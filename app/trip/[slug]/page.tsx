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
    trip = await getTripBySlug(params.slug)
    days = await getTripDays(trip.id)
  } catch (err) {
    error = 'Trip not found'
  }

  if (error || !trip) {
    return (
      <div className="text-center py-12">
        <h1 className="font-serif text-3xl font-bold text-navy mb-4">
          Trip Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          We couldn't find the trip you're looking for. Please check your link and try again.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-navy text-white rounded-lg hover:opacity-90 transition"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <>
      <TripHeader trip={trip} />

      <div className="mb-12">
        {trip.dedication && (
          <div className="text-center mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-gold">
            <p className="font-serif text-xl italic text-gray-700">
              {trip.dedication}
            </p>
          </div>
        )}

        <div className="grid gap-2 mb-8">
          <h2 className="font-serif text-2xl font-bold text-navy">Trip Details</h2>
          <p className="text-gray-600">
            {trip.start_date} — {trip.end_date}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="font-serif text-2xl font-bold text-navy mb-6">
          Your Journey
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <DayCard key={day.id} day={day} tripSlug={params.slug} />
          ))}
        </div>
      </div>
    </>
  )
}
