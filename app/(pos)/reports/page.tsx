import { getTransactions } from '@/lib/actions/transactions'
import { getCreditTransactions, getCreditMovements } from '@/lib/actions/credits'
import { ReportsClient } from '@/components/reports/reports-client'

export default async function ReportsPage() {
  const [transactions, creditTxs, creditMovements] = await Promise.all([
    getTransactions(),
    getCreditTransactions(),
    getCreditMovements(),
  ])

  return (
    <ReportsClient
      initialTransactions={transactions}
      initialCreditTxs={creditTxs}
      initialCreditMovements={creditMovements}
    />
  )
}
