import { getDashboardMetrics } from '@/lib/actions/transactions'
import { getProducts } from '@/lib/actions/products'
import { AnalyticsOverview } from '@/components/analytics/analytics-overview'

export default async function AnalyticsPage() {
  const [{ salesData }, products] = await Promise.all([
    getDashboardMetrics(),
    getProducts(),
  ])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Analíticas</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">Analíticas</h1>
      </div>
      <AnalyticsOverview salesData={salesData} topProducts={products} />
    </div>
  )
}
