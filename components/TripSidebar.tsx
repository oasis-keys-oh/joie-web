import Link from 'next/link'
import { Trip, TripDay } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface TripSidebarProps {
  trip: Trip
  days: TripDay[]
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

const HIGHLIGHT_DAYS = [2, 5, 8, 11, 14]

// Full trip route as a directions embed — Morocco to France arc
function buildRouteMapUrl(): string {
  const key = MAPS_KEY
  const origin = encodeURIComponent('Casablanca, Morocco')
  const destination = encodeURIComponent('Paris, France')
  const waypoints = [
    'Rabat, Morocco',
    'Fez, Morocco',
    'Lyon, France',
    'Beaune, France',
  ].map(encodeURIComponent).join('|')

  return `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${origin}&destination=${destination}&waypoints=${waypoints}&mode=driving&zoom=5`
}

export default function TripSidebar({ trip, days }: TripSidebarProps) {
  const highlights = days.filter((d) => HIGHLIGHT_DAYS.includes(d.day_number) && d.wow_moment)
  const mapUrl = buildRouteMapUrl()

  return (
    <aside className="space-y-8">

      {/* Route Map */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <p className="label shrink-0">Route Map</p>
          <div className="flex-1 border-t border-gray-100" />
        </div>
        <div className="rounded-sm overflow-hidden border border-gray-100" style={{ height: '240px' }}>
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Trip route map"
          />
        </div>

        {/* Route stop list */}
        <div className="mt-4 space-y-0">
          {[
            { label: 'Denver', sub: 'Departure · Jun 9' },
            { label: 'Casablanca', sub: 'Morocco · Days 1–2' },
            { label: 'Rabat', sub: 'Morocco · Days 3–4' },
            { label: 'Fez', sub: 'Morocco · Day 5' },
            { label: 'Lyon', sub: 'France · Days 6–7' },
            { label: 'Burgundy', sub: 'France · Days 8–10' },
            { label: 'Loire Valley', sub: 'France · Days 11–13' },
            { label: 'Paris', sub: 'Days 14–15' },
            { label: 'Denver', sub: 'Return · Jun 24' },
          ].map((stop, i, arr) => (
            <div key={i} className="flex items-start gap-3 py-1.5">
              <div className="flex flex-col items-center pt-1.5 shrink-0" style={{ width: '12px' }}>
                <div
                  className="w-2 h-2 rounded-full border-2 shrink-0"
                  style={{
                    borderColor: '#C9A84C',
                    background: i === 0 || i === arr.length - 1 ? '#C9A84C' : 'white',
                  }}
                />
                {i < arr.length - 1 && (
                  <div className="w-px bg-gray-200 mt-1" style={{ height: '14px' }} />
                )}
              </div>
              <div className="pb-1">
                <p className="text-navy font-semibold" style={{ fontSize: '0.78rem' }}>{stop.label}</p>
                <p className="text-ink-muted" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>{stop.sub}</p>
              </div>
            </div>
          ))}
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
              <div className="min-w-0 flex-1">
                <p className="text-navy font-medium text-sm group-hover:text-gold transition-colors">{link.label}</p>
                <p className="text-ink-muted" style={{ fontSize: '0.68rem' }}>{link.sub}</p>
              </div>
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
            { num: '15', label: 'Days' },
            { num: '2', label: 'Countries' },
            { num: '8', label: 'Cities' },
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
