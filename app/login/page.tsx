import { getSettings } from '@/lib/actions/settings'
import { LoginForm } from './login-form'

export default async function LoginPage() {
  const { storeName } = await getSettings()
  return <LoginForm storeName={storeName} />
}
