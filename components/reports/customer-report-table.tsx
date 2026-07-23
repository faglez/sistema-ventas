import { Transaction, CreditTransaction } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Wallet, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
]

interface CustomerReportTableProps {
  transactions: Transaction[]
  creditTransactions: CreditTransaction[]
}

export function CustomerReportTable({ transactions, creditTransactions }: CustomerReportTableProps) {
  // Group transactions by customer
  const map = new Map<
    string,
    {
      name: string
      txs: Transaction[]
      creditsUsed: number
      creditsAdded: number
    }
  >()

  transactions.forEach((tx) => {
    if (!map.has(tx.customerId)) {
      map.set(tx.customerId, { name: tx.customerName, txs: [], creditsUsed: 0, creditsAdded: 0 })
    }
    map.get(tx.customerId)!.txs.push(tx)
  })

  creditTransactions.forEach((ct) => {
    if (!map.has(ct.customerId)) return
    if (ct.type === 'uso') map.get(ct.customerId)!.creditsUsed += ct.amount
    else map.get(ct.customerId)!.creditsAdded += ct.amount
  })

  const rows = Array.from(map.entries())
    .map(([id, d]) => {
      const completed = d.txs.filter((t) => t.status === 'completada')
      const total = completed.reduce((s, t) => s + t.total, 0)
      return {
        id,
        name: d.name,
        totalTxs: d.txs.length,
        completedTxs: completed.length,
        cancelledTxs: d.txs.filter((t) => t.status === 'cancelada').length,
        total,
        avg: completed.length > 0 ? total / completed.length : 0,
        creditsUsed: d.creditsUsed,
        creditsAdded: d.creditsAdded,
      }
    })
    .sort((a, b) => b.total - a.total)

  if (rows.length === 0) {
    return (
      <div className="text-center py-14 text-gray-300">
        <p className="text-sm">Sin clientes en el período seleccionado</p>
      </div>
    )
  }

  const maxTotal = rows[0].total

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs w-8">#</TableHead>
          <TableHead className="text-xs">Cliente</TableHead>
          <TableHead className="text-xs">Transacciones</TableHead>
          <TableHead className="text-xs">Total Comprado</TableHead>
          <TableHead className="text-xs">Ticket Prom.</TableHead>
          <TableHead className="text-xs">Crédito Usado</TableHead>
          <TableHead className="text-xs">Participación</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => {
          const initials = row.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
          const participation = maxTotal > 0 ? (row.total / maxTotal) * 100 : 0

          return (
            <TableRow key={row.id} className="border-gray-50 hover:bg-gray-50/50">
              {/* Rank */}
              <TableCell>
                {i === 0 ? (
                  <Trophy className="w-4 h-4 text-yellow-500" />
                ) : (
                  <span className="text-sm font-bold text-gray-300">{i + 1}</span>
                )}
              </TableCell>

              {/* Customer */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={`text-xs font-semibold ${avatarColors[i % avatarColors.length]}`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{row.name}</p>
                    <p className="text-[10px] text-gray-400">#{row.id}</p>
                  </div>
                </div>
              </TableCell>

              {/* Transactions */}
              <TableCell>
                <p className="text-sm font-medium text-gray-900">{row.totalTxs}</p>
                <p className="text-[10px] text-gray-400">
                  {row.completedTxs} ok
                  {row.cancelledTxs > 0 && (
                    <span className="text-red-400"> · {row.cancelledTxs} cancel.</span>
                  )}
                </p>
              </TableCell>

              {/* Total */}
              <TableCell>
                <span className="text-sm font-bold text-gray-900">${row.total.toFixed(2)}</span>
              </TableCell>

              {/* Avg */}
              <TableCell>
                <span className="text-sm text-gray-700">${row.avg.toFixed(2)}</span>
              </TableCell>

              {/* Credits used */}
              <TableCell>
                {row.creditsUsed > 0 ? (
                  <div className="flex items-center gap-1 text-indigo-600">
                    <Wallet className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">${row.creditsUsed.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-300">—</span>
                )}
              </TableCell>

              {/* Participation bar */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        i === 0 ? 'bg-indigo-600' : 'bg-indigo-300'
                      )}
                      style={{ width: `${participation}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{Math.round(participation)}%</span>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
