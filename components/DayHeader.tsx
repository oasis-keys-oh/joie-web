'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { TripDay } from '@/lib/types'
import { getPhotoPool, UnsplashPhoto } from '@/lib/unsplash'
import UnsplashCredit from '@/components/UnsplashCredit'
import { formatDate } from '@/lib/utils'

interface DayHeaderProps {
  day: TripDay
}

function sized(photo: UnsplashPhoto, w: number, h: number, q: number): string {
  return `https://images.unsplash.com/${photo.id}?w=${w}&h=${h}&fit=crop&q=${q}`
}

export default function DayHeader({ day }: DayHeaderProps) {
  // Use location for city-level accuracy (e.g. "Loire — Chambord"), fall back to region
  const locationStr = [day.location, day.region].filter(Boolean).join(' ')
  const pool = getPhotoPool(locationStr)
  // Start from a deterministic offset per day so images don't always start the same
  const [index, setIndex] = useState(day.day_number % pool.length)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIndex((i) => (i + 1) % pool.length)
        setFading(false)
      }, 600)
    }, 6000)
    return () => clearInterval(interval)
  }, [pool.length])

  const photo = pool[index]
  const imgUrl = sized(photo, 2000, 900, 85)

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '70vh', minHeight: '480px' }}>

      {/* Cycling image with crossfade */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <Image
          src={imgUrl}
          alt={day.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
        />
      </div>

      {/* Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end px-8 sm:px-14 pb-14 sm:pb-18">

        {/* Day number + region */}
        <div className="flex items-center gap-4 mb-5">
          <span
            className="text-white text-xs tracking-widest uppercase opacity-60"
            style={{ letterSpacing: '0.22em' }}
          >
            Day {day.day_number}
          </span>
          <div className="h-px w-8 bg-gold opacity-50" />
          <span
            className="text-white text-xs tracking-widest uppercase opacity-60"
            style={{ letterSpacing: '0.22em' }}
          >
            {day.region}
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-serif font-bold text-white mb-4"
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 5rem)',
            lineHeight: '1.0',
            letterSpacing: '-0.015em',
            maxWidth: '800px',
          }}
        >
          {day.title}
        </h1>

        {/* Date + location */}
        <div className="flex items-center gap-6 mt-2">
          {day.date && (
            <p className="text-white opacity-55 text-sm" style={{ letterSpacing: '0.04em' }}>
              {formatDate(day.date)}
            </p>
          )}
          {day.location && (
            <>
              <div className="w-px h-4 bg-white opacity-30" />
              <p className="text-white opacity-55 text-sm" style={{ letterSpacing: '0.04em' }}>
                {day.location}
              </p>
            </>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5 mt-5">
          {pool.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFading(true); setTimeout(() => { setIndex(i); setFading(false) }, 600) }}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === index ? '#C9A84C' : 'rgba(255,255,255,0.4)',
                transform: i === index ? 'scale(1.3)' : 'scale(1)',
              }}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Photo attribution */}
      <UnsplashCredit photo={{ ...photo, url: imgUrl }} variant="hero" />
    </div>
  )
}
