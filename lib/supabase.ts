import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Data fetching functions
export async function getTripBySlug(slug: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('web_slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function getTripDays(tripId: string) {
  const { data, error } = await supabase
    .from('trip_days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true })

  if (error) throw error
  return data
}

export async function getTripDay(tripId: string, dayNumber: number) {
  const { data, error } = await supabase
    .from('trip_days')
    .select('*')
    .eq('trip_id', tripId)
    .eq('day_number', dayNumber)
    .single()

  if (error) throw error
  return data
}

export async function getDayEvents(dayId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('day_id', dayId)
    .order('time_start', { ascending: true, nullsFirst: true })

  if (error) throw error
  return data
}

export async function getReferenceItems(tripId: string) {
  const { data, error } = await supabase
    .from('reference_items')
    .select('*')
    .eq('trip_id', tripId)

  if (error) throw error
  return data
}

export async function getLocalContactsForDay(tripId: string, location: string) {
  if (!location) return []
  // Match destination keyword against the day's location string
  const keywords = location.toLowerCase().split(/[\s→,\/]+/).filter(k => k.length > 2)
  const { data } = await supabase
    .from('local_contacts')
    .select('*')
    .eq('trip_id', tripId)
  if (!data) return []
  // Filter: return contacts whose destination matches any keyword from day's location
  return data.filter((c: any) => {
    const dest = (c.destination || '').toLowerCase()
    return keywords.some((k) => dest.includes(k) || k.includes(dest))
  })
}

// GPX routes for a specific day — used by day page (web) and iOS/iPad app.
// iOS: query `day_routes` table filtered by day_id; filter traveler_keys client-side by persona.
export async function getDayRoutes(dayId: string) {
  const { data, error } = await supabase
    .from('day_routes')
    .select('*')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getDayRoutes]', error)
    return []
  }
  return (data || []) as import('./types').DayRoute[]
}

// Travelers actually linked to a trip — via trip_travelers → traveler_profiles.
// Used by PersonaProvider to build the per-trip persona picker instead of a
// hardcoded roster. Sorted by full_name for a stable, deterministic order
// (used to derive stable colors/initials client-side).
export async function getTripTravelers(tripId: string) {
  const { data, error } = await supabase
    .from('trip_travelers')
    .select('traveler_profiles(*)')
    .eq('trip_id', tripId)

  if (error) {
    console.error('[getTripTravelers]', error)
    return []
  }

  return (data || [])
    .map((row: any) => row.traveler_profiles)
    .filter(Boolean)
    .sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || ''))
}

// Per-country travel info (currency, tipping, connectivity, health/safety, embassy) for a trip.
// Backs the Prep page's "Money & Connectivity" and "Health & Safety" tabs — previously hardcoded
// to Morocco/France regardless of trip.
export async function getTripTravelInfo(tripId: string) {
  const { data, error } = await supabase
    .from('trip_travel_info')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getTripTravelInfo]', error)
    return []
  }
  return (data || []) as import('./types').TripTravelInfo[]
}

export async function getHotelForDay(tripId: string, date: string) {
  const { data, error } = await supabase
    .from('reference_items')
    .select('*')
    .eq('trip_id', tripId)
    .eq('type', 'hotel')
    .lte('check_in', date)
    .gte('check_out', date)
    .single()

  if (error) return null
  return data
}
