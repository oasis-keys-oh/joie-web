import { getTripBySlug } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import PrepClient from '@/components/PrepClient'
import { Trip } from '@/lib/types'

interface PrepPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PrepPageProps) {
  try {
    const trip = await getTripBySlug(params.slug)
    return { title: `Prepare · ${trip.title} | Oukala Journeys` }
  } catch {
    return { title: 'Prepare | Oukala Journeys' }
  }
}

async function getPackingItems(tripId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('packing_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('category', { ascending: true })
  return data || []
}

async function getRecommendations(tripId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('recommendations')
    .select('*')
    .eq('trip_id', tripId)
    .order('type', { ascending: true })
  return data || []
}

export default async function PrepPage({ params }: PrepPageProps) {
  let trip: Trip | null = null
  let packingItems: any[] = []
  let recommendations: any[] = []

  try {
    trip = await getTripBySlug(params.slug)
    ;[packingItems, recommendations] = await Promise.all([
      getPackingItems(trip.id),
      getRecommendations(trip.id),
    ])
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
          Oukala Journeys
        </p>
        <h1
          className="font-serif font-bold text-white"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.05', letterSpacing: '-0.015em' }}
        >
          Before You Go
        </h1>
        <p className="text-white opacity-50 mt-3 text-sm max-w-lg" style={{ lineHeight: '1.7' }}>
          Everything you need to arrive ready — what to pack, what to read, and what to know.
        </p>
      </div>

      {/* Client-side tabbed content */}
      <PrepClient
        tripSlug={params.slug}
        packingItems={packingItems}
        recommendations={recommendations}
      />
    </div>
  )
}
