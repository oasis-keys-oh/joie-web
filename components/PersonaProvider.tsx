'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { getTripBySlug, getTripTravelers } from '@/lib/supabase'

export type TravelerKey = string

export interface Traveler {
  key: TravelerKey
  name: string
  emoji: string
  initials: string
  tagline: string
  color: string
}

// Deterministic per-traveler styling — derived from position in the trip's
// traveler list (sorted by name), not from a hardcoded per-person map.
// This is what lets any trip's roster (any number of travelers, any names)
// get a consistent, distinct look without curator setup.
const COLOR_PALETTE = ['#1B2B4B', '#C9A84C', '#7c3aed', '#0d9488', '#b45309', '#be123c', '#4338ca', '#15803d']
const EMOJI_PALETTE = ['🧭', '✨', '🏆', '🌿', '🌊', '📷', '🎒', '☀️']

function initialsFor(fullName: string | null, fallback: string): string {
  const source = (fullName || fallback || '').trim()
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function taglineFor(roleLabel: string | null, personality: string | null): string {
  if (roleLabel && roleLabel.trim()) return roleLabel.trim()
  if (personality && personality.trim()) {
    const firstSentence = personality.split('.')[0].trim()
    return firstSentence.length > 70 ? firstSentence.slice(0, 67) + '…' : firstSentence
  }
  return ''
}

// Maps a raw traveler_profiles row (from Supabase) to the shape the UI uses,
// assigning a stable color/emoji by index within the current trip's roster.
function toTraveler(row: any, index: number): Traveler {
  return {
    key: row.traveler_key || row.id,
    name: row.nickname || row.full_name || 'Traveler',
    emoji: EMOJI_PALETTE[index % EMOJI_PALETTE.length],
    initials: initialsFor(row.full_name, row.nickname || row.traveler_key),
    tagline: taglineFor(row.role_label, row.personality),
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
  }
}

interface PersonaContextValue {
  traveler: Traveler | null
  setTraveler: (t: Traveler) => void
  showPicker: boolean
  setShowPicker: (v: boolean) => void
  travelers: Traveler[]
  tripId: string | null
  tripSlug: string | null
}

const PersonaContext = createContext<PersonaContextValue>({
  traveler: null,
  setTraveler: () => {},
  showPicker: false,
  setShowPicker: () => {},
  travelers: [],
  tripId: null,
  tripSlug: null,
})

export function usePersona() {
  return useContext(PersonaContext)
}

const STORAGE_PREFIX = 'joie_traveler_'

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const tripSlug = useMemo(() => {
    const match = pathname?.match(/^\/trip\/([^/]+)/)
    return match?.[1] || null
  }, [pathname])

  const [traveler, setTravelerState] = useState<Traveler | null>(null)
  const [travelers, setTravelers] = useState<Traveler[]>([])
  const [tripId, setTripId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Whenever the trip changes (or on first load), fetch that trip's actual
  // roster and restore any previously-picked persona for THIS trip specifically.
  // Previously this component used one hardcoded roster for every trip — see
  // Products/Joie sprint brief "joie-web-hotfix-1" for the bug this replaced.
  useEffect(() => {
    if (!mounted) return

    if (!tripSlug) {
      // No specific trip in the URL (e.g. the /trip index page) — nothing to
      // scope a roster to. Keep whatever persona is already in memory (if the
      // visitor came from a trip page this session), but don't fetch or prompt.
      setTravelers([])
      setTripId(null)
      setShowPicker(false)
      return
    }

    let cancelled = false

    async function loadTripTravelers() {
      try {
        const trip = await getTripBySlug(tripSlug!)
        const rows = await getTripTravelers(trip.id)
        if (cancelled) return

        const resolved = rows.map(toTraveler)
        setTripId(trip.id)
        setTravelers(resolved)

        const storageKey = STORAGE_PREFIX + tripSlug
        const stored = localStorage.getItem(storageKey)
        const found = stored ? resolved.find((t) => t.key === stored) : undefined

        if (found) {
          setTravelerState(found)
          setShowPicker(false)
        } else if (resolved.length > 0) {
          setTravelerState(null)
          setTimeout(() => setShowPicker(true), 800)
        } else {
          // Trip exists but has no travelers linked yet — nothing to pick from.
          setTravelerState(null)
          setShowPicker(false)
        }
      } catch (err) {
        console.error('[PersonaProvider] failed to load trip travelers:', err)
        if (!cancelled) {
          setTravelers([])
          setTripId(null)
        }
      }
    }

    loadTripTravelers()
    return () => { cancelled = true }
  }, [mounted, tripSlug])

  function setTraveler(t: Traveler) {
    setTravelerState(t)
    if (tripSlug) {
      localStorage.setItem(STORAGE_PREFIX + tripSlug, t.key)
    }
    setShowPicker(false)
  }

  if (!mounted) return <>{children}</>

  return (
    <PersonaContext.Provider value={{ traveler, setTraveler, showPicker, setShowPicker, travelers, tripId, tripSlug }}>
      {children}
      {showPicker && travelers.length > 0 && <PersonaPicker travelers={travelers} onSelect={setTraveler} />}
    </PersonaContext.Provider>
  )
}

function PersonaPicker({ travelers, onSelect }: { travelers: Traveler[]; onSelect: (t: Traveler) => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="bg-white max-w-lg w-full mx-6 rounded-sm overflow-hidden"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-6" style={{ background: '#1B2B4B' }}>
          <p className="text-gold text-xs tracking-widest uppercase mb-3" style={{ letterSpacing: '0.2em' }}>
            Oukala Journeys
          </p>
          <h2 className="font-serif text-white font-bold" style={{ fontSize: '1.75rem', lineHeight: '1.1' }}>
            Welcome to your journey
          </h2>
          <p className="text-white opacity-55 mt-2 text-sm" style={{ lineHeight: '1.6' }}>
            Who are you joining us as?
          </p>
        </div>

        {/* Traveler options */}
        <div className="p-6 grid grid-cols-2 gap-3">
          {travelers.map((t) => (
            <button
              key={t.key}
              onClick={() => onSelect(t)}
              className="group text-left p-5 rounded-sm border-2 border-transparent hover:border-gold transition-all duration-200"
              style={{ background: 'rgba(27,43,75,0.04)' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <span className="font-serif font-bold text-navy text-base">{t.name}</span>
              </div>
              {t.tagline && (
                <p className="text-ink-muted text-xs leading-relaxed" style={{ fontSize: '0.7rem' }}>
                  {t.tagline}
                </p>
              )}
            </button>
          ))}
        </div>

        <p className="text-center text-ink-muted pb-6" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
          You can switch at any time from the navigation menu.
        </p>
      </div>
    </div>
  )
}
