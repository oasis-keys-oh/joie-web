'use client'

import { useState, useEffect } from 'react'
import { usePersona } from '@/components/PersonaProvider'
import type { TripTravelInfo, TripReferenceSection } from '@/lib/types'

interface PackingItem {
  id: string
  category: string
  item: string
  notes?: string
  reason?: string | null
  traveler_key?: string | null
  segment?: string
}

interface Recommendation {
  id: string
  type: 'book' | 'audiobook' | 'film' | 'podcast' | 'music' | 'article'
  title: string
  author?: string
  description?: string
  amazon_url?: string
  streaming_url?: string
  streaming_platform?: string
  why_relevant?: string
}

interface PrepClientProps {
  tripSlug: string
  packingItems: PackingItem[]
  recommendations: Recommendation[]
  travelInfo: TripTravelInfo[]
  referenceSections?: TripReferenceSection[]
  guideCity?: string
}

type Tab = 'packing' | 'read' | 'money' | 'health' | 'guide'

const PACKING_CATEGORIES = [
  'Documents & Finance',
  'Clothing',
  'Footwear',
  'Toiletries',
  'Electronics',
  'Health & Pharmacy',
  'Day Bag',
  'Optional',
]

const REC_TYPES: { id: string; label: string; emoji: string }[] = [
  { id: 'book', label: 'Books', emoji: '📚' },
  { id: 'audiobook', label: 'Audiobooks', emoji: '🎧' },
  { id: 'film', label: 'Films', emoji: '🎬' },
  { id: 'podcast', label: 'Podcasts', emoji: '🎙️' },
  { id: 'music', label: 'Music', emoji: '🎵' },
]

// Rotating palette for non-USD currencies — assigned in order, not tied to any specific country.
const CURRENCY_COLORS = ['#b45309', '#15803d', '#7e22ce', '#0e7490', '#be123c']

// Deterministic string hash — used to pick a stable color for a segment/country name
// without hardcoding which name maps to which color.
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return h
}

// Small known-country flag lookup for Official Travel Resources — falls back to a
// generic globe rather than guessing/hardcoding one country as the default.
const COUNTRY_FLAGS: Record<string, string> = {
  morocco: '🇲🇦', france: '🇫🇷', canada: '🇨🇦', 'united states': '🇺🇸',
  spain: '🇪🇸', italy: '🇮🇹', portugal: '🇵🇹', mexico: '🇲🇽', 'united kingdom': '🇬🇧',
  greece: '🇬🇷', japan: '🇯🇵', thailand: '🇹🇭',
}
function countryFlag(name: string): string {
  return COUNTRY_FLAGS[name.trim().toLowerCase()] || '🌍'
}

// ── Exchange Rate Widget (bidirectional) ──────────────────────────────
// Fully data-driven: builds its currency list from whichever countries this trip's
// trip_travel_info rows define, instead of a hardcoded USD/MAD/EUR set.
function ExchangeRateCalculator({ countries }: { countries: TripTravelInfo[] }) {
  const CURRENCIES = [
    { code: 'USD', label: 'US Dollar', symbol: '$', color: '#1d4ed8', fallbackRate: 1 },
    ...countries
      .filter((c) => c.currency_code && c.currency_code !== 'USD')
      .filter((c, i, arr) => arr.findIndex((x) => x.currency_code === c.currency_code) === i) // dedupe
      .map((c, i) => ({
        code: c.currency_code!,
        label: c.currency_name || c.currency_code!,
        symbol: c.currency_symbol || c.currency_code!,
        color: CURRENCY_COLORS[i % CURRENCY_COLORS.length],
        fallbackRate: c.fallback_rate_to_usd || 1,
      })),
  ]

  const [activeCurrency, setActiveCurrency] = useState<string>('USD')
  const [inputValue, setInputValue] = useState('100')
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRates() {
      const fallback: Record<string, number> = { USD: 1 }
      for (const c of CURRENCIES) fallback[c.code] = c.fallbackRate
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        const live: Record<string, number> = { USD: 1 }
        for (const c of CURRENCIES) {
          live[c.code] = data.rates?.[c.code] ?? c.fallbackRate
        }
        setRates(live)
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      } catch {
        setRates(fallback)
        setLastUpdated(null)
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries.map((c) => c.currency_code).join(',')])

  // Convert inputValue in activeCurrency → USD (base)
  function toUSD(amount: number, from: string): number {
    if (!rates) return amount
    if (from === 'USD') return amount
    return amount / (rates[from] || 1)
  }

  const rawAmount = parseFloat(inputValue) || 0
  const usdBase = toUSD(rawAmount, activeCurrency)

  function getConverted(code: string): number {
    if (!rates) return 0
    if (code === 'USD') return usdBase
    return usdBase * (rates[code] || 1)
  }

  function formatRate(from: string, to: string): string {
    if (!rates) return ''
    const fromUSD = toUSD(1, from)
    const toAmt = to === 'USD' ? fromUSD : fromUSD * (rates[to] || 1)
    return `1 ${from} = ${toAmt.toFixed(2)} ${to}`
  }

  if (CURRENCIES.length <= 1) return null // nothing to convert against

  return (
    <div
      className="p-6 rounded-sm"
      style={{ background: 'rgba(27,43,75,0.04)', border: '1px solid rgba(27,43,75,0.08)' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span style={{ fontSize: '1.2rem' }}>💱</span>
        <p className="label">Live Exchange Rates</p>
        {lastUpdated && (
          <span className="text-ink-muted ml-auto" style={{ fontSize: '0.65rem' }}>
            Updated {lastUpdated}
          </span>
        )}
        {!lastUpdated && !loading && (
          <span className="text-ink-muted ml-auto" style={{ fontSize: '0.65rem' }}>
            Approx. rates
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4 text-ink-muted text-sm">Loading rates…</div>
      ) : rates ? (
        <>
          <p className="text-xs text-ink-muted mb-3" style={{ fontSize: '0.68rem' }}>
            Click any currency to type in that amount
          </p>
          <div className="space-y-2">
            {CURRENCIES.map((c) => {
              const isActive = activeCurrency === c.code
              const displayValue = isActive
                ? inputValue
                : getConverted(c.code).toFixed(c.fallbackRate > 5 ? 0 : 2)

              return (
                <div
                  key={c.code}
                  onClick={() => {
                    if (!isActive) {
                      // Switch active currency — convert displayed value to new input
                      const converted = getConverted(c.code)
                      setActiveCurrency(c.code)
                      setInputValue(c.fallbackRate > 5 ? converted.toFixed(0) : converted.toFixed(2))
                    }
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-sm cursor-pointer transition-all duration-200"
                  style={{
                    background: isActive ? `${c.color}10` : 'white',
                    border: isActive ? `2px solid ${c.color}` : '1px solid rgba(27,43,75,0.09)',
                  }}
                >
                  {/* Currency badge */}
                  <div
                    className="shrink-0 w-12 text-center font-bold text-sm rounded-sm py-1"
                    style={{ background: `${c.color}15`, color: c.color }}
                  >
                    {c.symbol}
                  </div>

                  {/* Input or read-only display */}
                  <div className="flex-1">
                    {isActive ? (
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full font-serif font-bold text-navy text-xl outline-none bg-transparent"
                        style={{ lineHeight: '1' }}
                        min="0"
                      />
                    ) : (
                      <p className="font-serif font-bold text-navy text-xl" style={{ lineHeight: '1' }}>
                        {displayValue}
                      </p>
                    )}
                    <p className="text-ink-muted mt-0.5" style={{ fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                      {c.label}
                      {isActive && <span className="ml-2 opacity-60">← enter amount</span>}
                    </p>
                  </div>

                  {/* Rate reference */}
                  {!isActive && (
                    <p className="text-ink-muted shrink-0 text-right" style={{ fontSize: '0.6rem', lineHeight: '1.5' }}>
                      {formatRate(activeCurrency, c.code)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : null}

      <p className="text-ink-muted mt-4 text-center" style={{ fontSize: '0.65rem' }}>
        For reference only. Rates fluctuate — check your bank before departure.
      </p>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────
export default function PrepClient({
  tripSlug,
  packingItems,
  recommendations,
  travelInfo,
  referenceSections = [],
  guideCity,
}: PrepClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('packing')

  // The Guide tab only appears when there's actually curator content to show —
  // no empty tab for trips that haven't had this researched yet.
  const TABS: { id: Tab; label: string }[] = [
    { id: 'packing', label: 'What to Pack' },
    { id: 'read', label: 'Read / Watch / Listen' },
    { id: 'money', label: 'Money & Connectivity' },
    { id: 'health', label: 'Health & Safety' },
    ...(referenceSections.length > 0
      ? [{ id: 'guide' as Tab, label: `The Guide: Explore ${guideCity || 'the Destination'}` }]
      : []),
  ]
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [healthPackingList, setHealthPackingList] = useState<Set<string>>(new Set())
  const [segment, setSegment] = useState<string>('all')
  const [revealedRecs, setRevealedRecs] = useState<Set<string>>(new Set())
  const { traveler } = usePersona()

  // Real segments present in this trip's packing list (was hardcoded to 'morocco'/'france').
  const segments = Array.from(
    new Set(packingItems.map((i) => i.segment).filter((s): s is string => !!s && s !== 'all'))
  )
  const segmentColor = (seg: string) => CURRENCY_COLORS[Math.abs(hashString(seg)) % CURRENCY_COLORS.length]

  function revealRec(id: string) {
    setRevealedRecs((prev) => new Set([...prev, id]))
  }

  function toggleItem(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function addHealthItemToPacking(label: string) {
    setHealthPackingList((prev) => new Set([...prev, label]))
    setActiveTab('packing')
  }

  // Filter packing items by segment and traveler persona
  const filteredItems = packingItems.filter((item) => {
    // Segment filter: 'all' items always pass; otherwise match segment
    if (segment !== 'all' && item.segment && item.segment !== 'all' && item.segment !== segment) return false
    // Traveler filter: 'all' traveler_key items always show; persona-specific only show for matching persona
    const key = item.traveler_key
    if (key && key !== 'all') {
      if (traveler && key !== traveler.key) return false
    }
    return true
  })

  const groupedItems: Record<string, PackingItem[]> = {}
  for (const item of filteredItems) {
    const cat = item.category || 'Other'
    if (!groupedItems[cat]) groupedItems[cat] = []
    groupedItems[cat].push(item)
  }

  // Inject health items added via "Add to packing list"
  if (healthPackingList.size > 0) {
    const healthExtra = groupedItems['Health & Pharmacy'] || []
    const existingLabels = new Set(healthExtra.map((i) => i.item))
    for (const label of healthPackingList) {
      if (!existingLabels.has(label)) {
        healthExtra.push({ id: `health-${label}`, category: 'Health & Pharmacy', item: label, notes: 'Added from Health & Safety' })
      }
    }
    groupedItems['Health & Pharmacy'] = healthExtra
  }

  const totalItems = filteredItems.length + healthPackingList.size
  const checkedCount = filteredItems.filter((i) => checkedItems.has(i.id)).length
  const pct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-14 py-12">

      {/* ── Packing Philosophy — always visible at top ── */}
      <div
        className="mb-10 p-6 rounded-sm"
        style={{ background: 'rgba(27,43,75,0.04)', borderLeft: '3px solid #C9A84C' }}
      >
        <p className="text-xs text-ink-muted uppercase tracking-widest mb-2" style={{ letterSpacing: '0.14em' }}>
          Oukala Packing Philosophy
        </p>
        <p className="text-sm text-ink leading-relaxed">
          {travelInfo.length > 1
            ? `${travelInfo.map((c) => c.country_name).join(' and ')} may call for different wardrobes — check the segment filters below for what's specific to each. `
            : ''}
          One carry-on each if you can manage it. The best hotel stays leave room for what you find.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-12 border-b border-gray-100 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-xs uppercase tracking-widest transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-navy border-gold font-semibold'
                : 'text-ink-muted border-transparent hover:text-navy'
            }`}
            style={{ letterSpacing: '0.14em' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PACKING TAB ── */}
      {activeTab === 'packing' && (
        <div>
          {healthPackingList.size > 0 && (
            <div
              className="mb-6 px-4 py-3 rounded-sm text-sm"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}
            >
              ✓ {healthPackingList.size} item{healthPackingList.size !== 1 ? 's' : ''} added from Health & Safety → Health & Pharmacy
            </div>
          )}

          {/* Persona indicator */}
          {traveler && (
            <div
              className="mb-6 px-4 py-3 rounded-sm flex items-center gap-3"
              style={{ background: `${traveler.color}10`, border: `1px solid ${traveler.color}30` }}
            >
              <span style={{ fontSize: '1rem' }}>{traveler.emoji}</span>
              <span className="text-sm text-navy font-medium">
                Viewing as <strong>{traveler.name}</strong>
              </span>
              <span className="text-xs text-ink-muted ml-1">
                — showing shared items + yours
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex gap-2">
              {segments.length === 0 ? null : ['all', ...segments].map((s) => (
                <button
                  key={s}
                  onClick={() => setSegment(s)}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest rounded-sm transition-all duration-200 ${
                    segment === s ? 'bg-navy text-white' : 'bg-gray-50 text-ink-muted hover:bg-gray-100'
                  }`}
                  style={{ letterSpacing: '0.12em' }}
                >
                  {s === 'all' ? 'Full Trip' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 sm:w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-ink-muted shrink-0">{checkedCount}/{totalItems} packed</span>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-10">
            {PACKING_CATEGORIES.map((cat) => {
              const items = groupedItems[cat]
              if (!items || items.length === 0) return null
              const allChecked = items.every((i) => checkedItems.has(i.id))
              return (
                <div key={cat}>
                  <div className="flex items-center gap-4 mb-4">
                    <p className="label shrink-0">{cat}</p>
                    <div className="flex-1 border-t border-gray-100" />
                    {allChecked && <span className="text-xs text-gold">✓ Done</span>}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const checked = checkedItems.has(item.id)
                      return (
                        <label
                          key={item.id}
                          className="flex items-start gap-3 px-3 py-3 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleItem(item.id)}
                            className="mt-0.5 shrink-0 accent-gold"
                          />
                          <span className="min-w-0 flex-1" style={{ display: 'block' }}>
                            <span
                              className={`text-sm font-medium transition-colors ${checked ? 'line-through text-ink-muted' : 'text-navy'}`}
                              style={{ display: 'block' }}
                            >
                              {item.item}
                            </span>
                            {(item.reason || item.notes) && (
                              <span className="text-xs text-ink-muted mt-0.5 leading-relaxed" style={{ display: 'block' }}>
                                {item.reason || item.notes}
                              </span>
                            )}
                          </span>
                          {item.segment && item.segment !== 'all' && (
                            <span
                              className="shrink-0 text-xs px-2 py-0.5 rounded-sm mt-0.5"
                              style={{
                                background: `${segmentColor(item.segment)}18`,
                                color: segmentColor(item.segment),
                              }}
                            >
                              {item.segment}
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Unlisted categories */}
            {Object.keys(groupedItems)
              .filter((cat) => !PACKING_CATEGORIES.includes(cat))
              .map((cat) => {
                const items = groupedItems[cat]
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-4 mb-4">
                      <p className="label shrink-0">{cat}</p>
                      <div className="flex-1 border-t border-gray-100" />
                    </div>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <label key={item.id} className="flex items-start gap-3 px-3 py-3 rounded-sm cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={checkedItems.has(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className="mt-0.5 shrink-0 accent-gold"
                          />
                          <span style={{ display: 'block' }}>
                            <span className="text-sm font-medium text-navy" style={{ display: 'block' }}>{item.item}</span>
                            {item.notes && <span className="text-xs text-ink-muted mt-0.5" style={{ display: 'block' }}>{item.notes}</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── READ / WATCH / LISTEN TAB ── */}
      {activeTab === 'read' && (
        <div>
          {REC_TYPES.map(({ id, label, emoji }) => {
            const recs = recommendations.filter((r) => r.type === id)
            if (recs.length === 0) return null
            return (
              <div key={id} className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                  <p className="label shrink-0">{label}</p>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
                <div className="space-y-5">
                  {recs.map((rec) => {
                    // Special case: Todd's costume — shown as "Cultural Immersion" until revealed
                    const isToddEntry = rec.title?.toLowerCase().includes('costume') || rec.description?.toLowerCase().includes('halloween')
                    const revealed = revealedRecs.has(rec.id)

                    return (
                      <div
                        key={rec.id}
                        className="flex items-start gap-4 p-5 rounded-sm"
                        style={{ background: 'rgba(27,43,75,0.03)', border: '1px solid rgba(27,43,75,0.07)' }}
                      >
                        <span className="min-w-0 flex-1" style={{ display: 'block' }}>
                          <span className="font-serif font-bold text-navy text-base leading-snug" style={{ display: 'block' }}>
                            {isToddEntry && !revealed ? 'Cultural Immersion Attire' : rec.title}
                          </span>
                          {rec.author && (
                            <span className="text-xs text-ink-muted mt-0.5 uppercase tracking-wide" style={{ letterSpacing: '0.1em', display: 'block' }}>
                              {rec.author}
                            </span>
                          )}
                          {isToddEntry && !revealed ? (
                            <span style={{ display: 'block' }}>
                              <span className="text-sm text-ink-muted mt-3 leading-relaxed italic" style={{ color: '#888', display: 'block' }}>
                                A carefully selected cultural ensemble for the journey ahead. Details revealed upon request.
                              </span>
                              <button
                                onClick={() => revealRec(rec.id)}
                                className="mt-3 text-xs uppercase tracking-widest text-gold hover:text-navy transition-colors"
                                style={{ letterSpacing: '0.14em' }}
                              >
                                Reveal →
                              </button>
                            </span>
                          ) : (
                            <span style={{ display: 'block' }}>
                              {rec.why_relevant && (
                                <span className="text-sm text-ink mt-3 leading-relaxed" style={{ color: '#555', display: 'block' }}>
                                  {rec.why_relevant}
                                </span>
                              )}
                              {rec.description && !rec.why_relevant && (
                                <span className="text-sm text-ink-muted mt-2 leading-relaxed" style={{ display: 'block' }}>
                                  {rec.description}
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                        <span className="flex flex-col gap-2 shrink-0" style={{ display: 'flex' }}>
                          {rec.amazon_url && (
                            <a
                              href={rec.amazon_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-xs uppercase tracking-widest text-navy border border-navy border-opacity-30 hover:bg-navy hover:text-white transition-all duration-200 rounded-sm text-center"
                              style={{ letterSpacing: '0.12em' }}
                            >
                              Amazon →
                            </a>
                          )}
                          {rec.streaming_url && rec.streaming_platform && (
                            <a
                              href={rec.streaming_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-xs uppercase tracking-widest rounded-sm text-center transition-all duration-200"
                              style={{
                                letterSpacing: '0.12em',
                                background: 'rgba(201,168,76,0.12)',
                                color: '#1B2B4B',
                                border: '1px solid rgba(201,168,76,0.4)',
                              }}
                            >
                              {rec.streaming_platform} →
                            </a>
                          )}
                          {!rec.amazon_url && !rec.streaming_url && (
                            <span
                              className="px-4 py-2 text-xs uppercase tracking-widest text-ink-muted border border-gray-200 rounded-sm text-center"
                              style={{ letterSpacing: '0.12em' }}
                            >
                              Find it
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {recommendations.length === 0 && (
            <div className="text-center py-16">
              <p className="text-ink-muted text-sm">Recommendations coming soon.</p>
            </div>
          )}

          <div
            className="mt-8 p-4 rounded-sm"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}
          >
            <p className="text-xs text-ink-muted leading-relaxed">
              Links marked "Amazon →" are affiliate links. When you buy through them, Oukala Journeys earns a small commission at no extra cost to you.
            </p>
          </div>
        </div>
      )}

      {/* ── MONEY & CONNECTIVITY TAB ── */}
      {activeTab === 'money' && (
        <div className="space-y-10 max-w-2xl">

          {/* Live exchange rate calculator — top of money tab */}
          <ExchangeRateCalculator countries={travelInfo} />

          {travelInfo.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <p className="label shrink-0">Currencies</p>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <div className="space-y-4">
                {travelInfo.map((c, i) => {
                  const color = CURRENCY_COLORS[i % CURRENCY_COLORS.length]
                  return (
                    <div
                      key={c.id}
                      className="p-6 rounded-sm"
                      style={{ background: 'rgba(27,43,75,0.03)', borderLeft: `3px solid ${color}` }}
                    >
                      <div className="flex items-baseline gap-3 mb-2">
                        <p className="font-serif font-bold text-navy text-lg">
                          {c.currency_name} {c.currency_code ? `(${c.currency_code})` : ''}
                        </p>
                        {c.fallback_rate_to_usd && (
                          <p className="text-xs text-ink-muted uppercase tracking-widest">
                            ~{c.fallback_rate_to_usd} {c.currency_code} = $1 USD
                          </p>
                        )}
                      </div>
                      {c.exchange_note && <p className="text-sm text-ink leading-relaxed">{c.exchange_note}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(() => {
            // Flatten + dedupe connectivity notes across countries (same note often applies to all of them)
            const seen = new Set<string>()
            const items = travelInfo.flatMap((c) => c.connectivity_notes || []).filter((item) => {
              if (seen.has(item.title)) return false
              seen.add(item.title)
              return true
            })
            if (items.length === 0) return null
            return (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <p className="label shrink-0">Phone & Data</p>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.title} className="flex gap-4 py-4 border-b border-gray-50">
                      <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                      <span style={{ display: 'block' }}>
                        <span className="font-medium text-navy text-sm" style={{ display: 'block' }}>{item.title}</span>
                        <span className="text-sm text-ink-muted mt-1 leading-relaxed" style={{ display: 'block' }}>{item.note}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {(() => {
            const withTips = travelInfo.filter((c) => (c.tipping_notes || []).length > 0)
            if (withTips.length === 0) return null
            const services = Array.from(new Set(withTips.flatMap((c) => (c.tipping_notes || []).map((t) => t.service))))
            return (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <p className="label shrink-0">Tipping Guide</p>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-6 text-xs uppercase tracking-widest text-ink-muted font-normal" style={{ letterSpacing: '0.12em' }}>Service</th>
                        {withTips.map((c) => (
                          <th key={c.id} className="text-left py-2 pr-6 text-xs uppercase tracking-widest text-ink-muted font-normal" style={{ letterSpacing: '0.12em' }}>
                            {c.country_name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service) => (
                        <tr key={service} className="border-b border-gray-50">
                          <td className="py-3 pr-6 font-medium text-navy">{service}</td>
                          {withTips.map((c) => {
                            const note = (c.tipping_notes || []).find((t) => t.service === service)
                            return (
                              <td key={c.id} className="py-3 pr-6 text-ink-muted">{note?.local_note || '—'}</td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}

          {travelInfo.length === 0 && (
            <div className="text-center py-16">
              <p className="text-ink-muted text-sm">Money & connectivity details for this trip are coming soon.</p>
            </div>
          )}

        </div>
      )}

      {/* ── HEALTH & SAFETY TAB ── */}
      {activeTab === 'health' && (
        <div className="space-y-10 max-w-2xl">
          {[
            {
              title: 'Before You Leave',
              items: [
                { label: 'Prescriptions', note: 'Bring enough for the full trip plus 5 extra days. Carry in original pharmacy bottles.' },
                { label: 'Travel Insurance', note: 'Get it. Covers emergency evacuation, trip cancellation, and medical abroad. Recommended: World Nomads or Allianz.' },
                { label: 'Tetanus', note: "Ensure you're up to date." },
                ...travelInfo.flatMap((c) =>
                  (c.vaccination_notes || []).map((v) => ({ label: `${v.label} (${c.country_name})`, note: v.note }))
                ),
              ],
            },
            ...(travelInfo.some((c) => (c.food_water_notes || []).length > 0)
              ? [{
                  title: 'Food & Water',
                  items: travelInfo.flatMap((c) =>
                    (c.food_water_notes || []).map((f) => ({ label: `${f.label} — ${c.country_name}`, note: f.note }))
                  ),
                }]
              : []),
            {
              title: 'Sun & Heat',
              items: [
                { label: 'Hydration', note: 'Drink 3+ liters of water per day when active outdoors. Keep a bottle in your day bag.' },
                { label: 'Timing', note: 'Plan strenuous outdoor activity for morning or late afternoon — take a rest during peak sun.' },
                ...travelInfo
                  .filter((c) => c.sun_safety_note)
                  .map((c) => ({ label: `Sun notes — ${c.country_name}`, note: c.sun_safety_note as string })),
              ],
            },
            {
              title: 'Pharmacy Essentials to Pack',
              items: [
                { label: 'Imodium / Pepto-Bismol', note: 'Just in case.' },
                { label: 'Antihistamine', note: 'For dust, pet dander, or seasonal allergies.' },
                { label: 'Pain reliever', note: 'Ibuprofen and Tylenol. Harder to find familiar brands abroad.' },
                { label: 'Blister kit', note: 'For unexpectedly long walking days. Bring moleskin and bandages.' },
                { label: 'Hand sanitizer', note: 'Small travel size — useful anywhere public restrooms are scarce.' },
              ],
            },
          ].map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-4 mb-5">
                <p className="label shrink-0">{section.title}</p>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.label} className="flex gap-4 py-3 border-b border-gray-50 group">
                    <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                    <span className="flex-1" style={{ display: 'block' }}>
                      <span className="font-medium text-navy text-sm" style={{ display: 'block' }}>{item.label}</span>
                      <span className="text-sm text-ink-muted mt-1 leading-relaxed" style={{ display: 'block' }}>{item.note}</span>
                    </span>
                    <button
                      onClick={() => addHealthItemToPacking(item.label)}
                      className={`shrink-0 self-start mt-0.5 text-xs px-3 py-1.5 rounded-sm transition-all duration-200 ${
                        healthPackingList.has(item.label)
                          ? 'bg-gold text-white cursor-default'
                          : 'border border-gray-200 text-ink-muted hover:border-gold hover:text-gold'
                      }`}
                      style={{ letterSpacing: '0.08em' }}
                      disabled={healthPackingList.has(item.label)}
                    >
                      {healthPackingList.has(item.label) ? '✓ Added' : '+ Pack'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Official Travel Resources ── */}
          {travelInfo.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <p className="label shrink-0">Official Travel Resources</p>
              <div className="flex-1 border-t border-gray-100" />
            </div>
            <div className="space-y-3">
              {travelInfo.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-5 py-4 rounded-sm border border-gray-100 bg-white"
                >
                  <span style={{ fontSize: '1.4rem' }}>{countryFlag(c.country_name)}</span>
                  <span className="flex-1">
                    <span className="font-medium text-navy text-sm block">{c.country_name}</span>
                  </span>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {c.advisory_url && (
                      <a
                        href={c.advisory_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-sm border border-gray-200 text-ink-muted hover:border-navy hover:text-navy transition-all"
                        style={{ letterSpacing: '0.06em' }}
                      >
                        State Dept Advisory →
                      </a>
                    )}
                    {c.embassy_url && (
                      <a
                        href={c.embassy_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-sm border border-gray-200 text-ink-muted hover:border-navy hover:text-navy transition-all"
                        style={{ letterSpacing: '0.06em' }}
                      >
                        {c.embassy_name || 'Embassy'} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <div
                className="px-5 py-4 rounded-sm"
                style={{ background: 'rgba(27,43,75,0.03)', border: '1px solid rgba(27,43,75,0.07)' }}
              >
                <p className="text-xs text-ink-muted leading-relaxed">
                  <strong className="text-navy">Smart Traveler Enrollment Program (STEP):</strong>{' '}
                  Register your trip at{' '}
                  <a
                    href="https://step.state.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    step.state.gov
                  </a>{' '}
                  so the U.S. Embassy can reach you in an emergency. Takes 2 minutes.
                </p>
              </div>
            </div>
          </div>
          )}

        </div>
      )}

      {/* ── THE GUIDE TAB ── */}
      {activeTab === 'guide' && (
        <div className="space-y-14 max-w-2xl">
          {referenceSections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center gap-4 mb-6">
                <p className="label shrink-0">{section.title}</p>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <div className="space-y-4">
                {section.content.map((item, idx) => {
                  // Tip-style items: { title, body }
                  if (item.title && item.body) {
                    return (
                      <div key={idx} className="flex gap-4 py-3 border-b border-gray-50">
                        <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                        <span className="flex-1">
                          <span className="font-medium text-navy text-sm block">{item.title}</span>
                          <span className="text-sm text-ink-muted mt-1 leading-relaxed block">{item.body}</span>
                        </span>
                      </div>
                    )
                  }
                  // Neighborhood-style items: { neighborhood, when, character }
                  if (item.neighborhood) {
                    return (
                      <div
                        key={idx}
                        className="px-5 py-4 rounded-sm border border-gray-100 bg-white"
                      >
                        <p className="font-medium text-navy text-sm mb-1">{item.neighborhood}</p>
                        {item.when && (
                          <p className="text-xs text-gold mb-1.5" style={{ letterSpacing: '0.04em' }}>
                            {item.when}
                          </p>
                        )}
                        {item.character && (
                          <p className="text-sm text-ink-muted leading-relaxed">{item.character}</p>
                        )}
                      </div>
                    )
                  }
                  // Attraction / drink-style items: { name, description, why?, cost?, rating?, address?, must_do?, photo_spot?, one_to_order? }
                  if (item.name) {
                    return (
                      <div
                        key={idx}
                        className="px-5 py-4 rounded-sm border border-gray-100 bg-white"
                      >
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <p className="font-medium text-navy text-sm">{item.name}</p>
                          {item.rating && (
                            <span
                              className="text-xs shrink-0 px-2 py-0.5 rounded-sm"
                              style={{ background: 'rgba(201,168,76,0.12)', color: '#8a6d1f' }}
                            >
                              {item.rating}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-ink-muted leading-relaxed mb-2">{item.description}</p>
                        )}
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
                          {item.address && <span>📍 {item.address}</span>}
                          {item.cost && <span>{item.cost}</span>}
                          {item.must_do && <span>Must do: {item.must_do}</span>}
                        </div>
                        {item.why && (
                          <p className="text-xs text-ink-muted italic mt-2">{item.why}</p>
                        )}
                        {item.one_to_order && (
                          <p className="text-xs text-navy mt-2">
                            <strong>Order this:</strong> {item.one_to_order}
                          </p>
                        )}
                        {item.photo_spot && (
                          <p className="text-xs text-ink-muted mt-2">📷 {item.photo_spot}</p>
                        )}
                      </div>
                    )
                  }
                  // Fallback: plain paragraph-style items: { text }
                  if (item.text) {
                    return (
                      <p key={idx} className="text-sm text-ink leading-relaxed">
                        {item.text}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
