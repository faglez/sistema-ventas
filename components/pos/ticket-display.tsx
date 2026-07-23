'use client'

import { useEffect } from 'react'
import { Printer, X } from 'lucide-react'
import { SaleTicket } from '@/components/pos/sale-ticket'
import { TicketData } from '@/types'

interface Props {
  data: TicketData
  autoPrint?: boolean
}

export function TicketDisplay({ data, autoPrint = true }: Props) {
  useEffect(() => {
    if (!autoPrint) return
    const t = setTimeout(() => window.print(), 400)
    return () => clearTimeout(t)
  }, [autoPrint])

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
          <SaleTicket data={data} />
        </div>
      </div>
    </>
  )
}
