'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Trip } from '@/lib/types'
import { getPhotoPool, UnsplashPhoto } from '@/lib/unsplash'
import UnsplashCredit from '@/components/UnsplashCredit'
import { formatDate } from '@/lib/utils'

interface TripHeaderProps {
  trip: Trip
  /** First destination region/city to pick a relevant hero photo pool */
  firstDestination?: string
}

function buildCuratorPool(trip: Trip): string[] {
  return [trip.hero_image_url, trip.hero_image_url_2, trip.hero_image_url_3, trip.hero_image_url_4]
    .filter((u): u is string => Boolean(u?.trim()))
}

export default function TripHeader({ trip, firstDestination }: TripHeaderProps) {
  const [active, setActive] = useState(0)

  const curatorPool = buildCuratorPool(trip)
  const hasCuratorImages = curatorPool.length > 0

  // Unsplash fallback — single photo from the destination pool
  const destination = firstDestination || (trip as any).first_destination || 'morocco'
  const unsplashPool = getPhotoPool(destination)
  const heroUnsplash: UnsplashPhoto = unsplashPool[0]

  // Cycle through whichever pool is active
  const poolSize = hasCuratorImages ? curatorPool.length : unsplashPool.length
  useEffect(() => {
    if (poolSize <= 1) return
    const timer = setInterval(() => setActive(i => (i + 1) % poolSize), 6000)
    return () => clearInterval(timer)
  }, [poolSize])

  const currentUrl = hasCuratorImages
    ? curatorPool[active]
    : `https://images.unsplash.com/${unsplashPool[active].id}?w=2400&h=1400&fit=crop&q=90`

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: '600px' }}
    >
      {/* Full-bleed image with crossfade */}
      {(hasCuratorImages ? curatorPool : unsplashPool.map(p => `https://images.unsplash.com/${p.id}?w=2400&h=1400&fit=crop&q=90`)).map((url, i) => (
        <Image
          key={typeof url === 'string' ? url : (url as UnsplashPhoto).id}
          src={typeof url === 'string' ? url : `https://images.unsplash.com/${(url as UnsplashPhoto).id}?w=2400&h=1400&fit=crop&q=90`}
          alt={trip.title}
          fill
          priority={i === 0}
          className="object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
          sizes="100vw"
          unoptimized
        />
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* Text — anchored to bottom */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="px-8 sm:px-14 pb-16 sm:pb-20 max-w-4xl">
          <p
            className="text-white text-xs font-medium mb-5 tracking-widest uppercase opacity-70"
            style={{ letterSpacing: '0.22em' }}
          >
            Oukala Journeys
          </p>
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
          <div className="flex items-center gap-4 mt-8">
            <div className="h-px bg-gold opacity-60" style={{ width: '32px' }} />
            <p
              className="text-white text-xs tracking-widest uppercase opacity-60"
              style={{ letterSpacing: '0.18em' }}
            >
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </p>
          </div>
        </div>
      </div>

      {/* Unsplash attribution — only for pool photos */}
      {!hasCuratorImages && (
        <UnsplashCredit photo={unsplashPool[active]} variant="hero" />
      )}

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-10 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px bg-white" style={{ height: '40px' }} />
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
