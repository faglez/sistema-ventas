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
import { Search, ScanLine, PackageSearch } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  searchQuery: string
  onSearchChange: (q: string) => void
  sortOrder: string
  onSortChange: (sort: 'newest' | 'price-asc' | 'price-desc') => void
  onAddToCart: (product: Product, size: ProductSize, color: string) => void
}

export function ProductGrid({
  products,
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  onAddToCart,
}: ProductGridProps) {
  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors flex-shrink-0">
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
