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

/**
 * /trip — Portal entry gate
 *
 * Shows the persona picker ("Who are you?") and trip listing.
 * This is the intended landing for all client-facing traffic:
 *   oukalajourney.com/trip  →  here
 *   trip.oukalajourney.com  →  also here (via Netlify redirect)
 *
 * Future: replace HomePortal with a proper auth gate once
 * Supabase Auth is wired up. Persona selection becomes login.
 */
export default async function TripPortalEntry() {
  const trips = await getTrips()
  return <HomePortal trips={trips} />
}
