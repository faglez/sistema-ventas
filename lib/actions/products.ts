'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Product, ProductSize, ProductStatus, Category } from '@/types'

type DbProduct = {
  id: string
  name: string
  category: string
  sizes: string
  colors: string
  price: number
  image: string
  stock: number
  status: string
  barcode: string | null
  createdAt: Date
  updatedAt: Date
}

function toProduct(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category as Exclude<Category, 'all'>,
    sizes: JSON.parse(p.sizes) as ProductSize[],
    colors: JSON.parse(p.colors) as string[],
    price: p.price,
    image: p.image,
    stock: p.stock,
    status: p.status as ProductStatus,
    barcode: p.barcode ?? undefined,
  }
}

export async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } })
  return products.map(toProduct)
}

export async function getLowStockCount(threshold: number): Promise<number> {
  return prisma.product.count({
    where: { stock: { lte: threshold }, status: { not: 'inactivo' } },
  })
}

export async function getLowStockProducts(threshold: number): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { stock: { lte: threshold }, status: { not: 'inactivo' } },
    orderBy: { stock: 'asc' },
  })
  return products.map(toProduct)
}

export interface ProductFormData {
  name: string
  category: Exclude<Category, 'all'>
  sizes: ProductSize[]
  colors: string[]
  price: number
  image: string
  stock: number
  status: ProductStatus
  barcode?: string
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      category: data.category,
      sizes: JSON.stringify(data.sizes),
      colors: JSON.stringify(data.colors),
      price: data.price,
      image: data.image,
      stock: data.stock,
      status: data.status,
      barcode: data.barcode?.trim() || null,
    },
  })
  revalidatePath('/products')
  revalidatePath('/orders')
  return toProduct(product)
}

export async function updateProduct(id: string, data: ProductFormData): Promise<Product> {
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      sizes: JSON.stringify(data.sizes),
      colors: JSON.stringify(data.colors),
      price: data.price,
      image: data.image,
      stock: data.stock,
      status: data.status,
      barcode: data.barcode?.trim() || null,
    },
  })
  revalidatePath('/products')
  revalidatePath('/orders')
  return toProduct(product)
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } })
  revalidatePath('/products')
  revalidatePath('/orders')
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  await prisma.product.update({ where: { id }, data: { status } })
  revalidatePath('/products')
}
