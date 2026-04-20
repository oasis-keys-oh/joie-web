import { createClient } from '@supabase/supabase-js'
import HomePortal from '@/components/HomePortal'

async function getTrips() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('trips')
    .select('id, title, subtitle, start_date, end_date, web_slug')
    .order('start_date', { ascending: false })
  return data || []
}

export default async function Landing() {
  const trips = await getTrips()
  return <HomePortal trips={trips} />
}
