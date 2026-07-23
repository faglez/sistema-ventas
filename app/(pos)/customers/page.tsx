import { getCustomers } from '@/lib/actions/customers'
import { getCreditTransactions } from '@/lib/actions/credits'
import { CustomersClient } from '@/components/customers/customers-client'

export default async function CustomersPage() {
  const [customers, creditTxs] = await Promise.all([
    getCustomers(),
    getCreditTransactions(),
  ])
  return <CustomersClient initialCustomers={customers} initialCreditTxs={creditTxs} />
}
