import {
  getTripBySlug,
  getTripDays,
  getTripDay,
  getDayEvents,
  getHotelForDay,
} from '@/lib/supabase'
import DayHeader from '@/components/DayHeader'
import MealRow from '@/components/MealRow'
import HotelCard from '@/components/HotelCard'
import ReservationCard from '@/components/ReservationCard'
import NarrativeSection from '@/components/NarrativeSection'
import CalloutBox from '@/components/CalloutBox'
import DayNavigation from '@/components/DayNavigation'
import { Trip, TripDay, Event } from '@/lib/types'
import Link from 'next/link'

interface DayPageProps {
  params: {
    slug: string
    day_number: string
  }
}

export async function generateMetadata({ params }: DayPageProps) {
  try {
    const trip = await getTripBySlug(params.slug)
    const day = await getTripDay(trip.id, parseInt(params.day_number))
    return {
      title: `${day.title} - Day ${day.day_number} | Joie`,
      description: `Day ${day.day_number} of your journey`,
    }
  } catch {
    return {
      title: 'Day | Joie',
    }
  }
}

export default async function DayPage({ params }: DayPageProps) {
  const dayNumber = parseInt(params.day_number)
  let trip: Trip | null = null
  let day: TripDay | null = null
  let allDays: TripDay[] = []
  let events: Event[] = []
  let error: string | null = null

  try {
    trip = await getTripBySlug(params.slug)
    allDays = await getTripDays(trip.id)
    day = await getTripDay(trip.id, dayNumber)
    events = await getDayEvents(day.id)
  } catch (err) {
    error = 'Day not found'
  }

  if (error || !trip || !day) {
    return (
      <div className="text-center py-12">
        <h1 className="font-serif text-3xl font-bold text-navy mb-4">
          Day Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          We couldn't find this day in your trip.
        </p>
        <Link
          href={`/trip/${params.slug}`}
          className="inline-block px-6 py-3 bg-navy text-white rounded-lg hover:opacity-90 transition"
        >
          Back to Trip
        </Link>
      </div>
    )
  }

  const hotel = day.date ? await getHotelForDay(trip.id, day.date) : null

  return (
    <>
      <DayHeader day={day} />

      {/* Meals Section */}
      {(day.meal_breakfast || day.meal_lunch || day.meal_dinner) && (
        <>
          <h2 className="font-serif text-2xl font-bold text-navy mb-4">
            Today's Meals
          </h2>
          <MealRow
            breakfast={day.meal_breakfast}
            lunch={day.meal_lunch}
            dinner={day.meal_dinner}
          />
        </>
      )}

      {/* Hotel Tonight */}
      {hotel && (
        <>
          <HotelCard hotel={hotel} />
        </>
      )}

      {/* Reservations & Events */}
      {events.length > 0 && (
        <>
          <h2 className="font-serif text-2xl font-bold text-navy mb-6">
            Confirmed Reservations
          </h2>
          {events.map((event) => (
            <ReservationCard key={event.id} event={event} />
          ))}
        </>
      )}

      {/* Morning Brief */}
      {day.morning_brief && (
        <div className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
          <h3 className="font-serif text-lg font-bold text-blue-900 mb-2">
            Morning Brief
          </h3>
          <p className="text-blue-800">{day.morning_brief}</p>
        </div>
      )}

      {/* Itinerary Narrative */}
      {day.itinerary_narrative && day.itinerary_narrative.length > 0 && (
        <>
          <h2 className="font-serif text-2xl font-bold text-navy mb-6">
            Itinerary
          </h2>
          {day.itinerary_narrative.map((segment, idx) => (
            <NarrativeSection key={idx} segment={segment} />
          ))}
        </>
      )}

      {/* Special Callout Boxes */}
      <div className="my-12 space-y-6">
        {day.wow_moment && (
          <CalloutBox type="wow" content={day.wow_moment} />
        )}

        {day.thread_content && (
          <CalloutBox
            type="thread"
            title={day.thread_title}
            content={day.thread_content.content || ''}
          />
        )}

        {day.local_insider_tip && (
          <CalloutBox
            type="one_thing"
            content={day.local_insider_tip}
          />
        )}

        {day.phrase && (
          <CalloutBox
            type="phrase"
            title={day.phrase.title}
            content={day.phrase.content || ''}
          />
        )}
      </div>

      {/* Navigation */}
      <DayNavigation
        tripSlug={params.slug}
        currentDay={dayNumber}
        totalDays={allDays.length}
      />
    </>
  )
}
