'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, UserX } from 'lucide-react'
import type { Customer } from '@/types'

interface DeleteCustomerDialogProps {
  customer: Customer | null
  open: boolean
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function DeleteCustomerDialog({ customer, open, onClose, onConfirm }: DeleteCustomerDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!customer) return
    setDeleting(true)
    try {
      await onConfirm(customer.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <UserX className="w-5 h-5 text-red-500" />
            </div>
            <DialogTitle className="text-base font-bold">Eliminar cliente</DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          ¿Estás seguro de que deseas eliminar a{' '}
          <span className="font-semibold text-gray-900">{customer?.name}</span>?
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Se eliminará su historial de créditos. Las transacciones históricas se conservan
          pero quedarán sin cliente asociado.
        </p>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
