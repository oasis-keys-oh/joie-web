'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface ShareEvent {
  id: string
  trip_id: string
  event_type: 'memory' | 'arrival' | 'challenge' | 'manual'
  location_name?: string
  place_category?: string
  challenge_title?: string
  memory_caption?: string
  media_url?: string
  created_at: string
}

interface TripDay {
  id: string
  day_number: number
  title: string
  location?: string
  region?: string
  wow_moment?: string
  thread_content?: any
  local_insider_tip?: string
  follower_published: boolean
  follower_published_at?: string
}

interface Props {
  tripId: string
  initialEvents: ShareEvent[]
  publishedDays: TripDay[]
  totalDays: number
}

const EVENT_ICONS: Record<string, string> = {
  memory: '📸',
  arrival: '✈️',
  challenge: '🏆',
  manual: '📍',
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 2) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function EventCard({ event }: { event: ShareEvent }) {
  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      <div className="shrink-0 w-10 h-10 bg-sand rounded-full flex items-center justify-center text-lg">
        {EVENT_ICONS[event.event_type] || '📍'}
      </div>
      <div className="flex-1 min-w-0">
        {event.event_type === 'memory' && (
          <>
            {event.media_url && (
              <div className="mb-3 overflow-hidden rounded-sm" style={{ maxHeight: 280 }}>
                <img src={event.media_url} alt="Memory" className="w-full object-cover" />
              </div>
            )}
            {event.memory_caption && (
              <p className="text-sm text-ink leading-relaxed italic">&ldquo;{event.memory_caption}&rdquo;</p>
            )}
            {!event.memory_caption && !event.media_url && (
              <p className="text-sm text-ink">A memory was shared from the road.</p>
            )}
          </>
        )}
        {event.event_type === 'arrival' && (
          <div>
            <p className="text-sm font-medium text-navy">
              Arrived in {event.location_name || 'a new destination'}
            </p>
            {event.place_category && (
              <p className="text-xs text-ink-muted mt-0.5 capitalize">{event.place_category.replace(/_/g, ' ')}</p>
            )}
          </div>
        )}
        {event.event_type === 'challenge' && (
          <div>
            <p className="text-sm font-medium text-navy">
              Challenge completed: {event.challenge_title || 'A scavenger hunt challenge'}
            </p>
            <p className="text-xs text-gold mt-0.5">+Points earned</p>
          </div>
        )}
        {event.event_type === 'manual' && (
          <p className="text-sm text-ink">
            {event.location_name ? `Update from ${event.location_name}` : 'A moment from the journey.'}
          </p>
        )}
        <p className="text-xs text-ink-muted opacity-50 mt-2">{formatRelativeTime(event.created_at)}</p>
      </div>
    </div>
  )
}

function DayStoryCard({ day }: { day: TripDay }) {
  const thread = day.thread_content as { title?: string; content?: string } | null

  return (
    <div className="py-8 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs tracking-widest uppercase text-gold" style={{ letterSpacing: '0.18em' }}>
          Day {day.day_number}
        </span>
        <div className="flex-1 border-t border-gray-100" />
        <span className="text-xs text-ink-muted opacity-50">
          {day.location || day.region}
        </span>
      </div>

      {day.wow_moment && (
        <p className="font-serif text-lg text-navy leading-relaxed mb-4" style={{ lineHeight: '1.65' }}>
          {day.wow_moment}
        </p>
      )}

      {thread?.content && (
        <p className="text-sm text-ink leading-relaxed mb-4" style={{ lineHeight: '1.8' }}>
          {thread.content}
        </p>
      )}

      {day.local_insider_tip && (
        <div className="bg-sand bg-opacity-60 border-l-2 border-gold px-4 py-3 mt-4">
          <p className="text-xs tracking-widest uppercase text-gold mb-1" style={{ letterSpacing: '0.14em' }}>
            Local Insight
          </p>
          <p className="text-sm text-ink italic leading-relaxed">{day.local_insider_tip}</p>
        </div>
      )}
    </div>
  )
}

function InTransitCard({ dayNumber }: { dayNumber: number }) {
  return (
    <div className="py-6 border-b border-gray-100 last:border-0 flex items-center gap-4 opacity-40">
      <div className="w-8 h-8 border border-dashed border-gray-300 rounded-full flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
        </svg>
      </div>
      <div>
        <p className="text-xs tracking-widest uppercase text-ink-muted" style={{ letterSpacing: '0.14em' }}>
          In Transit — Day {dayNumber}
        </p>
        <p className="text-xs text-ink-muted opacity-60 mt-0.5">Dispatch coming soon</p>
      </div>
    </div>
  )
}

export default function FollowerLiveFeed({ tripId, initialEvents, publishedDays, totalDays }: Props) {
  const [events, setEvents] = useState<ShareEvent[]>(initialEvents)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel(`trip-share:${tripId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_share_events', filter: `trip_id=eq.${tripId}` },
        (payload) => {
          setEvents(prev => [payload.new as ShareEvent, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tripId])

  // Build the full day list: published days get story content, unpublished get placeholder
  const allDayNumbers = Array.from({ length: totalDays }, (_, i) => i + 1)
  const publishedMap = new Map(publishedDays.map(d => [d.day_number, d]))

  return (
    <div className="max-w-lg mx-auto px-6 py-10">

      {/* Live Events Feed */}
      {events.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-xs tracking-widest uppercase text-ink-muted" style={{ letterSpacing: '0.16em' }}>
              Live from the road
            </p>
            <div className="flex-1 border-t border-gray-100" />
          </div>
          <div>
            {events.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        </section>
      )}

      {events.length === 0 && publishedDays.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-sand rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✈️</span>
          </div>
          <p className="font-serif text-lg text-navy mb-2">The journey begins soon</p>
          <p className="text-sm text-ink-muted leading-relaxed">
            Updates will appear here as the trip unfolds. You&apos;ll get a notification when something happens.
          </p>
        </div>
      )}

      {/* Story Feed — published days */}
      {(publishedDays.length > 0 || totalDays > 0) && (
        <section>
          <div className="flex items-center gap-4 mb-6">
            <p className="text-xs tracking-widest uppercase text-ink-muted shrink-0" style={{ letterSpacing: '0.16em' }}>
              The Dispatches
            </p>
            <div className="flex-1 border-t border-gray-100" />
          </div>
          <div>
            {allDayNumbers.map(n => {
              const day = publishedMap.get(n)
              if (day) return <DayStoryCard key={n} day={day} />
              return <InTransitCard key={n} dayNumber={n} />
            })}
          </div>
        </section>
      )}
    </div>
  )
}
