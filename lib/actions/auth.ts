'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { createSession, deleteSession, getSession } from '@/lib/session'

export interface LoginState {
  error?: string
}

export async function login(_prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!username || !password) {
    return { error: 'Ingresa usuario y contraseña.' }
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !user.active || !verifyPassword(password, user.password)) {
    return { error: 'Usuario o contraseña incorrectos.' }
  }

  await createSession(user)
  redirect('/orders')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function getCurrentUser() {
  return getSession()
}
