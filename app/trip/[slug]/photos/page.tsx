import { getTripBySlug } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  try {
    const trip = await getTripBySlug(params.slug)
    return { title: `Photos · ${trip.title} | Oukala Journeys` }
  } catch {
    return { title: 'Photos | Oukala Journeys' }
  }
}

async function getAlbum(tripId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: photos } = await supabase
    .from('media')
    .select('*')
    .eq('trip_id', tripId)
    .eq('approved', true)
    .order('created_at', { ascending: true })

  const { data: days } = await supabase
    .from('trip_days')
    .select('id, day_number, title, location')
    .eq('trip_id', tripId)
    .order('day_number')

  return { photos: photos || [], days: days || [] }
}

export default async function PhotosPage({ params }: Props) {
  const trip = await getTripBySlug(params.slug)
  const { photos, days } = await getAlbum(trip.id)

  const dayMap = Object.fromEntries(days.map(d => [d.id, d]))

  // Group by day, curated first within each group
  const byDay: Record<string, any[]> = {}
  for (const photo of photos) {
    const key = photo.day_id || '__untagged'
    if (!byDay[key]) byDay[key] = []
    byDay[key].push(photo)
  }
  // Sort within each day: curator_selected first
  for (const key of Object.keys(byDay)) {
    byDay[key].sort((a, b) => (b.curator_selected ? 1 : 0) - (a.curator_selected ? 1 : 0))
  }

  const orderedKeys = days.map(d => d.id).filter(id => byDay[id])
  if (byDay['__untagged']) orderedKeys.push('__untagged')

  const totalPhotos = photos.length
  const curatorPicks = photos.filter(p => p.curator_selected).length

  return (
    <div className="min-h-screen" style={{ background: '#f5f2ed' }}>
      {/* Header */}
      <div
        className="relative"
        style={{ background: 'linear-gradient(135deg, #1B2B4B 0%, #243660 100%)', paddingTop: '80px' }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16">
          <Link
            href={`/trip/${params.slug}`}
            className="inline-flex items-center gap-2 text-white opacity-50 hover:opacity-80 transition-opacity text-xs uppercase tracking-widest mb-8"
            style={{ letterSpacing: '0.16em' }}
          >
            ← {trip.title}
          </Link>
          <p className="text-gold text-xs tracking-widest uppercase mb-3" style={{ letterSpacing: '0.2em' }}>
            {trip.title}
          </p>
          <h1 className="font-serif font-bold text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: '1.05' }}>
            Our Album
          </h1>
          <div className="flex gap-6 mt-4">
            <p className="text-white opacity-50 text-sm">{totalPhotos} photos</p>
            {curatorPicks > 0 && (
              <p className="text-gold opacity-80 text-sm">★ {curatorPicks} curator picks</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-14">
        {totalPhotos === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-6">📸</p>
            <h2 className="font-serif text-2xl font-bold text-navy mb-3">No photos yet</h2>
            <p className="text-ink-muted max-w-sm mx-auto leading-relaxed">
              Photos taken during the trip will appear here. Upload via the Joie app during your journey.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {orderedKeys.map(dayId => {
              const dayPhotos = byDay[dayId]
              const day = dayId !== '__untagged' ? dayMap[dayId] : null

              return (
                <div key={dayId}>
                  {/* Day header */}
                  <div className="flex items-center gap-4 mb-6">
                    {day ? (
                      <>
                        <span className="text-xs font-semibold text-gold uppercase tracking-widest" style={{ letterSpacing: '0.16em' }}>
                          Day {day.day_number}
                        </span>
                        <span className="font-serif font-bold text-navy">{day.title}</span>
                        {day.location && <span className="text-xs text-ink-muted">{day.location}</span>}
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-ink-muted uppercase tracking-widest">Untagged</span>
                    )}
                    <div className="flex-1 border-t border-gray-200" />
                    <span className="text-xs text-ink-muted">{dayPhotos.length} photo{dayPhotos.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Photo grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {dayPhotos.map((photo: any) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square overflow-hidden rounded-sm group"
                        style={{ background: '#e8e4dc' }}
                      >
                        <Image
                          src={photo.storage_url}
                          alt={photo.caption || photo.editorial_caption || 'Trip photo'}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        {/* Curator pick badge */}
                        {photo.curator_selected && (
                          <div
                            className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-sm"
                            style={{ background: '#C9A84C', color: 'white', letterSpacing: '0.08em' }}
                          >
                            ★
                          </div>
                        )}
                        {/* Caption on hover */}
                        {(photo.editorial_caption || photo.caption) && (
                          <div
                            className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
                          >
                            <p className="text-white text-xs p-3 leading-relaxed">
                              {photo.editorial_caption || photo.caption}
                            </p>
                          </div>
                        )}
                        {/* Challenge badge */}
                        {photo.is_challenge && (
                          <div
                            className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-sm"
                            style={{ background: '#1B2B4B', color: 'white', letterSpacing: '0.08em' }}
                          >
                            🏆 {photo.challenge_label || 'Hunt'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
