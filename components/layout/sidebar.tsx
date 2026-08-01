'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  ArrowLeftRight,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Store,
  BarChart2,
  LogOut,
  UserCog,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/actions/auth'

const navItems = [
  { label: 'Panel', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Órdenes', href: '/orders', icon: ShoppingCart },
  { label: 'Reportes', href: '/reports', icon: BarChart2, adminOnly: true },
  { label: 'Analíticas', href: '/analytics', icon: TrendingUp },
  { label: 'Transacciones', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Notas de Venta', href: '/invoice', icon: FileText },
  { label: 'Clientes', href: '/customers', icon: Users },
  { label: 'Productos', href: '/products', icon: Store, showLowStock: true },
]

const bottomItems = [
  { label: 'Usuarios', href: '/users', icon: UserCog, adminOnly: true },
  { label: 'Configuración', href: '/settings', icon: Settings, adminOnly: true },
  { label: 'Centro de ayuda', href: '#', icon: HelpCircle },
]

interface SidebarUser {
  name: string
  role: string
}

export function Sidebar({
  storeName = 'VentasPOS',
  user,
  lowStockCount = 0,
}: {
  storeName?: string
  user?: SidebarUser
  lowStockCount?: number
}) {
  const pathname = usePathname()
  const isAdmin = user?.role === 'admin'
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin)
  const visibleBottomItems = bottomItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside className="w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0 print:hidden">
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm truncate">{storeName}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href
          const showBadge = item.showLowStock && lowStockCount > 0
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full flex-shrink-0',
                    isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                  )}
                >
                  {lowStockCount > 99 ? '99+' : lowStockCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100 space-y-0.5">
        {visibleBottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Low stock warning */}
      {lowStockCount > 0 && (
        <div className="px-3 pb-2">
          <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-orange-700 leading-tight">
              {lowStockCount} producto{lowStockCount > 1 ? 's' : ''} con stock bajo
            </p>
          </div>
        </div>
      )}

      {/* User + logout */}
      {user && (
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </aside>
  )
}
