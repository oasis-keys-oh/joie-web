import Link from 'next/link'
import Image from 'next/image'
import { TripDay } from '@/lib/types'

interface DayCardProps {
  day: TripDay
  tripSlug: string
}

// Map regions to curated Unsplash photos
function getDayImage(day: TripDay): string {
  const query = day.unsplash_query || day.region || 'andalusia spain'
  // Use a deterministic seed from day number for variety
  const seed = day.day_number
  const images: Record<string, string[]> = {
    'morocco': [
      'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548018560-c7196548f4af?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517821099606-cef63a9bcda6?w=800&h=600&fit=crop&q=80',
    ],
    'france': [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=800&h=600&fit=crop&q=80',
    ],
    'spain': [
      'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop&q=80',
    ],
    'default': [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80',
    ],
  }

  const regionLower = (day.region || '').toLowerCase()
  let pool = images.default
  for (const [key, imgs] of Object.entries(images)) {
    if (regionLower.includes(key)) {
      pool = imgs
      break
    }
  }
  // Use the query string last word as fallback variation
  void query
  return pool[seed % pool.length]
}

export default function DayCard({ day, tripSlug }: DayCardProps) {
  const imgUrl = getDayImage(day)

  return (
    <Link href={`/trip/${tripSlug}/day/${day.day_number}`} className="block group bg-white">
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <Image
          src={imgUrl}
          alt={day.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        {/* Day number badge */}
        <div className="absolute top-4 left-4">
          <span
            className="text-white text-xs tracking-widest uppercase opacity-80"
            style={{ letterSpacing: '0.15em' }}
          >
            Day {day.day_number}
          </span>
        </div>
      </div>

      {/* Card text */}
      <div className="bg-white px-5 py-5 border-b border-r border-l border-gray-100 group-hover:border-gold group-hover:border-opacity-30 transition-colors duration-300">
        <p
          className="text-xs text-ink-muted uppercase tracking-widest mb-2"
          style={{ letterSpacing: '0.15em' }}
        >
          {day.region}
          {day.date && (
            <span className="ml-3 opacity-60">{day.date}</span>
          )}
        </p>
        <h3 className="font-serif text-lg font-bold text-ink leading-snug group-hover:text-navy transition-colors duration-200">
          {day.title}
        </h3>
        <div
          className="mt-3 h-px bg-gold opacity-0 group-hover:opacity-40 transition-all duration-300"
          style={{ width: '24px' }}
        />
      </div>
    </Link>
  )
}
