'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CreditMovement } from '@/lib/actions/credits'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, TrendingDown, Users, ArrowUpRight, ArrowDownLeft, RotateCcw, SlidersHorizontal, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreditTransactionType } from '@/types'

const TYPE_CONFIG: Record<CreditTransactionType, { label: string; color: string; icon: React.ElementType; sign: 1 | -1 }> = {
  recarga:    { label: 'Recarga',    color: 'bg-green-100 text-green-700 border-green-200',   icon: ArrowUpRight,   sign: 1  },
  devolucion: { label: 'Devolución', color: 'bg-blue-100 text-blue-700 border-blue-200',      icon: RotateCcw,      sign: 1  },
  ajuste:     { label: 'Ajuste',     color: 'bg-gray-100 text-gray-600 border-gray-200',      icon: SlidersHorizontal, sign: 1 },
  uso:        { label: 'Uso',        color: 'bg-red-100 text-red-700 border-red-200',         icon: ArrowDownLeft,  sign: -1 },
}

const avatarColors = [
  'bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',   'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700',
]

interface Props {
  movements: CreditMovement[]
  from: string
  to: string
}

export function CreditMovementsReport({ movements, from, to }: Props) {
  const [customerFilter, setCustomerFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filtered = useMemo(
    () =>
      movements.filter(
        (m) =>
          m.date >= from &&
          m.date <= to &&
          (customerFilter === 'all' || m.customerId === customerFilter) &&
          (typeFilter === 'all' || m.type === typeFilter)
      ),
    [movements, from, to, customerFilter, typeFilter]
  )

  // Unique customers (from all movements, not filtered)
  const customers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; index: number }>()
    movements.forEach((m, i) => {
      if (!map.has(m.customerId)) map.set(m.customerId, { id: m.customerId, name: m.customerName, index: map.size })
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [movements])

  // Summary cards (based on filtered period)
  const summary = useMemo(() => {
    const inPeriod = movements.filter((m) => m.date >= from && m.date <= to)
    const recargas = inPeriod.filter((m) => m.type !== 'uso')
    const usos = inPeriod.filter((m) => m.type === 'uso')

    // Current credit balance per customer (from all movements, take latest balanceAfter per customer)
    const latestBalance = new Map<string, number>()
    movements.forEach((m) => {
      if (!latestBalance.has(m.customerId)) latestBalance.set(m.customerId, m.balanceAfter)
    })
    const totalActivo = Array.from(latestBalance.values()).reduce((s, b) => s + b, 0)
    const clientesConSaldo = Array.from(latestBalance.values()).filter((b) => b > 0).length

    return {
      totalActivo,
      clientesConSaldo,
      totalRecargas: recargas.reduce((s, m) => s + m.amount, 0),
      countRecargas: recargas.length,
      totalUsos: usos.reduce((s, m) => s + m.amount, 0),
      countUsos: usos.length,
      clientesEnPeriodo: new Set(inPeriod.map((m) => m.customerId)).size,
    }
  }, [movements, from, to])

  // Avatar color by customer order of appearance
  const customerColorIndex = useMemo(() => {
    const map = new Map<string, number>()
    customers.forEach((c, i) => map.set(c.id, i))
    return map
  }, [customers])

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={<Wallet className="w-4 h-4 text-indigo-600" />}
          bg="bg-indigo-50"
          label="Crédito en cartera"
          value={`$${summary.totalActivo.toFixed(2)}`}
          sub={`${summary.clientesConSaldo} clientes con saldo`}
        />
        <SummaryCard
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          bg="bg-green-50"
          label="Ingresos de crédito"
          value={`$${summary.totalRecargas.toFixed(2)}`}
          sub={`${summary.countRecargas} movimiento${summary.countRecargas !== 1 ? 's' : ''}`}
        />
        <SummaryCard
          icon={<TrendingDown className="w-4 h-4 text-red-500" />}
          bg="bg-red-50"
          label="Crédito utilizado"
          value={`$${summary.totalUsos.toFixed(2)}`}
          sub={`${summary.countUsos} movimiento${summary.countUsos !== 1 ? 's' : ''}`}
        />
        <SummaryCard
          icon={<Users className="w-4 h-4 text-purple-600" />}
          bg="bg-purple-50"
          label="Clientes activos"
          value={String(summary.clientesEnPeriodo)}
          sub="con movimientos en el período"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={customerFilter} onValueChange={(v) => setCustomerFilter(v ?? 'all')}>
          <SelectTrigger className="w-52 h-8 text-xs">
            <SelectValue placeholder="Todos los clientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los clientes</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="recarga">Recarga</SelectItem>
            <SelectItem value="uso">Uso</SelectItem>
            <SelectItem value="devolucion">Devolución</SelectItem>
            <SelectItem value="ajuste">Ajuste</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          {filtered.length > 0 && (
            <span className="text-xs text-gray-400">
              {filtered.length} movimiento{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
          <Link
            href={
              customerFilter !== 'all'
                ? `/print/credit-statement?customer=${customerFilter}`
                : '/print/credit-statement'
            }
            target="_blank"
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Estado de cuenta
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-300">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin movimientos en el período seleccionado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50/60">
                <TableHead className="text-xs font-semibold">Fecha</TableHead>
                <TableHead className="text-xs font-semibold">Cliente</TableHead>
                <TableHead className="text-xs font-semibold">Tipo</TableHead>
                <TableHead className="text-xs font-semibold">Descripción</TableHead>
                <TableHead className="text-xs font-semibold text-right text-red-500">Cargo</TableHead>
                <TableHead className="text-xs font-semibold text-right text-green-600">Abono</TableHead>
                <TableHead className="text-xs font-semibold text-right">Saldo anterior</TableHead>
                <TableHead className="text-xs font-semibold text-right">Saldo resultante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const cfg = TYPE_CONFIG[m.type]
                const Icon = cfg.icon
                const isDebit = cfg.sign === -1
                const colorIdx = customerColorIndex.get(m.customerId) ?? 0
                const initials = m.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <TableRow key={m.id} className="border-gray-50 hover:bg-gray-50/40">
                    {/* Date */}
                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">{m.date}</TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarFallback className={cn('text-[10px] font-semibold', avatarColors[colorIdx % avatarColors.length])}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-gray-900 whitespace-nowrap">{m.customerName}</p>
                          <p className="text-[10px] text-gray-400">{m.customerEmail}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Type badge */}
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap', cfg.color)}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </TableCell>

                    {/* Description */}
                    <TableCell className="text-xs text-gray-600 max-w-[200px] truncate">
                      {m.reason}
                    </TableCell>

                    {/* Cargo (debit) */}
                    <TableCell className="text-right">
                      {isDebit ? (
                        <span className="text-sm font-semibold text-red-600">
                          −${m.amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-200">—</span>
                      )}
                    </TableCell>

                    {/* Abono (credit) */}
                    <TableCell className="text-right">
                      {!isDebit ? (
                        <span className="text-sm font-semibold text-green-600">
                          +${m.amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-200">—</span>
                      )}
                    </TableCell>

                    {/* Balance before */}
                    <TableCell className="text-right">
                      <span className="text-xs text-gray-400">${m.balanceBefore.toFixed(2)}</span>
                    </TableCell>

                    {/* Balance after */}
                    <TableCell className="text-right">
                      <span className={cn('text-sm font-bold', m.balanceAfter > 0 ? 'text-indigo-600' : 'text-gray-400')}>
                        ${m.balanceAfter.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  icon, bg, label, value, sub,
}: {
  icon: React.ReactNode
  bg: string
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}
