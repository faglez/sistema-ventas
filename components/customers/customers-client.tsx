'use client'

import { useState, useTransition } from 'react'
import { CustomerTable } from '@/components/customers/customer-table'
import { CustomerCreditDialog } from '@/components/customers/customer-credit-dialog'
import { CustomerFormDialog } from '@/components/customers/customer-form-dialog'
import { DeleteCustomerDialog } from '@/components/customers/delete-customer-dialog'
import { addCredit } from '@/lib/actions/credits'
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/actions/customers'
import type { CustomerFormData } from '@/lib/actions/customers'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Search } from 'lucide-react'
import { Customer, CreditTransaction, CreditTransactionType } from '@/types'

interface CustomersClientProps {
  initialCustomers: Customer[]
  initialCreditTxs: CreditTransaction[]
}

export function CustomersClient({ initialCustomers, initialCreditTxs }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>(initialCreditTxs)
  const [search, setSearch] = useState('')

  const [creditDialogCustomer, setCreditDialogCustomer] = useState<Customer | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [, startTransition] = useTransition()

  const filtered = search.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search)
      )
    : customers

  /* ── Crédito ── */
  const handleAddCredit = (
    customerId: string,
    amount: number,
    type: Exclude<CreditTransactionType, 'uso'>,
    reason: string
  ) => {
    startTransition(async () => {
      const result = await addCredit(customerId, amount, type, reason)
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, creditBalance: result.newBalance } : c))
      )
      setCreditHistory((h) => [result.creditTransaction, ...h])
      setCreditDialogCustomer((c) =>
        c?.id === customerId ? { ...c, creditBalance: result.newBalance } : c
      )
    })
  }

  /* ── Crear / Editar ── */
  const handleSave = async (data: CustomerFormData) => {
    if (editingCustomer) {
      const updated = await updateCustomer(editingCustomer.id, data)
      startTransition(() =>
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      )
    } else {
      const created = await createCustomer(data)
      startTransition(() => setCustomers((prev) => [created, ...prev]))
    }
  }

  const handleAdd = () => {
    setEditingCustomer(null)
    setShowForm(true)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowForm(true)
  }

  /* ── Eliminar ── */
  const handleConfirmDelete = async (id: string) => {
    await deleteCustomer(id)
    startTransition(() => setCustomers((prev) => prev.filter((c) => c.id !== id)))
  }

  /* ── Dialog de crédito ── */
  const selectedBalance =
    customers.find((c) => c.id === creditDialogCustomer?.id)?.creditBalance ?? 0
  const dialogCreditHistory = creditHistory.filter(
    (t) => t.customerId === creditDialogCustomer?.id
  )

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Clientes</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">Clientes</h1>
        </div>
        <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <CustomerTable
            customers={filtered}
            onManageCredit={setCreditDialogCustomer}
            onEdit={handleEdit}
            onDelete={setDeletingCustomer}
          />
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={showForm}
        customer={editingCustomer}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />

      <DeleteCustomerDialog
        customer={deletingCustomer}
        open={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleConfirmDelete}
      />

      <CustomerCreditDialog
        customer={creditDialogCustomer}
        open={!!creditDialogCustomer}
        onClose={() => setCreditDialogCustomer(null)}
        creditTransactions={dialogCreditHistory}
        currentBalance={selectedBalance}
        onAddCredit={handleAddCredit}
      />
    </div>
  )
}
