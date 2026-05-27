import { redirect } from 'next/navigation'

/**
 * /trip — Portal entry gate
 *
 * Only one trip exists today (hamid-andalusia-2026), so we redirect
 * straight to it. The persona picker fires on the trip page itself,
 * so the traveler-selection flow is unchanged.
 *
 * When multiple trips exist, replace this with the HomePortal:
 *
 *   import { createClient } from '@supabase/supabase-js'
 *   import HomePortal from '@/components/HomePortal'
 *   export default async function TripPortalEntry() {
 *     const trips = await getTrips()
 *     return <HomePortal trips={trips} />
 *   }
 */
export default function TripPortalEntry() {
  redirect('/trip/hamid-andalusia-2026')
}
