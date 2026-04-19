'use client'

import { useState } from 'react'

interface PreTripDrop {
  id: string
  date_offset_days: number  // negative = days before trip
  type: string              // 'history' | 'music' | 'phrase' | 'weather' | 'tip'
  title?: string
  content: string
  unlock_date: string       // ISO date string — computed server-side
}

interface Props {
  drops: PreTripDrop[]
  tripStartDate: string
  today: string             // ISO date string (server computed)
}

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  history: { icon: '📜', label: 'History',  color: '#6366f1' },
  music:   { icon: '🎵', label: 'Music',    color: '#ec4899' },
  phrase:  { icon: '«',  label: 'Phrase',   color: '#e11d48' },
  weather: { icon: '🌤', label: 'Weather',  color: '#0ea5e9' },
  tip:     { icon: '→',  label: 'Insider',  color: '#0d9488' },
  default: { icon: '✦',  label: 'Drop',     color: '#C9A84C' },
}

function formatUnlockDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

function daysUntil(iso: string, today: string): number {
  const t = new Date(today)
  const u = new Date(iso)
  t.setHours(0, 0, 0, 0)
  u.setHours(0, 0, 0, 0)
  return Math.ceil((u.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
}

export default function PreTripDrops({ drops, tripStartDate, today }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!drops || drops.length === 0) return null

  // Sort: most recent unlock date first (closest to today)
  const sorted = [...drops].sort((a, b) =>
    new Date(b.unlock_date).getTime() - new Date(a.unlock_date).getTime()
  )

  const unlocked = sorted.filter((d) => d.unlock_date <= today)
  const locked   = sorted.filter((d) => d.unlock_date > today)

  // Days until trip
  const daysToTrip = daysUntil(tripStartDate, today)

  return (
    <div className="mb-14">
      {/* Section header */}
      <div className="flex items-center gap-5 mb-8">
        <p className="label shrink-0">Before You Go</p>
        <div className="flex-1 border-t border-gray-100" />
        {daysToTrip > 0 && (
          <span className="text-xs text-ink-muted shrink-0">
            {daysToTrip} day{daysToTrip !== 1 ? 's' : ''} until departure
          </span>
        )}
      </div>

      {/* Countdown strip */}
      {daysToTrip > 0 && (
        <div
          className="mb-6 px-6 py-5 rounded-sm"
          style={{ background: 'rgba(27,43,75,0.03)', borderLeft: '3px solid #C9A84C' }}
        >
          <p className="font-serif text-navy font-bold text-2xl">{daysToTrip}</p>
          <p className="text-xs text-ink-muted uppercase tracking-widest mt-0.5" style={{ letterSpacing: '0.14em' }}>
            days until The Andalusian Thread begins
          </p>
        </div>
      )}

      {/* Unlocked drops */}
      {unlocked.length > 0 && (
        <div className="space-y-3 mb-6">
          {unlocked.map((drop) => {
            const meta = TYPE_META[drop.type] || TYPE_META.default
            const isExpanded = expandedId === drop.id
            return (
              <div
                key={drop.id}
                className="rounded-sm overflow-hidden cursor-pointer"
                style={{
                  border: `1px solid ${meta.color}30`,
                  background: `${meta.color}06`,
                }}
                onClick={() => setExpandedId(isExpanded ? null : drop.id)}
              >
                <div className="px-5 py-4 flex items-start gap-4">
                  <span style={{ fontSize: '0.9rem', color: meta.color, flexShrink: 0, marginTop: '2px' }}>
                    {meta.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="uppercase font-semibold tracking-widest"
                        style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span className="text-ink-muted" style={{ fontSize: '0.65rem' }}>
                        {formatUnlockDate(drop.unlock_date)}
                      </span>
                    </div>
                    {drop.title && (
                      <p className="font-serif font-bold text-navy text-sm leading-snug">
                        {drop.title}
                      </p>
                    )}
                    {isExpanded && (
                      <p
                        className="text-ink mt-2 leading-relaxed"
                        style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#444' }}
                      >
                        {drop.content}
                      </p>
                    )}
                    {!isExpanded && drop.content.length > 120 && (
                      <p className="text-ink-muted mt-1" style={{ fontSize: '0.72rem' }}>
                        Tap to read →
                      </p>
                    )}
                    {!isExpanded && drop.content.length <= 120 && (
                      <p className="text-ink mt-1" style={{ fontSize: '0.8rem', color: '#555', lineHeight: '1.6' }}>
                        {drop.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Locked drops — shown as placeholder cards */}
      {locked.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-ink-muted uppercase tracking-widest mb-3" style={{ letterSpacing: '0.14em' }}>
            Coming soon
          </p>
          {locked.slice(0, 3).map((drop) => {
            const meta = TYPE_META[drop.type] || TYPE_META.default
            const remaining = daysUntil(drop.unlock_date, today)
            return (
              <div
                key={drop.id}
                className="px-5 py-3 rounded-sm flex items-center gap-4 opacity-45"
                style={{ border: '1px dashed rgba(27,43,75,0.15)', background: 'rgba(27,43,75,0.02)' }}
              >
                <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{meta.icon}</span>
                <div className="flex-1">
                  <span
                    className="uppercase tracking-widest"
                    style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: '#9ca3af' }}
                  >
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs text-ink-muted shrink-0">
                  {remaining > 0 ? `in ${remaining}d` : formatUnlockDate(drop.unlock_date)}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>🔒</span>
              </div>
            )
          })}
          {locked.length > 3 && (
            <p className="text-xs text-ink-muted text-center pt-1">
              +{locked.length - 3} more drops unlocking before departure
            </p>
          )}
        </div>
      )}
    </div>
  )
}
