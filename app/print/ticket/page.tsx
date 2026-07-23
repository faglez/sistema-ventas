'use client'

import { useEffect, useState } from 'react'
import { Printer, X } from 'lucide-react'
import { SaleTicket } from '@/components/pos/sale-ticket'
import { TicketData } from '@/types'

export default function PrintTicketPage() {
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('pos_ticket_print')
    if (raw) {
      try {
        setTicketData(JSON.parse(raw) as TicketData)
      } catch {
        // ignore malformed data
      }
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ticketData || !ready) return
    const timer = setTimeout(() => window.print(), 400)
    return () => clearTimeout(timer)
  }, [ticketData, ready])

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .ticket-card {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 12px !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg"
        >
          <Printer size={14} />
          Imprimir
        </button>
        <button
          onClick={() => window.close()}
          className="flex items-center gap-1.5 bg-white text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
        >
          <X size={14} />
          Cerrar
        </button>
      </div>

      <div className="min-h-screen bg-gray-100 flex items-start justify-center py-14">
        <div className="ticket-card bg-white rounded-xl shadow-lg p-6" style={{ width: '340px' }}>
          {!ready ? (
            <p className="text-gray-400 text-sm text-center py-10">Cargando ticket...</p>
          ) : !ticketData ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">No hay ticket disponible.</p>
              <p className="text-gray-300 text-xs mt-1">Procesa una venta primero.</p>
            </div>
          ) : (
            <SaleTicket data={ticketData} />
          )}
        </div>
      </div>
    </>
  )
}
