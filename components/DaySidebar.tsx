import Link from 'next/link'
import { TripDay } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'
import WeatherWidget from '@/components/WeatherWidget'

interface DaySidebarProps {
  days: TripDay[]
  currentDayNumber: number
  tripSlug: string
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

const REGION_DOT: Record<string, string> = {
  Morocco: '#b45309',
  France: '#15803d',
  Paris: '#1B2B4B',
  Transit: '#9ca3af',
}

function getRegionDot(region: string): string {
  for (const [key, color] of Object.entries(REGION_DOT)) {
    if (region?.includes(key)) return color
  }
  return '#9ca3af'
}

// Known city coords for reliable map display — avoids ambiguous geocoding
const CITY_COORDS: Record<string, { lat: number; lon: number; zoom: number }> = {
  'casablanca':   { lat: 33.5731, lon: -7.5898, zoom: 12 },
  'rabat':        { lat: 33.9716, lon: -6.8498, zoom: 12 },
  'fez':          { lat: 34.0181, lon: -5.0078, zoom: 12 },
  'marrakech':    { lat: 31.6295, lon: -7.9811, zoom: 12 },
  'tangier':      { lat: 35.7595, lon: -5.8340, zoom: 12 },
  'lyon':         { lat: 45.7640, lon: 4.8357,  zoom: 12 },
  'dijon':        { lat: 47.3220, lon: 5.0415,  zoom: 12 },
  'beaune':       { lat: 47.0231, lon: 4.8400,  zoom: 13 },
  'amboise':      { lat: 47.4133, lon: 0.9828,  zoom: 13 },
  'blois':        { lat: 47.5861, lon: 1.3359,  zoom: 13 },
  'chambord':     { lat: 47.6161, lon: 1.5168,  zoom: 14 },
  'chenonceaux':  { lat: 47.3250, lon: 1.0700,  zoom: 14 },
  'paris':        { lat: 48.8566, lon: 2.3522,  zoom: 13 },
  'versailles':   { lat: 48.8014, lon: 2.1301,  zoom: 13 },
}

function buildMapUrl(day: TripDay): string | null {
  if (!MAPS_KEY) {
    // Fall back to OpenStreetMap embed (no key needed)
    return buildOsmUrl(day)
  }
  const raw = day.location || day.region || day.title
  const primary = raw.split(/[→/–—]/)[0].trim()
  const query = encodeURIComponent(`${primary}`)
  return `https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&q=${query}&zoom=12`
}

function buildOsmUrl(day: TripDay): string {
  // Try to match a known city for accurate coordinates
  const raw = (day.location || day.region || day.title).toLowerCase()
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (raw.includes(city)) {
      const { lat, lon, zoom } = coords
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05}%2C${lat - 0.03}%2C${lon + 0.05}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`
    }
  }
  // Generic OSM search fallback
  const query = encodeURIComponent((day.location || day.region || day.title).split(/[→/–—]/)[0].trim())
  return `https://www.openstreetmap.org/export/embed.html?bbox=-8%2C30%2C3%2C50&layer=mapnik`
}

export default function DaySidebar({ days, currentDayNumber, tripSlug }: DaySidebarProps) {
  const currentDay = days.find((d) => d.day_number === currentDayNumber)
  const mapUrl = currentDay ? buildMapUrl(currentDay) : null

  return (
    <aside className="space-y-7">

      {/* Day map */}
      {mapUrl && (
        <div>
          <div className="flex items-center gap-4 mb-3">
            <p className="label shrink-0">Today&apos;s Location</p>
            <div className="flex-1 border-t border-gray-100" />
          </div>
          <div className="rounded-sm overflow-hidden border border-gray-100" style={{ height: '190px' }}>
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map for Day ${currentDayNumber}`}
            />
          </div>
          {currentDay?.location && (
            <p className="text-ink-muted text-center mt-2" style={{ fontSize: '0.68rem', letterSpacing: '0.06em' }}>
              {currentDay.location}
            </p>
          )}
        </div>
      )}

      {/* Weather for current day */}
      {currentDay && (
        <div>
          <div className="flex items-center gap-4 mb-3">
            <p className="label shrink-0">Weather</p>
            <div className="flex-1 border-t border-gray-100" />
          </div>
          {/* @ts-expect-error async server component */}
          <WeatherWidget day={currentDay} />
        </div>
      )}

      <div className="border-t border-gray-100" />

      {/* All days nav */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <p className="label shrink-0">All Days</p>
          <div className="flex-1 border-t border-gray-100" />
        </div>

        <nav className="space-y-0.5">
          {days.map((day) => {
            const isCurrent = day.day_number === currentDayNumber
            const dotColor = getRegionDot(day.region)

            return (
              <Link
                key={day.id}
                href={`/trip/${tripSlug}/day/${day.day_number}`}
                className={`
                  group flex items-start gap-2.5 px-2.5 py-2 rounded-sm transition-all duration-150
                  ${isCurrent ? 'bg-navy' : 'hover:bg-gray-50'}
                `}
              >
                {/* Region dot */}
                <div className="pt-1.5 shrink-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isCurrent ? '#C9A84C' : dotColor,
                      opacity: isCurrent ? 1 : 0.55,
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`shrink-0 font-semibold ${isCurrent ? 'text-gold' : 'text-ink-muted'}`}
                      style={{ fontSize: '0.67rem', letterSpacing: '0.06em' }}
                    >
                      {day.day_number}
                    </span>
                    <p
                      className={`truncate font-medium ${isCurrent ? 'text-white' : 'text-navy'}`}
                      style={{ fontSize: '0.73rem', lineHeight: '1.35' }}
                    >
                      {day.title}
                    </p>
                  </div>
                  <p
                    className={`mt-0.5 truncate ${isCurrent ? 'text-white opacity-50' : 'text-ink-muted'}`}
                    style={{ fontSize: '0.65rem', letterSpacing: '0.03em' }}
                  >
                    {formatDateShort(day.date)}
                  </p>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

    </aside>
  )
}
