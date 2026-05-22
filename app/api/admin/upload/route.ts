import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-admin'

const SESSION_COOKIE = 'oukala_admin_session'
const SESSION_VALUE = 'authenticated'
const BUCKET = 'trip-media'

export async function POST(req: NextRequest) {
  // Auth check — same cookie the admin portal uses
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (session?.value !== SESSION_VALUE) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'general'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Sanitise filename: strip special chars, add timestamp prefix to avoid collisions
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const base = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 60)
  const path = `${folder}/${Date.now()}-${base}.${ext}`

  // Browsers often send GPX (and other XML-based formats) as application/octet-stream.
  // Resolve the correct MIME type from the file extension when the browser can't.
  const MIME_OVERRIDES: Record<string, string> = {
    gpx: 'application/gpx+xml',
    kml: 'application/vnd.google-earth.kml+xml',
    geojson: 'application/geo+json',
    svg: 'image/svg+xml',
  }
  const contentType =
    (file.type && file.type !== 'application/octet-stream')
      ? file.type
      : (MIME_OVERRIDES[ext] ?? 'application/octet-stream')

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const admin = createAdminClient()
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage
    .from(BUCKET)
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
