import { Customer } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerTableProps {
  customers: Customer[]
  onManageCredit: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

const avatarColors = [
  'bg-indigo-100 text-indigo-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
]

export function CustomerTable({ customers, onManageCredit, onEdit, onDelete }: CustomerTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Cliente</TableHead>
          <TableHead className="text-xs">Email</TableHead>
          <TableHead className="text-xs">Teléfono</TableHead>
          <TableHead className="text-xs">Compras</TableHead>
          <TableHead className="text-xs">Total Gastado</TableHead>
          <TableHead className="text-xs">Crédito</TableHead>
          <TableHead className="text-xs">Última Visita</TableHead>
          <TableHead className="text-xs w-20"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((c, i) => {
          const initials = c.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
          const creditPct = (c.creditBalance / c.creditLimit) * 100
          return (
            <TableRow key={c.id} className="border-gray-50 hover:bg-gray-50/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={`text-xs font-semibold ${avatarColors[i % avatarColors.length]}`}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">#{c.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{c.email}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{c.phone}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-gray-900">{c.totalPurchases}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-bold text-gray-900">${c.totalSpent.toFixed(2)}</span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        'font-semibold',
                        c.creditBalance > 0 ? 'text-indigo-600' : 'text-gray-400'
                      )}
                    >
                      ${c.creditBalance.toFixed(2)}
                    </span>
                    <span className="text-gray-300">/ ${c.creditLimit.toFixed(2)}</span>
                  </div>
                  <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        creditPct > 75 ? 'bg-indigo-500' : creditPct > 30 ? 'bg-indigo-300' : 'bg-gray-200'
                      )}
                      style={{ width: `${creditPct}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">{c.lastPurchase}</span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                    title="Gestionar créditos"
                    onClick={() => onManageCredit(c)}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                    title="Editar cliente"
                    onClick={() => onEdit(c)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                    title="Eliminar cliente"
                    onClick={() => onDelete(c)}
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
