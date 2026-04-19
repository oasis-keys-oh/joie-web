'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type TravelerKey = 'omar' | 'kristi' | 'todd' | 'erica'

export interface Traveler {
  key: TravelerKey
  name: string
  emoji: string
  initials: string
  tagline: string
  color: string
}

export const TRAVELERS: Traveler[] = [
  { key: 'omar',   name: 'Omar',   emoji: '🧭', initials: 'O', tagline: 'Architect of the journey', color: '#1B2B4B' },
  { key: 'kristi', name: 'Kristi', emoji: '✨', initials: 'K', tagline: 'The reason we arrive', color: '#C9A84C' },
  { key: 'todd',   name: 'Todd',   emoji: '🏆', initials: 'T', tagline: 'The tiebreaker. Competitor.', color: '#7c3aed' },
  { key: 'erica',  name: 'Erica',  emoji: '🌿', initials: 'E', tagline: 'The quiet one who notices everything', color: '#0d9488' },
]

interface PersonaContextValue {
  traveler: Traveler | null
  setTraveler: (t: Traveler) => void
  showPicker: boolean
  setShowPicker: (v: boolean) => void
}

const PersonaContext = createContext<PersonaContextValue>({
  traveler: null,
  setTraveler: () => {},
  showPicker: false,
  setShowPicker: () => {},
})

export function usePersona() {
  return useContext(PersonaContext)
}

const STORAGE_KEY = 'joie_traveler'

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [traveler, setTravelerState] = useState<Traveler | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const found = TRAVELERS.find((t) => t.key === stored)
      if (found) {
        setTravelerState(found)
        return
      }
    }
    // First visit — show picker after a short delay
    setTimeout(() => setShowPicker(true), 800)
  }, [])

  function setTraveler(t: Traveler) {
    setTravelerState(t)
    localStorage.setItem(STORAGE_KEY, t.key)
    setShowPicker(false)
  }

  if (!mounted) return <>{children}</>

  return (
    <PersonaContext.Provider value={{ traveler, setTraveler, showPicker, setShowPicker }}>
      {children}
      {showPicker && <PersonaPicker onSelect={setTraveler} />}
    </PersonaContext.Provider>
  )
}

function PersonaPicker({ onSelect }: { onSelect: (t: Traveler) => void }) {
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
            Welcome to The Andalusian Thread
          </h2>
          <p className="text-white opacity-55 mt-2 text-sm" style={{ lineHeight: '1.6' }}>
            Who are you joining us as?
          </p>
        </div>

        {/* Traveler options */}
        <div className="p-6 grid grid-cols-2 gap-3">
          {TRAVELERS.map((t) => (
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
              <p className="text-ink-muted text-xs leading-relaxed" style={{ fontSize: '0.7rem' }}>
                {t.tagline}
              </p>
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
