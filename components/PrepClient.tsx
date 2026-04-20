'use client'

import { useState, useEffect } from 'react'
import { usePersona } from '@/components/PersonaProvider'

interface PackingItem {
  id: string
  category: string
  item: string
  notes?: string
  for_traveler?: string | null
  segment?: string
}

interface Recommendation {
  id: string
  type: 'book' | 'film' | 'podcast' | 'music' | 'article'
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
}

type Tab = 'packing' | 'read' | 'money' | 'health'

const TABS: { id: Tab; label: string }[] = [
  { id: 'packing', label: 'What to Pack' },
  { id: 'read', label: 'Read / Watch / Listen' },
  { id: 'money', label: 'Money & Connectivity' },
  { id: 'health', label: 'Health & Safety' },
]

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
  { id: 'film', label: 'Films', emoji: '🎬' },
  { id: 'podcast', label: 'Podcasts', emoji: '🎙️' },
  { id: 'music', label: 'Music', emoji: '🎵' },
]

type CurrencyCode = 'USD' | 'MAD' | 'EUR'

// ── Exchange Rate Widget (bidirectional) ──────────────────────────────
function ExchangeRateCalculator() {
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('USD')
  const [inputValue, setInputValue] = useState('100')
  const [rates, setRates] = useState<{ MAD: number; EUR: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        setRates({ MAD: data.rates.MAD, EUR: data.rates.EUR })
        setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      } catch {
        setRates({ MAD: 10.05, EUR: 0.92 })
        setLastUpdated(null)
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  // Convert inputValue in activeCurrency → USD (base)
  function toUSD(amount: number, from: CurrencyCode): number {
    if (!rates) return amount
    if (from === 'USD') return amount
    if (from === 'MAD') return amount / rates.MAD
    if (from === 'EUR') return amount / rates.EUR
    return amount
  }

  const rawAmount = parseFloat(inputValue) || 0
  const usdBase = toUSD(rawAmount, activeCurrency)

  function getConverted(code: CurrencyCode): number {
    if (!rates) return 0
    if (code === 'USD') return usdBase
    if (code === 'MAD') return usdBase * rates.MAD
    if (code === 'EUR') return usdBase * rates.EUR
    return 0
  }

  function formatRate(from: CurrencyCode, to: CurrencyCode): string {
    if (!rates) return ''
    const fromUSD = toUSD(1, from)
    const toAmt = getConverted === undefined ? 0 : (() => {
      if (to === 'USD') return fromUSD
      if (to === 'MAD') return fromUSD * rates.MAD
      if (to === 'EUR') return fromUSD * rates.EUR
      return 0
    })()
    return `1 ${from} = ${toAmt.toFixed(2)} ${to}`
  }

  const CURRENCIES: { code: CurrencyCode; label: string; symbol: string; color: string }[] = [
    { code: 'USD', label: 'US Dollar',       symbol: '$',  color: '#1d4ed8' },
    { code: 'MAD', label: 'Moroccan Dirham', symbol: 'DH', color: '#b45309' },
    { code: 'EUR', label: 'Euro',            symbol: '€',  color: '#15803d' },
  ]

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
                : getConverted(c.code).toFixed(c.code === 'MAD' ? 0 : 2)

              return (
                <div
                  key={c.code}
                  onClick={() => {
                    if (!isActive) {
                      // Switch active currency — convert displayed value to new input
                      const converted = getConverted(c.code)
                      setActiveCurrency(c.code)
                      setInputValue(c.code === 'MAD' ? converted.toFixed(0) : converted.toFixed(2))
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
export default function PrepClient({ tripSlug, packingItems, recommendations }: PrepClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('packing')
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [healthPackingList, setHealthPackingList] = useState<Set<string>>(new Set())
  const [segment, setSegment] = useState<'all' | 'morocco' | 'france'>('all')
  const [revealedRecs, setRevealedRecs] = useState<Set<string>>(new Set())
  const { traveler } = usePersona()

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

  // Filter packing items
  const filteredItems = packingItems.filter((item) => {
    if (segment !== 'all' && item.segment && item.segment !== 'all' && item.segment !== segment) return false
    if (item.for_traveler && traveler && item.for_traveler !== traveler.key) return false
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
          Morocco and France require different wardrobes. Plan for layering in Burgundy (June evenings can be 55°F),
          and modest dress for medinas — knees and shoulders covered. One carry-on each if you can manage it.
          The best hotel stays leave room for what you find.
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

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex gap-2">
              {(['all', 'morocco', 'france'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSegment(s)}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest rounded-sm transition-all duration-200 ${
                    segment === s ? 'bg-navy text-white' : 'bg-gray-50 text-ink-muted hover:bg-gray-100'
                  }`}
                  style={{ letterSpacing: '0.12em' }}
                >
                  {s === 'all' ? 'Full Trip' : s === 'morocco' ? 'Morocco' : 'France'}
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
                            {item.notes && (
                              <span className="text-xs text-ink-muted mt-0.5 leading-relaxed" style={{ display: 'block' }}>
                                {item.notes}
                              </span>
                            )}
                          </span>
                          {item.segment && item.segment !== 'all' && (
                            <span
                              className="shrink-0 text-xs px-2 py-0.5 rounded-sm mt-0.5"
                              style={{
                                background: item.segment === 'morocco' ? 'rgba(180, 83, 9, 0.1)' : 'rgba(21, 128, 61, 0.1)',
                                color: item.segment === 'morocco' ? '#b45309' : '#15803d',
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
          <ExchangeRateCalculator />

          <div>
            <div className="flex items-center gap-4 mb-6">
              <p className="label shrink-0">Currencies</p>
              <div className="flex-1 border-t border-gray-100" />
            </div>
            <div className="space-y-4">
              {[
                {
                  country: 'Morocco',
                  currency: 'Moroccan Dirham (MAD)',
                  symbol: 'DH',
                  rate: '~10 MAD = $1 USD',
                  tip: 'ATMs in Casablanca and Rabat medinas are reliable. Avoid airport exchange counters. Never exchange money on the street — it is illegal and the rates are fake.',
                  warning: 'Dirhams cannot be exported — spend or exchange before leaving.',
                  color: '#b45309',
                },
                {
                  country: 'France',
                  currency: 'Euro (EUR)',
                  symbol: '€',
                  rate: '~0.92 EUR = $1 USD',
                  tip: 'Cards accepted almost everywhere. Rural wine estates may prefer cash — carry €100 in small bills when visiting Burgundy villages.',
                  warning: null,
                  color: '#15803d',
                },
              ].map((c) => (
                <div
                  key={c.country}
                  className="p-6 rounded-sm"
                  style={{ background: 'rgba(27,43,75,0.03)', borderLeft: `3px solid ${c.color}` }}
                >
                  <div className="flex items-baseline gap-3 mb-2">
                    <p className="font-serif font-bold text-navy text-lg">{c.currency}</p>
                    <p className="text-xs text-ink-muted uppercase tracking-widest">{c.rate}</p>
                  </div>
                  <p className="text-sm text-ink leading-relaxed mb-3">{c.tip}</p>
                  {c.warning && (
                    <p className="text-xs px-3 py-2 rounded-sm" style={{ background: 'rgba(180,83,9,0.08)', color: '#b45309' }}>
                      ⚠️ {c.warning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
              <p className="label shrink-0">Phone & Data</p>
              <div className="flex-1 border-t border-gray-100" />
            </div>
            <div className="space-y-3">
              {[
                { title: 'T-Mobile Magenta / Google Fi', note: 'Both work in Morocco and France with no extra fees. Speeds are acceptable in cities.' },
                { title: 'Local SIM — Morocco', note: 'Maroc Telecom SIMs available at the airport. A 30-day 20GB data plan costs ~$12. Useful if staying longer.' },
                { title: 'WhatsApp', note: 'The default messaging app in Morocco — even for hotel concierge. Make sure everyone in the group has it.' },
                { title: 'Download Offline Maps', note: 'Download Morocco and France maps in Google Maps or Maps.me before you leave. Medinas can be confusing without data.' },
              ].map((item) => (
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
                    <th className="text-left py-2 pr-6 text-xs uppercase tracking-widest text-ink-muted font-normal" style={{ letterSpacing: '0.12em' }}>Morocco</th>
                    <th className="text-left py-2 text-xs uppercase tracking-widest text-ink-muted font-normal" style={{ letterSpacing: '0.12em' }}>France</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { service: 'Restaurant', morocco: '10–15 MAD / person', france: 'Round up, tip not required' },
                    { service: 'Private Driver / Guide', morocco: '50–100 MAD / day', france: '€10–15 / day' },
                    { service: 'Hotel Housekeeping', morocco: '10–20 MAD / night', france: '€2–5 / night' },
                    { service: 'Riad / Guesthouse Staff', morocco: '20–40 MAD / stay', france: 'N/A' },
                    { service: 'Taxi', morocco: 'Round up to nearest 5 MAD', france: 'Round up or small tip' },
                    { service: 'Hammam / Spa', morocco: '20–40 MAD', france: '€5–15' },
                  ].map((row) => (
                    <tr key={row.service} className="border-b border-gray-50">
                      <td className="py-3 pr-6 font-medium text-navy">{row.service}</td>
                      <td className="py-3 pr-6 text-ink-muted">{row.morocco}</td>
                      <td className="py-3 text-ink-muted">{row.france}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── HEALTH & SAFETY TAB ── */}
      {activeTab === 'health' && (
        <div className="space-y-10 max-w-2xl">
          {[
            {
              title: 'Before You Leave',
              items: [
                { label: 'Hepatitis A & B', note: 'Recommended for Morocco if not already vaccinated. Check with your doctor 4–6 weeks before travel.' },
                { label: 'Typhoid', note: 'Recommended if you plan to eat at local restaurants and street food (you should).' },
                { label: 'Tetanus', note: 'Ensure you\'re up to date.' },
                { label: 'Prescriptions', note: 'Bring enough for the full trip plus 5 extra days. Carry in original pharmacy bottles.' },
                { label: 'Travel Insurance', note: 'Get it. Covers emergency evacuation, trip cancellation, and medical abroad. Recommended: World Nomads or Allianz.' },
              ],
            },
            {
              title: 'Food & Water in Morocco',
              items: [
                { label: 'Tap water', note: 'Do not drink tap water in Morocco. Bottled water is cheap and universally available.' },
                { label: 'Ice', note: 'At luxury riads and rated restaurants, ice is made from filtered water. In markets and casual spots — skip it.' },
                { label: 'Fresh salads & fruit', note: 'Fine at your riad and high-end restaurants. At markets, peel everything you eat raw.' },
                { label: 'Street food', note: 'Go for it — but observe turnover. A busy stall with hot fresh food is almost always safe.' },
              ],
            },
            {
              title: 'Sun & Heat',
              items: [
                { label: 'SPF 50+', note: 'June UV index in Rabat is 9–10 (very high). Reapply every 2 hours outdoors.' },
                { label: 'Hydration', note: 'Morocco in June is warm — 80°F+. Drink 3+ liters per day when active. Keep a bottle in your day bag.' },
                { label: 'Timing', note: 'Plan major medina walks before 10am or after 4pm. The midday pause is real — lunch in the shade, then a rest.' },
              ],
            },
            {
              title: 'Pharmacy Essentials to Pack',
              items: [
                { label: 'Imodium / Pepto-Bismol', note: 'Just in case. The food is worth it.' },
                { label: 'Antihistamine', note: 'For dust, cats (riads have them), or seasonal allergies.' },
                { label: 'Pain reliever', note: 'Ibuprofen and Tylenol. Harder to find familiar brands abroad.' },
                { label: 'Blister kit', note: 'Medinas involve serious cobblestone walking. Bring moleskin and bandages.' },
                { label: 'Hand sanitizer', note: 'Small travel size. Mosques and medinas have limited sinks.' },
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
        </div>
      )}

    </div>
  )
}
