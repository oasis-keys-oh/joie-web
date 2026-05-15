'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'

// ── Create a blank intake record ────────────────────────────────────────────

export async function createIntakeAction() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('trip_intake')
    .insert({ status: 'submitted' })
    .select('id')
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create intake')
  redirect(`/admin/intake/${data.id}`)
}

// ── Upsert a single field (called on blur from the curator form) ─────────────

export async function upsertIntakeFieldAction(
  id: string,
  field: string,
  value: string | boolean | null
) {
  const admin = createAdminClient()
  await admin
    .from('trip_intake')
    .update({ [field]: value })
    .eq('id', id)
}

// ── Upsert a JSONB array field (hotels, flights, restaurants, etc.) ──────────

export async function upsertIntakeJsonFieldAction(
  id: string,
  field: string,
  value: unknown[]
) {
  const admin = createAdminClient()
  await admin
    .from('trip_intake')
    .update({ [field]: value })
    .eq('id', id)
}

// ── Update status ────────────────────────────────────────────────────────────

export async function updateIntakeStatusAction(id: string, status: string) {
  const admin = createAdminClient()
  await admin
    .from('trip_intake')
    .update({ status })
    .eq('id', id)
}

// ── Generate brief: set status + brief_generated_at, redirect ───────────────

export async function generateBriefAction(id: string) {
  const admin = createAdminClient()
  await admin
    .from('trip_intake')
    .update({
      status: 'brief_generated',
      brief_generated_at: new Date().toISOString(),
    })
    .eq('id', id)
  redirect(`/admin/intake/${id}/brief`)
}

// ── Delete intake record ─────────────────────────────────────────────────────

export async function deleteIntakeAction(id: string) {
  const admin = createAdminClient()
  await admin.from('trip_intake').delete().eq('id', id)
  redirect('/admin/intake')
}
