import { Sidebar } from '@/components/layout/sidebar'
import { getSettings } from '@/lib/actions/settings'
import { getLowStockCount } from '@/lib/actions/products'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const { storeName, lowStockThreshold } = await getSettings()
  const session = await getSession()
  const lowStockCount = await getLowStockCount(lowStockThreshold)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar storeName={storeName} user={session ?? undefined} lowStockCount={lowStockCount} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  )
}
