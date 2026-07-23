'use client'

import { useActionState } from 'react'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { login, LoginState } from '@/lib/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function LoginForm({ storeName }: { storeName: string }) {
  const [state, action, pending] = useActionState<LoginState | undefined, FormData>(login, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg">{storeName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Inicia sesión para continuar</p>
        </div>

        <form action={action} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" name="username" placeholder="admin" autoFocus required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full h-9 justify-center">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
