'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface CategoryDef {
  value: string
  label: string
}

export interface StoreSettings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  taxRate: number
  lowStockThreshold: number
  categories: CategoryDef[]
  clothingSizes: string[]
  shoeSizes: string[]
}

const DEFAULT_CATEGORIES: CategoryDef[] = [
  { value: 'men', label: 'Hombres' },
  { value: 'women', label: 'Mujeres' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Niños' },
  { value: 'accessories', label: 'Accesorios' },
]
const DEFAULT_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const DEFAULT_SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43']

const DEFAULTS: Omit<StoreSettings, 'categories' | 'clothingSizes' | 'shoeSizes'> = {
  storeName: 'VentasPOS',
  storeEmail: 'ventas@ventaspos.com',
  storePhone: '+51 999 000 111',
  storeAddress: 'Av. Principal 123, Lima, Perú',
  currency: 'PEN',
  taxRate: 11,
  lowStockThreshold: 5,
}

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany()
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    storeName: map.storeName ?? DEFAULTS.storeName,
    storeEmail: map.storeEmail ?? DEFAULTS.storeEmail,
    storePhone: map.storePhone ?? DEFAULTS.storePhone,
    storeAddress: map.storeAddress ?? DEFAULTS.storeAddress,
    currency: map.currency ?? DEFAULTS.currency,
    taxRate: parseFloat(map.taxRate ?? String(DEFAULTS.taxRate)),
    lowStockThreshold: parseInt(map.lowStockThreshold ?? String(DEFAULTS.lowStockThreshold), 10),
    categories: parseJson(map.categories, DEFAULT_CATEGORIES),
    clothingSizes: parseJson(map.clothingSizes, DEFAULT_CLOTHING_SIZES),
    shoeSizes: parseJson(map.shoeSizes, DEFAULT_SHOE_SIZES),
  }
}

export async function saveSettings(data: StoreSettings): Promise<void> {
  const { categories, clothingSizes, shoeSizes, lowStockThreshold: _lst, ...scalar } = data
  const scalarWithThreshold = { ...scalar, lowStockThreshold: String(data.lowStockThreshold) }
  const scalarEntries = (Object.entries(scalarWithThreshold) as [string, string | number][]).map(([key, value]) =>
    prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })
  )
  const jsonEntries = [
    { key: 'categories', value: JSON.stringify(categories) },
    { key: 'clothingSizes', value: JSON.stringify(clothingSizes) },
    { key: 'shoeSizes', value: JSON.stringify(shoeSizes) },
  ].map(({ key, value }) =>
    prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
  )
  await prisma.$transaction([...scalarEntries, ...jsonEntries])
  revalidatePath('/settings')
  revalidatePath('/orders')
  revalidatePath('/products')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
}
