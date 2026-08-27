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

// Curator research sections (neighborhood guides, top sights, bar picks, "things you
// wouldn't think about" tips) — backs the Prep page's "The Guide" tab.
//
// Deliberately excludes section_keys that duplicate content now rendered elsewhere on
// the site: trip-narrative essays (already on the trip index page via trip.trip_narrative),
// cultural/tipping norms (already on this same Prep page via trip_travel_info), and
// per-location photo spots / dining guides (already on each day page via
// trip_days.photo_spot / trip_days.wine_food_picks + confirmed events). Only the
// genuinely non-duplicated exploratory content — neighborhoods, top sights, bar picks,
// general travel tips — surfaces here.
const REDUNDANT_REFERENCE_SECTION_KEYS = [
  'why_the_salish_vow', // trip-narrative essay — duplicates trip.trip_narrative
  'cultural_norms',     // tipping/taxes/etiquette — duplicates trip_travel_info
  'photo_spots',        // duplicates trip_days.photo_spot per day
  'dining_guide',       // duplicates trip_days.wine_food_picks + confirmed events
]

export async function getTripReferenceSections(tripId: string) {
  const { data, error } = await supabase
    .from('trip_reference_sections')
    .select('*')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[getTripReferenceSections]', error)
    return []
  }
  return (data || []).filter(
    (s) => !REDUNDANT_REFERENCE_SECTION_KEYS.includes(s.section_key)
  ) as import('./types').TripReferenceSection[]
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
