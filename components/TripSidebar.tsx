import Link from 'next/link'
import { Trip, TripDay } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import DaysUntilBadge from '@/components/DaysUntilBadge'

interface TripSidebarProps {
  trip: Trip
  days: TripDay[]
}

const HIGHLIGHT_DAYS = [2, 5, 8, 11, 14]

/**
 * Static SVG route map — pinned markers on a simplified Mediterranean backdrop.
 * No API key required. Coordinates projected onto a 280×240 viewport.
 *
 * Real coords (lon, lat):
 *   Casablanca  -7.59, 33.57
 *   Rabat       -6.83, 34.02
 *   Fez         -5.00, 34.03
 *   Lyon         4.83, 45.75
 *   Beaune       4.84, 47.02
 *   Loire/Tours  0.68, 47.39
 *   Paris        2.35, 48.85
 *
 * Map bbox: lon -10..10, lat 30..52  → scaled to 280×240
 */
const STOPS = [
  { id: 'casablanca', label: 'Casablanca', lon: -7.59, lat: 33.57, days: 'Days 1–2' },
  { id: 'rabat',      label: 'Rabat',      lon: -6.83, lat: 34.02, days: 'Days 3–4' },
  { id: 'fez',        label: 'Fez',        lon: -5.00, lat: 34.03, days: 'Day 5' },
  { id: 'lyon',       label: 'Lyon',       lon:  4.83, lat: 45.75, days: 'Days 6–7' },
  { id: 'beaune',     label: 'Beaune',     lon:  4.84, lat: 47.02, days: 'Days 8–10' },
  { id: 'loire',      label: 'Loire',      lon:  0.68, lat: 47.39, days: 'Days 11–13' },
  { id: 'paris',      label: 'Paris',      lon:  2.35, lat: 48.85, days: 'Days 14–15' },
]

const MAP_W = 280
const MAP_H = 240
const LON_MIN = -10, LON_MAX = 12
const LAT_MIN = 30, LAT_MAX = 53

function project(lon: number, lat: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_W
  const y = MAP_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * MAP_H
  return [Math.round(x), Math.round(y)]
}

function RouteMap() {
  const pts = STOPS.map((s) => project(s.lon, s.lat))
  const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')

  return (
    <div className="rounded-sm overflow-hidden border border-gray-100" style={{ height: '240px', background: '#f0f4f8', position: 'relative' }}>
      <svg
        width={MAP_W}
        height={MAP_H}
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        style={{ width: '100%', height: '100%' }}
        aria-label="Trip route map: Casablanca to Paris"
      >
        {/* Simple sea / land fill */}
        <rect width={MAP_W} height={MAP_H} fill="#dde9f4" />

        {/* Rough landmass polygons — Morocco + Western Europe simplified */}
        {/* Morocco */}
        <polygon
          points="28,90 55,78 72,72 80,80 75,105 60,118 40,120 22,108"
          fill="#e8e4d8" stroke="#c8c0b0" strokeWidth="0.5"
        />
        {/* Iberian Peninsula */}
        <polygon
          points="55,42 95,30 115,35 120,55 110,75 90,80 72,72 60,60"
          fill="#e8e4d8" stroke="#c8c0b0" strokeWidth="0.5"
        />
        {/* France + partial Europe */}
        <polygon
          points="112,12 155,8 185,15 195,40 180,58 160,60 140,52 125,45 115,35"
          fill="#e8e4d8" stroke="#c8c0b0" strokeWidth="0.5"
        />
        {/* Italy + Alps rough */}
        <polygon
          points="168,48 185,38 200,42 210,65 200,80 185,78 172,65"
          fill="#e8e4d8" stroke="#c8c0b0" strokeWidth="0.5"
        />

        {/* Strait of Gibraltar label */}
        <text x="84" y="77" fill="#7a9bba" fontSize="5" textAnchor="middle" opacity="0.7">Gibraltar</text>

        {/* Route arc */}
        <path d={pathD} fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="4 2.5" opacity="0.85" />

        {/* Stop dots + labels */}
        {STOPS.map((stop, i) => {
          const [x, y] = pts[i]
          const isFirst = i === 0
          const isLast = i === STOPS.length - 1
          const labelX = x + (x > MAP_W / 2 ? -5 : 5)
          const anchor = x > MAP_W / 2 ? 'end' : 'start'
          return (
            <g key={stop.id}>
              {/* Pin circle */}
              <circle cx={x} cy={y} r={isFirst || isLast ? 5 : 4} fill="#C9A84C" opacity="0.9" />
              <circle cx={x} cy={y} r={isFirst || isLast ? 2.5 : 1.5} fill="white" />
              {/* Label */}
              <text
                x={labelX}
                y={y - 7}
                fill="#1B2B4B"
                fontSize="7"
                fontWeight="600"
                textAnchor={anchor}
                style={{ fontFamily: 'sans-serif' }}
              >
                {stop.label}
              </text>
            </g>
          )
        })}

        {/* Morocco / France country labels */}
        <text x="55" y="100" fill="#9a8a6a" fontSize="6" fontWeight="500" opacity="0.6" textAnchor="middle" style={{ fontFamily: 'sans-serif', letterSpacing: '0.08em' }}>MOROCCO</text>
        <text x="148" y="36" fill="#9a8a6a" fontSize="6" fontWeight="500" opacity="0.6" textAnchor="middle" style={{ fontFamily: 'sans-serif', letterSpacing: '0.08em' }}>FRANCE</text>
      </svg>
    </div>
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
          <p className="label shrink-0">Route Map</p>
          <div className="flex-1 border-t border-gray-100" />
        </div>
        <RouteMap />

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
