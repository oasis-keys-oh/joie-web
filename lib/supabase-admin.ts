import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS. Used only in server-side admin routes.
// NEVER expose this to the client bundle.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !serviceKey) throw new Error('Missing Supabase admin credentials')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function verifyAdminPassword(input: string): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('admin_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single()
  return data?.value === input
}
