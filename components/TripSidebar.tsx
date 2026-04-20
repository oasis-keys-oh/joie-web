'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Trip, TripDay } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import DaysUntilBadge from '@/components/DaysUntilBadge'

interface TripSidebarProps {
  trip: Trip
  days: TripDay[]
}

const HIGHLIGHT_DAYS = [2, 5, 8, 11, 14]

// Real route stops — matched to actual DB day data
const STOPS = [
  { id: 'casablanca', label: 'Casablanca', lat: 33.5731, lng: -7.5898 },
  { id: 'rabat',      label: 'Rabat',      lat: 34.0209, lng: -6.8416 },
  { id: 'lyon',       label: 'Lyon',       lat: 45.7640, lng: 4.8357  },
  { id: 'beaune',     label: 'Beaune',     lat: 47.0205, lng: 4.8398  },
  { id: 'loire',      label: 'Loire Valley', lat: 47.3900, lng: 0.6880 },
  { id: 'paris',      label: 'Paris',      lat: 48.8566, lng: 2.3522  },
]

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

function RouteMap() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !GOOGLE_MAPS_KEY) return

    // Load Google Maps JS API dynamically
    const scriptId = 'google-maps-script'
    const init = () => {
      if (!ref.current) return
      const google = (window as any).google
      if (!google) return

      const bounds = new google.maps.LatLngBounds()
      STOPS.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }))

      const map = new google.maps.Map(ref.current, {
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: false,
        scrollwheel: false,
        draggable: false,
        styles: [
          { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#1B2B4B' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dde9f4' }] },
          { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f0ede6' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e0dbd0' }] },
          { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#c8c0b0' }, { weight: 1 }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      })

      map.fitBounds(bounds, { top: 24, bottom: 24, left: 24, right: 24 })

      // Draw route polyline
      const path = new google.maps.Polyline({
        path: STOPS.map(s => ({ lat: s.lat, lng: s.lng })),
        geodesic: true,
        strokeColor: '#C9A84C',
        strokeOpacity: 0,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.85, scale: 3 },
          offset: '0',
          repeat: '12px',
        }],
        map,
      })

      // Place markers
      STOPS.forEach((stop, i) => {
        const isEndpoint = i === 0 || i === STOPS.length - 1
        const marker = new google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map,
          title: stop.label,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isEndpoint ? 7 : 5,
            fillColor: '#C9A84C',
            fillOpacity: 0.92,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          label: {
            text: stop.label,
            color: '#1B2B4B',
            fontSize: '10px',
            fontWeight: '600',
            fontFamily: 'sans-serif',
          },
        })
        // Suppress unused warning
        void marker
      })
    }

    if (!(window as any).google) {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script')
        script.id = scriptId
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&callback=__initTripMap`
        script.async = true
        ;(window as any).__initTripMap = init
        document.head.appendChild(script)
      } else {
        // Script loading, wait for callback
        ;(window as any).__initTripMap = init
      }
    } else {
      init()
    }
  }, [])

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="rounded-sm border border-gray-100 flex items-center justify-center" style={{ height: '240px', background: '#f0ede6' }}>
        <p className="text-ink-muted text-xs">Map unavailable</p>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="rounded-sm overflow-hidden border border-gray-100"
      style={{ height: '240px' }}
    />
  )
}

export default function TripSidebar({ trip, days }: TripSidebarProps) {
  const highlights = days.filter((d) => HIGHLIGHT_DAYS.includes(d.day_number) && d.wow_moment)

  return (
    <aside className="space-y-8">

      {/* Days Until — client component to avoid hydration mismatch */}
      <DaysUntilBadge startDate={trip.start_date} endDate={trip.end_date} />

      {/* Route Map */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <p className="label shrink-0">Map</p>
          <div className="flex-1 border-t border-gray-100" />
        </div>
        <RouteMap />

        {/* Route stop list */}
        <div className="mt-4 space-y-0">
          {[
            { label: 'Denver',       sub: 'Departure · Jun 8',       day: null },
            { label: 'Casablanca',   sub: 'Morocco · Days 2–3',      day: 2 },
            { label: 'Rabat',        sub: 'Morocco · Days 3–5',      day: 3 },
            { label: 'Lyon',         sub: 'France · Days 6–7',       day: 6 },
            { label: 'Burgundy',     sub: 'France · Days 7–10',      day: 8 },
            { label: 'Loire Valley', sub: 'France · Days 10–13',     day: 11 },
            { label: 'Paris',        sub: 'Days 14–15',              day: 14 },
            { label: 'Denver',       sub: 'Return · Jun 22',         day: null },
          ].map((stop, i, arr) => {
            const href = stop.day ? `/trip/${trip.web_slug}/day/${stop.day}` : null
            const dot = (
              <span className="flex flex-col items-center pt-1.5 shrink-0" style={{ width: '12px' }}>
                <span
                  className="w-2 h-2 rounded-full border-2 shrink-0"
                  style={{
                    borderColor: '#C9A84C',
                    background: i === 0 || i === arr.length - 1 ? '#C9A84C' : 'white',
                    display: 'inline-block',
                  }}
                />
                {i < arr.length - 1 && (
                  <span className="w-px bg-gray-200 mt-1" style={{ height: '14px', display: 'block' }} />
                )}
              </span>
            )

            const label = (
              <span className="pb-1" style={{ display: 'block' }}>
                <span
                  className="font-semibold"
                  style={{ fontSize: '0.78rem', color: '#1B2B4B', display: 'block' }}
                >
                  {stop.label}
                  {href && <span className="ml-1 text-gold opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
                </span>
                <span className="text-ink-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.04em', display: 'block' }}>{stop.sub}</span>
              </span>
            )

            return href ? (
              <Link
                key={i}
                href={href}
                className="flex items-start gap-3 py-1.5 group hover:bg-gray-50 -mx-2 px-2 rounded-sm transition-colors"
              >
                {dot}{label}
              </Link>
            ) : (
              <div key={i} className="flex items-start gap-3 py-1.5">
                {dot}{label}
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* WOW Highlights */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <p className="label shrink-0">Trip Highlights</p>
          <div className="flex-1 border-t border-gray-100" />
        </div>
        <div className="space-y-6">
          {highlights.map((day) => (
            <div key={day.id}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-gold font-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.12em' }}>
                  DAY {day.day_number}
                </span>
                <div className="flex-1 border-t border-dashed border-gray-200" />
              </div>
              <p className="text-navy font-semibold mb-1" style={{ fontSize: '0.76rem', lineHeight: '1.3' }}>
                {day.title}
              </p>
              <p className="text-ink-muted line-clamp-3" style={{ fontSize: '0.71rem', lineHeight: '1.6' }}>
                {day.wow_moment}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Quick Links */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <p className="label shrink-0">Trip Resources</p>
          <div className="flex-1 border-t border-gray-100" />
        </div>
        <div className="space-y-2">
          {[
            { href: `/trip/${trip.web_slug}/prep`, label: 'Before You Go', sub: 'Packing · Health · Currency', emoji: '🧳' },
            { href: `/trip/${trip.web_slug}/hunt`, label: 'The Hunt', sub: 'Scavenger hunt · Leaderboard', emoji: '🏆' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-sm border border-gray-100 hover:border-gold hover:border-opacity-50 transition-all duration-200 group"
            >
              <span style={{ fontSize: '1.1rem' }}>{link.emoji}</span>
              <span className="min-w-0 flex-1" style={{ display: 'block' }}>
                <span className="text-navy font-medium text-sm group-hover:text-gold transition-colors" style={{ display: 'block' }}>{link.label}</span>
                <span className="text-ink-muted" style={{ fontSize: '0.68rem', display: 'block' }}>{link.sub}</span>
              </span>
              <span className="text-ink-muted group-hover:text-gold transition-colors text-sm">→</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* At a Glance */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <p className="label shrink-0">At a Glance</p>
          <div className="flex-1 border-t border-gray-100" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { num: String(days.length || 15), label: 'Days' },
            { num: String(new Set(days.map(d => (d.region || '').split('/')[0].trim()).filter(Boolean)).size || 2), label: 'Countries' },
            { num: String(STOPS.length), label: 'Cities' },
            { num: '4', label: 'Travelers' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-4 border border-gray-100 rounded-sm">
              <p className="font-serif text-2xl font-bold text-navy">{stat.num}</p>
              <p className="text-ink-muted mt-0.5 uppercase tracking-widest" style={{ fontSize: '0.62rem', letterSpacing: '0.16em' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

    </aside>
  )
}
