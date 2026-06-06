'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase-admin'

function sbOk(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message)
}

// ── Add follower (admin panel) ────────────────────────────────────────────────
export async function addFollowerAction(formData: FormData) {
  const admin = createAdminClient()
  const tripId = formData.get('trip_id') as string
  const tripSlug = formData.get('trip_slug') as string
  const firstName = formData.get('first_name') as string || null
  const lastName = formData.get('last_name') as string || null
  const email = formData.get('email') as string || null

  // ref_code is the first_name slug for personalized invite links
  const refCode = (firstName || email || 'guest').toLowerCase().replace(/\s+/g, '-')

  sbOk(await admin.from('trip_followers').insert({
    trip_id: tripId,
    first_name: firstName,
    last_name: lastName,
    email,
    status: 'active',
    ref_code: refCode,
    notify_memories: true,
    notify_arrivals: true,
    notify_challenges: false,
  }))

  revalidatePath(`/admin/trip/${tripId}`)
}

// ── Remove follower (sets status = 'removed') ─────────────────────────────────
export async function removeFollowerAction(followerId: string, tripId: string) {
  const admin = createAdminClient()
  sbOk(await admin.from('trip_followers').update({ status: 'removed' }).eq('id', followerId))
  revalidatePath(`/admin/trip/${tripId}`)
}

// ── Update follower notify prefs ──────────────────────────────────────────────
export async function updateFollowerPrefsAction(
  followerId: string,
  tripId: string,
  prefs: { notify_memories?: boolean; notify_arrivals?: boolean; notify_challenges?: boolean }
) {
  const admin = createAdminClient()
  sbOk(await admin.from('trip_followers').update(prefs).eq('id', followerId))
  revalidatePath(`/admin/trip/${tripId}`)
}

// ── Publish a day to followers ────────────────────────────────────────────────
export async function publishDayToFollowersAction(dayId: string, tripId: string) {
  const admin = createAdminClient()
  sbOk(await admin.from('trip_days').update({
    follower_published: true,
    follower_published_at: new Date().toISOString(),
  }).eq('id', dayId))
  revalidatePath(`/admin/trip/${tripId}`)
}

// ── Unpublish a day ────────────────────────────────────────────────────────────
export async function unpublishDayFromFollowersAction(dayId: string, tripId: string) {
  const admin = createAdminClient()
  sbOk(await admin.from('trip_days').update({
    follower_published: false,
    follower_published_at: null,
  }).eq('id', dayId))
  revalidatePath(`/admin/trip/${tripId}`)
}

// ── Get followers for a trip ──────────────────────────────────────────────────
export async function getFollowersAction(tripId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('trip_followers')
    .select('id, first_name, last_name, email, status, ref_code, notify_memories, notify_arrivals, notify_challenges, created_at, push_subscription')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data || []
}
