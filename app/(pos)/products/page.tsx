import { getProducts } from '@/lib/actions/products'
import { getSettings } from '@/lib/actions/settings'
import { ProductsClient } from '@/components/products/products-client'

export default async function ProductsPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()])
  return (
    <ProductsClient
      initialProducts={products}
      categories={settings.categories}
      clothingSizes={settings.clothingSizes}
      shoeSizes={settings.shoeSizes}
      currency={settings.currency}
    />
  )
}
