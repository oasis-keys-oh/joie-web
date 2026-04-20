import { cookies } from 'next/headers'

const SESSION_COOKIE = 'oukala_admin_session'
const SESSION_VALUE = 'authenticated'

export function isAdminAuthenticated(): boolean {
  return cookies().get(SESSION_COOKIE)?.value === SESSION_VALUE
}
