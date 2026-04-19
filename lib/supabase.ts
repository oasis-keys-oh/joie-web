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
