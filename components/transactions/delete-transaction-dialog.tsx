'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2 } from 'lucide-react'
import type { Transaction } from '@/types'

interface DeleteTransactionDialogProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function DeleteTransactionDialog({ transaction: tx, open, onClose, onConfirm }: DeleteTransactionDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!tx) return
    setDeleting(true)
    try {
      await onConfirm(tx.id)
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
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <DialogTitle className="text-base font-bold">Eliminar transacción</DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          ¿Eliminar la transacción{' '}
          <span className="font-mono font-semibold text-indigo-600">{tx?.id}</span>?
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Se eliminarán todos los ítems asociados. El stock <span className="font-medium">no</span> se
          restaura automáticamente.
        </p>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={deleting}>Cancelar</Button>
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
