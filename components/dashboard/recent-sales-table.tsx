import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types'

interface RecentSalesTableProps {
  transactions: Transaction[]
}

const statusVariant = (status: string) => {
  if (status === 'completada') return 'bg-green-50 text-green-700 border-green-100'
  if (status === 'pendiente') return 'bg-yellow-50 text-yellow-700 border-yellow-100'
  return 'bg-red-50 text-red-700 border-red-100'
}

export function RecentSalesTable({ transactions }: RecentSalesTableProps) {
  const recent = transactions.slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">Ventas Recientes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100">
              <TableHead className="text-xs">ID</TableHead>
              <TableHead className="text-xs">Cliente</TableHead>
              <TableHead className="text-xs">Total</TableHead>
              <TableHead className="text-xs">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((tx) => (
              <TableRow key={tx.id} className="border-gray-50">
                <TableCell className="font-mono text-xs text-gray-400">{tx.id}</TableCell>
                <TableCell className="text-sm font-medium text-gray-900">{tx.customerName}</TableCell>
                <TableCell className="text-sm font-bold text-gray-900">${tx.total.toFixed(2)}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize',
                      statusVariant(tx.status)
                    )}
                  >
                    {tx.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
