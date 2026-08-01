'use client'

import { useRef, useState } from 'react'
import { Product, ProductSize } from '@/types'
import { ProductCard } from './product-card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, ScanLine, PackageSearch, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: Product[]
  allProducts: Product[]
  searchQuery: string
  onSearchChange: (q: string) => void
  sortOrder: string
  onSortChange: (sort: 'newest' | 'price-asc' | 'price-desc') => void
  onAddToCart: (product: Product, size: ProductSize, color: string) => void
}

export function ProductGrid({
  products,
  allProducts,
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  onAddToCart,
}: ProductGridProps) {
  const [scanMode, setScanMode] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanFeedback, setScanFeedback] = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)
  const barcodeRef = useRef<HTMLInputElement>(null)

  const openScanMode = () => {
    setScanMode(true)
    setBarcodeInput('')
    setScanFeedback(null)
    setTimeout(() => barcodeRef.current?.focus(), 50)
  }

  const closeScanMode = () => {
    setScanMode(false)
    setBarcodeInput('')
    setScanFeedback(null)
  }

  const handleBarcodeSubmit = (raw: string) => {
    const code = raw.trim()
    if (!code) return
    const found = allProducts.find((p) => p.barcode === code)
    if (found) {
      onAddToCart(found, found.sizes[0] ?? '', found.colors[0] ?? '')
      setScanFeedback({ type: 'ok', msg: `✓ ${found.name} agregado al carrito` })
      setBarcodeInput('')
      setTimeout(() => {
        setScanFeedback(null)
        barcodeRef.current?.focus()
      }, 1500)
    } else {
      setScanFeedback({ type: 'error', msg: `Código "${code}" no encontrado` })
      setBarcodeInput('')
      setTimeout(() => {
        setScanFeedback(null)
        barcodeRef.current?.focus()
      }, 2000)
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        {scanMode ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-pulse" />
              <Input
                ref={barcodeRef}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleBarcodeSubmit(barcodeInput)
                  }
                  if (e.key === 'Escape') closeScanMode()
                }}
                placeholder="Escanea o escribe el código y presiona Enter..."
                className="pl-9 h-9 border-indigo-300 focus:border-indigo-500 font-mono"
                autoComplete="off"
              />
            </div>
            {scanFeedback && (
              <span
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded-md flex-shrink-0',
                  scanFeedback.type === 'ok'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-600'
                )}
              >
                {scanFeedback.msg}
              </span>
            )}
            <button
              onClick={closeScanMode}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 flex-shrink-0 border border-gray-200 rounded-lg px-2 py-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={openScanMode}
              className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <ScanLine className="w-4 h-4" />
              <span className="hidden sm:inline">Escanear Código</span>
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar producto..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={sortOrder} onValueChange={(v) => onSortChange(v as 'newest' | 'price-asc' | 'price-desc')}>
              <SelectTrigger className="w-40 h-9 flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más reciente</SelectItem>
                <SelectItem value="price-asc">Precio: menor</SelectItem>
                <SelectItem value="price-desc">Precio: mayor</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
          <PackageSearch className="w-14 h-14 mb-3" />
          <p className="text-base font-medium text-gray-400">Sin resultados</p>
          <p className="text-sm text-gray-300 mt-1">Intenta con otra búsqueda o categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  )
}
