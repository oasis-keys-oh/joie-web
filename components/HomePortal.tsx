'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePersona } from '@/components/PersonaProvider'
import { formatDate } from '@/lib/utils'

interface Trip {
  id: string
  title: string
  subtitle?: string
  start_date: string
  end_date: string
  web_slug: string
}

interface HomePortalProps {
  trips: Trip[]
}

// One curated image per trip slot — can be expanded later
const TRIP_IMAGES: Record<string, string> = {
  'hamid-andalusia-2026': 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=1600&h=900&fit=crop&q=85',
}
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=1600&h=900&fit=crop&q=85'

export default function HomePortal({ trips }: HomePortalProps) {
  const { traveler, setShowPicker } = usePersona()

  return (
    <div className="relative min-h-screen bg-navy flex flex-col">

      {/* Full-bleed hero behind everything */}
      <div className="absolute inset-0">
        <Image
          src={FALLBACK_IMAGE}
          alt="Oukala Journeys"
          fill
          className="object-cover opacity-30"
          priority
          unoptimized
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(27,43,75,0.6) 0%, rgba(27,43,75,0.92) 60%, #1B2B4B 100%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-8 sm:px-14 py-32">

        {/* Top: brand */}
        <div className="mb-16">
          <p
            className="text-gold text-xs tracking-widest uppercase mb-4"
            style={{ letterSpacing: '0.24em' }}
          >
            Oukala Journeys
          </p>
          <h1
            className="font-serif font-bold text-white"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)', lineHeight: '1.0', letterSpacing: '-0.02em', maxWidth: '640px' }}
          >
            Your private journey awaits.
          </h1>
        </div>

        {/* Persona greeting or prompt */}
        {traveler ? (
          <div className="mb-10 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: traveler.color, boxShadow: `0 0 0 3px rgba(255,255,255,0.15)` }}
            >
              {traveler.initials}
            </div>
            <div>
              <p className="text-white font-medium text-base">Welcome back, {traveler.name}.</p>
              <button
                onClick={() => setShowPicker(true)}
                className="text-white opacity-40 hover:opacity-70 transition-opacity text-xs"
                style={{ letterSpacing: '0.06em' }}
              >
                Not you? Switch →
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-10">
            <button
              onClick={() => setShowPicker(true)}
              className="inline-flex items-center gap-3 px-6 py-3 border border-white border-opacity-30 text-white text-sm hover:border-gold hover:text-gold transition-all duration-200"
              style={{ letterSpacing: '0.08em' }}
            >
              <span>Who are you?</span>
              <span className="opacity-60">→</span>
            </button>
            <p className="text-white opacity-30 text-xs mt-3" style={{ letterSpacing: '0.06em' }}>
              Select your traveler profile to personalize your experience
            </p>
          </div>
        )}

        {/* Trip cards — the main CTA */}
        {trips.length === 0 ? (
          <p className="text-white opacity-40 text-sm">No journeys found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl">
            {trips.map((trip) => {
              const imgSrc = TRIP_IMAGES[trip.web_slug] || FALLBACK_IMAGE
              const href = `/trip/${trip.web_slug}`
              return (
                <Link
                  key={trip.id}
                  href={href}
                  className="group relative overflow-hidden rounded-sm flex flex-col"
                  style={{ minHeight: '320px' }}
                >
                  {/* Card image */}
                  <Image
                    src={imgSrc}
                    alt={trip.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />

                  {/* Gradient */}
                  <span
                    className="absolute inset-0"
                    style={{ display: 'block', background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.72) 100%)' }}
                  />

                  {/* Persona color accent bar — top */}
                  {traveler && (
                    <span
                      className="absolute top-0 left-0 right-0 h-0.5 z-10 transition-opacity duration-300"
                      style={{ display: 'block', background: traveler.color }}
                    />
                  )}

                  {/* Card content — anchored bottom */}
                  <span className="absolute inset-0 flex flex-col justify-end p-6" style={{ display: 'flex' }}>
                    <span
                      className="text-white opacity-50 text-xs uppercase tracking-widest mb-2"
                      style={{ display: 'block', letterSpacing: '0.18em' }}
                    >
                      {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
                    </span>
                    <span
                      className="font-serif font-bold text-white mb-1"
                      style={{ display: 'block', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', lineHeight: '1.1', letterSpacing: '-0.01em' }}
                    >
                      {trip.title}
                    </span>
                    {trip.subtitle && (
                      <span className="text-white opacity-60 text-xs mb-4" style={{ display: 'block', lineHeight: '1.5' }}>
                        {trip.subtitle}
                      </span>
                    )}

                    {/* CTA — placed after meaningful content per article */}
                    <span
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest transition-all duration-200"
                      style={{
                        display: 'inline-flex',
                        letterSpacing: '0.16em',
                        color: traveler ? traveler.color : '#C9A84C',
                      }}
                    >
                      <span>Enter Journey</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Sub-links — quieter secondary actions */}
        {trips.length > 0 && (
          <div className="mt-8 flex items-center gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center gap-4">
                <Link
                  href={`/trip/${trip.web_slug}/hunt`}
                  className="text-white opacity-30 hover:opacity-60 transition-opacity text-xs uppercase tracking-widest"
                  style={{ letterSpacing: '0.14em' }}
                >
                  The Hunt
                </Link>
                <span className="text-white opacity-15 text-xs">·</span>
                <Link
                  href={`/trip/${trip.web_slug}/prep`}
                  className="text-white opacity-30 hover:opacity-60 transition-opacity text-xs uppercase tracking-widest"
                  style={{ letterSpacing: '0.14em' }}
                >
                  Before You Go
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Footer strip */}
        <div className="mt-auto pt-16 border-t border-white border-opacity-10 flex items-center justify-between">
          <a
            href="https://oukalajourney.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white opacity-25 hover:opacity-50 transition-opacity text-xs uppercase tracking-widest"
            style={{ letterSpacing: '0.18em' }}
          >
            oukalajourney.com →
          </a>
          <p className="text-white opacity-15 text-xs" style={{ letterSpacing: '0.1em' }}>
            Powered by Joie
          </p>
        </div>
      </div>
    </div>
  )
}
