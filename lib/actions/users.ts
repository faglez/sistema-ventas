'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

export interface UserData {
  id: string
  username: string
  name: string
  role: string
  active: boolean
  createdAt: Date
}

export interface UserFormData {
  username: string
  name: string
  role: string
  password?: string
}

export async function getUsers(): Promise<UserData[]> {
  return prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
  })
}

export async function createUser(data: UserFormData): Promise<UserData> {
  if (!data.password) throw new Error('La contraseña es requerida')
  const user = await prisma.user.create({
    data: {
      username: data.username.trim().toLowerCase(),
      name: data.name.trim(),
      role: data.role,
      password: hashPassword(data.password),
    },
    select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
  })
  revalidatePath('/users')
  return user
}

export async function updateUser(id: string, data: UserFormData): Promise<UserData> {
  const updateData: Record<string, unknown> = {
    name: data.name.trim(),
    role: data.role,
    username: data.username.trim().toLowerCase(),
  }
  if (data.password) updateData.password = hashPassword(data.password)
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
  })
  revalidatePath('/users')
  return user
}

export async function toggleUserActive(id: string, active: boolean): Promise<void> {
  await prisma.user.update({ where: { id }, data: { active } })
  revalidatePath('/users')
}
