import { getSettings } from '@/lib/actions/settings'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Menú &rsaquo; Configuración</p>
        <h1 className="text-xl font-bold text-gray-900 mt-0.5">Configuración</h1>
      </div>
      <SettingsForm initial={settings} />
    </div>
  )
}
