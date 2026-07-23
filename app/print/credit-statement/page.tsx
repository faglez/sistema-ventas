import { getCustomerStatements } from '@/lib/actions/credits'
import { getSettings } from '@/lib/actions/settings'
import { CreditStatementPrint } from '@/components/print/credit-statement-print'

interface Props {
  searchParams: Promise<{ customer?: string }>
}

export default async function CreditStatementPage({ searchParams }: Props) {
  const { customer } = await searchParams
  const customerIds = customer ? customer.split(',').filter(Boolean) : undefined

  const [statements, settings] = await Promise.all([
    getCustomerStatements(customerIds),
    getSettings(),
  ])

  const generatedAt = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (statements.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
        No hay movimientos de crédito para los clientes seleccionados.
      </div>
    )
  }

  return (
    <CreditStatementPrint
      statements={statements}
      settings={settings}
      generatedAt={generatedAt}
    />
  )
}
