import { getUsers } from '@/lib/actions/users'
import { UsersClient } from '@/components/users/users-client'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const session = await getSession()
  if (session?.role !== 'admin') redirect('/dashboard')

  const users = await getUsers()
  return <UsersClient initialUsers={users} currentUserId={session.userId} />
}
