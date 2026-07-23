'use client'

import { cn } from '@/lib/utils'

export type DatePreset = 'today' | 'week' | 'month' | 'year' | 'historic' | 'custom'

const presets: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mes' },
  { key: 'year', label: 'Este año' },
  { key: 'historic', label: 'Histórico' },
  { key: 'custom', label: 'Personalizado' },
]

interface DateRangeFilterProps {
  from: string
  to: string
  preset: DatePreset
  onPresetChange: (preset: DatePreset) => void
  onFromChange: (date: string) => void
  onToChange: (date: string) => void
}

export function DateRangeFilter({
  from,
  to,
  preset,
  onPresetChange,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-4 flex-wrap bg-white rounded-xl border border-gray-100 p-4">
      {/* Preset pills */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg flex-shrink-0">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => onPresetChange(p.key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap',
              preset === p.key
                ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Desde</span>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              onFromChange(e.target.value)
              onPresetChange('custom')
            }}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 text-gray-700 bg-gray-50"
          />
        </div>
        <span className="text-gray-300">—</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Hasta</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              onToChange(e.target.value)
              onPresetChange('custom')
            }}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 text-gray-700 bg-gray-50"
          />
        </div>
      </div>

      {/* Range label */}
      {from && to && (
        <span className="text-xs text-gray-400 hidden md:block">
          {from === to ? from : `${from} al ${to}`}
        </span>
      )}
    </div>
  )
}
