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

interface ProductsClientProps {
  initialProducts: Product[]
  categories?: CategoryDef[]
  clothingSizes?: string[]
  shoeSizes?: string[]
  currency?: string
}

export function ProductsClient({ initialProducts, categories, clothingSizes, shoeSizes, currency }: ProductsClientProps) {
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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Productos</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">Gestión de Productos</h1>
      </div>

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
