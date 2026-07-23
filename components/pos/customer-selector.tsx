'use client'

import { useState, useRef, useEffect } from 'react'
import { Customer } from '@/types'
import { User, X, Wallet, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerSelectorProps {
  customers: Customer[]
  selected: Customer | null
  onSelect: (c: Customer | null) => void
}

export function CustomerSelector({ customers, selected, onSelect }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  )

  if (selected) {
    return (
      <div className="flex items-center gap-2 p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
        <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{selected.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Wallet className="w-2.5 h-2.5 text-indigo-500" />
            <span className="text-[10px] text-indigo-600 font-medium">
              Crédito disponible: ${selected.creditBalance.toFixed(2)}
            </span>
          </div>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed transition-all text-left',
          open
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
        )}
      >
        <User className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <span className="text-xs text-gray-400 flex-1">Seleccionar cliente...</span>
        <ChevronDown className={cn('w-3.5 h-3.5 text-gray-300 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              placeholder="Buscar por nombre o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Sin resultados</p>
            ) : (
              filtered.map((c) => {
                const initials = c.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelect(c)
                      setOpen(false)
                      setSearch('')
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-50 text-left transition-colors"
                  >
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-indigo-700">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{c.name}</p>
                      <div className="flex items-center gap-1">
                        <Wallet className="w-2.5 h-2.5 text-gray-400" />
                        <p className="text-[10px] text-gray-400">
                          Crédito: ${c.creditBalance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {c.creditBalance > 0 && (
                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                        Con saldo
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
