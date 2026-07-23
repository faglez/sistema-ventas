'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Customer } from '@/types'
import type { CustomerFormData } from '@/lib/actions/customers'

interface CustomerFormDialogProps {
  open: boolean
  customer?: Customer | null
  onClose: () => void
  onSave: (data: CustomerFormData) => Promise<void>
}

const empty: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  creditLimit: 200,
}

export function CustomerFormDialog({ open, customer, onClose, onSave }: CustomerFormDialogProps) {
  const [form, setForm] = useState<CustomerFormData>(empty)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({})

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? { name: customer.name, email: customer.email, phone: customer.phone, creditLimit: customer.creditLimit }
          : { ...empty }
      )
      setErrors({})
    }
  }, [open, customer])

  const set = <K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (!form.email.trim()) e.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (form.creditLimit < 0) e.creditLimit = 'El límite no puede ser negativo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err: any) {
      if (err?.message?.includes('Unique constraint') || err?.message?.includes('email')) {
        setErrors((e) => ({ ...e, email: 'Este email ya está registrado' }))
      }
    } finally {
      setSaving(false)
    }
  }

  const isEdit = !!customer

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Nombre completo *</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: María García"
              className={cn(errors.name && 'border-red-400')}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="correo@ejemplo.com"
              className={cn(errors.email && 'border-red-400')}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Teléfono</Label>
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+51 999 000 111"
            />
          </div>

          {/* Límite de crédito */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Límite de crédito (USD) *</Label>
            <Input
              type="number"
              min={0}
              step={10}
              value={form.creditLimit || ''}
              onChange={(e) => set('creditLimit', parseFloat(e.target.value) || 0)}
              placeholder="200"
              className={cn(errors.creditLimit && 'border-red-400')}
            />
            {errors.creditLimit && <p className="text-xs text-red-500">{errors.creditLimit}</p>}
            <p className="text-[11px] text-gray-400">
              El saldo de crédito se gestiona desde el botón de créditos en la tabla.
            </p>
          </div>

          {/* Info de stats en edición */}
          {isEdit && (
            <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-400">Compras</p>
                <p className="text-sm font-bold text-gray-900">{customer.totalPurchases}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total gastado</p>
                <p className="text-sm font-bold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Saldo crédito</p>
                <p className="text-sm font-bold text-indigo-600">${customer.creditBalance.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
