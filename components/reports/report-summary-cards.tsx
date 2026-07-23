import { Transaction } from '@/types'
import { Card } from '@/components/ui/card'
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportSummaryCardsProps {
  transactions: Transaction[]
}

export function ReportSummaryCards({ transactions }: ReportSummaryCardsProps) {
  const completed = transactions.filter((t) => t.status === 'completada')
  const totalRevenue = completed.reduce((s, t) => s + t.total, 0)
  const uniqueCustomers = new Set(transactions.map((t) => t.customerId)).size
  const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0
  const cancelled = transactions.filter((t) => t.status === 'cancelada').length
  const pending = transactions.filter((t) => t.status === 'pendiente').length

  const cards = [
    {
      title: 'Ingresos Totales',
      value: `$${totalRevenue.toFixed(2)}`,
      sub: `${completed.length} transacciones completadas`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      valueCls: 'text-gray-900',
    },
    {
      title: 'Transacciones',
      value: transactions.length.toString(),
      sub: pending > 0 ? `${pending} pendiente${pending > 1 ? 's' : ''}` : 'Todas procesadas',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      valueCls: 'text-gray-900',
    },
    {
      title: 'Clientes Únicos',
      value: uniqueCustomers.toString(),
      sub: 'en el período seleccionado',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      valueCls: 'text-gray-900',
    },
    {
      title: 'Ticket Promedio',
      value: `$${avgTicket.toFixed(2)}`,
      sub: cancelled > 0 ? `${cancelled} cancelada${cancelled > 1 ? 's' : ''}` : 'Sin cancelaciones',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      valueCls: 'text-gray-900',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.title} className="p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">{c.title}</p>
              <p className={cn('text-2xl font-bold mt-1', c.valueCls)}>{c.value}</p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">{c.sub}</p>
            </div>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-2', c.bg)}>
              <c.icon className={cn('w-5 h-5', c.color)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
