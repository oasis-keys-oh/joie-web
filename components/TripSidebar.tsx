import Link from 'next/link'
import { Trip, TripDay } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import DaysUntilBadge from '@/components/DaysUntilBadge'

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

      {/* Days Until — client component to avoid hydration mismatch */}
      <DaysUntilBadge startDate={trip.start_date} endDate={trip.end_date} />

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
            { label: 'Denver', sub: 'Departure · Jun 9', day: null },
            { label: 'Casablanca', sub: 'Morocco · Days 1–2', day: 1 },
            { label: 'Rabat', sub: 'Morocco · Days 3–4', day: 3 },
            { label: 'Fez', sub: 'Morocco · Day 5', day: 5 },
            { label: 'Lyon', sub: 'France · Days 6–7', day: 6 },
            { label: 'Burgundy', sub: 'France · Days 8–10', day: 8 },
            { label: 'Loire Valley', sub: 'France · Days 11–13', day: 11 },
            { label: 'Paris', sub: 'Days 14–15', day: 14 },
            { label: 'Denver', sub: 'Return · Jun 24', day: null },
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
