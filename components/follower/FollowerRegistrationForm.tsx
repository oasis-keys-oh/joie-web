'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Props {
  tripId: string
  tripSlug: string
  tripTitle: string
  prefillName?: string
  refCode?: string
  onRegistered: (followerId: string) => void
}

export default function FollowerRegistrationForm({ tripId, tripSlug, tripTitle, prefillName, refCode, onRegistered }: Props) {
  const [firstName, setFirstName] = useState(prefillName || '')
  const [email, setEmail] = useState('')
  const [pushOptIn, setPushOptIn] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // INSERT follower row
        const { data: follower, error: insertErr } = await supabase
          .from('trip_followers')
          .insert({
            trip_id: tripId,
            first_name: firstName || null,
            email: email || null,
            status: 'active',
            ref_code: refCode || null,
            notify_memories: true,
            notify_arrivals: true,
            notify_challenges: false,
          })
          .select('id, unsubscribe_token')
          .single()

        if (insertErr) throw new Error(insertErr.message)

        // Request push subscription if opted in and browser supports it
        if (pushOptIn && 'serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (vapidPublicKey && registration.pushManager) {
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
              })
              // Write raw PushSubscription.toJSON() directly — iOS edge function reads this format
              await supabase
                .from('trip_followers')
                .update({ push_subscription: subscription.toJSON() })
                .eq('id', follower.id)
            }
          } catch {
            // Push subscription failed — not fatal, follower row still created
          }
        }

        // Set session cookie so returning visitors skip registration
        document.cookie = `joie_follow_${tripSlug}=${follower.id}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`

        onRegistered(follower.id)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-widest uppercase text-gold mb-3" style={{ letterSpacing: '0.2em' }}>
          Follow the Journey
        </p>
        <h1 className="font-serif text-3xl font-bold text-navy mb-3" style={{ lineHeight: '1.15' }}>
          {tripTitle}
        </h1>
        <p className="text-ink-muted text-sm leading-relaxed">
          Get live updates as the journey unfolds — arrivals, moments, and dispatches from the road.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs tracking-widest uppercase text-ink-muted mb-1.5" style={{ letterSpacing: '0.14em' }}>
            Your name <span className="opacity-50">(optional)</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First name"
            className="w-full border border-gray-200 px-4 py-3 text-sm text-ink bg-white focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs tracking-widest uppercase text-ink-muted mb-1.5" style={{ letterSpacing: '0.14em' }}>
            Email <span className="opacity-50">(optional — for story updates)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-gray-200 px-4 py-3 text-sm text-ink bg-white focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {'PushManager' in window && (
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={pushOptIn}
                onChange={e => setPushOptIn(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border transition-colors ${pushOptIn ? 'bg-navy border-navy' : 'bg-white border-gray-300'} flex items-center justify-center`}>
                {pushOptIn && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </div>
            <span className="text-sm text-ink-muted leading-relaxed">
              Notify me when something happens — a new arrival, a memory from the road.
            </span>
          </label>
        )}

        {error && (
          <p className="text-sm text-red-600 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-navy text-white py-3.5 text-xs tracking-widest uppercase hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
          style={{ letterSpacing: '0.18em' }}
        >
          {isPending ? 'Following…' : 'Follow This Journey'}
        </button>
      </form>

      <p className="text-center text-xs text-ink-muted opacity-50 mt-6 leading-relaxed">
        No account needed. You can unsubscribe at any time.
      </p>
    </div>
  )
}

// Converts a base64-encoded VAPID public key to Uint8Array for PushManager.subscribe
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
