import Link from 'next/link'
import Image from 'next/image'
import { TripDay } from '@/lib/types'
import { getPhotoForDay } from '@/lib/unsplash'
import UnsplashCredit from '@/components/UnsplashCredit'
import { formatDateShort } from '@/lib/utils'

interface DayCardProps {
  day: TripDay
  tripSlug: string
}

export default function DayCard({ day, tripSlug }: DayCardProps) {
  const photo = getPhotoForDay(day.region || '', day.day_number, 800, 600, 80, day.location)
  // Use DB-provided URL if curated, otherwise fall back to Unsplash pool
  const imageUrl = day.hero_image_url || photo.url

  return (
    <Link href={`/trip/${tripSlug}/day/${day.day_number}`} className="block group bg-white">
      {/* Image */}
      <span className="block relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <Image
          src={imageUrl}
          alt={day.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        {/* Overlay */}
        <span
          className="absolute inset-0 transition-opacity duration-500"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.65) 100%)', display: 'block' }}
        />
        {/* Day number badge */}
        <span className="absolute top-4 left-4" style={{ display: 'block' }}>
          <span
            className="text-white text-xs tracking-widest uppercase opacity-80"
            style={{ letterSpacing: '0.15em' }}
          >
            Day {day.day_number}
          </span>
        </span>
      </span>
      {/* Only show Unsplash credit when using the pool photo, not a DB-curated URL */}
      {!day.hero_image_url && <UnsplashCredit photo={photo} variant="card" />}

      {/* Card text */}
      <span
        className="block bg-white px-5 py-5 border-b border-r border-l border-gray-100 group-hover:border-gold group-hover:border-opacity-30 transition-colors duration-300"
      >
        <span
          className="block text-xs text-ink-muted uppercase tracking-widest mb-2"
          style={{ letterSpacing: '0.15em' }}
        >
          {day.region}
          {day.date && (
            <span className="ml-3 opacity-60">{formatDateShort(day.date)}</span>
          )}
        </span>
        <span className="block font-serif text-lg font-bold text-ink leading-snug group-hover:text-navy transition-colors duration-200">
          {day.title}
        </span>
        <span
          className="block mt-3 h-px bg-gold opacity-0 group-hover:opacity-40 transition-all duration-300"
          style={{ width: '24px' }}
        />
      </span>
    </Link>
  )
}
