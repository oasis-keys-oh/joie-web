import { getTripBySlug, getTripDays, getTripTravelers } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import TripHeader from '@/components/TripHeader'
import DayCard from '@/components/DayCard'
import TripSidebar from '@/components/TripSidebar'
import PhotoFooter from '@/components/PhotoFooter'
import PreTripDrops from '@/components/PreTripDrops'
import CuratorThread from '@/components/CuratorThread'
import PersonaDedication from '@/components/PersonaDedication'
import FollowerPage from '@/components/follower/FollowerPage'
import { Trip, TripDay } from '@/lib/types'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

async function getPreTripDrops(tripId: string, tripStartDate: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('pre_trip_content')
    .select('id, date_offset_days, type, title, content')
    .eq('trip_id', tripId)
    .lt('date_offset_days', 0)   // only pre-trip rows (negative offsets)
    .order('date_offset_days', { ascending: false })  // most recent first

  if (!data) return []

  const tripStart = new Date(tripStartDate)

  return data.map((row: any) => {
    const unlockDate = new Date(tripStart)
    unlockDate.setDate(unlockDate.getDate() + row.date_offset_days) // date_offset_days is negative
    return {
      ...row,
      unlock_date: unlockDate.toISOString().slice(0, 10), // YYYY-MM-DD
    }
  })
}

interface TripPageProps {
  params: {
    slug: string
  }
  searchParams: {
    ref?: string
    name?: string
  }
}

// ── Follower data fetching ─────────────────────────────────────────────────────

async function getLatestShareEvents(tripId: string, limit = 20) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('trip_share_events')
    .select('id, trip_id, event_type, location_name, place_category, challenge_title, memory_caption, media_url, created_at')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}

async function getHuntChallengeCount(tripId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { count } = await supabase
    .from('hunt_challenges')
    .select('id', { count: 'exact', head: true })
    .eq('trip_id', tripId)
  return count || 0
}

async function getPublishedDays(tripId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('trip_days')
    .select('id, day_number, title, location, region, wow_moment, thread_content, local_insider_tip, follower_published, follower_published_at')
    .eq('trip_id', tripId)
    .eq('follower_published', true)
    .order('day_number', { ascending: true })
  return data || []
}

export async function generateMetadata({ params }: TripPageProps) {
  try {
    const trip = await getTripBySlug(params.slug)
    return {
      title: `${trip.title} | Oukala Journeys`,
      description: trip.subtitle || 'Your personalized journey',
    }
  } catch {
    return { title: 'Trip | Oukala Journeys' }
  }
}

export default async function TripPage({ params, searchParams }: TripPageProps) {
  // ── Follower gate ────────────────────────────────────────────────────────────
  // Visitors arriving via a share link (?ref= or ?name=) see the follower view.
  // Returning followers have a joie_follow_<slug> cookie set after registration.
  // All other visitors (travelers) see the full itinerary.

  const cookieStore = await cookies()
  const followerCookie = cookieStore.get(`joie_follow_${params.slug}`)
  const hasRefParam = !!(searchParams.ref || searchParams.name)
  const isReturningFollower = !!followerCookie

  if (hasRefParam || isReturningFollower) {
    let trip: Trip | null = null
    let totalDays = 0

    try {
      const t = await getTripBySlug(params.slug)
      trip = t
      const allDays = await getTripDays(t.id)
      totalDays = allDays.length
    } catch {
      // Trip not found — fall through to traveler 404 below
    }

    if (trip) {
      // Check if this returning follower has full_access — if so, fall through to full itinerary
      if (isReturningFollower && followerCookie?.value) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: followerRow } = await supabase
          .from('trip_followers')
          .select('full_access')
          .eq('id', followerCookie.value)
          .single()

        if (followerRow?.full_access === true) {
          // Full access granted — fall through to the full traveler itinerary below
          // (don't return FollowerPage)
        } else {
          const [shareEvents, publishedDays] = await Promise.all([
            getLatestShareEvents(trip!.id),
            getPublishedDays(trip!.id),
          ])
          return (
            <FollowerPage
              tripId={trip.id}
              tripSlug={params.slug}
              tripTitle={trip.title}
              mode="feed"
              prefillName={searchParams.name}
              refCode={searchParams.ref}
              initialFollowerId={followerCookie.value}
              initialEvents={shareEvents as any}
              publishedDays={publishedDays as any}
              totalDays={totalDays}
            />
          )
        }
      } else {
        // New visitor with ?ref= — show registration form
        const [shareEvents, publishedDays] = await Promise.all([
          getLatestShareEvents(trip!.id),
          getPublishedDays(trip!.id),
        ])
        return (
          <FollowerPage
            tripId={trip.id}
            tripSlug={params.slug}
            tripTitle={trip.title}
            mode="register"
            prefillName={searchParams.name}
            refCode={searchParams.ref}
            initialFollowerId={undefined}
            initialEvents={shareEvents as any}
            publishedDays={publishedDays as any}
            totalDays={totalDays}
          />
        )
      }
    }
  }
  // ── End follower gate ────────────────────────────────────────────────────────

  let trip: Trip | null = null
  let days: TripDay[] = []
  let drops: any[] = []
  let travelerCount = 0
  let huntChallengeCount = 0
  let error: string | null = null
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD server time

  try {
    const t = await getTripBySlug(params.slug)
    trip = t
    days = await getTripDays(t.id)
    drops = await getPreTripDrops(t.id, t.start_date)
    const [travelers, challengeCount] = await Promise.all([
      getTripTravelers(t.id),
      getHuntChallengeCount(t.id),
    ])
    travelerCount = travelers.length
    huntChallengeCount = challengeCount
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
      {/* Full-bleed hero — derive photo from first day's location */}
      <TripHeader trip={trip} firstDestination={days[0]?.location || days[0]?.region || ''} />

      {/* Two-column layout below hero */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">

        {/* Dedication — persona-aware: each traveler sees their own line */}
        {((trip as any).dedications || trip.dedication) && (
          <PersonaDedication
            dedications={(trip as any).dedications || {}}
            fallback={trip.dedication}
          />
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
                  {formatDate(trip.start_date)} <span className="text-gold mx-1.5">—</span> {formatDate(trip.end_date)}
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
              <div className="mb-12 py-10 border-y border-gold border-opacity-15 text-center">
                {/* English translation first */}
                {trip.epigraph_translation && (
                  <p
                    className="font-serif text-xl italic text-navy mb-3"
                    style={{ lineHeight: '1.6' }}
                  >
                    &ldquo;{trip.epigraph_translation}&rdquo;
                  </p>
                )}
                {/* Transliteration */}
                {trip.epigraph_transliteration && (
                  <p
                    className="text-ink-muted mb-4 italic"
                    style={{ fontSize: '0.85rem', letterSpacing: '0.02em' }}
                  >
                    {trip.epigraph_transliteration}
                  </p>
                )}
                {/* Original script */}
                <p
                  className="font-serif text-base text-ink-muted opacity-60"
                  style={{ lineHeight: '1.6', direction: 'rtl', fontFamily: 'serif' }}
                >
                  {trip.epigraph}
                </p>
              </div>
            )}

            {/* Pre-trip content drops — only visible before departure */}
            {drops.length > 0 && (
              <PreTripDrops
                drops={drops}
                tripStartDate={trip.start_date}
                tripTitle={trip.title}
                today={today}
              />
            )}

            {/* Featured: Hunt + Prep */}
            <div className="mb-14">
              <div className="flex items-center gap-5 mb-7">
                <p className="label shrink-0">Trip Extras</p>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/trip/${params.slug}/hunt`}
                  className="group relative overflow-hidden rounded-sm border border-gray-100 hover:border-gold hover:border-opacity-60 transition-all duration-300 p-6"
                  style={{ background: 'linear-gradient(135deg, #1B2B4B 0%, #243660 100%)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span style={{ fontSize: '1.8rem' }}>🏆</span>
                    <span className="text-white opacity-40 group-hover:opacity-80 transition-opacity text-sm">→</span>
                  </div>
                  <p className="text-gold text-xs tracking-widest uppercase mb-1" style={{ letterSpacing: '0.18em' }}>
                    The Hunt
                  </p>
                  <h3 className="font-serif font-bold text-white text-xl mb-2" style={{ lineHeight: '1.1' }}>
                    Scavenger Hunt
                  </h3>
                  <p className="text-white opacity-50 text-xs leading-relaxed">
                    {huntChallengeCount > 0 ? `${huntChallengeCount} challenges` : 'Challenges'} across your journey. Points, stakes, and a Grand Finale.
                  </p>
                </Link>

                <Link
                  href={`/trip/${params.slug}/prep`}
                  className="group relative overflow-hidden rounded-sm border border-gray-100 hover:border-gold hover:border-opacity-60 transition-all duration-300 p-6"
                  style={{ background: 'linear-gradient(135deg, #f8f5ef 0%, #f0ebe0 100%)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span style={{ fontSize: '1.8rem' }}>🧳</span>
                    <span className="text-ink-muted opacity-40 group-hover:opacity-80 transition-opacity text-sm">→</span>
                  </div>
                  <p className="text-gold text-xs tracking-widest uppercase mb-1" style={{ letterSpacing: '0.18em' }}>
                    Before You Go
                  </p>
                  <h3 className="font-serif font-bold text-navy text-xl mb-2" style={{ lineHeight: '1.1' }}>
                    Trip Prep
                  </h3>
                  <p className="text-navy opacity-50 text-xs leading-relaxed">
                    Packing checklist, books &amp; films, money &amp; connectivity, health &amp; safety — everything before departure.
                  </p>
                </Link>

                <Link
                  href={`/trip/${params.slug}/photos`}
                  className="group relative overflow-hidden rounded-sm border border-gray-100 hover:border-gold hover:border-opacity-60 transition-all duration-300 p-6"
                  style={{ background: 'linear-gradient(135deg, #2d1b4e 0%, #3d2660 100%)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span style={{ fontSize: '1.8rem' }}>📸</span>
                    <span className="text-white opacity-40 group-hover:opacity-80 transition-opacity text-sm">→</span>
                  </div>
                  <p className="text-gold text-xs tracking-widest uppercase mb-1" style={{ letterSpacing: '0.18em' }}>
                    The Album
                  </p>
                  <h3 className="font-serif font-bold text-white text-xl mb-2" style={{ lineHeight: '1.1' }}>
                    Our Photos
                  </h3>
                  <p className="text-white opacity-50 text-xs leading-relaxed">
                    Shared memories from the journey, grouped by day — with curator highlights starred.
                  </p>
                </Link>

                <Link
                  href={`/trip/${params.slug}/recap`}
                  className="group relative overflow-hidden rounded-sm border border-gray-100 hover:border-gold hover:border-opacity-60 transition-all duration-300 p-6"
                  style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #234d38 100%)' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span style={{ fontSize: '1.8rem' }}>✨</span>
                    <span className="text-white opacity-40 group-hover:opacity-80 transition-opacity text-sm">→</span>
                  </div>
                  <p className="text-gold text-xs tracking-widest uppercase mb-1" style={{ letterSpacing: '0.18em' }}>
                    After the Journey
                  </p>
                  <h3 className="font-serif font-bold text-white text-xl mb-2" style={{ lineHeight: '1.1' }}>
                    Trip Recap
                  </h3>
                  <p className="text-white opacity-50 text-xs leading-relaxed">
                    Stats, hunt results, curator picks, and everything you said — assembled after you land.
                  </p>
                </Link>
              </div>
            </div>

            {/* Day grid */}
            <div>
              <div className="flex items-center gap-5 mb-8">
                <p className="label shrink-0">Your Journey</p>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2">
                {days.map((day, i) => (
                  <div
                    key={day.id}
                    className={
                      // If this is the last card and the total count is odd, span full width
                      i === days.length - 1 && days.length % 2 !== 0
                        ? 'sm:col-span-2'
                        : ''
                    }
                  >
                    <DayCard day={day} tripSlug={params.slug} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:sticky lg:top-24">
            <TripSidebar trip={trip} days={days} travelerCount={travelerCount} />
          </div>

        </div>
      </div>

      {/* Bottom photo showcase — derived from the trip's closing day (was hardcoded to "Morocco"
          regardless of trip; getPhotoPool() falls back to a generic default pool for any region/
          location string it doesn't recognize, so this is safe for trips outside the curated pools) */}
      {(() => {
        const lastDay = days[days.length - 1]
        const closingRegion = lastDay?.region || lastDay?.location || trip.title
        return (
          <PhotoFooter
            region={closingRegion}
            caption={lastDay?.region || undefined}
            overrideUrl={trip.closing_photo_url || undefined}
          />
        )
      })()}

      {/* Floating curator chat — always visible on trip pages */}
      <CuratorThread
        tripId={trip.id}
        tripSlug={params.slug}
        curatorWhatsApp="+12125551234"
        curatorPhone="+12125551234"
      />
    </>
  )
}
