'use client'

import { useState, useMemo } from 'react'
import { DateRangeFilter, DatePreset } from '@/components/reports/date-range-filter'
import { ReportSummaryCards } from '@/components/reports/report-summary-cards'
import { CustomerReportTable, buildCustomerReportRows } from '@/components/reports/customer-report-table'
import { TransactionsByDate } from '@/components/reports/transactions-by-date'
import { SalesByPeriodChart } from '@/components/reports/sales-by-period-chart'
import { CreditMovementsReport } from '@/components/reports/credit-movements-report'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, Printer, Users, List, Wallet } from 'lucide-react'
import { downloadCSV } from '@/lib/csv'
import type { Transaction, CreditTransaction } from '@/types'
import type { CreditMovement } from '@/lib/actions/credits'

type ReportTab = 'customers' | 'transactions' | 'credits'

function getPresetRange(preset: DatePreset): { from: string; to: string } {
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const todayStr = fmt(today)

  switch (preset) {
    case 'today':
      return { from: todayStr, to: todayStr }

    case 'week': {
      const d = new Date(today)
      const day = d.getDay() || 7
      d.setDate(d.getDate() - day + 1)
      return { from: fmt(d), to: todayStr }
    }

    case 'month':
      return {
        from: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
        to: todayStr,
      }

    case 'year':
      return { from: `${today.getFullYear()}-01-01`, to: todayStr }

    case 'historic':
      return { from: '2000-01-01', to: todayStr }

    default:
      return { from: todayStr, to: todayStr }
  }
}

interface ReportsClientProps {
  initialTransactions: Transaction[]
  initialCreditTxs: CreditTransaction[]
  initialCreditMovements: CreditMovement[]
}

export function ReportsClient({ initialTransactions, initialCreditTxs, initialCreditMovements }: ReportsClientProps) {
  const [preset, setPreset] = useState<DatePreset>('historic')
  const initialRange = getPresetRange('historic')
  const [from, setFrom] = useState(initialRange.from)
  const [to, setTo] = useState(initialRange.to)
  const [activeTab, setActiveTab] = useState<ReportTab>('customers')

  const handlePresetChange = (p: DatePreset) => {
    setPreset(p)
    if (p !== 'custom') {
      const range = getPresetRange(p)
      setFrom(range.from)
      setTo(range.to)
    }
  }

  const filteredTransactions = useMemo(
    () => initialTransactions.filter((tx) => tx.date >= from && tx.date <= to),
    [initialTransactions, from, to]
  )

  const filteredCreditTxs = useMemo(
    () => initialCreditTxs.filter((ct) => ct.date >= from && ct.date <= to),
    [initialCreditTxs, from, to]
  )

  const periodLabel =
    preset === 'historic'
      ? 'Todo el historial'
      : preset === 'today'
      ? 'Hoy'
      : from === to
      ? from
      : `${from} — ${to}`

  const handleExportCSV = () => {
    const suffix = `${from}_a_${to}`

    if (activeTab === 'customers') {
      const rows = buildCustomerReportRows(filteredTransactions, filteredCreditTxs)
      downloadCSV(
        `reporte-clientes_${suffix}.csv`,
        ['Cliente', 'ID', 'Transacciones', 'Completadas', 'Canceladas', 'Total Comprado', 'Ticket Promedio', 'Crédito Usado', 'Crédito Agregado'],
        rows.map((r) => [r.name, r.id, r.totalTxs, r.completedTxs, r.cancelledTxs, r.total.toFixed(2), r.avg.toFixed(2), r.creditsUsed.toFixed(2), r.creditsAdded.toFixed(2)])
      )
      return
    }

    if (activeTab === 'transactions') {
      downloadCSV(
        `reporte-transacciones_${suffix}.csv`,
        ['ID', 'Fecha', 'Cliente', 'Artículos', 'Subtotal', 'Descuento', 'Impuesto', 'Total', 'Método de Pago', 'Estado'],
        filteredTransactions.map((tx) => [
          tx.id, tx.date, tx.customerName, tx.items.length,
          tx.subtotal.toFixed(2), tx.discount.toFixed(2), tx.tax.toFixed(2), tx.total.toFixed(2),
          tx.paymentMethod, tx.status,
        ])
      )
      return
    }

    const creditRows = initialCreditMovements.filter((m) => m.date >= from && m.date <= to)
    downloadCSV(
      `reporte-creditos_${suffix}.csv`,
      ['Fecha', 'Cliente', 'Email', 'Tipo', 'Descripción', 'Monto', 'Saldo Anterior', 'Saldo Resultante'],
      creditRows.map((m) => [m.date, m.customerName, m.customerEmail, m.type, m.reason, m.amount.toFixed(2), m.balanceBefore.toFixed(2), m.balanceAfter.toFixed(2)])
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Reportes</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">Reportes</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Período:{' '}
            <span className="font-medium text-indigo-600">{periodLabel}</span>
            {filteredTransactions.length > 0 && (
              <span className="ml-2 text-gray-300">
                · {filteredTransactions.length} transacción{filteredTransactions.length !== 1 ? 'es' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="print:hidden">
        <DateRangeFilter
          from={from}
          to={to}
          preset={preset}
          onPresetChange={handlePresetChange}
          onFromChange={(d) => { setFrom(d); setPreset('custom') }}
          onToChange={(d) => { setTo(d); setPreset('custom') }}
        />
      </div>

      <ReportSummaryCards transactions={filteredTransactions} />

      <SalesByPeriodChart transactions={filteredTransactions} />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab((v as ReportTab) ?? 'customers')} className="space-y-4">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="customers" className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5" />
            Por Cliente
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-1.5 text-xs">
            <List className="w-3.5 h-3.5" />
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-1.5 text-xs">
            <Wallet className="w-3.5 h-3.5" />
            Créditos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <CustomerReportTable
              transactions={filteredTransactions}
              creditTransactions={filteredCreditTxs}
            />
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsByDate transactions={filteredTransactions} />
        </TabsContent>

        <TabsContent value="credits">
          <CreditMovementsReport
            movements={initialCreditMovements}
            from={from}
            to={to}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
