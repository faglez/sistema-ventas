import { getTransactions } from '@/lib/actions/transactions'
import { getSettings } from '@/lib/actions/settings'
import { InvoicePreview } from '@/components/invoice/invoice-preview'

export default async function InvoicePage() {
  const [transactions, settings] = await Promise.all([getTransactions(), getSettings()])
  const transaction = transactions[0]

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Nota de Venta</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">Nota de Venta</h1>
      </div>
      {transaction ? (
        <InvoicePreview transaction={transaction} settings={settings} />
      ) : (
        <p className="text-sm text-gray-400">No hay transacciones registradas.</p>
      )}
    </div>
  )
}
