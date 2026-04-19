import { getTripBySlug, getTripDays } from '@/lib/supabase'
import TripHeader from '@/components/TripHeader'
import DayCard from '@/components/DayCard'
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
    return {
      title: 'Trip | Joie',
    }
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
          <h1 className="font-serif text-4xl font-bold text-navy mb-4">
            Trip Not Found
          </h1>
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
      <TripHeader trip={trip} />

      <div className="max-w-5xl mx-auto px-8 sm:px-12">

        {trip.dedication && (
          <div className="py-16 text-center border-b border-gold border-opacity-20">
            <p className="font-serif text-2xl italic text-ink-muted leading-relaxed max-w-2xl mx-auto">
              &ldquo;{trip.dedication}&rdquo;
            </p>
          </div>
        )}

        <div className="py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-gray-100">
          <div>
            <p className="label mb-3">Journey</p>
            <p className="font-serif text-3xl font-bold text-navy">{trip.title}</p>
            {trip.subtitle && (
              <p className="text-ink-muted mt-2 text-base">{trip.subtitle}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="label mb-2">Dates</p>
            <p className="font-serif text-lg text-ink">
              {trip.start_date} <span className="text-gold mx-2">—</span> {trip.end_date}
            </p>
            <p className="text-sm text-ink-muted mt-1">{days.length} days</p>
          </div>
        </div>

        <div className="py-16">
          <div className="flex items-center gap-6 mb-12">
            <p className="label shrink-0">Your Journey</p>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2 lg:grid-cols-3">
            {days.map((day) => (
              <DayCard key={day.id} day={day} tripSlug={params.slug} />
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
