import Image from 'next/image'
import { Trip } from '@/lib/types'
import { getPhotoPool, UnsplashPhoto } from '@/lib/unsplash'
import UnsplashCredit from '@/components/UnsplashCredit'
import { formatDate } from '@/lib/utils'

interface TripHeaderProps {
  trip: Trip
  /** Override hero image URL — e.g. from a custom trip cover photo */
  imageUrl?: string
  /** First destination region/city to pick a relevant hero photo pool */
  firstDestination?: string
}

export default function TripHeader({ trip, imageUrl, firstDestination }: TripHeaderProps) {
  // Derive hero from the trip's first destination (passed from server), not a hardcoded location.
  // Falls back to a general travel photo if no destination is specified.
  const destination = firstDestination || (trip as any).first_destination || 'morocco'
  const pool = getPhotoPool(destination)
  const heroPhoto: UnsplashPhoto = pool[0]
  const finalImageUrl = imageUrl || `https://images.unsplash.com/${heroPhoto.id}?w=2400&h=1400&fit=crop&q=90`

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: '600px' }}
    >
      {/* Full-bleed image */}
      <Image
        src={finalImageUrl}
        alt={trip.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
        unoptimized
      />

      {/* Gradient overlay — deep at bottom, light at top */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* Text — anchored to bottom */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="px-8 sm:px-14 pb-16 sm:pb-20 max-w-4xl">

          {/* Label */}
          <p
            className="text-white text-xs font-medium mb-5 tracking-widest uppercase opacity-70"
            style={{ letterSpacing: '0.22em' }}
          >
            Oukala Journeys
          </p>

          {/* Title */}
          <h1
            className="font-serif font-bold text-white mb-4"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6.5rem)',
              lineHeight: '0.95',
              letterSpacing: '-0.02em',
            }}
          >
            {trip.title}
          </h1>

          {/* Subtitle */}
          {trip.subtitle && (
            <p
              className="text-white opacity-80 font-light mt-5"
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                letterSpacing: '0.01em',
                maxWidth: '520px',
                lineHeight: '1.5',
              }}
            >
              {trip.subtitle}
            </p>
          )}

          {/* Date strip */}
          <div className="flex items-center gap-4 mt-8">
            <div
              className="h-px bg-gold opacity-60"
              style={{ width: '32px' }}
            />
            <p
              className="text-white text-xs tracking-widest uppercase opacity-60"
              style={{ letterSpacing: '0.18em' }}
            >
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </p>
          </div>
        </div>
      </div>

      {/* Photo attribution */}
      {!imageUrl && <UnsplashCredit photo={heroPhoto} variant="hero" />}

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-10 flex flex-col items-center gap-2 opacity-40">
        <div
          className="w-px bg-white"
          style={{ height: '40px' }}
        />
        <p
          className="text-white text-xs tracking-widest uppercase"
          style={{ letterSpacing: '0.2em', writingMode: 'vertical-rl' }}
        >
          Scroll
        </p>
      </div>
    </div>
  )
}
