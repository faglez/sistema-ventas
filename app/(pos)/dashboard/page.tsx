import { getDashboardMetrics } from '@/lib/actions/transactions'
import { getTransactions } from '@/lib/actions/transactions'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { RecentSalesTable } from '@/components/dashboard/recent-sales-table'
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react'

export default async function DashboardPage() {
  const [{ metrics: m, salesData }, transactions] = await Promise.all([
    getDashboardMetrics(),
    getTransactions(),
  ])

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Panel</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">Panel Principal</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Ventas Hoy"
          value={`$${m.salesTotal.toFixed(2)}`}
          change={m.salesChange}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <MetricCard
          title="Transacciones"
          value={m.transactions.toString()}
          change={m.transactionsChange}
          icon={ShoppingBag}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <MetricCard
          title="Clientes Nuevos"
          value={m.newCustomers.toString()}
          change={m.newCustomersChange}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <MetricCard
          title="Productos Vendidos"
          value={m.productsSold.toString()}
          change={m.productsSoldChange}
          icon={Package}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SalesChart salesData={salesData} />
        <RecentSalesTable transactions={transactions} />
      </div>
    </div>
  )
}
