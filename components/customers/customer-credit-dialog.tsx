'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Customer, CreditTransaction, CreditTransactionType } from '@/types'
import { Wallet, Plus, History, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerCreditDialogProps {
  customer: Customer | null
  open: boolean
  onClose: () => void
  creditTransactions: CreditTransaction[]
  currentBalance: number
  onAddCredit: (
    customerId: string,
    amount: number,
    type: Exclude<CreditTransactionType, 'uso'>,
    reason: string
  ) => void
}

const typeLabel: Record<string, string> = {
  recarga: 'Recarga',
  uso: 'Uso',
  devolucion: 'Devolución',
  ajuste: 'Ajuste',
}

const txStyle = (type: string) => ({
  icon: type === 'uso' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600',
  amount: type === 'uso' ? 'text-red-600' : 'text-green-600',
  sign: type === 'uso' ? '-' : '+',
})

export function CustomerCreditDialog({
  customer,
  open,
  onClose,
  creditTransactions,
  currentBalance,
  onAddCredit,
}: CustomerCreditDialogProps) {
  const [tab, setTab] = useState<'add' | 'history'>('add')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<Exclude<CreditTransactionType, 'uso'>>('recarga')
  const [reason, setReason] = useState('')

  if (!customer) return null

  const customerTxs = creditTransactions
    .filter((t) => t.customerId === customer.id)
    .sort((a, b) => b.date.localeCompare(a.date))

  const usedPct = Math.min((currentBalance / customer.creditLimit) * 100, 100)

  const handleSubmit = () => {
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) return
    onAddCredit(customer.id, num, type, reason.trim() || typeLabel[type])
    setAmount('')
    setReason('')
    setTab('history')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Créditos — {customer.name}
          </DialogTitle>
        </DialogHeader>

        {/* Balance card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-4 text-white">
          <p className="text-xs text-indigo-300 uppercase tracking-wide">Saldo disponible</p>
          <p className="text-3xl font-black mt-1">${currentBalance.toFixed(2)}</p>
          <p className="text-xs text-indigo-300 mt-0.5">Límite: ${customer.creditLimit.toFixed(2)}</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-indigo-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white rounded-full h-full transition-all duration-500"
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <span className="text-xs text-indigo-200 font-medium">{Math.round(usedPct)}%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 -mb-1">
          {([
            { key: 'add', label: 'Agregar crédito', icon: Plus },
            { key: 'history', label: `Historial (${customerTxs.length})`, icon: History },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'add' ? (
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-medium text-gray-500">Tipo de operación</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as typeof type)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recarga">Recarga de crédito</SelectItem>
                  <SelectItem value="devolucion">Devolución de compra</SelectItem>
                  <SelectItem value="ajuste">Ajuste manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500">Monto ($)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-500">
                Motivo{' '}
                <span className="text-gray-300 font-normal">(opcional)</span>
              </Label>
              <Input
                placeholder="Ej: Premio fidelidad, devolución #TXN-001..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Confirmar crédito
            </Button>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-0 pt-1">
            {customerTxs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Sin movimientos de crédito</p>
            ) : (
              customerTxs.map((tx) => {
                const s = txStyle(tx.type)
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', s.icon)}>
                      {tx.type === 'uso' ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tx.reason}</p>
                      <p className="text-xs text-gray-400">
                        {tx.date} · {typeLabel[tx.type]}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn('text-sm font-bold', s.amount)}>
                        {s.sign}${tx.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400">→ ${tx.balanceAfter.toFixed(2)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
