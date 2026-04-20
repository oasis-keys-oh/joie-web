'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
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
  tripId: string
  tripSlug: string   // kept for UI breadcrumb links only
  challenges: Challenge[]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Submissions: challengeId → travelerKeys who completed it
type Submissions = Record<string, string[]>

const TIEBREAKER_RULE = 'Whoever spots the first stork in Morocco wins the tiebreaker.'

function getPointsColor(pts: number): string {
  if (pts >= 10) return '#f97316'
  if (pts >= 5)  return '#a78bfa'
  return '#C9A84C'
}

/**
 * Detect and visually highlight transliteration patterns in challenge descriptions.
 * Pattern: "SomePhrase (transliteration — meaning)" or Arabic/RTL text surrounded by parens.
 * Renders: description text + styled pronunciation pill if pattern found.
 */
function ChallengeDescription({ text }: { text: string }) {
  // Match pattern: "word" (romanization — pronounced: X, meaning "Y")
  // We look for text in quotes or the pattern: phrase (pronunciation — meaning)
  const transMatch = text.match(/[""]([^""]+)[""]\s*\(([^)]+)\)/)
  const parenMatch = !transMatch ? text.match(/\(([^)]*(?:pronounced|meaning|—)[^)]*)\)/i) : null

  if (transMatch || parenMatch) {
    const pill: string = transMatch ? (transMatch[2] ?? '') : (parenMatch ? (parenMatch[1] ?? '') : '')
    const parts: string[] = pill.split(/—|,/)
    return (
      <div>
        <p className="text-sm text-ink mt-2 leading-relaxed" style={{ color: '#555' }}>
          {text}
        </p>
        <div
          className="mt-2 px-3 py-2 rounded-sm inline-block"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)' }}
        >
          {parts.map((part: string, i: number) => (
            <span
              key={i}
              className="text-xs"
              style={{
                display: 'inline',
                color: i === 0 ? '#1B2B4B' : '#6b5a2e',
                fontStyle: i > 0 ? 'italic' : 'normal',
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {i > 0 && ' — '}
              {part.trim()}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <p className="text-sm text-ink mt-2 leading-relaxed" style={{ color: '#555' }}>
      {text}
    </p>
  )
}

function getPointsLabel(pts: number): string {
  if (pts >= 10) return 'Grand Finale'
  if (pts >= 5)  return 'Challenge'
  return 'Discovery'
}

export default function HuntClient({ tripId, tripSlug, challenges }: HuntClientProps) {
  const { traveler } = usePersona()
  const [submissions, setSubmissions] = useState<Submissions>({})
  const [finaleVerse, setFinaleVerse] = useState('')
  const [finaleSubmitted, setFinaleSubmitted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'open'>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load all existing submissions from Supabase on mount
  const loadSubmissions = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('hunt_submissions')
        .select('challenge_id, traveler_key')
        .eq('trip_id', tripId)

      if (error) {
        console.error('Failed to load hunt submissions:', error.message)
      } else if (data) {
        const built: Submissions = {}
        for (const row of data) {
          if (!built[row.challenge_id]) built[row.challenge_id] = []
          if (!built[row.challenge_id].includes(row.traveler_key)) {
            built[row.challenge_id].push(row.traveler_key)
          }
        }
        setSubmissions(built)
      }
    } finally {
      setLoading(false)
    }
  }, [tripSlug])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  // Also load any saved grand finale verse for current traveler
  useEffect(() => {
    if (!traveler) return
    const grandFinale = challenges.find((c) => c.is_grand_finale)
    if (!grandFinale) return

    async function loadVerse() {
      const { data } = await supabase
        .from('hunt_submissions')
        .select('verse_text, completed_at')
        .eq('trip_id', tripId)
        .eq('challenge_id', grandFinale!.id)
        .eq('traveler_key', traveler!.key)
        .maybeSingle()

      if (data?.verse_text) {
        setFinaleVerse(data.verse_text)
        setFinaleSubmitted(true)
      }
    }
    loadVerse()
  }, [traveler, challenges, tripSlug])

  // Compute scores
  const scores: Record<string, number> = {}
  for (const t of TRAVELERS) scores[t.key] = 0
  for (const [challengeId, completedBy] of Object.entries(submissions)) {
    const challenge = challenges.find((c) => c.id === challengeId)
    if (!challenge) continue
    for (const tk of completedBy) {
      scores[tk] = (scores[tk] || 0) + challenge.points
    }
  }

  const sorted = TRAVELERS.slice().sort((a, b) => (scores[b.key] || 0) - (scores[a.key] || 0))
  const totalPossible = challenges.reduce((sum, c) => sum + c.points, 0)

  async function toggleCompletion(challengeId: string, travelerKey: string) {
    const current = submissions[challengeId] || []
    const isDone = current.includes(travelerKey)

    // Optimistic UI update
    setSubmissions((prev) => {
      const next = isDone
        ? current.filter((k) => k !== travelerKey)
        : [...current, travelerKey]
      return { ...prev, [challengeId]: next }
    })

    setSaving(true)
    try {
      if (isDone) {
        // Remove
        await supabase
          .from('hunt_submissions')
          .delete()
          .eq('trip_id', tripId)
          .eq('challenge_id', challengeId)
          .eq('traveler_key', travelerKey)
      } else {
        // Insert
        await supabase
          .from('hunt_submissions')
          .upsert({
            trip_id: tripId,
            challenge_id: challengeId,
            traveler_key: travelerKey,
            completed_at: new Date().toISOString(),
          }, { onConflict: 'trip_id,challenge_id,traveler_key' })
      }
    } catch (err) {
      console.error('Failed to save submission:', err)
      // Revert optimistic update on error
      await loadSubmissions()
    } finally {
      setSaving(false)
    }
  }

  async function submitFinaleVerse() {
    if (!finaleVerse.trim() || !traveler) return
    const grandFinale = challenges.find((c) => c.is_grand_finale)
    if (!grandFinale) return

    setSaving(true)
    try {
      await supabase
        .from('hunt_submissions')
        .upsert({
          trip_id: tripId,
          challenge_id: grandFinale.id,
          traveler_key: traveler.key,
          verse_text: finaleVerse.trim(),
          completed_at: new Date().toISOString(),
        }, { onConflict: 'trip_id,challenge_id,traveler_key' })

      setFinaleSubmitted(true)
      // Also mark grand finale as completed in scores
      setSubmissions((prev) => {
        const current = prev[grandFinale.id] || []
        if (current.includes(traveler.key)) return prev
        return { ...prev, [grandFinale.id]: [...current, traveler.key] }
      })
    } catch (err) {
      console.error('Failed to submit verse:', err)
    } finally {
      setSaving(false)
    }
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

  // Split regular challenges into tiers for clearer visual grouping
  const discoveryChallenges = regularChallenges.filter((c) => c.points < 5)
  const mainChallenges      = regularChallenges.filter((c) => c.points >= 5)

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14 py-12">

      {/* Saving indicator */}
      {saving && (
        <div
          className="fixed top-20 right-6 z-50 px-4 py-2 rounded-sm text-xs text-white uppercase tracking-widest"
          style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
        >
          Saving…
        </div>
      )}

      {/* Leaderboard */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <p className="label shrink-0">Leaderboard</p>
          <div className="flex-1 border-t border-gray-100" />
          <span className="text-xs text-ink-muted">{totalPossible} pts total</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TRAVELERS.map((t) => (
              <div
                key={t.key}
                className="p-4 rounded-sm text-center animate-pulse"
                style={{ background: 'rgba(27,43,75,0.03)', border: '1px solid rgba(27,43,75,0.07)' }}
              >
                <div className="w-10 h-10 rounded-full mx-auto mb-2" style={{ background: t.color + '40' }} />
                <div className="h-3 bg-gray-100 rounded mx-auto w-12 mb-2" />
                <div className="h-6 bg-gray-100 rounded mx-auto w-8" />
              </div>
            ))}
          </div>
        ) : (
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
        )}

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

      {/* ── The Challenges (5pt) ── */}
      {mainChallenges.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-4 mb-4">
            <p className="label shrink-0" style={{ color: '#a78bfa' }}>The Challenge</p>
            <div className="flex-1 border-t" style={{ borderColor: '#a78bfa30' }} />
            <span className="text-xs shrink-0" style={{ color: '#a78bfa', letterSpacing: '0.1em' }}>5 pts each</span>
          </div>
        </div>
      )}

      {/* Challenge cards — Challenges (5pt) first, then Discoveries (3pt) */}
      <div className="space-y-4 mb-6">
        {mainChallenges.map((challenge) => {
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
                    <ChallengeDescription text={challenge.description} />
                    {challenge.location_hint && (
                      <p className="text-xs text-ink-muted mt-2 italic">📍 {challenge.location_hint}</p>
                    )}
                    {challenge.requires_photo && (
                      <p className="text-xs mt-2" style={{ color: ptColor }}>📸 Photo proof required</p>
                    )}
                  </div>
                </div>
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
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ background: t.color, fontSize: '0.6rem' }}>
                          {t.initials}
                        </span>
                        {t.name}{done && ' ✓'}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Discoveries (3pt) ── */}
      {discoveryChallenges.length > 0 && (
        <div className="mb-2 mt-10">
          <div className="flex items-center gap-4 mb-4">
            <p className="label shrink-0" style={{ color: '#C9A84C' }}>Discoveries</p>
            <div className="flex-1 border-t" style={{ borderColor: '#C9A84C30' }} />
            <span className="text-xs shrink-0" style={{ color: '#C9A84C', letterSpacing: '0.1em' }}>3 pts each</span>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-12">
        {discoveryChallenges.map((challenge) => {
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
                    <ChallengeDescription text={challenge.description} />
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
                    onClick={submitFinaleVerse}
                    disabled={!finaleVerse.trim() || !traveler || saving}
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
