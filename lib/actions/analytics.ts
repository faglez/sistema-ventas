'use server'

import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/actions/settings'

const CATEGORY_COLORS = [
  'bg-indigo-500', 'bg-pink-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500',
  'bg-blue-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500',
]

export interface CategorySlice {
  label: string
  value: number
  color: string
}

export interface TopProduct {
  id: string
  name: string
  image: string | null
  stock: number | null
  price: number
  unitsSold: number
}

export interface MonthlySales {
  label: string
  value: number
}

export interface AnalyticsData {
  salesTotal: number
  salesChangePct: number | null
  avgTicket: number
  avgTicketChangePct: number | null
  cancelRate: number
  cancelRateDeltaPoints: number
  categoryBreakdown: CategorySlice[]
  topProducts: TopProduct[]
  monthlyTrend: MonthlySales[]
  periodLabel: string
}

function monthStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [allTransactions, settings] = await Promise.all([
    prisma.transaction.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { date: 'desc' },
    }),
    getSettings(),
  ])

  // Anchor "current period" to the most recent transaction so the dashboard
  // stays meaningful regardless of how stale the underlying data is.
  const latest = allTransactions[0]
  const anchor = latest ? new Date(latest.date) : new Date()
  const currentMonth = monthStr(anchor)
  const prevMonthDate = new Date(anchor)
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1)
  const prevMonth = monthStr(prevMonthDate)

  const currentTxs = allTransactions.filter((t) => t.date.startsWith(currentMonth))
  const prevTxs = allTransactions.filter((t) => t.date.startsWith(prevMonth))

  const completed = (txs: typeof allTransactions) => txs.filter((t) => t.status === 'completada')

  const currentCompleted = completed(currentTxs)
  const prevCompleted = completed(prevTxs)

  const salesTotal = currentCompleted.reduce((s, t) => s + t.total, 0)
  const prevSalesTotal = prevCompleted.reduce((s, t) => s + t.total, 0)

  const avgTicket = currentCompleted.length > 0 ? salesTotal / currentCompleted.length : 0
  const prevAvgTicket = prevCompleted.length > 0 ? prevSalesTotal / prevCompleted.length : 0

  const cancelRate = currentTxs.length > 0
    ? (currentTxs.filter((t) => t.status === 'cancelada').length / currentTxs.length) * 100
    : 0
  const prevCancelRate = prevTxs.length > 0
    ? (prevTxs.filter((t) => t.status === 'cancelada').length / prevTxs.length) * 100
    : 0

  // Category breakdown + top products — computed over all completed sales,
  // so the picture stays representative even when the current month is thin.
  const categoryRevenue = new Map<string, number>()
  const productAgg = new Map<string, { name: string; unitsSold: number; revenue: number; productId: string | null }>()

  for (const tx of allTransactions) {
    if (tx.status !== 'completada') continue
    for (const item of tx.items) {
      const revenue = item.price * item.quantity
      const category = item.product?.category ?? 'otros'
      categoryRevenue.set(category, (categoryRevenue.get(category) ?? 0) + revenue)

      const key = item.productId ?? `name:${item.productName}`
      const existing = productAgg.get(key)
      if (existing) {
        existing.unitsSold += item.quantity
        existing.revenue += revenue
      } else {
        productAgg.set(key, {
          name: item.productName,
          unitsSold: item.quantity,
          revenue,
          productId: item.productId,
        })
      }
    }
  }

  const totalCategoryRevenue = Array.from(categoryRevenue.values()).reduce((s, v) => s + v, 0)
  const categoryLabel = (value: string) =>
    settings.categories.find((c) => c.value === value)?.label ?? (value.charAt(0).toUpperCase() + value.slice(1))

  const categoryBreakdown: CategorySlice[] = Array.from(categoryRevenue.entries())
    .map(([category, revenue]) => ({
      label: categoryLabel(category),
      value: totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 1000) / 10 : 0,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((c, i) => ({ label: c.label, value: c.value, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))

  const productIds = Array.from(productAgg.values())
    .map((p) => p.productId)
    .filter((id): id is string => id !== null)
  const products = productIds.length > 0
    ? await prisma.product.findMany({ where: { id: { in: productIds } } })
    : []
  const productById = new Map(products.map((p) => [p.id, p]))

  const topProducts: TopProduct[] = Array.from(productAgg.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((p) => {
      const current = p.productId ? productById.get(p.productId) : undefined
      return {
        id: p.productId ?? p.name,
        name: p.name,
        image: current?.image ?? null,
        stock: current?.stock ?? null,
        price: current?.price ?? p.revenue / p.unitsSold,
        unitsSold: p.unitsSold,
      }
    })

  // Last 7 months ending at the anchor month (not necessarily real "today")
  const monthlyTrend: MonthlySales[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchor)
    d.setMonth(d.getMonth() - i)
    const key = monthStr(d)
    const label = d.toLocaleString('es-PE', { month: 'short' })
    const value = allTransactions
      .filter((t) => t.status === 'completada' && t.date.startsWith(key))
      .reduce((s, t) => s + t.total, 0)
    monthlyTrend.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value })
  }

  return {
    salesTotal,
    salesChangePct: pctChange(salesTotal, prevSalesTotal),
    avgTicket,
    avgTicketChangePct: pctChange(avgTicket, prevAvgTicket),
    cancelRate: Math.round(cancelRate * 10) / 10,
    cancelRateDeltaPoints: Math.round((cancelRate - prevCancelRate) * 10) / 10,
    categoryBreakdown,
    topProducts,
    monthlyTrend,
    periodLabel: anchor.toLocaleString('es-PE', { month: 'long', year: 'numeric' }),
  }
}
