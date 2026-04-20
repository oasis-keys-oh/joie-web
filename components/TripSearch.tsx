'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

interface SearchResult {
  id: string
  type: 'event' | 'day' | 'hotel'
  title: string
  subtitle?: string
  dayNumber?: number
  href: string
}

interface Props {
  tripSlug: string
  tripId: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TripSearch({ tripSlug, tripId }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [allItems, setAllItems] = useState<SearchResult[]>([])
  const [loaded, setLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load all searchable data once when drawer opens
  useEffect(() => {
    if (!open || loaded) return

    async function loadData() {
      // Events (restaurants, activities, hotels, flights)
      const { data: events } = await supabase
        .from('events')
        .select('id, title, type, notes, day_id')
        .eq('trip_id', tripId)

      // Days
      const { data: days } = await supabase
        .from('trip_days')
        .select('id, day_number, title, location, region')
        .eq('trip_id', tripId)
        .order('day_number')

      const dayMap: Record<string, number> = {}
      const items: SearchResult[] = []

      days?.forEach((d) => {
        dayMap[d.id] = d.day_number
        items.push({
          id: d.id,
          type: 'day',
          title: d.title,
          subtitle: d.location || d.region,
          dayNumber: d.day_number,
          href: `/trip/${tripSlug}/day/${d.day_number}`,
        })
      })

      events?.forEach((e) => {
        const dayNum = dayMap[e.day_id]
        items.push({
          id: e.id,
          type: 'event',
          title: e.title,
          subtitle: e.type + (e.notes ? ` · ${e.notes.slice(0, 60)}` : ''),
          dayNumber: dayNum,
          href: dayNum ? `/trip/${tripSlug}/day/${dayNum}` : `/trip/${tripSlug}`,
        })
      })

      setAllItems(items)
      setLoaded(true)
    }

    loadData()
  }, [open, loaded, tripId, tripSlug])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = query.trim().length < 2
    ? allItems.slice(0, 8)
    : allItems.filter((item) => {
        const q = query.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q)
        )
      }).slice(0, 12)

  const typeLabel: Record<string, string> = {
    event: 'Activity',
    day: 'Day',
    hotel: 'Hotel',
  }

  const typeIcon: Record<string, string> = {
    event: '📍',
    day: '📅',
    hotel: '🏨',
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-white opacity-40 hover:opacity-80 transition-opacity text-xs"
        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        title="Search trip (⌘K)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="6" cy="6" r="4" />
          <line x1="9.5" y1="9.5" x2="13" y2="13" />
        </svg>
        <span className="hidden md:inline uppercase tracking-widest" style={{ letterSpacing: '0.14em' }}>Search</span>
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="w-full max-w-xl bg-white rounded-sm overflow-hidden"
            style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35)', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="#999" strokeWidth="1.8">
                <circle cx="6" cy="6" r="4" />
                <line x1="9.5" y1="9.5" x2="13" y2="13" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, days, hotels, activities…"
                className="flex-1 text-navy text-sm outline-none placeholder-gray-300"
                style={{ letterSpacing: '0.01em' }}
              />
              <button
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-gray-500 text-xs uppercase tracking-widest"
                style={{ letterSpacing: '0.12em' }}
              >
                esc
              </button>
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1">
              {!loaded && (
                <div className="px-5 py-6 text-center text-ink-muted text-xs">Loading…</div>
              )}
              {loaded && results.length === 0 && (
                <div className="px-5 py-6 text-center text-ink-muted text-xs">No results for "{query}"</div>
              )}
              {loaded && results.length > 0 && (
                <div>
                  {query.trim().length < 2 && (
                    <p className="px-5 pt-3 pb-1 text-ink-muted text-xs uppercase tracking-widest" style={{ letterSpacing: '0.14em' }}>
                      Browse your trip
                    </p>
                  )}
                  {results.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <span className="mt-0.5 text-sm shrink-0">{typeIcon[item.type] || '·'}</span>
                      <span className="flex-1 min-w-0" style={{ display: 'block' }}>
                        <span className="text-navy font-medium text-sm truncate" style={{ display: 'block' }}>{item.title}</span>
                        {item.subtitle && (
                          <span className="text-ink-muted text-xs truncate mt-0.5" style={{ display: 'block', lineHeight: '1.4' }}>
                            {item.subtitle}
                          </span>
                        )}
                      </span>
                      {item.dayNumber && (
                        <span
                          className="shrink-0 text-xs text-ink-muted uppercase tracking-widest mt-0.5"
                          style={{ letterSpacing: '0.12em', fontSize: '0.6rem' }}
                        >
                          Day {item.dayNumber}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-ink-muted text-xs opacity-60">⌘K to open / close</p>
              <p className="text-ink-muted text-xs opacity-60">{allItems.length} items indexed</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
