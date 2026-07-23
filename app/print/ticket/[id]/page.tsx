import { getTicketDataForTransaction } from '@/lib/actions/transactions'
import { TicketDisplay } from '@/components/pos/ticket-display'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReprintTicketPage({ params }: Props) {
  const { id } = await params
  const ticketData = await getTicketDataForTransaction(decodeURIComponent(id))

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Transacción no encontrada.</p>
          <p className="text-gray-300 text-xs mt-1">{id}</p>
        </div>
      </div>
    )
  }

  return <TicketDisplay data={ticketData} />
}
