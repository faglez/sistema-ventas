'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import type { CategoryDef } from '@/lib/actions/settings'

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { value: 'men', label: 'Hombres' },
  { value: 'women', label: 'Mujeres' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Niños' },
  { value: 'accessories', label: 'Accesorios' },
]

interface ProductFiltersProps {
  search: string
  onSearch: (v: string) => void
  category: string | null
  onCategory: (v: string | null) => void
  onAdd: () => void
  categories?: CategoryDef[]
}

export function ProductFilters({ search, onSearch, category, onCategory, onAdd, categories }: ProductFiltersProps) {
  const cats = categories ?? DEFAULT_CATEGORIES
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={category ?? 'all'} onValueChange={onCategory}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {cats.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={onAdd}
        className="bg-indigo-600 hover:bg-indigo-700 text-white ml-auto"
      >
        <Plus className="w-4 h-4 mr-2" />
        Agregar Producto
      </Button>
    </div>
  )
}
