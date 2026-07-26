import { getSettings } from '@/lib/actions/settings'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const { storeName } = await getSettings()
  return <LoginForm storeName={storeName} />
}
