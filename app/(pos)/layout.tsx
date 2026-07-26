import { Sidebar } from '@/components/layout/sidebar'
import { getSettings } from '@/lib/actions/settings'
import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const { storeName } = await getSettings()
  const session = await getSession()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar storeName={storeName} user={session ?? undefined} />
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  )
}
