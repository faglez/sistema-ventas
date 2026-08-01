'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserData, UserFormData } from '@/lib/actions/users'

interface UserFormDialogProps {
  open: boolean
  user?: UserData | null
  onClose: () => void
  onSave: (data: UserFormData) => Promise<void>
}

const empty: UserFormData = { username: '', name: '', role: 'cajero', password: '' }

export function UserFormDialog({ open, user, onClose, onSave }: UserFormDialogProps) {
  const [form, setForm] = useState<UserFormData>(empty)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})

  useEffect(() => {
    if (open) {
      setForm(user ? { username: user.username, name: user.name, role: user.role, password: '' } : { ...empty })
      setErrors({})
      setShowPassword(false)
    }
  }, [open, user])

  const set = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (!form.username.trim()) e.username = 'El usuario es requerido'
    else if (!/^[a-z0-9_]+$/i.test(form.username)) e.username = 'Solo letras, números y guión bajo'
    if (!user && !form.password) e.password = 'La contraseña es requerida'
    if (form.password && form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Unique') || msg.includes('username')) {
        setErrors((e) => ({ ...e, username: 'Este usuario ya existe' }))
      }
    } finally {
      setSaving(false)
    }
  }

  const isEdit = !!user

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Nombre completo *</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ej: María García"
              className={cn(errors.name && 'border-red-400')}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Usuario *</Label>
            <Input
              value={form.username}
              onChange={(e) => set('username', e.target.value.toLowerCase())}
              placeholder="Ej: maria_cajero"
              className={cn(errors.username && 'border-red-400')}
            />
            {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">Rol *</Label>
            <Select value={form.role} onValueChange={(v) => set('role', v ?? 'cajero')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cajero">Cajero</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">
              {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password ?? ''}
                onChange={(e) => set('password', e.target.value)}
                placeholder={isEdit ? 'Sin cambios' : 'Mínimo 6 caracteres'}
                className={cn('pr-10', errors.password && 'border-red-400')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
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
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
