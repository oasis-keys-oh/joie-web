'use client'

import { useEffect, useRef, useState } from 'react'
import type { DayRoute, TripDay } from '@/lib/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

// Oukala-branded map style (matches TripSidebar)
const MAP_STYLES = [
  { featureType: 'all',                    elementType: 'labels.text.fill',   stylers: [{ color: '#1B2B4B' }] },
  { featureType: 'water',                  elementType: 'geometry',            stylers: [{ color: '#dde9f4' }] },
  { featureType: 'landscape',              elementType: 'geometry',            stylers: [{ color: '#f0ede6' }] },
  { featureType: 'road',                   elementType: 'geometry',            stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',                   elementType: 'geometry.stroke',     stylers: [{ color: '#e0dbd0' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke',     stylers: [{ color: '#c8c0b0' }, { weight: 1 }] },
  { featureType: 'poi',                    stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',                stylers: [{ visibility: 'off' }] },
]

// Per-route colors: navy first (primary traveler), then gold, brown, green
const ROUTE_COLORS = ['#1B2B4B', '#C9A84C', '#8B5E3C', '#4A7C59']

// Known city coords for fallback iframe (mirrors DaySidebar)
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  casablanca: { lat: 33.5731, lon: -7.5898 },
  rabat:      { lat: 33.9716, lon: -6.8498 },
  fez:        { lat: 34.0181, lon: -5.0078 },
  marrakech:  { lat: 31.6295, lon: -7.9811 },
  tangier:    { lat: 35.7595, lon: -5.8340 },
  lyon:       { lat: 45.7640, lon:  4.8357  },
  dijon:      { lat: 47.3220, lon:  5.0415  },
  beaune:     { lat: 47.0231, lon:  4.8400  },
  amboise:    { lat: 47.4133, lon:  0.9828  },
  blois:      { lat: 47.5861, lon:  1.3359  },
  paris:      { lat: 48.8566, lon:  2.3522  },
  versailles: { lat: 48.8014, lon:  2.1301  },
}

// ── Google Maps JS API loader (singleton) ─────────────────────────────────────

let mapsPromise: Promise<void> | null = null

function loadGoogleMaps(key: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).google?.maps?.Map) return Promise.resolve()
  if (mapsPromise) return mapsPromise

  mapsPromise = new Promise<void>((resolve, reject) => {
    const cbName = `__gm_cb_${Date.now()}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)[cbName] = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[cbName]
      resolve()
    }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=${cbName}`
    s.async = true
    s.defer = true
    s.onerror = (err) => { mapsPromise = null; reject(err) }
    document.head.appendChild(s)
  })
  return mapsPromise
}

// ── GPX parser ────────────────────────────────────────────────────────────────

async function fetchAndParseGpx(url: string): Promise<{ lat: number; lng: number }[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GPX fetch failed: ${res.status}`)
  const text = await res.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'application/xml')

  // Prefer track points, fall back to route points, then waypoints
  let nodes = Array.from(doc.querySelectorAll('trkpt'))
  if (nodes.length === 0) nodes = Array.from(doc.querySelectorAll('rtept'))
  if (nodes.length === 0) nodes = Array.from(doc.querySelectorAll('wpt'))

  return nodes
    .map(n => ({
      lat: parseFloat(n.getAttribute('lat') ?? '0'),
      lng: parseFloat(n.getAttribute('lon') ?? '0'),
    }))
    .filter(p => p.lat !== 0 && p.lng !== 0)
}

// ── Persona filtering ─────────────────────────────────────────────────────────

function filterByPersona(routes: DayRoute[], persona: string | null): DayRoute[] {
  return routes.filter(r => {
    if (!r.traveler_keys || r.traveler_keys.length === 0) return true
    if (!persona) return true
    return r.traveler_keys.includes(persona)
  })
}

// ── Iframe fallback (used when no routes or no Maps key) ─────────────────────

function IframeFallback({ day }: { day: TripDay }) {
  if (!MAPS_KEY) {
    // OSM fallback
    const raw = (day.location || day.region || day.title).toLowerCase()
    let src = 'https://www.openstreetmap.org/export/embed.html?bbox=-8%2C30%2C3%2C50&layer=mapnik'
    for (const [city, c] of Object.entries(CITY_COORDS)) {
      if (raw.includes(city)) {
        const { lat, lon } = c
        src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.03}%2C${lon + 0.05}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`
        break
      }
    }
    return <iframe src={src} width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Location map" />
  }

  const raw = day.location || day.region || day.title
  const primary = raw.split(/[→/–—]/)[0].trim()
  const src = `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${encodeURIComponent(primary)}&zoom=12`
  return (
    <iframe
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen={false}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Map for Day ${day.day_number}`}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  routes: DayRoute[]
  day: TripDay
}

export default function DayRouteMap({ routes, day }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [persona, setPersona] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'noroutemap'>('loading')

  // Read persona from localStorage on mount
  useEffect(() => {
    try {
      setPersona(localStorage.getItem('joie_traveler'))
    } catch {
      // localStorage not available (SSR guard)
    }
  }, [])

  const visibleRoutes = filterByPersona(routes, persona)

  // Initialise or rebuild the map whenever visible routes or persona changes
  useEffect(() => {
    if (!MAPS_KEY || visibleRoutes.length === 0) {
      setStatus('noroutemap')
      return
    }
    if (!mapRef.current) return

    let cancelled = false

    async function init() {
      try {
        await loadGoogleMaps(MAPS_KEY!)
        if (cancelled || !mapRef.current) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google as any

        const map = new google.maps.Map(mapRef.current, {
          zoom: 14,
          center: { lat: 0, lng: 0 },
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          styles: MAP_STYLES,
        })

        const bounds = new google.maps.LatLngBounds()
        let anyPoints = false

        for (let i = 0; i < visibleRoutes.length; i++) {
          const route = visibleRoutes[i]
          const color = ROUTE_COLORS[i % ROUTE_COLORS.length]

          try {
            const points = await fetchAndParseGpx(route.gpx_url)
            if (cancelled) return
            if (points.length === 0) continue

            anyPoints = true
            points.forEach(p => bounds.extend(p))

            // Draw polyline
            new google.maps.Polyline({
              path: points,
              map,
              strokeColor: color,
              strokeOpacity: 0.85,
              strokeWeight: 3,
            })

            // Start marker — gold dot
            new google.maps.Marker({
              position: points[0],
              map,
              title: `${route.name ?? `Route ${i + 1}`} — Start`,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillColor: '#C9A84C',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            })

            // End marker — navy dot
            new google.maps.Marker({
              position: points[points.length - 1],
              map,
              title: `${route.name ?? `Route ${i + 1}`} — End`,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            })
          } catch (gpxErr) {
            console.warn('[DayRouteMap] GPX parse error for route', route.id, gpxErr)
          }
        }

        if (!anyPoints) {
          setStatus('noroutemap')
          return
        }

        map.fitBounds(bounds, 24) // 24px padding
        setStatus('ready')
      } catch (err) {
        console.error('[DayRouteMap] init error', err)
        if (!cancelled) setStatus('error')
      }
    }

    setStatus('loading')
    init()
    return () => { cancelled = true }
  }, [visibleRoutes, persona])  // eslint-disable-line react-hooks/exhaustive-deps

  // No routes for this persona (or no routes at all): fall back to location iframe
  if (status === 'noroutemap' || (!MAPS_KEY && visibleRoutes.length === 0)) {
    return <IframeFallback day={day} />
  }

  return (
    <div className="relative w-full" style={{ height: '190px' }}>
      {/* Map canvas */}
      <div ref={mapRef} className="w-full h-full rounded-sm overflow-hidden border border-gray-100" />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-sm"
          style={{ background: '#f0ede6' }}
        >
          <span className="text-xs text-ink-muted uppercase tracking-widest" style={{ letterSpacing: '0.14em' }}>
            Loading route…
          </span>
        </div>
      )}

      {/* Error state — fall through to iframe */}
      {status === 'error' && <IframeFallback day={day} />}

      {/* Route label(s) */}
      {status === 'ready' && visibleRoutes.length > 0 && (
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5 pointer-events-none">
          {visibleRoutes.map((r, i) => (
            <span
              key={r.id}
              className="text-white rounded-sm px-1.5 py-0.5"
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                background: ROUTE_COLORS[i % ROUTE_COLORS.length],
                opacity: 0.9,
              }}
            >
              {r.name ?? 'Route'}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
