'use client'

import { CheckCircle, Printer, ShoppingBag } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SaleTicket } from './sale-ticket'
import { TicketData } from '@/types'

interface CheckoutDialogProps {
  open: boolean
  ticketData: TicketData | null
  onClose: () => void
}

export function CheckoutDialog({ open, ticketData, onClose }: CheckoutDialogProps) {
  const handlePrint = () => {
    if (!ticketData) return
    localStorage.setItem('pos_ticket_print', JSON.stringify(ticketData))
    window.open('/print/ticket', '_blank', 'width=440,height=660,noopener')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[360px] p-0 overflow-hidden gap-0">
        {/* Success header */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-5 text-center border-b border-green-100">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900">¡Venta Procesada!</h2>
          <p className="text-xs text-gray-500 mt-1">La transacción se registró correctamente</p>
          {ticketData && (
            <p className="text-[10px] font-mono text-gray-400 mt-1.5 tracking-wider">
              {ticketData.id}
            </p>
          )}
        </div>

        {/* Ticket preview */}
        <div className="px-4 py-4 max-h-72 overflow-y-auto bg-gray-50">
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 shadow-sm">
            {ticketData && <SaleTicket data={ticketData} />}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4 pt-3 bg-white border-t border-gray-100">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm h-9"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Imprimir Ticket
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 text-sm h-9"
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            Nueva Venta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
