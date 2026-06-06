'use client'

import { useState } from 'react'
import FollowerRegistrationForm from './FollowerRegistrationForm'
import FollowerLiveFeed from './FollowerLiveFeed'

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
  tripSlug: string
  tripTitle: string
  mode: 'register' | 'feed'  // register = new visitor, feed = returning follower
  prefillName?: string
  refCode?: string
  initialFollowerId?: string
  initialEvents: ShareEvent[]
  publishedDays: TripDay[]
  totalDays: number
}

export default function FollowerPage({
  tripId,
  tripSlug,
  tripTitle,
  mode: initialMode,
  prefillName,
  refCode,
  initialFollowerId,
  initialEvents,
  publishedDays,
  totalDays,
}: Props) {
  const [mode, setMode] = useState<'register' | 'feed'>(initialMode)

  function handleRegistered(_followerId: string) {
    setMode('feed')
  }

  if (mode === 'register') {
    return (
      <>
        {/* Minimal follower header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <p className="font-serif text-base font-bold text-navy">Oukala Journeys</p>
          <p className="text-xs text-ink-muted opacity-50 tracking-widest uppercase" style={{ letterSpacing: '0.12em' }}>
            Private Travel
          </p>
        </div>
        <FollowerRegistrationForm
          tripId={tripId}
          tripSlug={tripSlug}
          tripTitle={tripTitle}
          prefillName={prefillName}
          refCode={refCode}
          onRegistered={handleRegistered}
        />
      </>
    )
  }

  return (
    <>
      {/* Minimal follower header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
        <p className="font-serif text-base font-bold text-navy">Oukala Journeys</p>
        <p className="text-xs text-ink-muted opacity-40 tracking-widest uppercase" style={{ letterSpacing: '0.12em' }}>
          {tripTitle}
        </p>
      </div>
      <FollowerLiveFeed
        tripId={tripId}
        initialEvents={initialEvents}
        publishedDays={publishedDays}
        totalDays={totalDays}
      />
    </>
  )
}
