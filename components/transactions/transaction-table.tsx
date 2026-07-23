import Link from 'next/link'
import { Transaction } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Trash2, Printer } from 'lucide-react'
import { CreditCard, Banknote, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusStyle = (status: string) => {
  if (status === 'completada') return 'bg-green-50 text-green-700 border-green-100'
  if (status === 'pendiente') return 'bg-yellow-50 text-yellow-700 border-yellow-100'
  return 'bg-red-50 text-red-700 border-red-100'
}

const PaymentIcon = ({ method }: { method: string }) => {
  if (method === 'tarjeta') return <CreditCard className="w-3.5 h-3.5 inline mr-1" />
  if (method === 'efectivo') return <Banknote className="w-3.5 h-3.5 inline mr-1" />
  return <Smartphone className="w-3.5 h-3.5 inline mr-1" />
}

const methodLabel: Record<string, string> = {
  tarjeta: 'Tarjeta',
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  credito: 'Crédito',
}

interface TransactionTableProps {
  transactions: Transaction[]
  onView: (tx: Transaction) => void
  onDelete: (tx: Transaction) => void
}

export function TransactionTable({ transactions, onView, onDelete }: TransactionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">ID</TableHead>
          <TableHead className="text-xs">Cliente</TableHead>
          <TableHead className="text-xs">Items</TableHead>
          <TableHead className="text-xs">Total</TableHead>
          <TableHead className="text-xs">Método de Pago</TableHead>
          <TableHead className="text-xs">Estado</TableHead>
          <TableHead className="text-xs">Fecha</TableHead>
          <TableHead className="text-xs w-28"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-sm text-gray-400 py-10">
              No hay transacciones que coincidan con los filtros.
            </TableCell>
          </TableRow>
        )}
        {transactions.map((tx) => {
          const totalItems = tx.items.reduce((s, i) => s + i.quantity, 0)
          return (
            <TableRow key={tx.id} className="border-gray-50 hover:bg-gray-50/50">
              <TableCell>
                <button
                  onClick={() => onView(tx)}
                  className="font-mono text-xs text-indigo-600 font-medium hover:underline"
                >
                  {tx.id}
                </button>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-gray-900">{tx.customerName}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{totalItems} uds.</span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-bold text-gray-900">${tx.total.toFixed(2)}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600 flex items-center">
                  <PaymentIcon method={tx.paymentMethod} />
                  {methodLabel[tx.paymentMethod] || tx.paymentMethod}
                </span>
              </TableCell>
              <TableCell>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize', statusStyle(tx.status))}>
                  {tx.status}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">{tx.date}</span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                    title="Ver detalle"
                    onClick={() => onView(tx)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Link
                    href={`/print/ticket/${encodeURIComponent(tx.id)}`}
                    target="_blank"
                    title="Reimprimir ticket"
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                    title="Eliminar"
                    onClick={() => onDelete(tx)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
