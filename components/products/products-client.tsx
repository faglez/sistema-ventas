'use client'

import { useState, useMemo, useTransition } from 'react'
import { ProductFilters } from '@/components/products/product-filters'
import { ProductTable } from '@/components/products/product-table'
import { ProductFormDialog } from '@/components/products/product-form-dialog'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/products'
import type { ProductFormData } from '@/lib/actions/products'
import type { CategoryDef } from '@/lib/actions/settings'
import type { Product } from '@/types'
import { AlertTriangle } from 'lucide-react'

interface ProductsClientProps {
  initialProducts: Product[]
  categories?: CategoryDef[]
  clothingSizes?: string[]
  shoeSizes?: string[]
  currency?: string
  lowStockThreshold?: number
}

export function ProductsClient({ initialProducts, categories, clothingSizes, shoeSizes, currency, lowStockThreshold = 5 }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>('all')

  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = !category || category === 'all' || p.category === category
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [products, search, category])

  const handleAdd = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = (product: Product) => {
    setDeletingProduct(product)
  }

  const handleSave = async (data: ProductFormData) => {
    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, data)
      startTransition(() => {
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      })
    } else {
      const created = await createProduct(data)
      startTransition(() => {
        setProducts((prev) => [created, ...prev])
      })
    }
  }

  const handleConfirmDelete = async (id: string) => {
    await deleteProduct(id)
    startTransition(() => {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    })
  }

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= lowStockThreshold && p.status !== 'inactivo').length,
    [products, lowStockThreshold]
  )

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Productos</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">Gestión de Productos</h1>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-700">
            <span className="font-semibold">{lowStockCount} producto{lowStockCount > 1 ? 's' : ''}</span> con stock igual o menor a {lowStockThreshold} unidades.
          </p>
        </div>
      )}

      <ProductFilters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        onAdd={handleAdd}
        categories={categories}
      />

      <Card>
        <CardContent className="p-0">
          <ProductTable
            products={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            lowStockThreshold={lowStockThreshold}
          />
        </CardContent>
      </Card>

      <ProductFormDialog
        open={showForm}
        product={editingProduct}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        categories={categories}
        clothingSizes={clothingSizes}
        shoeSizes={shoeSizes}
        currency={currency}
      />

      <DeleteProductDialog
        product={deletingProduct}
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
