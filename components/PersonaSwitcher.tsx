'use client'

import { useState } from 'react'
import { usePersona, TRAVELERS } from '@/components/PersonaProvider'

export default function PersonaSwitcher() {
  const { traveler, setTraveler, setShowPicker } = usePersona()
  const [open, setOpen] = useState(false)

  if (!traveler) {
    return (
      <button
        onClick={() => setShowPicker(true)}
        className="text-white opacity-50 hover:opacity-90 transition-opacity text-xs uppercase tracking-widest"
        style={{ letterSpacing: '0.14em', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
      >
        Who are you? →
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 group"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{
            background: traveler.color,
            boxShadow: '0 1px 8px rgba(0,0,0,0.35)',
          }}
        >
          {traveler.initials}
        </div>
        <span
          className="text-white opacity-60 group-hover:opacity-90 transition-opacity text-xs uppercase tracking-widest hidden sm:inline"
          style={{ letterSpacing: '0.14em', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
        >
          {traveler.name}
        </span>
        <span
          className="text-white opacity-40 text-xs"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
        >
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div
            className="absolute right-0 top-10 z-50 bg-white rounded-sm overflow-hidden"
            style={{ minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-ink-muted uppercase tracking-widest" style={{ letterSpacing: '0.14em' }}>
                Switch Traveler
              </p>
            </div>
            {TRAVELERS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTraveler(t); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div className="text-left">
                  <p className="text-navy font-medium text-sm">{t.name}</p>
                  <p className="text-ink-muted" style={{ fontSize: '0.65rem' }}>{t.tagline}</p>
                </div>
                {traveler.key === t.key && (
                  <span className="ml-auto text-gold text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
