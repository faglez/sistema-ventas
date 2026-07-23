'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CreditCard, Banknote, Smartphone, User, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionStatus, PaymentMethod } from '@/types'

interface TransactionDetailDialogProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, data: { status?: TransactionStatus; paymentMethod?: PaymentMethod }) => Promise<void>
}

const statusStyle = (s: string) => {
  if (s === 'completada') return 'bg-green-50 text-green-700 border-green-100'
  if (s === 'pendiente') return 'bg-yellow-50 text-yellow-700 border-yellow-100'
  return 'bg-red-50 text-red-700 border-red-100'
}

const PaymentIcon = ({ method }: { method: string }) => {
  if (method === 'tarjeta') return <CreditCard className="w-3.5 h-3.5" />
  if (method === 'efectivo') return <Banknote className="w-3.5 h-3.5" />
  return <Smartphone className="w-3.5 h-3.5" />
}

export function TransactionDetailDialog({ transaction: tx, open, onClose, onUpdate }: TransactionDetailDialogProps) {
  const [status, setStatus] = useState<TransactionStatus | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [saving, setSaving] = useState(false)

  // Sync local state when tx changes
  const currentStatus = (status || tx?.status) as TransactionStatus
  const currentPayment = (paymentMethod || tx?.paymentMethod) as PaymentMethod

  const handleOpen = (v: boolean) => {
    if (!v) {
      setStatus('')
      setPaymentMethod('')
      onClose()
    }
  }

  const isDirty =
    (status !== '' && status !== tx?.status) ||
    (paymentMethod !== '' && paymentMethod !== tx?.paymentMethod)

  const handleSave = async () => {
    if (!tx || !isDirty) return
    setSaving(true)
    try {
      await onUpdate(tx.id, {
        ...(status && status !== tx.status ? { status: status as TransactionStatus } : {}),
        ...(paymentMethod && paymentMethod !== tx.paymentMethod ? { paymentMethod: paymentMethod as PaymentMethod } : {}),
      })
      setStatus('')
      setPaymentMethod('')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!tx) return null

  const totalItems = tx.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold font-mono text-indigo-600">{tx.id}</DialogTitle>
          <p className="text-xs text-gray-400">{tx.date} · {totalItems} ítem{totalItems !== 1 ? 's' : ''}</p>
        </DialogHeader>

        {/* Cliente */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900">{tx.customerName}</span>
        </div>

        {/* Items */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Productos
          </p>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            {tx.items.map((item, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between px-3 py-2.5 text-sm',
                  i < tx.items.length - 1 && 'border-b border-gray-50'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">
                    {item.quantity} u. × ${item.price.toFixed(2)}
                    {item.selectedSize && ` · T: ${item.selectedSize}`}
                    {item.selectedColor && (
                      <span className="inline-flex items-center gap-1 ml-1">
                        · <span
                          className="w-2.5 h-2.5 rounded-full border border-gray-200 inline-block"
                          style={{ backgroundColor: item.selectedColor }}
                        />
                      </span>
                    )}
                  </p>
                </div>
                <span className="font-semibold text-gray-900 ml-3 flex-shrink-0">
                  ${(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span><span>${tx.subtotal.toFixed(2)}</span>
          </div>
          {tx.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento</span><span>-${tx.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Impuesto 11%</span><span>${tx.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
            <span>TOTAL</span><span>${tx.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Editar estado y método */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600">Estado</p>
            <Select
              value={currentStatus}
              onValueChange={(v) => setStatus(v as TransactionStatus)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-600">Método de pago</p>
            <Select
              value={currentPayment}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="credito">Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cerrar</Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
