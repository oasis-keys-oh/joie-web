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
import DayCalloutSidebar from '@/components/DayCalloutSidebar'
import DayNavigation from '@/components/DayNavigation'
import PhotoFooter from '@/components/PhotoFooter'
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
      {/* Back to trip overview — subtle breadcrumb overlaid on hero */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex items-center justify-between px-8 py-5">
          {/* Left: back link */}
          <Link
            href={`/trip/${params.slug}`}
            className="pointer-events-auto flex items-center gap-2 group"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
          >
            <span className="text-white opacity-60 group-hover:opacity-100 transition-opacity text-sm">←</span>
            <span
              className="text-white opacity-60 group-hover:opacity-100 transition-opacity text-xs uppercase tracking-widest hidden sm:inline"
              style={{ letterSpacing: '0.16em' }}
            >
              {trip.title}
            </span>
          </Link>
        </div>
      </div>

      {/* Full-bleed day hero */}
      <DayHeader day={day} />

      {/* Three-column: left day-nav | center content | right callout sidebar */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] xl:grid-cols-[260px_1fr_280px] gap-8 lg:gap-10 items-start">

          {/* ── LEFT SIDEBAR — Day Navigation + Map ── */}
          <div className="lg:sticky lg:top-24 order-3 lg:order-1">
            <DaySidebar
              days={allDays}
              currentDayNumber={dayNumber}
              tripSlug={params.slug}
            />
          </div>

          {/* ── CENTER CONTENT ── */}
          <div className="order-1 lg:order-2 min-w-0 pb-24">

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

            {/* Navigation */}
            <DayNavigation
              tripSlug={params.slug}
              currentDay={dayNumber}
              totalDays={allDays.length}
            />

          </div>

          {/* ── RIGHT SIDEBAR — Callout Boxes ── */}
          <div className="lg:sticky lg:top-24 order-2 lg:order-3">
            <DayCalloutSidebar day={day} />
          </div>

        </div>
      </div>

      {/* Bottom photo showcase */}
      <PhotoFooter
        region={day.region}
        caption={`${day.region} · ${day.location || ''}`}
      />
    </>
  )
}
