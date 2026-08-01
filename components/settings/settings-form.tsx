'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Save, Store, DollarSign, Bell, Check, Loader2, Tags, X, Plus, Ruler } from 'lucide-react'
import { saveSettings, type StoreSettings } from '@/lib/actions/settings'

interface SettingsFormProps {
  initial: StoreSettings
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const [form, setForm] = useState<StoreSettings>({ ...initial, currency: initial.currency ?? 'PEN' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // new category input
  const [newCatLabel, setNewCatLabel] = useState('')
  // new size inputs
  const [newClothingSize, setNewClothingSize] = useState('')
  const [newShoeSize, setNewShoeSize] = useState('')

  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  /* ── Categories helpers ── */
  const updateCatLabel = (idx: number, label: string) =>
    set('categories', form.categories.map((c, i) => (i === idx ? { ...c, label } : c)))

  const removeCat = (idx: number) =>
    set('categories', form.categories.filter((_, i) => i !== idx))

  const addCat = () => {
    const label = newCatLabel.trim()
    if (!label) return
    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    if (form.categories.some((c) => c.value === value)) return
    set('categories', [...form.categories, { value, label }])
    setNewCatLabel('')
  }

  /* ── Size helpers ── */
  const removeSize = (field: 'clothingSizes' | 'shoeSizes', idx: number) =>
    set(field, (form[field] as string[]).filter((_, i) => i !== idx))

  const addSize = (field: 'clothingSizes' | 'shoeSizes', raw: string, clear: () => void) => {
    const val = raw.trim().toUpperCase()
    if (!val) return
    const list = form[field] as string[]
    if (list.includes(val)) return
    set(field, [...list, val])
    clear()
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Información de la Tienda */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <CardTitle className="text-sm font-semibold">Información de la Tienda</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Nombre de la Tienda</label>
            <Input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Email</label>
              <Input type="email" value={form.storeEmail} onChange={(e) => set('storeEmail', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">Teléfono</label>
              <Input value={form.storePhone} onChange={(e) => set('storePhone', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Dirección</label>
            <Input value={form.storeAddress} onChange={(e) => set('storeAddress', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Configuración Financiera */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-green-600" />
            </div>
            <CardTitle className="text-sm font-semibold">Configuración Financiera</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Moneda</label>
            <Select value={form.currency ?? 'PEN'} onValueChange={(v) => set('currency', v ?? 'PEN')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEN">PEN — Sol Peruano</SelectItem>
                <SelectItem value="USD">USD — Dólar Americano</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="MXN">MXN — Peso Mexicano</SelectItem>
                <SelectItem value="COP">COP — Peso Colombiano</SelectItem>
                <SelectItem value="ARS">ARS — Peso Argentino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="max-w-xs">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Tasa de Impuesto (%)</label>
            <Input
              type="number" min="0" max="100" step="0.5"
              value={form.taxRate}
              onChange={(e) => set('taxRate', parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Se aplica el <span className="font-medium text-gray-600">{form.taxRate}%</span> sobre el subtotal en cada venta
            </p>
          </div>
          <div className="max-w-xs">
            <label className="text-xs font-medium text-gray-500 block mb-1.5">Umbral de stock bajo (unidades)</label>
            <Input
              type="number" min="1" max="999" step="1"
              value={form.lowStockThreshold}
              onChange={(e) => set('lowStockThreshold', parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-gray-400 mt-1">
              Se mostrará alerta cuando el stock sea ≤ <span className="font-medium text-gray-600">{form.lowStockThreshold}</span> unidades
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Catálogo de Categorías */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
              <Tags className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <CardTitle className="text-sm font-semibold">Categorías de Productos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {form.categories.map((cat, idx) => (
              <div key={cat.value} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-mono w-24 flex-shrink-0">{cat.value}</span>
                <Input
                  value={cat.label}
                  onChange={(e) => updateCatLabel(idx, e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeCat(idx)}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newCatLabel}
              onChange={(e) => setNewCatLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCat()}
              placeholder="Nueva categoría…"
              className="h-8 text-xs flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={addCat} className="h-8 text-xs px-2.5">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Agregar
            </Button>
          </div>
          <p className="text-[10px] text-gray-400">El ID interno (columna izquierda) se genera automáticamente y no cambia al editar la etiqueta.</p>
        </CardContent>
      </Card>

      {/* Catálogo de Tallas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
              <Ruler className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <CardTitle className="text-sm font-semibold">Catálogo de Tallas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Ropa */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Tallas de Ropa</p>
            <div className="flex flex-wrap gap-2">
              {form.clothingSizes.map((s, idx) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md"
                >
                  {s}
                  <button type="button" onClick={() => removeSize('clothingSizes', idx)} className="text-indigo-300 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newClothingSize}
                  onChange={(e) => setNewClothingSize(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSize('clothingSizes', newClothingSize, () => setNewClothingSize(''))}
                  placeholder="Ej: XXL"
                  className="h-7 w-20 text-xs"
                />
                <button
                  type="button"
                  onClick={() => addSize('clothingSizes', newClothingSize, () => setNewClothingSize(''))}
                  className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calzado */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Tallas de Calzado</p>
            <div className="flex flex-wrap gap-2">
              {form.shoeSizes.map((s, idx) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md"
                >
                  {s}
                  <button type="button" onClick={() => removeSize('shoeSizes', idx)} className="text-purple-300 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newShoeSize}
                  onChange={(e) => setNewShoeSize(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSize('shoeSizes', newShoeSize, () => setNewShoeSize(''))}
                  placeholder="Ej: 44"
                  className="h-7 w-20 text-xs"
                />
                <button
                  type="button"
                  onClick={() => addSize('shoeSizes', newShoeSize, () => setNewShoeSize(''))}
                  className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 text-gray-500"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <CardTitle className="text-sm font-semibold">Notificaciones</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 italic">Próximamente — Alertas de stock bajo, ventas diarias, etc.</p>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saved ? '¡Configuración guardada!' : 'Guardar Cambios'}
        </Button>
        {saved && <p className="text-xs text-green-600">Los cambios se aplican inmediatamente en todo el sistema.</p>}
      </div>
    </div>
  )
}
