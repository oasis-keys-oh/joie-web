import {
  getTripBySlug,
  getTripDays,
  getTripDay,
  getDayEvents,
  getHotelForDay,
} from '@/lib/supabase'
import DayHeader from '@/components/DayHeader'
import DaySidebar from '@/components/DaySidebar'
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
    return { title: 'Day | Joie' }
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

      {/* Two-column: left sidebar + main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="py-10 grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-10 lg:gap-12 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:sticky lg:top-24 order-2 lg:order-1">
            <DaySidebar
              days={allDays}
              currentDayNumber={dayNumber}
              tripSlug={params.slug}
            />
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="order-1 lg:order-2 max-w-2xl pb-24">

            {/* Morning Brief */}
            {day.morning_brief && (
              <div
                className="mt-10 mb-12 py-8 px-8 border-l-2 border-gold"
                style={{ background: '#faf8f4' }}
              >
                <p className="label mb-3">Morning Brief</p>
                <p
                  className="font-serif text-lg leading-relaxed text-navy"
                  style={{ lineHeight: '1.75' }}
                >
                  {day.morning_brief}
                </p>
              </div>
            )}

            {/* Meals */}
            {(day.meal_breakfast || day.meal_lunch || day.meal_dinner) && (
              <div className="mt-10">
                <div className="flex items-center gap-5 mb-6">
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
              <div className="mt-12">
                <div className="flex items-center gap-5 mb-6">
                  <p className="label shrink-0">Hotel Tonight</p>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
                <HotelCard hotel={hotel} />
              </div>
            )}

            {/* Reservations */}
            {events.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-5 mb-6">
                  <p className="label shrink-0">Confirmed Reservations</p>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
                <div className="space-y-5">
                  {events.map((event) => (
                    <ReservationCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary Narrative */}
            {day.itinerary_narrative && day.itinerary_narrative.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-5 mb-10">
                  <p className="label shrink-0">Itinerary</p>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
                {/* Timeline wrapper */}
                <div className="pl-1 border-l border-gray-200 space-y-0">
                  {day.itinerary_narrative.map((segment, idx) => (
                    <NarrativeSection key={idx} segment={segment} />
                  ))}
                </div>
              </div>
            )}

            {/* Callout Boxes */}
            <div className="mt-12 space-y-6">
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
        </div>
      </div>
    </>
  )
}
