'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { CreditTransaction, CreditTransactionType } from '@/types'

type DbCreditTx = {
  id: string
  customerId: string
  amount: number
  type: string
  reason: string
  balanceBefore: number
  balanceAfter: number
  date: string
  createdAt: Date
}

function toCreditTx(c: DbCreditTx): CreditTransaction {
  return {
    id: c.id,
    customerId: c.customerId,
    amount: c.amount,
    type: c.type as CreditTransactionType,
    reason: c.reason,
    balanceBefore: c.balanceBefore,
    balanceAfter: c.balanceAfter,
    date: c.date,
  }
}

export async function getCreditTransactions(customerId?: string): Promise<CreditTransaction[]> {
  const txs = await prisma.creditTransaction.findMany({
    where: customerId ? { customerId } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  return txs.map(toCreditTx)
}

export interface CreditMovement extends CreditTransaction {
  customerName: string
  customerEmail: string
  creditBalance: number
  creditLimit: number
}

export async function getCreditMovements(): Promise<CreditMovement[]> {
  const txs = await prisma.creditTransaction.findMany({
    include: {
      customer: { select: { name: true, email: true, creditBalance: true, creditLimit: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return txs.map((c) => ({
    ...toCreditTx(c),
    customerName: c.customer.name,
    customerEmail: c.customer.email,
    creditBalance: c.customer.creditBalance,
    creditLimit: c.customer.creditLimit,
  }))
}

export interface StatementEntry {
  date: string
  creditType: CreditTransactionType
  description: string
  items?: Array<{ name: string; quantity: number; price: number; selectedSize: string; selectedColor: string }>
  cargo: number
  abono: number
  balanceBefore: number
  balanceAfter: number
}

export interface CustomerStatement {
  customerId: string
  customerName: string
  customerEmail: string
  creditBalance: number
  creditLimit: number
  entries: StatementEntry[]
  totalCargos: number
  totalAbonos: number
}

export async function getCustomerStatements(customerIds?: string[]): Promise<CustomerStatement[]> {
  const creditTxs = await prisma.creditTransaction.findMany({
    where: customerIds?.length ? { customerId: { in: customerIds } } : undefined,
    include: { customer: { select: { name: true, email: true, creditBalance: true, creditLimit: true } } },
    orderBy: { createdAt: 'asc' },
  })

  // Extract transaction IDs referenced in uso movements
  const txIds: string[] = []
  for (const ct of creditTxs) {
    if (ct.type === 'uso') {
      const match = ct.reason.match(/TXN-[\w]+/)
      if (match) txIds.push(match[0])
    }
  }

  const transactions = txIds.length > 0
    ? await prisma.transaction.findMany({ where: { id: { in: txIds } }, include: { items: true } })
    : []

  const txMap = new Map(transactions.map((t) => [t.id, t]))

  const customerMap = new Map<string, CustomerStatement>()

  for (const ct of creditTxs) {
    if (!customerMap.has(ct.customerId)) {
      customerMap.set(ct.customerId, {
        customerId: ct.customerId,
        customerName: ct.customer.name,
        customerEmail: ct.customer.email,
        creditBalance: ct.customer.creditBalance,
        creditLimit: ct.customer.creditLimit,
        entries: [],
        totalCargos: 0,
        totalAbonos: 0,
      })
    }

    const stmt = customerMap.get(ct.customerId)!
    const isDebit = ct.type === 'uso'
    const txIdMatch = ct.reason.match(/TXN-[\w]+/)
    const relatedTx = txIdMatch ? txMap.get(txIdMatch[0]) : undefined

    stmt.entries.push({
      date: ct.date,
      creditType: ct.type as CreditTransactionType,
      description: ct.reason,
      items: relatedTx?.items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        price: i.price,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
      })),
      cargo: isDebit ? ct.amount : 0,
      abono: !isDebit ? ct.amount : 0,
      balanceBefore: ct.balanceBefore,
      balanceAfter: ct.balanceAfter,
    })

    if (isDebit) stmt.totalCargos += ct.amount
    else stmt.totalAbonos += ct.amount
  }

  return Array.from(customerMap.values())
}

export async function addCredit(
  customerId: string,
  amount: number,
  type: Exclude<CreditTransactionType, 'uso'>,
  reason: string
): Promise<{ newBalance: number; creditTransaction: CreditTransaction }> {
  const customer = await prisma.customer.findUniqueOrThrow({
    where: { id: customerId },
    select: { creditBalance: true },
  })

  const balanceBefore = customer.creditBalance
  const delta = amount
  const balanceAfter = Math.max(0, balanceBefore + delta)

  const [creditTx] = await prisma.$transaction([
    prisma.creditTransaction.create({
      data: {
        customerId,
        amount,
        type,
        reason,
        balanceBefore,
        balanceAfter,
        date: new Date().toISOString().split('T')[0],
      },
    }),
    prisma.customer.update({
      where: { id: customerId },
      data: { creditBalance: balanceAfter },
    }),
  ])

  revalidatePath('/customers')
  revalidatePath('/reports')

  return { newBalance: balanceAfter, creditTransaction: toCreditTx(creditTx) }
}
