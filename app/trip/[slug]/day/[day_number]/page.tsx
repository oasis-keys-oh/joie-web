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
      title: `${day.title} — Day ${day.day_number} | Joie`,
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
    const t = await getTripBySlug(params.slug)
    trip = t
    allDays = await getTripDays(t.id)
    const d = await getTripDay(t.id, dayNumber)
    day = d
    events = await getDayEvents(d.id)
  } catch {
    error = 'Day not found'
  }

  if (error || !trip || !day) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center px-8">
          <p className="label mb-6">Day Not Found</p>
          <h1 className="font-serif text-4xl font-bold text-navy mb-4">
            We couldn&apos;t find this day
          </h1>
          <Link
            href={`/trip/${params.slug}`}
            className="inline-block px-8 py-3 bg-navy text-white text-sm uppercase tracking-widest hover:bg-opacity-90 transition"
            style={{ letterSpacing: '0.15em' }}
          >
            Back to Trip
          </Link>
        </div>
      </div>
    )
  }

  const hotel = day.date ? await getHotelForDay(trip.id, day.date) : null

  return (
    <>
      {/* Full-bleed day hero */}
      <DayHeader day={day} />

      {/* Content — centered column with generous padding */}
      <div className="max-w-3xl mx-auto px-8 sm:px-12 pb-24">

        {/* Morning Brief — right after hero, feels like a wake-up card */}
        {day.morning_brief && (
          <div className="mt-16 mb-16 py-10 px-10 bg-parchment border-l-2 border-gold">
            <p className="label mb-4">Morning Brief</p>
            <p className="font-serif text-xl leading-relaxed text-ink" style={{ lineHeight: '1.7' }}>
              {day.morning_brief}
            </p>
          </div>
        )}

        {/* Meals */}
        {(day.meal_breakfast || day.meal_lunch || day.meal_dinner) && (
          <div className="mt-16">
            <div className="flex items-center gap-6 mb-8">
              <p className="label shrink-0">Today&apos;s Meals</p>
              <div className="flex-1 border-t border-gray-100" />
            </div>
            <MealRow
              breakfast={day.meal_breakfast}
              lunch={day.meal_lunch}
              dinner={day.meal_dinner}
            />
          </div>
        )}

        {/* Hotel Tonight */}
        {hotel && (
          <div className="mt-16">
            <div className="flex items-center gap-6 mb-8">
              <p className="label shrink-0">Hotel Tonight</p>
              <div className="flex-1 border-t border-gray-100" />
            </div>
            <HotelCard hotel={hotel} />
          </div>
        )}

        {/* Reservations & Events */}
        {events.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-6 mb-8">
              <p className="label shrink-0">Confirmed Reservations</p>
              <div className="flex-1 border-t border-gray-100" />
            </div>
            <div className="space-y-6">
              {events.map((event) => (
                <ReservationCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Itinerary Narrative */}
        {day.itinerary_narrative && day.itinerary_narrative.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-6 mb-12">
              <p className="label shrink-0">Itinerary</p>
              <div className="flex-1 border-t border-gray-100" />
            </div>
            <div className="space-y-0">
              {day.itinerary_narrative.map((segment, idx) => (
                <NarrativeSection key={idx} segment={segment} />
              ))}
            </div>
          </div>
        )}

        {/* Callout Boxes — spaced out, editorial */}
        <div className="mt-16 space-y-8">
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
            <CalloutBox type="one_thing" content={day.local_insider_tip} />
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

      </div>
    </>
  )
}
