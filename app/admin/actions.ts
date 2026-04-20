'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
  cookies().set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/admin',
  })
  redirect('/admin')
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE)
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

// ── Day fields ───────────────────────────────────────────────────────────────

export async function updateDayFieldAction(dayId: string, field: string, value: string) {
  const admin = createAdminClient()
  await admin.from('trip_days').update({ [field]: value || null }).eq('id', dayId)
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
