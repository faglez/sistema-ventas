import { Product } from '@/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Barcode, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const categoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    men: 'Hombres', women: 'Mujeres', unisex: 'Unisex', kids: 'Niños', accessories: 'Accesorios',
  }
  return map[cat] || cat
}

const statusStyle = (status: string) => {
  if (status === 'activo') return 'bg-green-50 text-green-700 border-green-100'
  if (status === 'agotado') return 'bg-yellow-50 text-yellow-700 border-yellow-100'
  return 'bg-gray-50 text-gray-500 border-gray-100'
}

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  lowStockThreshold?: number
}

export function ProductTable({ products, onEdit, onDelete, lowStockThreshold = 5 }: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-100">
          <TableHead className="text-xs">Producto</TableHead>
          <TableHead className="text-xs">Categoría</TableHead>
          <TableHead className="text-xs">Tallas</TableHead>
          <TableHead className="text-xs">Cód. Barras</TableHead>
          <TableHead className="text-xs">Stock</TableHead>
          <TableHead className="text-xs">Precio</TableHead>
          <TableHead className="text-xs">Estado</TableHead>
          <TableHead className="text-xs w-20"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-sm text-gray-400 py-10">
              No hay productos que coincidan con la búsqueda.
            </TableCell>
          </TableRow>
        )}
        {products.map((p) => {
          const isLowStock = p.stock <= lowStockThreshold && p.status !== 'inactivo'
          return (
            <TableRow key={p.id} className={cn('border-gray-50 hover:bg-gray-50/50', isLowStock && 'bg-orange-50/30')}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{p.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{categoryLabel(p.category)}</span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-gray-500">{p.sizes.join(', ')}</span>
              </TableCell>
              <TableCell>
                {p.barcode ? (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-mono bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                    <Barcode className="w-3 h-3 text-gray-400" />
                    {p.barcode}
                  </span>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />}
                  <span className={cn('text-sm font-medium', isLowStock ? 'text-orange-600' : 'text-gray-700')}>
                    {p.stock}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-bold text-gray-900">${p.price.toFixed(2)}</span>
              </TableCell>
              <TableCell>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize', statusStyle(p.status))}>
                  {p.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600"
                    onClick={() => onEdit(p)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => onDelete(p)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
