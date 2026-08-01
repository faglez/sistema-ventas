'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Loader2, Upload, ImageIcon, Link, Barcode } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, ProductSize, ProductStatus } from '@/types'
import type { ProductFormData } from '@/lib/actions/products'
import type { CategoryDef } from '@/lib/actions/settings'

const DEFAULT_CLOTHING_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL']
const DEFAULT_SHOE_SIZES: ProductSize[] = ['36', '37', '38', '39', '40', '41', '42', '43']
const DEFAULT_CATEGORIES: CategoryDef[] = [
  { value: 'men', label: 'Hombres' },
  { value: 'women', label: 'Mujeres' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Niños' },
  { value: 'accessories', label: 'Accesorios' },
]

interface ProductFormDialogProps {
  open: boolean
  product?: Product | null
  onClose: () => void
  onSave: (data: ProductFormData) => Promise<void>
  categories?: CategoryDef[]
  clothingSizes?: string[]
  shoeSizes?: string[]
  currency?: string
}

const empty: ProductFormData = {
  name: '',
  category: 'men',
  sizes: ['M'],
  colors: ['#000000'],
  price: 0,
  image: '',
  stock: 0,
  status: 'activo',
  barcode: '',
}

function toFormData(p: Product): ProductFormData {
  return {
    name: p.name,
    category: p.category,
    sizes: p.sizes,
    colors: p.colors,
    price: p.price,
    image: p.image,
    stock: p.stock,
    status: p.status,
    barcode: p.barcode ?? '',
  }
}

export function ProductFormDialog({ open, product, onClose, onSave, categories, clothingSizes, shoeSizes, currency = 'PEN' }: ProductFormDialogProps) {
  const cats = categories ?? DEFAULT_CATEGORIES
  const clothSizes = clothingSizes ?? DEFAULT_CLOTHING_SIZES
  const shoeSzs = shoeSizes ?? DEFAULT_SHOE_SIZES
  const [form, setForm] = useState<ProductFormData>(empty)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({})
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [urlMode, setUrlMode] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setForm(product ? toFormData(product) : { ...empty, colors: ['#000000'], sizes: ['M'] })
      setErrors({})
      setUploadError('')
      setUrlMode(false)
      setDragOver(false)
    }
  }, [open, product])

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Solo se permiten imágenes.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no puede superar 5 MB.')
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al subir imagen.')
      set('image', json.url)
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Error al subir imagen.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleSize = (size: ProductSize) =>
    set('sizes', form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size])

  const addColor = () => set('colors', [...form.colors, '#6366f1'])
  const removeColor = (i: number) => set('colors', form.colors.filter((_, idx) => idx !== i))
  const updateColor = (i: number, val: string) =>
    set('colors', form.colors.map((c, idx) => (idx === i ? val : c)))

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (form.price <= 0) e.price = 'El precio debe ser mayor a 0'
    if (form.stock < 0) e.stock = 'El stock no puede ser negativo'
    if (form.sizes.length === 0) e.sizes = 'Selecciona al menos una talla'
    if (form.colors.length === 0) e.colors = 'Agrega al menos un color'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const isEdit = !!product

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-5 py-2">
          {/* Nombre */}
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Nombre del producto *</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: Camisa Casual Manga Larga"
              className={cn(errors.name && 'border-red-400')}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Categoría *</Label>
            <Select value={form.category} onValueChange={(v) => set('category', v ?? cats[0]?.value ?? 'men')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cats.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Estado *</Label>
            <Select value={form.status} onValueChange={(v) => set('status', v as ProductStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="agotado">Agotado</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Precio */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Precio ({currency}) *</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.price || ''}
              onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={cn(errors.price && 'border-red-400')}
            />
            {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Stock inicial *</Label>
            <Input
              type="number"
              min={0}
              value={form.stock || ''}
              onChange={(e) => set('stock', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={cn(errors.stock && 'border-red-400')}
            />
            {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
          </div>

          {/* Imagen */}
          <div className="col-span-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-700">Imagen del producto</Label>
              <button
                type="button"
                onClick={() => setUrlMode((v) => !v)}
                className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700"
              >
                <Link className="w-3 h-3" />
                {urlMode ? 'Usar archivo' : 'Usar URL'}
              </button>
            </div>

            {urlMode ? (
              /* URL mode */
              <div className="flex gap-2">
                <Input
                  value={form.image}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-xs"
                />
                {form.image && (
                  <img
                    src={form.image}
                    alt="preview"
                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>
            ) : (
              /* Upload mode */
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-xl transition-colors',
                  dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />

                <div className="flex items-center gap-4 p-3">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    ) : form.image ? (
                      <img
                        src={form.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploading ? 'Subiendo…' : form.image ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      O arrastra una imagen aquí · JPG, PNG, WEBP · máx. 5 MB
                    </p>
                    {form.image && !uploading && (
                      <button
                        type="button"
                        onClick={() => set('image', '')}
                        className="text-[10px] text-red-400 hover:text-red-500 mt-0.5"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                </div>

                {uploadError && (
                  <p className="px-3 pb-2 text-xs text-red-500">{uploadError}</p>
                )}
              </div>
            )}
          </div>

          {/* Tallas */}
          <div className="col-span-2 space-y-2">
            <Label className="text-xs font-medium text-gray-700">Tallas disponibles *</Label>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Ropa</p>
              <div className="flex flex-wrap gap-2">
                {clothSizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-medium border transition-all',
                      form.sizes.includes(s)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Calzado</p>
              <div className="flex flex-wrap gap-2">
                {shoeSzs.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-medium border transition-all',
                      form.sizes.includes(s)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {errors.sizes && <p className="text-xs text-red-500">{errors.sizes}</p>}
          </div>

          {/* Código de barras */}
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Código de barras (opcional)</Label>
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={form.barcode ?? ''}
                onChange={(e) => set('barcode', e.target.value)}
                placeholder="EAN-13, UPC, o código personalizado..."
                className="pl-9 font-mono text-sm"
              />
            </div>
            <p className="text-[11px] text-gray-400">
              Puedes escanear el código con un lector o ingresarlo manualmente.
            </p>
          </div>

          {/* Colores */}
          <div className="col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-700">Colores disponibles *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addColor}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar color
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.colors.map((color, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(i, e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-xs text-gray-500 font-mono">{color}</span>
                  {form.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(i)}
                      className="text-gray-300 hover:text-red-400 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.colors && <p className="text-xs text-red-500">{errors.colors}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
