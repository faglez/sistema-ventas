import { Transaction } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SalesByPeriodChartProps {
  transactions: Transaction[]
}

export function SalesByPeriodChart({ transactions }: SalesByPeriodChartProps) {
  const completed = transactions.filter((t) => t.status === 'completada')

  // Group by date
  const byDate = new Map<string, number>()
  completed.forEach((t) => {
    byDate.set(t.date, (byDate.get(t.date) ?? 0) + t.total)
  })

  const data = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date: date.slice(5), full: date, value }))

  const max = data.length > 0 ? Math.max(...data.map((d) => d.value)) : 1
  const totalRevenue = completed.reduce((s, t) => s + t.total, 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Ingresos por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-28 flex items-center justify-center text-gray-300 text-sm">
            Sin datos en el período seleccionado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-700">Ingresos por Día</CardTitle>
            <p className="text-xl font-bold text-gray-900 mt-0.5">${totalRevenue.toFixed(2)}</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
            {data.length} día{data.length !== 1 ? 's' : ''} con ventas
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2" style={{ height: '120px' }}>
          {data.map((d, i) => {
            const heightPct = (d.value / max) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                {/* Tooltip on hover */}
                <div className="relative w-full flex justify-center">
                  <span className="absolute bottom-full mb-1 hidden group-hover:block text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded whitespace-nowrap z-10">
                    {d.full}: ${d.value.toFixed(2)}
                  </span>
                </div>
                <div className="w-full flex items-end" style={{ height: '80px' }}>
                  <div
                    className="w-full rounded-t-sm bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer"
                    style={{ height: `${heightPct}%`, minHeight: '4px' }}
                  />
                </div>
                <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.date}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
