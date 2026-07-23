import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ImageIcon } from 'lucide-react'
import type { SalesDataPoint, Product } from '@/types'

const categoryData = [
  { label: 'Hombres', value: 35, color: 'bg-indigo-500' },
  { label: 'Mujeres', value: 28, color: 'bg-pink-500' },
  { label: 'Unisex', value: 18, color: 'bg-purple-500' },
  { label: 'Niños', value: 12, color: 'bg-yellow-500' },
  { label: 'Accesorios', value: 7, color: 'bg-green-500' },
]

interface AnalyticsOverviewProps {
  salesData: SalesDataPoint[]
  topProducts: Product[]
}

export function AnalyticsOverview({ salesData, topProducts }: AnalyticsOverviewProps) {
  const totalSales = salesData.reduce((s, d) => s + d.value, 0)
  const max = Math.max(...salesData.map((x) => x.value), 1)

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-gray-400">Ventas Totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalSales.toLocaleString()}</p>
          <p className="text-xs text-green-500 font-medium mt-1">+12.5% vs mes anterior</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-gray-400">Promedio por Transacción</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$117.84</p>
          <p className="text-xs text-green-500 font-medium mt-1">+5.2% vs mes anterior</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-gray-400">Tasa de Devolución</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">2.4%</p>
          <p className="text-xs text-red-500 font-medium mt-1">+0.3% vs mes anterior</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryData.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                    <span className="text-gray-600">{c.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{c.value}%</span>
                </div>
                <Progress value={c.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Productos Destacados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-5 text-center">{i + 1}</span>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-9 h-9 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex-shrink-0 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.stock} uds. en stock</p>
                </div>
                <span className="text-sm font-bold text-gray-900 flex-shrink-0">${p.price.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly bars */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Tendencia de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-24">
            {salesData.map((d, i) => {
              const isLast = i === salesData.length - 1
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: '72px' }}>
                    <div
                      className={`w-full rounded-t-md ${isLast ? 'bg-indigo-600' : 'bg-indigo-100'}`}
                      style={{ height: `${(d.value / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{d.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
