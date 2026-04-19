'use client'

import { useState } from 'react'
import { usePersona, TRAVELERS } from '@/components/PersonaProvider'

interface Challenge {
  id: string
  title: string
  description: string
  points: number
  category?: string
  location_hint?: string
  requires_photo?: boolean
  is_grand_finale?: boolean
}

interface HuntClientProps {
  tripSlug: string
  challenges: Challenge[]
}

// Local submissions store (in-memory for this session — future: write to Supabase hunt_submissions)
type Submissions = Record<string, string[]> // challengeId → travelerKeys who completed it

const TIEBREAKER_RULE = 'Whoever spots the first stork in Morocco wins the tiebreaker.'

function getPointsColor(pts: number): string {
  if (pts >= 10) return '#f97316'   // orange — grand finale
  if (pts >= 5)  return '#a78bfa'   // purple — challenge
  return '#C9A84C'                  // gold — discovery
}

function getPointsLabel(pts: number): string {
  if (pts >= 10) return 'Grand Finale'
  if (pts >= 5)  return 'Challenge'
  return 'Discovery'
}

export default function HuntClient({ tripSlug, challenges }: HuntClientProps) {
  const { traveler } = usePersona()
  const [submissions, setSubmissions] = useState<Submissions>({})
  const [finaleVerse, setFinaleVerse] = useState('')
  const [finaleSubmitted, setFinaleSubmitted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'open'>('all')

  // Compute scores
  const scores: Record<string, number> = {}
  for (const t of TRAVELERS) {
    scores[t.key] = 0
  }
  for (const [challengeId, completedBy] of Object.entries(submissions)) {
    const challenge = challenges.find((c) => c.id === challengeId)
    if (!challenge) continue
    for (const tk of completedBy) {
      scores[tk] = (scores[tk] || 0) + challenge.points
    }
  }

  const sorted = TRAVELERS.slice().sort((a, b) => (scores[b.key] || 0) - (scores[a.key] || 0))
  const totalPossible = challenges.reduce((sum, c) => sum + c.points, 0)

  function toggleCompletion(challengeId: string, travelerKey: string) {
    setSubmissions((prev) => {
      const current = prev[challengeId] || []
      const next = current.includes(travelerKey)
        ? current.filter((k) => k !== travelerKey)
        : [...current, travelerKey]
      return { ...prev, [challengeId]: next }
    })
  }

  const iCompletedCount = traveler
    ? challenges.filter((c) => (submissions[c.id] || []).includes(traveler.key)).length
    : 0

  const filteredChallenges = challenges.filter((c) => {
    if (activeFilter === 'mine' && traveler) {
      return (submissions[c.id] || []).includes(traveler.key)
    }
    if (activeFilter === 'open' && traveler) {
      return !(submissions[c.id] || []).includes(traveler.key)
    }
    return true
  })

  const grandFinale = challenges.find((c) => c.is_grand_finale)
  const regularChallenges = filteredChallenges.filter((c) => !c.is_grand_finale)

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14 py-12">

      {/* Leaderboard */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <p className="label shrink-0">Leaderboard</p>
          <div className="flex-1 border-t border-gray-100" />
          <span className="text-xs text-ink-muted">{totalPossible} pts total</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sorted.map((t, rank) => {
            const pts = scores[t.key] || 0
            const pct = totalPossible > 0 ? (pts / totalPossible) * 100 : 0
            const isMe = traveler?.key === t.key
            return (
              <div
                key={t.key}
                className="relative p-4 rounded-sm text-center"
                style={{
                  background: isMe ? 'rgba(27,43,75,0.06)' : 'rgba(27,43,75,0.02)',
                  border: isMe ? `2px solid ${t.color}` : '1px solid rgba(27,43,75,0.07)',
                }}
              >
                {rank === 0 && pts > 0 && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-sm">🏆</div>
                )}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-2"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <p className="text-navy font-medium text-sm">{t.name}</p>
                <p className="font-serif font-bold text-navy text-2xl mt-1">{pts}</p>
                <p className="text-xs text-ink-muted">pts</p>
                {/* Mini progress bar */}
                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: t.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <p
          className="mt-3 text-center text-xs text-ink-muted"
          style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}
        >
          Tiebreaker: {TIEBREAKER_RULE}
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 mb-8">
        {([
          { id: 'all', label: 'All Challenges' },
          { id: 'open', label: 'Still Open' },
          { id: 'mine', label: 'My Completions' },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest rounded-sm transition-all duration-200 ${
              activeFilter === id
                ? 'bg-navy text-white'
                : 'bg-gray-50 text-ink-muted hover:bg-gray-100'
            }`}
            style={{ letterSpacing: '0.12em' }}
          >
            {label}
          </button>
        ))}
        {traveler && (
          <span className="ml-auto text-xs text-ink-muted self-center">
            {iCompletedCount}/{challenges.filter(c => !c.is_grand_finale).length} done
          </span>
        )}
      </div>

      {/* Challenge cards */}
      <div className="space-y-4 mb-12">
        {regularChallenges.map((challenge) => {
          const completedBy = submissions[challenge.id] || []
          const iCompleted = traveler ? completedBy.includes(traveler.key) : false
          const ptColor = getPointsColor(challenge.points)
          const ptLabel = getPointsLabel(challenge.points)

          return (
            <div
              key={challenge.id}
              className="rounded-sm overflow-hidden"
              style={{
                border: `1px solid ${iCompleted ? ptColor + '40' : 'rgba(27,43,75,0.08)'}`,
                background: iCompleted ? `${ptColor}08` : 'white',
              }}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Points badge */}
                  <div
                    className="shrink-0 flex flex-col items-center justify-center rounded-sm px-3 py-2"
                    style={{ background: ptColor + '15', minWidth: '52px' }}
                  >
                    <span className="font-serif font-bold text-lg" style={{ color: ptColor, lineHeight: '1' }}>
                      {challenge.points}
                    </span>
                    <span className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: ptColor, fontSize: '0.58rem', letterSpacing: '0.1em' }}>
                      {ptLabel}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-navy text-base leading-snug">
                      {challenge.title}
                    </h3>
                    {challenge.category && (
                      <p className="text-xs text-ink-muted uppercase tracking-widest mt-0.5" style={{ letterSpacing: '0.1em' }}>
                        {challenge.category}
                      </p>
                    )}
                    <p className="text-sm text-ink mt-2 leading-relaxed" style={{ color: '#555' }}>
                      {challenge.description}
                    </p>
                    {challenge.location_hint && (
                      <p className="text-xs text-ink-muted mt-2 italic">
                        📍 {challenge.location_hint}
                      </p>
                    )}
                    {challenge.requires_photo && (
                      <p className="text-xs mt-2" style={{ color: ptColor }}>
                        📸 Photo proof required
                      </p>
                    )}
                  </div>
                </div>

                {/* Completion toggles */}
                <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-ink-muted uppercase tracking-widest mr-1" style={{ letterSpacing: '0.1em' }}>
                    Mark complete:
                  </span>
                  {TRAVELERS.map((t) => {
                    const done = completedBy.includes(t.key)
                    return (
                      <button
                        key={t.key}
                        onClick={() => toggleCompletion(challenge.id, t.key)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                        style={{
                          background: done ? t.color : 'rgba(27,43,75,0.05)',
                          color: done ? 'white' : '#9ca3af',
                          border: `1px solid ${done ? t.color : 'transparent'}`,
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                          style={{ background: t.color, fontSize: '0.6rem' }}
                        >
                          {t.initials}
                        </span>
                        {t.name}
                        {done && ' ✓'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Grand Finale */}
      {grandFinale && (
        <div
          className="rounded-sm overflow-hidden"
          style={{ border: '2px solid #f97316', background: 'rgba(249,115,22,0.04)' }}
        >
          <div className="px-6 py-4" style={{ background: '#f97316' }}>
            <div className="flex items-center gap-3">
              <span className="text-white text-2xl">🏁</span>
              <div>
                <p className="text-white text-xs uppercase tracking-widest opacity-70" style={{ letterSpacing: '0.2em' }}>
                  Grand Finale · 10 Points
                </p>
                <h3 className="font-serif font-bold text-white text-xl">{grandFinale.title}</h3>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-ink leading-relaxed mb-5" style={{ color: '#555' }}>
              {grandFinale.description}
            </p>

            {!finaleSubmitted ? (
              <div>
                <label className="label mb-2 block">Enter your verse:</label>
                <textarea
                  value={finaleVerse}
                  onChange={(e) => setFinaleVerse(e.target.value)}
                  rows={5}
                  placeholder="Write your verse here — 4–8 lines, in any form. It should describe a moment from the journey."
                  className="w-full border border-gray-200 rounded-sm p-4 text-sm text-navy font-serif leading-relaxed focus:outline-none focus:border-gold resize-none"
                  style={{ fontStyle: 'italic' }}
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-ink-muted">
                    {traveler ? `Submitting as ${traveler.name}` : 'Select a traveler in the nav first'}
                  </p>
                  <button
                    onClick={() => { if (finaleVerse.trim() && traveler) setFinaleSubmitted(true) }}
                    disabled={!finaleVerse.trim() || !traveler}
                    className="px-6 py-2 text-xs uppercase tracking-widest transition-all duration-200 disabled:opacity-40"
                    style={{
                      background: '#f97316',
                      color: 'white',
                      letterSpacing: '0.14em',
                    }}
                  >
                    Submit Verse
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-4">✨</p>
                <p className="font-serif text-navy font-bold text-lg mb-2">Verse received.</p>
                <p className="text-sm text-ink-muted mb-6">
                  {traveler?.name}&apos;s grand finale is logged. The judges will deliberate.
                </p>
                <blockquote
                  className="font-serif italic text-navy text-sm leading-relaxed border-l-2 border-gold pl-4 text-left max-w-md mx-auto"
                  style={{ lineHeight: '1.8' }}
                >
                  {finaleVerse}
                </blockquote>
                <button
                  onClick={() => setFinaleSubmitted(false)}
                  className="mt-6 text-xs text-ink-muted underline hover:text-navy"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rules callout */}
      <div
        className="mt-10 p-6 rounded-sm"
        style={{ background: 'rgba(27,43,75,0.04)', borderLeft: '3px solid #1B2B4B' }}
      >
        <p className="label mb-3">Rules</p>
        <ul className="space-y-2">
          {[
            'Challenges must be completed during the trip window (June 9–24, 2026).',
            'Photo challenges require evidence — the honor system applies to all others.',
            'Challenges can be completed by multiple travelers; points go to each finisher.',
            'The Grand Finale verse is evaluated on originality, imagery, and journey resonance.',
            'Tiebreaker: first stork spotted in Morocco. No ties allowed.',
          ].map((rule) => (
            <li key={rule} className="flex gap-3 text-sm text-ink" style={{ color: '#555', lineHeight: '1.6' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-navy mt-2 shrink-0 opacity-40" />
              {rule}
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
