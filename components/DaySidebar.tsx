import Link from 'next/link'
import { TripDay } from '@/lib/types'

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

// Use the Embed API place search — cleanest for single locations
function buildDayMapUrl(day: TripDay): string {
  const key = MAPS_KEY
  // Take the first location before any arrow, slash, or dash for a clean query
  const raw = day.location || day.region || day.title
  const primary = raw.split(/[→\/–—]/)[0].trim()
  const query = encodeURIComponent(primary)
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${query}&zoom=11`
}

export default function DaySidebar({ days, currentDayNumber, tripSlug }: DaySidebarProps) {
  const currentDay = days.find((d) => d.day_number === currentDayNumber)
  const mapUrl = currentDay ? buildDayMapUrl(currentDay) : null

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
                    {day.date}
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
