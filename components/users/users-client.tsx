'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserFormDialog } from '@/components/users/user-form-dialog'
import { UserPlus, Search, Shield, ShoppingBag, CheckCircle2, XCircle, Edit, Power } from 'lucide-react'
import { createUser, updateUser, toggleUserActive } from '@/lib/actions/users'
import type { UserData, UserFormData } from '@/lib/actions/users'
import { cn } from '@/lib/utils'

interface UsersClientProps {
  initialUsers: UserData[]
  currentUserId: string
}

export function UsersClient({ initialUsers, currentUserId }: UsersClientProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [, startTransition] = useTransition()

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const handleSave = async (data: UserFormData) => {
    if (editingUser) {
      const updated = await updateUser(editingUser.id, data)
      startTransition(() => setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u))))
    } else {
      const created = await createUser(data)
      startTransition(() => setUsers((prev) => [...prev, created]))
    }
  }

  const handleToggleActive = async (user: UserData) => {
    if (user.id === currentUserId) return
    const newActive = !user.active
    await toggleUserActive(user.id, newActive)
    startTransition(() =>
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, active: newActive } : u)))
    )
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú › Usuarios</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">Gestión de Usuarios</h1>
        </div>
        <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre o usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="text-xs">Usuario</TableHead>
                <TableHead className="text-xs">Nombre de acceso</TableHead>
                <TableHead className="text-xs">Rol</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs">Creado</TableHead>
                <TableHead className="text-xs w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-gray-400 py-10">
                    No hay usuarios que coincidan.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((u) => {
                const isSelf = u.id === currentUserId
                return (
                  <TableRow key={u.id} className="border-gray-50 hover:bg-gray-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          {isSelf && <p className="text-[10px] text-indigo-500">Tú</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 font-mono">{u.username}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium',
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        )}
                      >
                        {u.role === 'admin' ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <ShoppingBag className="w-3 h-3" />
                        )}
                        {u.role === 'admin' ? 'Administrador' : 'Cajero'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border',
                          u.active
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-gray-50 text-gray-500 border-gray-100'
                        )}
                      >
                        {u.active ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-gray-700"
                          onClick={() => handleEdit(u)}
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-7 w-7',
                            isSelf
                              ? 'text-gray-200 cursor-not-allowed'
                              : u.active
                              ? 'text-gray-400 hover:text-orange-600'
                              : 'text-gray-400 hover:text-green-600'
                          )}
                          onClick={() => handleToggleActive(u)}
                          disabled={isSelf}
                          title={u.active ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserFormDialog
        open={showForm}
        user={editingUser}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />
    </div>
  )
}
