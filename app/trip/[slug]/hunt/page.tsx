import { getTripBySlug } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import HuntClient from '@/components/HuntClient'
import { Trip } from '@/lib/types'

interface HuntPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: HuntPageProps) {
  try {
    const trip = await getTripBySlug(params.slug)
    return { title: `The Hunt · ${trip.title} | Oukala Journeys` }
  } catch {
    return { title: 'The Hunt | Oukala Journeys' }
  }
}

async function getHuntChallenges(tripId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('hunt_challenges')
    .select('*')
    .eq('trip_id', tripId)
    .order('points', { ascending: false })
  return data || []
}

export default async function HuntPage({ params }: HuntPageProps) {
  let trip: Trip | null = null
  let challenges: any[] = []

  try {
    trip = await getTripBySlug(params.slug)
    challenges = await getHuntChallenges(trip.id)
  } catch {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-ink-muted">Trip not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero strip */}
      <div
        className="relative pt-32 pb-16 px-8 sm:px-14"
        style={{ background: '#1B2B4B' }}
      >
        <Link
          href={`/trip/${params.slug}`}
          className="inline-flex items-center gap-2 text-white opacity-50 hover:opacity-80 transition-opacity text-xs uppercase tracking-widest mb-8"
          style={{ letterSpacing: '0.16em' }}
        >
          ← {trip.title}
        </Link>
        <p
          className="text-gold text-xs tracking-widest uppercase mb-3"
          style={{ letterSpacing: '0.2em' }}
        >
          The Andalusian Thread
        </p>
        <h1
          className="font-serif font-bold text-white"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.05', letterSpacing: '-0.015em' }}
        >
          The Hunt
        </h1>
        <p className="text-white opacity-50 mt-3 text-sm max-w-2xl" style={{ lineHeight: '1.7' }}>
          Eleven challenges across Morocco and France. Points. Stakes. A Grand Finale verse.
          The tiebreaker rule: whoever spots the first stork wins.
        </p>

        {/* Points legend */}
        <div className="flex gap-6 mt-8">
          {[
            { label: '3 pts', note: 'Discovery', color: '#C9A84C' },
            { label: '5 pts', note: 'Challenge', color: '#a78bfa' },
            { label: '10 pts', note: 'Grand Finale', color: '#f97316' },
          ].map((tier) => (
            <div key={tier.label} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: tier.color }}
              />
              <span className="text-white opacity-60 text-xs uppercase tracking-widest" style={{ letterSpacing: '0.12em' }}>
                {tier.label} — {tier.note}
              </span>
            </div>
          ))}
        </div>
      </div>

      <HuntClient tripSlug={params.slug} challenges={challenges} />
    </div>
  )
}
