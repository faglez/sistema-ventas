'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/actions/settings'
import type {
  Transaction,
  TransactionItem,
  TransactionStatus,
  PaymentMethod,
  CartItem,
  Customer,
  CheckoutInfo,
  TicketData,
  DashboardMetrics,
  SalesDataPoint,
} from '@/types'

type DbTx = {
  id: string
  customerId: string | null
  customerName: string
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: string
  status: string
  date: string
  createdAt: Date
  items: Array<{
    id: string
    transactionId: string
    productId: string | null
    productName: string
    quantity: number
    price: number
    selectedSize: string
    selectedColor: string
  }>
}

function toTransaction(t: DbTx): Transaction {
  return {
    id: t.id,
    customerId: t.customerId ?? '',
    customerName: t.customerName,
    items: t.items.map(
      (i): TransactionItem => ({
        productId: i.productId ?? '',
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
      })
    ),
    subtotal: t.subtotal,
    discount: t.discount,
    tax: t.tax,
    total: t.total,
    paymentMethod: t.paymentMethod as PaymentMethod,
    status: t.status as TransactionStatus,
    date: t.date,
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const txs = await prisma.transaction.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return txs.map(toTransaction)
}

export async function updateTransaction(
  id: string,
  data: { status?: TransactionStatus; paymentMethod?: PaymentMethod }
): Promise<Transaction> {
  const tx = await prisma.transaction.update({
    where: { id },
    data,
    include: { items: true },
  })
  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/reports')
  return toTransaction(tx)
}

export async function deleteTransaction(id: string): Promise<void> {
  // TransactionItem has onDelete: Cascade so items are auto-deleted
  await prisma.transaction.delete({ where: { id } })
  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/reports')
}

export async function createTransaction(input: {
  cartItems: CartItem[]
  customer: Customer | null
  checkoutInfo: CheckoutInfo
  subtotal: number
  tax: number
  total: number
}): Promise<TicketData> {
  const { cartItems, customer, checkoutInfo, subtotal, tax, total } = input
  const [settings, now] = [await getSettings(), new Date()]
  const dateStr = now.toISOString().split('T')[0]
  const txId = `TXN-${now.getTime()}`

  await prisma.$transaction(async (tx) => {
    // Create the transaction with items
    await tx.transaction.create({
      data: {
        id: txId,
        customerId: customer?.id ?? null,
        customerName: customer?.name ?? 'Venta sin cliente',
        subtotal,
        discount: checkoutInfo.discount,
        tax,
        total,
        paymentMethod: checkoutInfo.paymentMethod,
        status: 'completada',
        date: dateStr,
        items: {
          create: cartItems.map((ci) => ({
            productId: ci.product.id,
            productName: ci.product.name,
            quantity: ci.quantity,
            price: ci.product.price,
            selectedSize: ci.selectedSize,
            selectedColor: ci.selectedColor,
          })),
        },
      },
    })

    // Reduce stock for each product sold
    for (const ci of cartItems) {
      await tx.product.update({
        where: { id: ci.product.id },
        data: { stock: { decrement: ci.quantity } },
      })
    }

    // Update customer totals if there's a customer
    if (customer) {
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          totalPurchases: { increment: 1 },
          totalSpent: { increment: total },
          lastPurchase: dateStr,
        },
      })

      // Deduct credit and record credit transaction if credit was applied
      if (checkoutInfo.usedCredit > 0) {
        const latest = await tx.customer.findUnique({
          where: { id: customer.id },
          select: { creditBalance: true },
        })
        const balanceBefore = latest?.creditBalance ?? 0
        const balanceAfter = Math.max(0, balanceBefore - checkoutInfo.usedCredit)

        await tx.creditTransaction.create({
          data: {
            customerId: customer.id,
            amount: checkoutInfo.usedCredit,
            type: 'uso',
            reason: `Pago con crédito — ${txId}`,
            balanceBefore,
            balanceAfter,
            date: dateStr,
          },
        })

        await tx.customer.update({
          where: { id: customer.id },
          data: { creditBalance: balanceAfter },
        })
      }
    }
  })

  revalidatePath('/orders')
  revalidatePath('/transactions')
  revalidatePath('/customers')
  revalidatePath('/dashboard')
  revalidatePath('/reports')
  revalidatePath('/products')

  return {
    id: txId,
    date: now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    customer: customer ? { id: customer.id, name: customer.name } : null,
    items: cartItems.map((ci) => ({
      name: ci.product.name,
      quantity: ci.quantity,
      unitPrice: ci.product.price,
      selectedSize: ci.selectedSize,
      selectedColor: ci.selectedColor,
    })),
    subtotal,
    discount: checkoutInfo.discount,
    tax,
    taxRate: settings.taxRate,
    creditApplied: checkoutInfo.usedCredit,
    total,
    paymentMethod: checkoutInfo.paymentMethod,
    store: {
      name: settings.storeName,
      address: settings.storeAddress,
      phone: settings.storePhone,
      email: settings.storeEmail,
    },
  }
}

export async function getTicketDataForTransaction(id: string): Promise<TicketData | null> {
  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!tx) return null

  const settings = await getSettings()
  const taxRate = tx.subtotal > 0
    ? Math.round((tx.tax / tx.subtotal) * 100)
    : settings.taxRate

  // Try to parse a time from the id (TXN-<timestamp>) or leave blank
  const tsMatch = tx.id.match(/TXN-(\d+)$/)
  const time = tsMatch
    ? new Date(parseInt(tsMatch[1])).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    : ''

  return {
    id: tx.id,
    date: tx.date,
    time,
    customer: tx.customerId ? { id: tx.customerId, name: tx.customerName } : null,
    items: tx.items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      unitPrice: i.price,
      selectedSize: i.selectedSize,
      selectedColor: i.selectedColor,
    })),
    subtotal: tx.subtotal,
    discount: tx.discount,
    tax: tx.tax,
    taxRate,
    creditApplied: 0,
    total: tx.total,
    paymentMethod: tx.paymentMethod,
    store: {
      name: settings.storeName,
      address: settings.storeAddress,
      phone: settings.storePhone,
      email: settings.storeEmail,
    },
  }
}

export async function getDashboardMetrics(): Promise<{
  metrics: DashboardMetrics
  salesData: SalesDataPoint[]
}> {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yestStr = yesterday.toISOString().split('T')[0]

  // Today's completed transactions
  const todayTxs = await prisma.transaction.findMany({
    where: { date: todayStr, status: 'completada' },
    include: { items: true },
  })
  const yestTxs = await prisma.transaction.findMany({
    where: { date: yestStr, status: 'completada' },
    include: { items: true },
  })

  // All transactions today (for count)
  const todayAllTxs = await prisma.transaction.findMany({ where: { date: todayStr } })

  const salesTotal = todayTxs.reduce((s, t) => s + t.total, 0)
  const yestSales = yestTxs.reduce((s, t) => s + t.total, 0)
  const salesChange = yestSales === 0 ? 0 : ((salesTotal - yestSales) / yestSales) * 100

  const productsSold = todayTxs.reduce(
    (s, t) => s + t.items.reduce((si, i) => si + i.quantity, 0),
    0
  )
  const yestProducts = yestTxs.reduce(
    (s, t) => s + t.items.reduce((si, i) => si + i.quantity, 0),
    0
  )
  const productsSoldChange =
    yestProducts === 0 ? 0 : ((productsSold - yestProducts) / yestProducts) * 100

  // New customers this month
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const newCustomers = await prisma.customer.count({
    where: { createdAt: { gte: new Date(`${thisMonth}-01`) } },
  })

  // Last 7 months sales data
  const months: SalesDataPoint[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setMonth(d.getMonth() - i)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('es-PE', { month: 'short' })

    const monthTxs = await prisma.transaction.findMany({
      where: { date: { startsWith: monthStr }, status: 'completada' },
    })
    const value = monthTxs.reduce((s, t) => s + t.total, 0)
    months.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value })
  }

  return {
    metrics: {
      salesTotal,
      salesChange: Math.round(salesChange * 10) / 10,
      transactions: todayAllTxs.length,
      transactionsChange: 0,
      newCustomers,
      newCustomersChange: 0,
      productsSold,
      productsSoldChange: Math.round(productsSoldChange * 10) / 10,
    },
    salesData: months,
  }
}
