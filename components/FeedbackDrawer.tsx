'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { usePersona } from '@/components/PersonaProvider'

interface FeedbackEntry {
  id: string
  traveler_key: string
  comment: string
  created_at: string
}

interface Props {
  tripId: string
  dayId: string
  dayTitle: string
  dayNumber: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Curators who can see all feedback threads
const CURATORS = ['omar', 'kristi']

const TRAVELER_COLOR: Record<string, string> = {
  omar:   '#1B2B4B',
  kristi: '#C9A84C',
  todd:   '#7c3aed',
  erica:  '#0d9488',
}

const TRAVELER_INITIALS: Record<string, string> = {
  omar: 'O', kristi: 'K', todd: 'T', erica: 'E',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default function FeedbackDrawer({ tripId, dayId, dayTitle, dayNumber }: Props) {
  const { traveler } = usePersona()
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const isCurator = traveler ? CURATORS.includes(traveler.key) : false

  const loadFeedback = useCallback(async () => {
    if (!isCurator) return  // regular travelers only see their own (hidden from others)
    const { data } = await supabase
      .from('feedback')
      .select('id, traveler_key, comment, created_at')
      .eq('day_id', dayId)
      .order('created_at', { ascending: true })
    setEntries(data || [])
  }, [dayId, isCurator])

  useEffect(() => {
    if (open) loadFeedback()
  }, [open, loadFeedback])

  async function handleSubmit() {
    if (!comment.trim() || !traveler) return
    setSubmitting(true)
    try {
      await supabase.from('feedback').insert({
        trip_id: tripId,
        day_id: dayId,
        traveler_key: traveler.key,
        comment: comment.trim(),
        status: 'new',
      })
      setComment('')
      setSubmitted(true)
      if (isCurator) await loadFeedback()
      setTimeout(() => setSubmitted(false), 3500)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Trigger button — subtle, floats bottom-right of the day content */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-sm text-xs uppercase tracking-widest transition-all duration-200 hover:opacity-80"
        style={{
          background: 'rgba(27,43,75,0.05)',
          border: '1px solid rgba(27,43,75,0.1)',
          color: '#9ca3af',
          letterSpacing: '0.14em',
        }}
      >
        <span style={{ fontSize: '0.75rem' }}>✉</span>
        Leave a Note
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[80]"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-[90] flex flex-col"
        style={{
          width: 'min(440px, 100vw)',
          background: 'white',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-7 py-6 border-b border-gray-100"
          style={{ flexShrink: 0 }}
        >
          <div>
            <p className="label mb-1">Day {dayNumber} Note</p>
            <h2 className="font-serif font-bold text-navy text-lg leading-snug" style={{ maxWidth: '280px' }}>
              {dayTitle}
            </h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-ink-muted hover:text-navy transition-colors mt-1"
            style={{ fontSize: '1.2rem', lineHeight: '1' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6">

          {/* Curator thread — only Omar & Kristi see this */}
          {isCurator && entries.length > 0 && (
            <div className="mb-8">
              <p className="label mb-4">All Notes</p>
              <div className="space-y-4">
                {entries.map((entry) => {
                  const color = TRAVELER_COLOR[entry.traveler_key] || '#1B2B4B'
                  const initials = TRAVELER_INITIALS[entry.traveler_key] || '?'
                  return (
                    <div key={entry.id} className="flex gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                        style={{ background: color }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-navy leading-relaxed"
                          style={{ fontSize: '0.875rem', lineHeight: '1.65' }}
                        >
                          {entry.comment}
                        </p>
                        <p className="text-ink-muted mt-1" style={{ fontSize: '0.67rem' }}>
                          {entry.traveler_key} · {formatTime(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <p className="label mb-3">Add a Curator Note</p>
              </div>
            </div>
          )}

          {/* Intro for non-curators */}
          {!isCurator && (
            <div className="mb-6">
              <p className="text-ink leading-relaxed" style={{ fontSize: '0.875rem', color: '#555', lineHeight: '1.7' }}>
                Leave a note for your guides — a thought about the day, something unexpected, a request, or anything you want them to know.
              </p>
            </div>
          )}

          {/* Compose */}
          {traveler ? (
            <div>
              {!submitted ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: TRAVELER_COLOR[traveler.key] || '#1B2B4B' }}
                    >
                      {traveler.initials}
                    </div>
                    <span className="text-xs text-ink-muted">{traveler.name}</span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="What's on your mind about this day?"
                    className="w-full border border-gray-200 rounded-sm p-4 text-sm text-navy leading-relaxed focus:outline-none focus:border-navy resize-none"
                    style={{ lineHeight: '1.65' }}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!comment.trim() || submitting}
                    className="mt-3 w-full py-3 text-xs uppercase tracking-widest text-white transition-all duration-200 disabled:opacity-40"
                    style={{
                      background: '#1B2B4B',
                      letterSpacing: '0.16em',
                    }}
                  >
                    {submitting ? 'Sending…' : 'Send Note'}
                  </button>
                </>
              ) : (
                <div className="text-center py-10">
                  <p className="text-3xl mb-3">✉️</p>
                  <p className="font-serif text-navy font-bold text-base mb-1">Note sent.</p>
                  <p className="text-sm text-ink-muted">Omar and Kristi will see it.</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="p-5 rounded-sm text-center"
              style={{ background: 'rgba(27,43,75,0.04)' }}
            >
              <p className="text-sm text-ink-muted">
                Select who you are from the nav to leave a note.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
