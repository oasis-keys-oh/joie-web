'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { verifyAdminPassword, createAdminClient } from '@/lib/supabase-admin'

const SESSION_COOKIE = 'oukala_admin_session'
const SESSION_VALUE = 'authenticated'

// ── Auth ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string
  const valid = await verifyAdminPassword(password)
  if (!valid) {
    redirect('/admin/login?error=Incorrect+password')
  }
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  redirect('/admin')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/admin/login')
}

// ── Contacts ────────────────────────────────────────────────────────────────

export async function upsertContactAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const payload = {
    trip_id: formData.get('trip_id') as string,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    role: formData.get('role') as string,
    destination: formData.get('destination') as string,
    specialty: formData.get('specialty') as string || null,
    intro_note: formData.get('intro_note') as string || null,
  }
  if (id) {
    await admin.from('local_contacts').update(payload).eq('id', id)
  } else {
    await admin.from('local_contacts').insert(payload)
  }
}

export async function deleteContactAction(id: string) {
  const admin = createAdminClient()
  await admin.from('local_contacts').delete().eq('id', id)
}

// ── Events ──────────────────────────────────────────────────────────────────

export async function upsertEventAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  // traveler_keys submitted as repeated fields: traveler_keys=omar&traveler_keys=kristi
  const rawKeys = formData.getAll('traveler_keys') as string[]
  const travelerKeys = rawKeys.filter(Boolean)
  const payload = {
    trip_id: formData.get('trip_id') as string,
    day_id: formData.get('day_id') as string,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    time_start: formData.get('time_start') as string || null,
    address: formData.get('address') as string || null,
    phone: formData.get('phone') as string || null,
    confirmation: formData.get('confirmation') as string || null,
    booking_url: formData.get('booking_url') as string || null,
    booking_status: formData.get('booking_status') as string || 'confirmed',
    notes: formData.get('notes') as string || null,
    traveler_keys: travelerKeys.length > 0 ? travelerKeys : null,
  }
  if (id) {
    await admin.from('events').update(payload).eq('id', id)
  } else {
    await admin.from('events').insert(payload)
  }
}

export async function deleteEventAction(id: string) {
  const admin = createAdminClient()
  await admin.from('events').delete().eq('id', id)
}

// ── Hotels / Reference Items ─────────────────────────────────────────────────

export async function upsertHotelAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const payload = {
    trip_id: formData.get('trip_id') as string,
    type: 'hotel',
    name: formData.get('name') as string,
    check_in: formData.get('check_in') as string || null,
    check_out: formData.get('check_out') as string || null,
    address: formData.get('address') as string || null,
    phone: formData.get('phone') as string || null,
    website: formData.get('website') as string || null,
    confirmation: formData.get('confirmation') as string || null,
    notes: formData.get('notes') as string || null,
  }
  if (id) {
    await admin.from('reference_items').update(payload).eq('id', id)
  } else {
    await admin.from('reference_items').insert(payload)
  }
}

export async function deleteHotelAction(id: string) {
  const admin = createAdminClient()
  await admin.from('reference_items').delete().eq('id', id)
}

// ── Trip fields ──────────────────────────────────────────────────────────────

export async function updateTripFieldAction(tripId: string, field: string, value: string) {
  const admin = createAdminClient()
  await admin.from('trips').update({ [field]: value || null }).eq('id', tripId)
  revalidatePath(`/admin/trip/${tripId}`)
}

// ── Day fields ───────────────────────────────────────────────────────────────

export async function updateDayFieldAction(dayId: string, field: string, value: string, tripId?: string) {
  const admin = createAdminClient()
  await admin.from('trip_days').update({ [field]: value || null }).eq('id', dayId)
  if (tripId) revalidatePath(`/admin/trip/${tripId}`)
}

// ── Hunt challenges ──────────────────────────────────────────────────────────

export async function upsertChallengeAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const payload = {
    trip_id: formData.get('trip_id') as string,
    day_number: parseInt(formData.get('day_number') as string) || null,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    transliteration: formData.get('transliteration') as string || null,
    points: parseInt(formData.get('points') as string) || 10,
    challenge_type: formData.get('challenge_type') as string || 'find',
  }
  if (id) {
    await admin.from('hunt_challenges').update(payload).eq('id', id)
  } else {
    await admin.from('hunt_challenges').insert(payload)
  }
}

export async function deleteChallengeAction(id: string) {
  const admin = createAdminClient()
  await admin.from('hunt_challenges').delete().eq('id', id)
}

// ── Packing items ────────────────────────────────────────────────────────────

export async function upsertPackingItemAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const payload = {
    trip_id: formData.get('trip_id') as string,
    item: formData.get('item') as string,
    category: formData.get('category') as string,
    segment: formData.get('segment') as string || null,
    traveler_key: formData.get('traveler_key') as string || null,
    reason: formData.get('reason') as string || null,
    sort_order: parseInt(formData.get('sort_order') as string) || null,
  }
  if (id) {
    await admin.from('packing_items').update(payload).eq('id', id)
  } else {
    await admin.from('packing_items').insert(payload)
  }
}

export async function deletePackingItemAction(id: string) {
  const admin = createAdminClient()
  await admin.from('packing_items').delete().eq('id', id)
}

// ── Recommendations ──────────────────────────────────────────────────────────

export async function upsertRecAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const payload = {
    trip_id: formData.get('trip_id') as string,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    author: formData.get('author') as string || null,
    description: formData.get('description') as string || null,
    why_relevant: formData.get('why_relevant') as string || null,
    when_to_enjoy: formData.get('when_to_enjoy') as string || null,
    amazon_url: formData.get('amazon_url') as string || null,
    streaming_url: formData.get('streaming_url') as string || null,
    streaming_platform: formData.get('streaming_platform') as string || null,
    sort_order: parseInt(formData.get('sort_order') as string) || null,
  }
  if (id) {
    await admin.from('recommendations').update(payload).eq('id', id)
  } else {
    await admin.from('recommendations').insert(payload)
  }
}

export async function deleteRecAction(id: string) {
  const admin = createAdminClient()
  await admin.from('recommendations').delete().eq('id', id)
}

// ── Pre-trip content drops ───────────────────────────────────────────────────

export async function upsertPreTripDropAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const payload = {
    trip_id: formData.get('trip_id') as string,
    date_offset_days: parseInt(formData.get('date_offset_days') as string),
    type: formData.get('type') as string,
    title: formData.get('title') as string || null,
    content: formData.get('content') as string,
    media_url: formData.get('media_url') as string || null,
    sent: formData.get('sent') === 'true',
  }
  if (id) {
    await admin.from('pre_trip_content').update(payload).eq('id', id)
  } else {
    await admin.from('pre_trip_content').insert(payload)
  }
}

export async function deletePreTripDropAction(id: string) {
  const admin = createAdminClient()
  await admin.from('pre_trip_content').delete().eq('id', id)
}

// ── Travelers ─────────────────────────────────────────────────────────────────

export async function upsertTravelerAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const ageRaw = formData.get('age') as string
  const payload = {
    traveler_key:      formData.get('traveler_key') as string || null,
    full_name:         formData.get('name') as string,
    email:             formData.get('email') as string || null,
    phone:             formData.get('phone') as string || null,
    partner_name:      formData.get('partner_name') as string || null,
    age:               ageRaw ? parseInt(ageRaw) : null,
    languages:         formData.get('languages') as string || null,
    // Hospitality
    pillow_firmness:   formData.get('pillow_firmness') as string || null,
    coffee_order:      formData.get('coffee_order') as string || null,
    curtains_arrival:  formData.get('curtains_preference') as string || null,
    // Food & drink
    allergies:         formData.get('allergies') as string || null,
    dietary_notes:     formData.get('dietary_notes') as string || null,
    wine_preferences:  formData.get('wine_preferences') as string || null,
    // Personality & travel
    travel_style:      formData.get('travel_style') as string || null,
    personality:       formData.get('personality') as string || null,
    interests:         formData.get('interests') as string || null,
    activities:        formData.get('activities') as string || null,
    music_preferences: formData.get('music_preferences') as string || null,
    // Health & dates
    mobility_notes:    formData.get('mobility_notes') as string || null,
    anniversary_date:  formData.get('anniversary_date') as string || null,
    bucket_list:       formData.get('bucket_list') as string || null,
    notes:             formData.get('notes') as string || null,
  }
  if (id) {
    await admin.from('traveler_profiles').update(payload).eq('id', id)
  } else {
    const { data: newTraveler } = await admin
      .from('traveler_profiles')
      .insert(payload)
      .select('id')
      .single()
    // Link to the trip using real FK column: traveler_id
    const tripId = formData.get('trip_id') as string
    if (newTraveler?.id && tripId) {
      await admin
        .from('trip_travelers')
        .upsert(
          { trip_id: tripId, traveler_id: newTraveler.id },
          { onConflict: 'trip_id,traveler_id', ignoreDuplicates: true }
        )
    }
  }
}

export async function deleteTravelerAction(travelerId: string, tripId: string) {
  const admin = createAdminClient()
  // Remove from trip only (keep profile for reuse on other trips)
  await admin
    .from('trip_travelers')
    .delete()
    .eq('traveler_id', travelerId)
    .eq('trip_id', tripId)
}

// ── Read / Watch / Listen (mobile app) ──────────────────────────────────────

export async function upsertRWLAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const payload = {
    trip_id:           formData.get('trip_id') as string,
    type:              formData.get('type') as string,
    title:             formData.get('title') as string,
    author_director:   formData.get('author_director') as string || null,
    reason:            formData.get('reason') as string || null,
    amazon_url:        formData.get('amazon_url') as string || null,
    streaming_url:     formData.get('streaming_url') as string || null,
    streaming_platform: formData.get('streaming_platform') as string || null,
    cover_image_url:   formData.get('cover_image_url') as string || null,
    isbn:              formData.get('isbn') as string || null,
    tmdb_id:           formData.get('tmdb_id') as string || null,
    display_order:     parseInt(formData.get('display_order') as string) || 0,
  }
  if (id) {
    await admin.from('read_watch_listen').update(payload).eq('id', id)
  } else {
    await admin.from('read_watch_listen').insert(payload)
  }
}

export async function deleteRWLAction(id: string) {
  const admin = createAdminClient()
  await admin.from('read_watch_listen').delete().eq('id', id)
}

// ── Hunt challenge coordinates ───────────────────────────────────────────────
// Extends the existing upsertChallengeAction — now includes coordinates

export async function upsertChallengeWithCoordsAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const lon = (formData.get('coord_lon') as string || '').trim()
  const lat = (formData.get('coord_lat') as string || '').trim()
  const coordinates = lon && lat ? `(${lon},${lat})` : null
  const payload: Record<string, unknown> = {
    trip_id:        formData.get('trip_id') as string,
    day_number:     parseInt(formData.get('day_number') as string) || null,
    title:          formData.get('title') as string,
    description:    formData.get('description') as string,
    transliteration: formData.get('transliteration') as string || null,
    points:         parseInt(formData.get('points') as string) || 10,
    challenge_type: formData.get('challenge_type') as string || 'find',
    leg:            formData.get('leg') as string || 'morocco',
    coordinates,
  }
  if (id) {
    await admin.from('hunt_challenges').update(payload).eq('id', id)
  } else {
    await admin.from('hunt_challenges').insert(payload)
  }
}

// ── Haggle Triggers ──────────────────────────────────────────────────────────

export async function upsertHaggleTriggerAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const lon = (formData.get('coord_lon') as string || '').trim()
  const lat = (formData.get('coord_lat') as string || '').trim()
  const coordinates = lon && lat ? `(${lon},${lat})` : null

  // tips is text[] — textarea with one tip per line
  const tipsRaw = (formData.get('tips') as string || '')
  const tips = tipsRaw.split('\n').map((s: string) => s.trim()).filter(Boolean)

  // JSONB fields — parse from textarea; default null on parse error
  let phrases: unknown = null
  let price_anchors: unknown = null
  try { phrases = JSON.parse(formData.get('phrases') as string || 'null') } catch { phrases = null }
  try { price_anchors = JSON.parse(formData.get('price_anchors') as string || 'null') } catch { price_anchors = null }

  const payload = {
    trip_id:       formData.get('trip_id') as string,
    day_id:        formData.get('day_id') as string || null,
    location_name: formData.get('location_name') as string,
    coordinates,
    radius_meters: parseInt(formData.get('radius_meters') as string) || 500,
    currency:      formData.get('currency') as string || null,
    phrases,
    price_anchors,
    tips:          tips.length > 0 ? tips : null,
  }
  if (id) {
    await admin.from('joie_haggle_triggers').update(payload).eq('id', id)
  } else {
    await admin.from('joie_haggle_triggers').insert(payload)
  }
}

export async function deleteHaggleTriggerAction(id: string) {
  const admin = createAdminClient()
  await admin.from('joie_haggle_triggers').delete().eq('id', id)
}

// ── Journey Facts ────────────────────────────────────────────────────────────

export async function upsertJourneyFactAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  let destinations: unknown = null
  try { destinations = JSON.parse(formData.get('destinations') as string || 'null') } catch { destinations = null }
  const payload = {
    trip_id:        formData.get('trip_id') as string,
    category:       formData.get('category') as string || 'history',
    headline:       formData.get('headline') as string,
    body:           formData.get('body') as string,
    music_url:      formData.get('music_url') as string || null,
    music_platform: formData.get('music_platform') as string || null,
    destinations,
    is_active:      formData.get('is_active') !== 'false',
    sort_order:     parseInt(formData.get('sort_order') as string) || null,
  }
  if (id) {
    await admin.from('journey_facts').update(payload).eq('id', id)
  } else {
    await admin.from('journey_facts').insert(payload)
  }
}

export async function deleteJourneyFactAction(id: string) {
  const admin = createAdminClient()
  await admin.from('journey_facts').delete().eq('id', id)
}

// ── Day routes ───────────────────────────────────────────────────────────────

export async function upsertRouteAction(formData: FormData) {
  const admin = createAdminClient()
  const id = formData.get('id') as string | null
  const rawKeys = formData.getAll('traveler_keys') as string[]
  const travelerKeys = rawKeys.filter(Boolean)
  const payload = {
    trip_id: formData.get('trip_id') as string,
    day_id: formData.get('day_id') as string,
    name: formData.get('name') as string || null,
    gpx_url: formData.get('gpx_url') as string,
    traveler_keys: travelerKeys.length > 0 ? travelerKeys : null,
    sort_order: parseInt(formData.get('sort_order') as string) || 0,
  }
  const tripId = formData.get('trip_id') as string
  if (id) {
    await admin.from('day_routes').update(payload).eq('id', id)
  } else {
    await admin.from('day_routes').insert(payload)
  }
  revalidatePath(`/admin/trip/${tripId}`)
}

export async function deleteRouteAction(id: string, tripId: string) {
  const admin = createAdminClient()
  await admin.from('day_routes').delete().eq('id', id)
  revalidatePath(`/admin/trip/${tripId}`)
}

// ── Bulk delete ──────────────────────────────────────────────────────────────
// Used by all tabs that have multi-select checkboxes.

type BulkDeleteTable =
  | 'local_contacts'
  | 'reference_items'
  | 'hunt_challenges'
  | 'packing_items'
  | 'recommendations'
  | 'read_watch_listen'
  | 'joie_haggle_triggers'
  | 'journey_facts'

export async function bulkDeleteAction(table: BulkDeleteTable, ids: string[]) {
  if (!ids.length) return
  const admin = createAdminClient()
  await admin.from(table).delete().in('id', ids)
}
