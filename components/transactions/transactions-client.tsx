'use client'

import { useState, useTransition } from 'react'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionDetailDialog } from '@/components/transactions/transaction-detail-dialog'
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog'
import { updateTransaction, deleteTransaction } from '@/lib/actions/transactions'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { Transaction, TransactionStatus, PaymentMethod } from '@/types'

interface TransactionsClientProps {
  initialTransactions: Transaction[]
}

export function TransactionsClient({ initialTransactions }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')

  const [viewingTx, setViewingTx] = useState<Transaction | null>(null)
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null)

  const [, startTransition] = useTransition()

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      !search.trim() ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.customerName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleUpdate = async (
    id: string,
    data: { status?: TransactionStatus; paymentMethod?: PaymentMethod }
  ) => {
    const updated = await updateTransaction(id, data)
    startTransition(() =>
      setTransactions((prev) => prev.map((tx) => (tx.id === id ? updated : tx)))
    )
    if (viewingTx?.id === id) setViewingTx(updated)
  }

  const handleDelete = async (id: string) => {
    await deleteTransaction(id)
    startTransition(() => setTransactions((prev) => prev.filter((tx) => tx.id !== id)))
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Transacciones</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">Transacciones</h1>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por ID o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TransactionStatus | 'all')}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <TransactionTable
            transactions={filtered}
            onView={setViewingTx}
            onDelete={setDeletingTx}
          />
        </CardContent>
      </Card>

      <TransactionDetailDialog
        transaction={viewingTx}
        open={!!viewingTx}
        onClose={() => setViewingTx(null)}
        onUpdate={handleUpdate}
      />

      <DeleteTransactionDialog
        transaction={deletingTx}
        open={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
