import { getTransactions } from '@/lib/actions/transactions'
import { TransactionsClient } from '@/components/transactions/transactions-client'

export default async function TransactionsPage() {
  const transactions = await getTransactions()
  return <TransactionsClient initialTransactions={transactions} />
}
