/**
 * /api/admin/lookup-place
 *
 * Server-side Google Places lookup for the admin event editor.
 * Requires "Places API" to be enabled on the NEXT_PUBLIC_GOOGLE_MAPS_KEY key.
 * To enable: Google Cloud Console → APIs & Services → Enable APIs → Places API.
 *
 * GET params:
 *   query  — event title / venue name (e.g. "Dinarjat Restaurant")
 *   city   — optional location context from the day (e.g. "Rabat, Morocco")
 *
 * Returns up to 5 results: { name, address, phone, website, lat, lng, place_id }
 */

import { NextRequest, NextResponse } from 'next/server'

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

interface TextSearchResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: { location: { lat: number; lng: number } }
}

interface DetailResult {
  name: string
  formatted_address: string
  formatted_phone_number?: string
  website?: string
  geometry: { location: { lat: number; lng: number } }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get('query') || '').trim()
  const city  = (searchParams.get('city')  || '').trim()

  if (!query) return NextResponse.json({ results: [], error: 'No query provided.' })
  if (!KEY)   return NextResponse.json({ results: [], error: 'Google Maps key not configured.' })

  // ── Text Search ───────────────────────────────────────────────────────────
  const searchQuery = city ? `${query} ${city}` : query
  let candidates: TextSearchResult[] = []

  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${KEY}`
    const res  = await fetch(url, { next: { revalidate: 0 } })
    const data = await res.json() as { status: string; results: TextSearchResult[]; error_message?: string }

    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json({
        results: [],
        error: `Places API not enabled: ${data.error_message ?? data.status}. Enable "Places API" in Google Cloud Console.`,
      })
    }
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ results: [], error: `Google Places error: ${data.status}` })
    }
    candidates = (data.results || []).slice(0, 5)
  } catch (e) {
    return NextResponse.json({ results: [], error: `Network error: ${e instanceof Error ? e.message : 'unknown'}` })
  }

  if (!candidates.length) return NextResponse.json({ results: [] })

  // ── Place Details (phone + website) for each candidate ────────────────────
  const results = await Promise.all(
    candidates.map(async (place) => {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,geometry&key=${KEY}`
        const res  = await fetch(url, { next: { revalidate: 0 } })
        const data = await res.json() as { result: DetailResult }
        const r = data.result
        return {
          place_id: place.place_id,
          name:     r.name,
          address:  r.formatted_address,
          phone:    r.formatted_phone_number ?? null,
          website:  r.website ?? null,
          lat:      r.geometry.location.lat,
          lng:      r.geometry.location.lng,
        }
      } catch {
        // Fall back to Text Search data if Details call fails
        return {
          place_id: place.place_id,
          name:     place.name,
          address:  place.formatted_address,
          phone:    null,
          website:  null,
          lat:      place.geometry.location.lat,
          lng:      place.geometry.location.lng,
        }
      }
    })
  )

  return NextResponse.json({ results })
}
