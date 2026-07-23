import { Transaction } from '@/types'
import { CreditCard, Banknote, Smartphone, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionsByDateProps {
  transactions: Transaction[]
}

const statusStyle = (status: string) => {
  if (status === 'completada') return 'bg-green-50 text-green-700 border-green-100'
  if (status === 'pendiente') return 'bg-yellow-50 text-yellow-700 border-yellow-100'
  return 'bg-red-50 text-red-700 border-red-100'
}

const MethodIcon = ({ method }: { method: string }) => {
  const cls = 'w-3.5 h-3.5'
  if (method === 'tarjeta') return <CreditCard className={cls} />
  if (method === 'efectivo') return <Banknote className={cls} />
  if (method === 'credito') return <Wallet className={cls} />
  return <Smartphone className={cls} />
}

const methodLabel: Record<string, string> = {
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  credito: 'Crédito',
}

export function TransactionsByDate({ transactions }: TransactionsByDateProps) {
  // Group by date descending
  const byDate = new Map<string, Transaction[]>()
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))
  sorted.forEach((tx) => {
    if (!byDate.has(tx.date)) byDate.set(tx.date, [])
    byDate.get(tx.date)!.push(tx)
  })

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 py-14 text-center text-gray-300">
        <p className="text-sm">Sin transacciones en el período seleccionado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Array.from(byDate.entries()).map(([date, txs]) => {
        const dayTotal = txs
          .filter((t) => t.status === 'completada')
          .reduce((s, t) => s + t.total, 0)

        return (
          <div key={date}>
            {/* Date header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-700">{date}</span>
                <span className="text-xs text-gray-400">
                  {txs.length} transacción{txs.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600">${dayTotal.toFixed(2)}</span>
            </div>

            {/* Transaction rows */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {txs.map((tx, idx) => {
                const totalItems = tx.items.reduce((s, i) => s + i.quantity, 0)
                return (
                  <div
                    key={tx.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50',
                      idx < txs.length - 1 ? 'border-b border-gray-50' : ''
                    )}
                  >
                    {/* ID */}
                    <span className="font-mono text-xs text-indigo-500 font-medium w-20 flex-shrink-0">
                      {tx.id}
                    </span>

                    {/* Customer */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tx.customerName}</p>
                      <p className="text-[10px] text-gray-400">
                        {totalItems} artículo{totalItems !== 1 ? 's' : ''}
                        {tx.discount > 0 && ` · Desc. $${tx.discount.toFixed(2)}`}
                      </p>
                    </div>

                    {/* Payment method */}
                    <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
                      <MethodIcon method={tx.paymentMethod} />
                      <span className="text-xs">{methodLabel[tx.paymentMethod]}</span>
                    </div>

                    {/* Status */}
                    <span
                      className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize flex-shrink-0',
                        statusStyle(tx.status)
                      )}
                    >
                      {tx.status}
                    </span>

                    {/* Total */}
                    <span className="text-sm font-bold text-gray-900 w-20 text-right flex-shrink-0">
                      ${tx.total.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
