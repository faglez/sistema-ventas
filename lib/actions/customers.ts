'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Customer } from '@/types'

export interface CustomerFormData {
  name: string
  email: string
  phone: string
  creditLimit: number
}

type DbCustomer = {
  id: string
  name: string
  email: string
  phone: string | null
  totalPurchases: number
  totalSpent: number
  lastPurchase: string | null
  creditBalance: number
  creditLimit: number
  createdAt: Date
  updatedAt: Date
}

function toCustomer(c: DbCustomer): Customer {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? '',
    totalPurchases: c.totalPurchases,
    totalSpent: c.totalSpent,
    lastPurchase: c.lastPurchase ?? '',
    creditBalance: c.creditBalance,
    creditLimit: c.creditLimit,
  }
}

export async function getCustomers(): Promise<Customer[]> {
  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } })
  return customers.map(toCustomer)
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      creditLimit: data.creditLimit,
    },
  })
  revalidatePath('/customers')
  return toCustomer(customer)
}

export async function updateCustomer(id: string, data: CustomerFormData): Promise<Customer> {
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      creditLimit: data.creditLimit,
    },
  })
  revalidatePath('/customers')
  return toCustomer(customer)
}

export async function deleteCustomer(id: string): Promise<void> {
  await prisma.$transaction([
    // Desvincula transacciones (customerId es opcional en el schema)
    prisma.transaction.updateMany({
      where: { customerId: id },
      data: { customerId: null },
    }),
    // Elimina historial de crédito
    prisma.creditTransaction.deleteMany({ where: { customerId: id } }),
    // Elimina el cliente
    prisma.customer.delete({ where: { id } }),
  ])
  revalidatePath('/customers')
  revalidatePath('/reports')
}
