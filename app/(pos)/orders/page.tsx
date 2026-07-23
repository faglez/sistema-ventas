import { getProducts } from '@/lib/actions/products'
import { getCustomers } from '@/lib/actions/customers'
import { getSettings } from '@/lib/actions/settings'
import { OrdersClient } from '@/components/pos/orders-client'

export default async function OrdersPage() {
  const [products, customers, settings] = await Promise.all([
    getProducts(),
    getCustomers(),
    getSettings(),
  ])
  return (
    <OrdersClient
      initialProducts={products}
      initialCustomers={customers}
      taxRate={settings.taxRate}
      categories={settings.categories}
    />
  )
}
