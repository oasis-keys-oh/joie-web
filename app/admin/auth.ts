import { cookies } from 'next/headers'

const SESSION_COOKIE = 'oukala_admin_session'
const SESSION_VALUE = 'authenticated'

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE
}
