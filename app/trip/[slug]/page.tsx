import { getTripBySlug, getTripDays } from '@/lib/supabase'
import TripHeader from '@/components/TripHeader'
import DayCard from '@/components/DayCard'
import TripSidebar from '@/components/TripSidebar'
import { Trip, TripDay } from '@/lib/types'
import Link from 'next/link'

interface TripPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: TripPageProps) {
  try {
    const trip = await getTripBySlug(params.slug)
    return {
      title: `${trip.title} | Joie`,
      description: trip.subtitle || 'Your personalized journey',
    }
  } catch {
    return { title: 'Trip | Joie' }
  }
}

export default async function TripPage({ params }: TripPageProps) {
  let trip: Trip | null = null
  let days: TripDay[] = []
  let error: string | null = null

  try {
    const t = await getTripBySlug(params.slug)
    trip = t
    days = await getTripDays(t.id)
  } catch {
    error = 'Trip not found'
  }

  if (error || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center px-8">
          <p className="label mb-6">Oukala Journeys</p>
          <h1 className="font-serif text-4xl font-bold text-navy mb-4">Trip Not Found</h1>
          <p className="text-ink-muted mb-10 max-w-sm mx-auto leading-relaxed">
            We couldn&apos;t find the trip you&apos;re looking for.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-navy text-white text-sm tracking-widest uppercase hover:bg-opacity-90 transition-all duration-300"
            style={{ letterSpacing: '0.15em' }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Full-bleed hero */}
      <TripHeader trip={trip} />

      {/* Two-column layout below hero */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">

        {/* Dedication */}
        {trip.dedication && (
          <div className="py-14 text-center border-b border-gold border-opacity-20">
            <p className="font-serif text-xl italic text-ink-muted leading-relaxed max-w-2xl mx-auto">
              &ldquo;{trip.dedication}&rdquo;
            </p>
          </div>
        )}

        {/* Two-column: main content (left) + sidebar (right) */}
        <div className="py-14 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-14 lg:gap-16 items-start">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Trip meta strip */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 pb-8 border-b border-gray-100">
              <div>
                <p className="label mb-2">Journey</p>
                <h2
                  className="font-serif font-bold text-navy"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: '1.05', letterSpacing: '-0.015em' }}
                >
                  {trip.title}
                </h2>
                {trip.subtitle && (
                  <p className="text-ink-muted mt-2">{trip.subtitle}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="label mb-1">Dates</p>
                <p className="font-serif text-base text-ink">
                  {trip.start_date} <span className="text-gold mx-1.5">—</span> {trip.end_date}
                </p>
                <p className="text-xs text-ink-muted mt-1">{days.length} days</p>
              </div>
            </div>

            {/* Trip narrative */}
            {trip.trip_narrative && (
              <div className="mb-14">
                <div className="flex items-center gap-5 mb-7">
                  <p className="label shrink-0">The Story</p>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
                <div className="space-y-5">
                  {trip.trip_narrative.split('\n\n').filter(Boolean).map((para, i) => (
                    <p
                      key={i}
                      className={`leading-relaxed ${i === 0 ? 'font-serif text-lg text-navy' : 'text-ink'}`}
                      style={{
                        lineHeight: '1.85',
                        color: i === 0 ? '#1B2B4B' : '#3d3d3d',
                        fontSize: i === 0 ? '1.1rem' : '1rem',
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Epigraph */}
            {trip.epigraph && (
              <div className="mb-12 py-8 border-y border-gold border-opacity-15 text-center">
                <p
                  className="font-serif text-xl italic text-ink-muted"
                  style={{ lineHeight: '1.6', direction: 'rtl' }}
                >
                  {trip.epigraph}
                </p>
              </div>
            )}

            {/* Day grid */}
            <div>
              <div className="flex items-center gap-5 mb-8">
                <p className="label shrink-0">Your Journey</p>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2">
                {days.map((day) => (
                  <DayCard key={day.id} day={day} tripSlug={params.slug} />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:sticky lg:top-24">
            <TripSidebar trip={trip} days={days} />
          </div>

        </div>
      </div>
    </>
  )
}
