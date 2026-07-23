import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SalesDataPoint } from '@/types'

interface SalesChartProps {
  salesData: SalesDataPoint[]
}

export function SalesChart({ salesData }: SalesChartProps) {
  const max = Math.max(...salesData.map((d) => d.value), 1)
  const total = salesData.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-700">Ventas por Mes</CardTitle>
            <p className="text-2xl font-bold text-gray-900 mt-1">${total.toLocaleString()}</p>
          </div>
          <span className="text-xs text-green-500 font-medium bg-green-50 px-2 py-1 rounded-full">
            +12.5%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-36">
          {salesData.map((d, i) => {
            const heightPct = (d.value / max) * 100
            const isLast = i === salesData.length - 1
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-gray-400">
                  ${(d.value / 1000).toFixed(1)}k
                </span>
                <div className="w-full flex items-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-md transition-all ${isLast ? 'bg-indigo-600' : 'bg-indigo-200'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{d.label}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
