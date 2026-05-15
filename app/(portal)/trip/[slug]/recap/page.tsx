import { getTripBySlug, getTripDays } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  try {
    const trip = await getTripBySlug(params.slug)
    return { title: `Recap · ${trip.title} | Oukala Journeys` }
  } catch {
    return { title: 'Recap | Oukala Journeys' }
  }
}

async function getRecapData(tripId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [
    { data: submissions },
    { data: photos },
    { data: feedback },
    { data: events },
  ] = await Promise.all([
    supabase.from('hunt_submissions').select('*').eq('trip_id', tripId),
    supabase.from('media').select('*').eq('trip_id', tripId).eq('approved', true).order('created_at'),
    supabase.from('feedback').select('*').eq('trip_id', tripId).order('created_at'),
    supabase.from('events').select('*').eq('trip_id', tripId),
  ])

  return {
    submissions: submissions || [],
    photos: photos || [],
    feedback: feedback || [],
    events: events || [],
  }
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
  return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

export default async function RecapPage({ params }: Props) {
  const trip = await getTripBySlug(params.slug)
  const days = await getTripDays(trip.id)
  const { submissions, photos, feedback, events } = await getRecapData(trip.id)

  const today = new Date()
  const tripEnd = new Date(trip.end_date)
  const tripStarted = new Date(trip.start_date) <= today

  // Stats
  const totalDays = days.length
  const countries = [...new Set(days.map(d => d.region).filter(Boolean))].filter(r => !r.includes('Transit')).length
  const huntTotal = submissions.reduce((s: number, sub: any) => s + (sub.points || 0), 0)
  const uniqueHunters = [...new Set(submissions.map((s: any) => s.traveler_key))].length
  const photoCount = photos.length
  const curatorPicks = photos.filter((p: any) => p.curator_selected)
  const restaurantCount = events.filter((e: any) => e.type === 'restaurant').length
  const feedbackCount = feedback.length

  // Hunt leaderboard from submissions
  const scores: Record<string, number> = {}
  for (const s of submissions as any[]) {
    scores[s.traveler_key] = (scores[s.traveler_key] || 0) + (s.points || 0)
  }
  const leaderboard = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key, pts]) => ({ key, pts }))

  // Top curator picks for hero grid
  const heroPhotos = curatorPicks.slice(0, 6)

  const isFuture = new Date(trip.start_date) > today

  return (
    <div className="min-h-screen" style={{ background: '#f5f2ed' }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B2B4B 0%, #243660 100%)', paddingTop: '80px' }}
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10 py-16">
          <Link
            href={`/trip/${params.slug}`}
            className="inline-flex items-center gap-2 text-white opacity-50 hover:opacity-80 transition-opacity text-xs uppercase tracking-widest mb-8"
            style={{ letterSpacing: '0.16em' }}
          >
            ← {trip.title}
          </Link>
          <p className="text-gold text-xs tracking-widest uppercase mb-3" style={{ letterSpacing: '0.2em' }}>
            {isFuture ? 'Coming Soon' : 'Journey Complete'}
          </p>
          <h1
            className="font-serif font-bold text-white mb-4"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: '1.05', letterSpacing: '-0.015em' }}
          >
            {trip.title}
          </h1>
          <p className="text-white opacity-50 text-sm">{formatDateRange(trip.start_date, trip.end_date)}</p>
        </div>

        {/* Curator pick photo strip */}
        {heroPhotos.length > 0 && (
          <div className="flex gap-1 px-0 pb-0 overflow-hidden" style={{ height: '220px' }}>
            {heroPhotos.map((p: any) => (
              <div key={p.id} className="relative flex-1 min-w-0">
                <Image
                  src={p.storage_url}
                  alt={p.editorial_caption || ''}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.2)' }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-14 space-y-16">

        {isFuture ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-6">🗓</p>
            <h2 className="font-serif text-2xl font-bold text-navy mb-3">Recap unlocks after your trip</h2>
            <p className="text-ink-muted max-w-sm mx-auto leading-relaxed">
              Your journey recap — stats, memories, hunt results, and highlights — will be assembled here once the trip wraps.
            </p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div>
              <div className="flex items-center gap-5 mb-8">
                <p className="label shrink-0">By the Numbers</p>
                <div className="flex-1 border-t border-gray-200" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { n: totalDays, label: 'Days' },
                  { n: countries, label: 'Countries' },
                  { n: restaurantCount, label: 'Restaurants' },
                  { n: photoCount, label: 'Photos' },
                  { n: huntTotal, label: 'Hunt Points' },
                  { n: feedbackCount, label: 'Notes Left' },
                ].map(({ n, label }) => (
                  <div
                    key={label}
                    className="bg-white border border-gray-100 rounded-sm px-5 py-6 text-center"
                  >
                    <p className="font-serif text-3xl font-bold text-navy">{n}</p>
                    <p className="text-xs text-ink-muted uppercase tracking-widest mt-1" style={{ letterSpacing: '0.14em' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hunt leaderboard */}
            {leaderboard.length > 0 && (
              <div>
                <div className="flex items-center gap-5 mb-8">
                  <p className="label shrink-0">Hunt Results</p>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
                <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
                  {leaderboard.map(({ key, pts }, i) => (
                    <div
                      key={key}
                      className="flex items-center gap-5 px-6 py-4 border-b border-gray-50 last:border-0"
                    >
                      <span className="font-serif text-2xl font-bold" style={{ color: i === 0 ? '#C9A84C' : '#9ca3af', minWidth: '2rem' }}>
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold text-navy capitalize">{key}</span>
                      <span className="font-mono text-sm font-bold" style={{ color: i === 0 ? '#C9A84C' : '#1B2B4B' }}>
                        {pts} pts
                      </span>
                      {i === 0 && <span className="text-lg">🏆</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo highlights */}
            {curatorPicks.length > 0 && (
              <div>
                <div className="flex items-center gap-5 mb-8">
                  <p className="label shrink-0">Curator Highlights</p>
                  <div className="flex-1 border-t border-gray-200" />
                  <Link href={`/trip/${params.slug}/photos`} className="text-xs text-gold hover:opacity-75">
                    Full album →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {curatorPicks.slice(0, 9).map((p: any) => (
                    <div key={p.id} className="relative rounded-sm overflow-hidden group" style={{ aspectRatio: '4/3', background: '#e8e4dc' }}>
                      <Image
                        src={p.storage_url}
                        alt={p.editorial_caption || p.caption || ''}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                      {(p.editorial_caption || p.caption) && (
                        <div
                          className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
                        >
                          <p className="text-white text-xs p-3">{p.editorial_caption || p.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-day recap */}
            <div>
              <div className="flex items-center gap-5 mb-8">
                <p className="label shrink-0">The Journey</p>
                <div className="flex-1 border-t border-gray-200" />
              </div>
              <div className="space-y-3">
                {days.map(day => (
                  <Link
                    key={day.id}
                    href={`/trip/${params.slug}/day/${day.day_number}`}
                    className="flex items-center gap-5 bg-white border border-gray-100 rounded-sm px-6 py-4 hover:border-gold hover:border-opacity-50 transition-colors group"
                  >
                    <span className="text-xs font-semibold text-gold uppercase tracking-widest shrink-0" style={{ letterSpacing: '0.16em', minWidth: '3rem' }}>
                      Day {day.day_number}
                    </span>
                    <span className="font-serif font-bold text-navy text-sm flex-1">{day.title}</span>
                    {day.location && <span className="text-xs text-ink-muted hidden sm:block">{day.location}</span>}
                    <span className="text-ink-muted opacity-40 group-hover:opacity-80 transition-opacity text-sm shrink-0">→</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Traveler notes */}
            {feedback.length > 0 && (
              <div>
                <div className="flex items-center gap-5 mb-8">
                  <p className="label shrink-0">What You Said</p>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(feedback as any[]).slice(0, 6).map((f: any) => (
                    <div key={f.id} className="bg-white border border-gray-100 rounded-sm px-6 py-5">
                      <p className="text-xs font-semibold text-gold mb-2">{f.traveler_name}</p>
                      <p className="text-sm text-navy leading-relaxed italic">&ldquo;{f.comment}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
