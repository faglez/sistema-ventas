import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnalyticsData } from '@/lib/actions/analytics'

interface AnalyticsOverviewProps {
  analytics: AnalyticsData
}

function ChangeLabel({ pct, invert = false }: { pct: number | null; invert?: boolean }) {
  if (pct === null) {
    return <p className="text-xs font-medium mt-1 text-gray-400">Sin datos del mes anterior</p>
  }
  const isGood = invert ? pct <= 0 : pct >= 0
  return (
    <p className={cn('text-xs font-medium mt-1', isGood ? 'text-green-500' : 'text-red-500')}>
      {pct >= 0 ? '+' : ''}
      {pct}% vs mes anterior
    </p>
  )
}

export function AnalyticsOverview({ analytics }: AnalyticsOverviewProps) {
  const { salesTotal, salesChangePct, avgTicket, avgTicketChangePct, cancelRate, cancelRateDeltaPoints, categoryBreakdown, topProducts, monthlyTrend, periodLabel } = analytics
  const max = Math.max(...monthlyTrend.map((x) => x.value), 1)

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-gray-400">Ventas Totales · {periodLabel}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${salesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <ChangeLabel pct={salesChangePct} />
        </Card>
        <Card className="p-5">
          <p className="text-xs text-gray-400">Promedio por Transacción</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${avgTicket.toFixed(2)}</p>
          <ChangeLabel pct={avgTicketChangePct} />
        </Card>
        <Card className="p-5">
          <p className="text-xs text-gray-400">Tasa de Cancelación</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{cancelRate}%</p>
          <ChangeLabel pct={cancelRateDeltaPoints} invert />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-gray-300 text-center py-6">Sin ventas registradas</p>
            ) : (
              categoryBreakdown.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                      <span className="text-gray-600">{c.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{c.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', c.color)} style={{ width: `${c.value}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-300 text-center py-6">Sin ventas registradas</p>
            ) : (
              topProducts.map((p, i) => (
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
                    <p className="text-xs text-gray-400">{p.unitsSold} vendidos</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">${p.price.toFixed(2)}</span>
                </div>
              ))
            )}
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
            {monthlyTrend.map((d, i) => {
              const isLast = i === monthlyTrend.length - 1
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
