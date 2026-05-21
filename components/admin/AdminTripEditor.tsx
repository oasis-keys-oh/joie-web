'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  upsertContactAction, deleteContactAction,
  upsertEventAction, deleteEventAction,
  upsertHotelAction, deleteHotelAction,
  upsertChallengeWithCoordsAction, deleteChallengeAction,
  updateDayFieldAction,
  updateTripFieldAction,
  upsertPackingItemAction, deletePackingItemAction,
  upsertRecAction, deleteRecAction,
  upsertPreTripDropAction, deletePreTripDropAction,
  upsertTravelerAction, deleteTravelerAction,
  upsertRWLAction, deleteRWLAction,
  upsertHaggleTriggerAction, deleteHaggleTriggerAction,
  upsertJourneyFactAction, deleteJourneyFactAction,
  bulkDeleteAction,
} from '@/app/(portal)/admin/actions'
import { getPhotoPool, getPhotoForDay, DEFAULT_PHOTOS } from '@/lib/unsplash'
import ImageUploadBtn from '@/components/admin/ImageUploadBtn'

// ── Types ────────────────────────────────────────────────────────────────────

interface Trip { id: string; title: string; web_slug: string; start_date: string; end_date: string; web_password?: string; story_image_url?: string; hero_image_url?: string; hero_image_url_2?: string; hero_image_url_3?: string; hero_image_url_4?: string }
interface Day { id: string; day_number: number; date: string; title: string; region: string; location?: string; morning_brief?: string; wow_moment?: string; gpx_url?: string; hero_image_url?: string; hero_image_url_2?: string; hero_image_url_3?: string; hero_image_url_4?: string; footer_image_url?: string }
interface Traveler { id: string; traveler_key?: string; full_name: string; email?: string; phone?: string; partner_name?: string; pillow_firmness?: string; coffee_order?: string; curtains_arrival?: string; dietary_notes?: string; mobility_notes?: string; anniversary_date?: string; personality?: string; notes?: string; wine_preferences?: string; interests?: string; travel_style?: string; allergies?: string; languages?: string; activities?: string; bucket_list?: string; music_preferences?: string; age?: number }
interface Event { id: string; day_id: string; type: string; title: string; time_start?: string; address?: string; phone?: string; confirmation?: string; booking_url?: string; booking_status?: string; notes?: string }
interface Contact { id: string; name: string; phone: string; role: string; destination: string; specialty?: string; intro_note?: string }
interface Hotel { id: string; name: string; check_in?: string; check_out?: string; address?: string; phone?: string; website?: string; confirmation?: string; notes?: string }
interface Challenge { id: string; day_number?: number; title: string; description: string; transliteration?: string; points: number; challenge_type: string; leg?: string; coordinates?: string }
interface PackingItem { id: string; item: string; category: string; segment?: string; traveler_key?: string; reason?: string; sort_order?: number }
interface Rec { id: string; type: string; title: string; author?: string; description?: string; why_relevant?: string; when_to_enjoy?: string; amazon_url?: string; streaming_url?: string; streaming_platform?: string; sort_order?: number }
interface PreTripDrop { id: string; date_offset_days: number; type: string; title?: string; content: string; media_url?: string; sent: boolean }
interface Feedback { id: string; day_id: string; traveler_name: string; comment: string; created_at: string }
interface RWLItem { id: string; type: string; title: string; author_director?: string; reason?: string; amazon_url?: string; streaming_url?: string; streaming_platform?: string; cover_image_url?: string; isbn?: string; tmdb_id?: string; display_order?: number }
interface HaggleTrigger { id: string; trip_id: string; day_id?: string; location_name: string; coordinates?: string; radius_meters?: number; currency?: string; phrases?: Record<string, string>; price_anchors?: Record<string, unknown>; tips?: string[] }
interface JourneyFact { id: string; trip_id: string; category: string; headline: string; body: string; music_url?: string; music_platform?: string; destinations?: string[]; is_active: boolean; sort_order?: number }

interface Props {
  trip: Trip
  days: Day[]
  events: Event[]
  contacts: Contact[]
  hotels: Hotel[]
  challenges: Challenge[]
  packing: PackingItem[]
  recs: Rec[]
  drops: PreTripDrop[]
  feedback: Feedback[]
  travelers: Traveler[]
  rwl: RWLItem[]
  haggle: HaggleTrigger[]
  facts: JourneyFact[]
  activeTab: string
}

const TABS = [
  { id: 'days',         label: 'Days' },
  { id: 'settings',     label: '✏️ Trip Info' },
  { id: 'events',       label: 'Events' },
  { id: 'travelers',    label: 'Travelers' },
  { id: 'contacts',     label: 'Contacts' },
  { id: 'hotels',       label: 'Hotels' },
  { id: 'hunt',         label: 'Hunt' },
  { id: 'haggle',       label: '🛒 Haggle' },
  { id: 'packing',      label: 'Packing' },
  { id: 'recs',         label: 'Recommendations' },
  { id: 'rwl',          label: '📚 Read · Watch · Listen' },
  { id: 'pretripdrops', label: 'Pre-Trip Drops' },
  { id: 'facts',        label: '💡 Journey Facts' },
  { id: 'feedback',     label: 'Feedback' },
  { id: 'health',       label: '🩺 Health' },
]

const ROLE_OPTIONS = ['driver', 'guide', 'fixer', 'restaurant_contact', 'other']
const EVENT_TYPES = ['restaurant', 'activity', 'transport', 'flight', 'hotel', 'experience', 'tour', 'transfer']
const CHALLENGE_TYPES = ['find', 'photo', 'taste', 'buy', 'ask', 'learn', 'grand_finale']
const LEG_OPTIONS = ['morocco', 'france']

// ── Bulk-select hook & bar ────────────────────────────────────────────────────

function useBulkSelect(ids: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggle = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])
  const toggleAll = useCallback(() => {
    setSelected(prev => prev.size === ids.length ? new Set() : new Set(ids))
  }, [ids])
  const clear = useCallback(() => setSelected(new Set()), [])
  const allSelected = ids.length > 0 && selected.size === ids.length
  const someSelected = selected.size > 0 && !allSelected
  return { selected, toggle, toggleAll, clear, allSelected, someSelected }
}

type BulkDeleteTable = Parameters<typeof bulkDeleteAction>[0]

function BulkDeleteBar({
  selected, total, table, label, onDone, onToggleAll,
}: {
  selected: Set<string>
  total: number
  table: BulkDeleteTable
  label: string
  onDone: () => void
  onToggleAll: () => void
}) {
  const [pending, startTransition] = useTransition()
  if (selected.size === 0) return null
  const allSelected = selected.size === total
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-navy/5 border border-navy/10 rounded-sm text-xs">
      <span className="text-navy font-medium">{selected.size} of {total} selected</span>
      <button type="button" onClick={onToggleAll} className="text-gold hover:underline">
        {allSelected ? 'Deselect all' : `Select all ${total}`}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Delete ${selected.size} ${label}${selected.size > 1 ? 's' : ''}? This cannot be undone.`)) return
          startTransition(async () => {
            await bulkDeleteAction(table, [...selected])
            onDone()
            window.location.reload()
          })
        }}
        className="ml-auto px-3 py-1 bg-red-600 text-white rounded-sm hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? 'Deleting…' : `Delete ${selected.size}`}
      </button>
    </div>
  )
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs uppercase tracking-widest text-ink-muted mb-1.5" style={{ letterSpacing: '0.14em' }}>{children}</span>
}

function Input({ name, defaultValue, placeholder, type = 'text', required }: {
  name: string; defaultValue?: string; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <input
      name={name}
      type={type}
      defaultValue={defaultValue || ''}
      placeholder={placeholder}
      required={required}
      className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
      style={{ background: '#faf8f4' }}
    />
  )
}

/** URL input paired with an Upload button. Use wherever an image URL is expected. */
function ImageUrlInput({ name, defaultValue, placeholder, folder = 'general' }: {
  name: string; defaultValue?: string; placeholder?: string; folder?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        name={name}
        type="url"
        defaultValue={defaultValue || ''}
        placeholder={placeholder || 'https://… or upload →'}
        className="flex-1 min-w-0 border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
        style={{ background: '#faf8f4' }}
      />
      <ImageUploadBtn targetInputName={name} folder={folder} />
    </div>
  )
}

function Textarea({ name, defaultValue, placeholder, rows = 3, required }: {
  name: string; defaultValue?: string; placeholder?: string; rows?: number; required?: boolean
}) {
  return (
    <textarea
      name={name}
      defaultValue={defaultValue || ''}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold resize-y"
      style={{ background: '#faf8f4' }}
    />
  )
}

function Select({ name, defaultValue, options }: { name: string; defaultValue?: string; options: string[] }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue || options[0]}
      className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
      style={{ background: '#faf8f4' }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function SaveBtn({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2 text-xs uppercase tracking-widest text-white transition-opacity hover:opacity-85 disabled:opacity-50 rounded-sm"
      style={{ background: '#1B2B4B', letterSpacing: '0.14em' }}
    >
      {pending ? 'Saving…' : 'Save'}
    </button>
  )
}

function DeleteBtn({ onClick, pending }: { onClick: () => void; pending: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="px-4 py-2 text-xs uppercase tracking-widest text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 rounded-sm"
      style={{ letterSpacing: '0.12em' }}
    >
      {pending ? '…' : 'Delete'}
    </button>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-sm px-6 py-5 space-y-4">
      {children}
    </div>
  )
}

function SectionHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-serif text-lg font-bold text-navy">{title}</h3>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85 transition-opacity"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add
        </button>
      )}
    </div>
  )
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

export default function AdminTripEditor({ trip, days, events, contacts, hotels, challenges, packing, recs, drops, feedback, travelers, rwl, haggle, facts, activeTab: initTab }: Props) {
  const [tab, setTab] = useState(initTab)

  return (
    <div>
      {/* Trip title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-navy">{trip.title}</h1>
        <p className="text-ink-muted text-sm mt-1">{trip.start_date} → {trip.end_date} · {days.length} days</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 mb-8 border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-3 text-xs uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 -mb-px"
            style={{
              letterSpacing: '0.14em',
              color: tab === t.id ? '#1B2B4B' : '#9ca3af',
              borderBottomColor: tab === t.id ? '#1B2B4B' : 'transparent',
              fontWeight: tab === t.id ? 700 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'days'          && <DaysTab         trip={trip} days={days} />}
      {tab === 'events'        && <EventsTab       trip={trip} days={days} events={events} />}
      {tab === 'travelers'     && <TravelersTab    trip={trip} travelers={travelers} />}
      {tab === 'contacts'      && <ContactsTab     trip={trip} contacts={contacts} />}
      {tab === 'hotels'        && <HotelsTab       trip={trip} hotels={hotels} />}
      {tab === 'hunt'          && <HuntTab         trip={trip} challenges={challenges} />}
      {tab === 'haggle'        && <HaggleTab       trip={trip} triggers={haggle} />}
      {tab === 'packing'       && <PackingTab      trip={trip} packing={packing} />}
      {tab === 'recs'          && <RecsTab         trip={trip} recs={recs} />}
      {tab === 'rwl'           && <RWLTab          trip={trip} items={rwl} />}
      {tab === 'pretripdrops'  && <PreTripDropsTab trip={trip} drops={drops} />}
      {tab === 'facts'         && <JourneyFactsTab trip={trip} facts={facts} />}
      {tab === 'feedback'      && <FeedbackTab     days={days} feedback={feedback} />}
      {tab === 'health'        && <ImageHealthTab  days={days} />}
      {tab === 'settings'      && <SettingsTab     trip={trip} />}
    </div>
  )
}

// ── Days Tab ─────────────────────────────────────────────────────────────────

/** Small inline thumbnail preview for a URL */
function ImagePreview({ url }: { url?: string }) {
  if (!url?.trim()) return null
  return (
    <div className="mt-2 rounded-sm overflow-hidden border border-gray-100" style={{ aspectRatio: '16/5', maxWidth: '320px' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="w-full h-full object-cover" />
    </div>
  )
}

const UNSPLASH_HINT = (
  <p className="text-xs text-ink-muted mb-2 leading-relaxed">
    Paste any direct image URL.{' '}
    <strong className="text-navy">Unsplash:</strong> right-click a photo → &ldquo;Copy Image Address&rdquo;.
    Or open a photo on unsplash.com, copy the hash from the URL, and use:{' '}
    <code className="text-xs bg-gray-100 px-1 rounded">https://images.unsplash.com/photo-HASH?w=1600&h=900&fit=crop&q=85</code>
  </p>
)

function DaysTab({ trip, days }: { trip: Trip; days: Day[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  // Track live preview URLs for each day's image slots
  const [previews, setPreviews] = useState<Record<string, { h1?: string; h2?: string; h3?: string; h4?: string; footer?: string }>>({})

  function handleSave(dayId: string, field: string, value: string) {
    startTransition(async () => {
      await updateDayFieldAction(dayId, field, value, trip.id)
      setSaved(s => ({ ...s, [dayId]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [dayId]: false })), 2000)
    })
  }

  function updatePreview(dayId: string, slot: 'h1' | 'h2' | 'h3' | 'h4' | 'footer', value: string) {
    setPreviews(p => ({ ...p, [dayId]: { ...p[dayId], [slot]: value } }))
  }

  return (
    <div className="space-y-3">
      {days.map(day => {
        const dayPreviews = previews[day.id] || {}
        return (
          <div key={day.id} data-day={day.id} className="bg-white border border-gray-100 rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === day.id ? null : day.id)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-gold uppercase tracking-widest" style={{ letterSpacing: '0.16em', minWidth: '48px' }}>
                  Day {day.day_number}
                </span>
                <span className="font-serif font-bold text-navy text-sm">{day.title}</span>
                <span className="text-xs text-ink-muted">{day.location || day.region}</span>
                {(day.hero_image_url || day.hero_image_url_2) && (
                  <span className="text-xs px-2 py-0.5 rounded-sm" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>📷 curator</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {saved[day.id] && <span className="text-xs text-green-600">Saved ✓</span>}
                <a
                  href={`/trip/${trip.web_slug}/day/${day.day_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-xs text-gold hover:opacity-75"
                >
                  View →
                </a>
                <span
                  className="text-xs border border-gray-200 px-3 py-1 rounded-sm text-ink-muted group-hover:border-navy group-hover:text-navy transition-colors"
                  style={{ letterSpacing: '0.08em' }}
                >
                  {expanded === day.id ? 'Close' : 'Edit ↓'}
                </span>
              </div>
            </button>

            {expanded === day.id && (
              <div className="border-t border-gray-100 px-6 py-6 space-y-6">

                {/* Day Title */}
                <div>
                  <Label>Day Title</Label>
                  <input
                    name="title"
                    type="text"
                    defaultValue={day.title}
                    placeholder="e.g. Arrival in Seville"
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
                    style={{ background: '#faf8f4' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.querySelector(`[data-day="${day.id}"] input[name="title"]`) as HTMLInputElement
                      handleSave(day.id, 'title', el?.value || '')
                    }}
                    className="mt-2 text-xs uppercase tracking-widest px-4 py-1.5 text-white rounded-sm"
                    style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
                  >
                    {pending ? 'Saving…' : 'Save Title'}
                  </button>
                </div>

                {/* Morning Brief */}
                <div>
                  <Label>Morning Brief</Label>
                  <Textarea name="morning_brief" defaultValue={day.morning_brief} placeholder="What travelers need to know this morning…" rows={4} />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.querySelector(`[data-day="${day.id}"] textarea[name="morning_brief"]`) as HTMLTextAreaElement
                      handleSave(day.id, 'morning_brief', el?.value || '')
                    }}
                    className="mt-2 text-xs uppercase tracking-widest px-4 py-1.5 text-white rounded-sm"
                    style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
                  >
                    {pending ? 'Saving…' : 'Save Brief'}
                  </button>
                </div>

                {/* WOW Moment */}
                <div>
                  <Label>WOW Moment</Label>
                  <Textarea name="wow_moment" defaultValue={day.wow_moment} placeholder="The headline moment for this day…" rows={2} />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.querySelector(`[data-day="${day.id}"] textarea[name="wow_moment"]`) as HTMLTextAreaElement
                      handleSave(day.id, 'wow_moment', el?.value || '')
                    }}
                    className="mt-2 text-xs uppercase tracking-widest px-4 py-1.5 text-white rounded-sm"
                    style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
                  >
                    {pending ? 'Saving…' : 'Save WOW'}
                  </button>
                </div>

                {/* ── Hero Images (cycling pool) ── */}
                <div className="space-y-4">
                  <div>
                    <p className="block text-xs font-semibold uppercase tracking-widest text-navy mb-1" style={{ letterSpacing: '0.14em' }}>Hero Images (Cycling Pool)</p>
                    {UNSPLASH_HINT}
                    <p className="text-xs text-ink-muted mb-3">
                      Add up to 4 images — the page will cycle through them. If all are blank, the auto Unsplash pool is used instead.
                      A <strong className="text-navy">📷 curator</strong> badge on the row header means images are set.
                    </p>
                  </div>

                  {/* Image slot 1 */}
                  {(['hero_image_url', 'hero_image_url_2', 'hero_image_url_3', 'hero_image_url_4'] as const).map((field, idx) => {
                    const slotKey = (['h1', 'h2', 'h3', 'h4'] as const)[idx]
                    const currentVal = day[field] || ''
                    const previewUrl = dayPreviews[slotKey] !== undefined ? dayPreviews[slotKey] : currentVal
                    const inputId = `day-${day.id}-${field}`
                    return (
                      <div key={field} className="flex gap-3 items-start">
                        <div className="flex-1 space-y-1.5">
                          <Label>Image {idx + 1}{idx === 0 ? ' (primary)' : ''}</Label>
                          <div className="flex items-center gap-2">
                            <input
                              id={inputId}
                              name={field}
                              type="url"
                              defaultValue={currentVal}
                              placeholder="https://images.unsplash.com/photo-HASH?w=1600&h=900&fit=crop&q=85"
                              className="flex-1 min-w-0 border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
                              style={{ background: '#faf8f4' }}
                              onChange={e => updatePreview(day.id, slotKey, e.target.value)}
                            />
                            <ImageUploadBtn
                              targetInputName={field}
                              targetInputId={inputId}
                              folder="trip-media"
                              onUploaded={url => {
                                updatePreview(day.id, slotKey, url)
                                handleSave(day.id, field, url)
                              }}
                            />
                          </div>
                          <ImagePreview url={previewUrl} />
                        </div>
                        <div className="pt-6 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.querySelector(`[data-day="${day.id}"] input[name="${field}"]`) as HTMLInputElement
                              handleSave(day.id, field, el?.value || '')
                            }}
                            className="text-xs uppercase tracking-widest px-3 py-1.5 text-white rounded-sm whitespace-nowrap"
                            style={{ background: '#1B2B4B', letterSpacing: '0.10em' }}
                          >
                            {pending ? '…' : 'Save'}
                          </button>
                          {currentVal && (
                            <button
                              type="button"
                              onClick={() => {
                                handleSave(day.id, field, '')
                                updatePreview(day.id, slotKey, '')
                              }}
                              className="text-xs text-red-400 hover:text-red-600 px-3 py-1 border border-red-100 rounded-sm"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ── Footer Image ── */}
                <div>
                  <Label>Footer Image</Label>
                  <p className="text-xs text-ink-muted mb-2">
                    Overrides the featured photo in the full-bleed footer section at the bottom of the day page.
                    Leave blank to use the auto Unsplash pool with the thumbnail strip.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      id={`day-${day.id}-footer_image_url`}
                      name="footer_image_url"
                      type="url"
                      defaultValue={day.footer_image_url || ''}
                      placeholder="https://images.unsplash.com/photo-HASH?w=2400&h=900&fit=crop&q=85"
                      className="flex-1 min-w-0 border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
                      style={{ background: '#faf8f4' }}
                      onChange={e => updatePreview(day.id, 'footer', e.target.value)}
                    />
                    <ImageUploadBtn
                      targetInputName="footer_image_url"
                      targetInputId={`day-${day.id}-footer_image_url`}
                      folder="trip-media"
                      onUploaded={url => {
                        updatePreview(day.id, 'footer', url)
                        handleSave(day.id, 'footer_image_url', url)
                      }}
                    />
                  </div>
                  <ImagePreview url={dayPreviews.footer !== undefined ? dayPreviews.footer : (day.footer_image_url || '')} />
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.querySelector(`[data-day="${day.id}"] input[name="footer_image_url"]`) as HTMLInputElement
                        handleSave(day.id, 'footer_image_url', el?.value || '')
                      }}
                      className="text-xs uppercase tracking-widest px-4 py-1.5 text-white rounded-sm"
                      style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
                    >
                      {pending ? 'Saving…' : 'Save Footer'}
                    </button>
                    {day.footer_image_url && (
                      <button
                        type="button"
                        onClick={() => { handleSave(day.id, 'footer_image_url', ''); updatePreview(day.id, 'footer', '') }}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* ── GPX Route URL ── */}
                <div>
                  <Label>GPX Route URL</Label>
                  <p className="text-xs text-ink-muted mb-2">
                    Optional — upload a <code className="text-xs bg-gray-100 px-1 rounded">.gpx</code> file to Supabase Storage
                    and paste the public URL here. The app renders it as a route overlay on the day map.
                    Leave blank for days without a walking/driving route.
                  </p>
                  <input
                    name="gpx_url"
                    type="url"
                    defaultValue={day.gpx_url || ''}
                    placeholder="https://…supabase.co/storage/v1/object/public/joie-media/…/day-1.gpx"
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
                    style={{ background: '#faf8f4' }}
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.querySelector(`[data-day="${day.id}"] input[name="gpx_url"]`) as HTMLInputElement
                        handleSave(day.id, 'gpx_url', el?.value || '')
                      }}
                      className="text-xs uppercase tracking-widest px-4 py-1.5 text-white rounded-sm"
                      style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
                    >
                      {pending ? 'Saving…' : 'Save GPX URL'}
                    </button>
                    {day.gpx_url && (
                      <button
                        type="button"
                        onClick={() => handleSave(day.id, 'gpx_url', '')}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Clear
                      </button>
                    )}
                    {day.gpx_url && (
                      <a href={day.gpx_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:opacity-75">
                        View file →
                      </a>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Travelers Tab ─────────────────────────────────────────────────────────────

const PILLOW_OPTIONS = ['', 'soft', 'medium', 'firm', 'extra-firm']
const CURTAINS_OPTIONS = ['', 'open', 'closed', 'partial']

function TravelersTab({ trip, travelers }: { trip: Trip; travelers: Traveler[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">{travelers.length} traveler{travelers.length !== 1 ? 's' : ''} on this trip.</p>
          <p className="text-xs text-ink-muted mt-0.5">Profiles are reusable across trips. Preferences power hotel preference emails and per-person packing.</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add Traveler
        </button>
      </div>

      {travelers.length === 0 && !adding && (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-sm">
          <p className="text-sm text-ink-muted mb-2">No travelers linked to this trip yet.</p>
          <p className="text-xs text-ink-muted">Run the migration in Supabase first, then add travelers above.</p>
        </div>
      )}

      {adding && (
        <Card>
          <SectionHeader title="New Traveler" />
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertTravelerAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-4"
          >
            <input type="hidden" name="trip_id" value={trip.id} />

            {/* Identity */}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name *</Label><Input name="name" required placeholder="e.g. Kristi Hamid" /></div>
              <div><Label>Traveler Key</Label><Input name="traveler_key" placeholder="kristi (used for packing/persona)" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Email</Label><Input name="email" type="email" placeholder="kristi@example.com" /></div>
              <div><Label>Phone</Label><Input name="phone" placeholder="+1 555 000 0000" /></div>
              <div><Label>Partner / Spouse Name</Label><Input name="partner_name" placeholder="e.g. Omar" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Age</Label><Input name="age" type="number" placeholder="42" /></div>
              <div><Label>Languages</Label><Input name="languages" placeholder="English (native), French (basic)" /></div>
            </div>

            {/* Hospitality */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-navy uppercase tracking-widest mb-3" style={{ letterSpacing: '0.12em' }}>Hotel Preferences</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Pillow Firmness</Label>
                  <select name="pillow_firmness" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold" style={{ background: '#faf8f4' }}>
                    {PILLOW_OPTIONS.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Curtains on Arrival</Label>
                  <select name="curtains_preference" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold" style={{ background: '#faf8f4' }}>
                    {CURTAINS_OPTIONS.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                  </select>
                </div>
                <div><Label>Coffee Order</Label><Input name="coffee_order" placeholder="Black, no sugar" /></div>
              </div>
            </div>

            {/* Food & drink */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-navy uppercase tracking-widest mb-3" style={{ letterSpacing: '0.12em' }}>Food & Drink</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Allergies</Label><Input name="allergies" placeholder="Shellfish, tree nuts…" /></div>
                <div><Label>Dietary Notes</Label><Input name="dietary_notes" placeholder="Vegetarian-curious, no pork…" /></div>
              </div>
              <div className="mt-3"><Label>Wine & Drink Preferences</Label><Textarea name="wine_preferences" placeholder="Prefers red Burgundy, dry whites. Enjoys local aperitifs." rows={2} /></div>
            </div>

            {/* Personality */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-navy uppercase tracking-widest mb-3" style={{ letterSpacing: '0.12em' }}>Personality & Travel Style</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Travel Style</Label><Input name="travel_style" placeholder="Slow explorer, needs downtime each afternoon" /></div>
                <div><Label>Personality / Framing</Label><Input name="personality" placeholder="The planner. Needs the 'why'." /></div>
              </div>
              <div className="mt-3"><Label>Interests & Passions</Label><Textarea name="interests" placeholder="Architecture, local markets, food culture, photography…" rows={2} /></div>
              <div className="mt-3"><Label>Preferred Activities</Label><Textarea name="activities" placeholder="Loves walking tours. Avoids extreme heat." rows={2} /></div>
            </div>

            {/* Personal */}
            <div className="pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Anniversary Date</Label><Input name="anniversary_date" type="date" /></div>
                <div><Label>Bucket List (this trip)</Label><Input name="bucket_list" placeholder="See the sunrise at the Alhambra" /></div>
              </div>
              <div className="mt-3"><Label>Mobility Notes</Label><Textarea name="mobility_notes" placeholder="Prefers flat routes, no cobblestones…" rows={2} /></div>
              <div className="mt-3"><Label>Curator Notes</Label><Textarea name="notes" placeholder="Any private notes for this traveler…" rows={2} /></div>
            </div>

            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted hover:text-navy">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {travelers.map(t => <TravelerRow key={t.id} traveler={t} tripId={trip.id} />)}
    </div>
  )
}

function TravelerRow({ traveler, tripId }: { traveler: Traveler; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <p className="font-serif font-bold text-navy text-base">{traveler.full_name}</p>
              {traveler.traveler_key && (
                <span className="text-xs px-2 py-0.5 rounded-sm font-mono" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>
                  {traveler.traveler_key}
                </span>
              )}
              {traveler.partner_name && (
                <span className="text-xs text-ink-muted">+ {traveler.partner_name}</span>
              )}
            </div>
            {/* Contact */}
            <div className="flex flex-wrap gap-4 text-xs text-ink-muted mb-3">
              {traveler.email && <span>✉ {traveler.email}</span>}
              {traveler.phone && <span>📞 {traveler.phone}</span>}
              {traveler.languages && <span>🗣 {traveler.languages}</span>}
            </div>
            {/* Hospitality preferences */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-1.5 text-xs mb-2">
              {traveler.pillow_firmness && (
                <div><span className="text-ink-muted">Pillow:</span> <strong className="text-navy">{traveler.pillow_firmness}</strong></div>
              )}
              {traveler.coffee_order && (
                <div><span className="text-ink-muted">Coffee:</span> <strong className="text-navy">{traveler.coffee_order}</strong></div>
              )}
              {traveler.curtains_arrival && (
                <div><span className="text-ink-muted">Curtains:</span> <strong className="text-navy">{traveler.curtains_arrival}</strong></div>
              )}
              {traveler.anniversary_date && (
                <div><span className="text-ink-muted">Anniversary:</span> <strong className="text-navy">{traveler.anniversary_date}</strong></div>
              )}
              {traveler.travel_style && (
                <div><span className="text-ink-muted">Style:</span> <strong className="text-navy">{traveler.travel_style}</strong></div>
              )}
            </div>
            {/* Dietary / allergies */}
            {traveler.allergies && (
              <p className="text-xs text-red-500 mt-1">⚠ Allergies: {traveler.allergies}</p>
            )}
            {traveler.dietary_notes && (
              <p className="text-xs text-ink-muted mt-1">🥗 {traveler.dietary_notes}</p>
            )}
            {traveler.wine_preferences && (
              <p className="text-xs text-ink-muted mt-0.5">🍷 {traveler.wine_preferences}</p>
            )}
            {traveler.interests && (
              <p className="text-xs text-ink-muted mt-0.5">✦ {traveler.interests}</p>
            )}
            {traveler.activities && (
              <p className="text-xs text-ink-muted mt-0.5">🎯 {traveler.activities}</p>
            )}
            {traveler.mobility_notes && (
              <p className="text-xs text-ink-muted mt-0.5">🚶 {traveler.mobility_notes}</p>
            )}
            {traveler.personality && (
              <p className="text-xs text-ink-muted mt-0.5 italic">&ldquo;{traveler.personality}&rdquo;</p>
            )}
            {traveler.notes && (
              <p className="text-xs text-ink-muted mt-1 border-l-2 border-gray-200 pl-2">{traveler.notes}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm(`Remove ${traveler.full_name} from this trip? Their profile will be kept for future trips.`)) {
                  await deleteTravelerAction(traveler.id, tripId)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', traveler.id)
            fd.set('trip_id', tripId)
            await upsertTravelerAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={traveler.id} />
          <input type="hidden" name="trip_id" value={tripId} />

          {/* Identity */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Full Name *</Label><Input name="name" defaultValue={traveler.full_name} required /></div>
            <div><Label>Traveler Key</Label><Input name="traveler_key" defaultValue={traveler.traveler_key} placeholder="e.g. kristi" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Email</Label><Input name="email" type="email" defaultValue={traveler.email} /></div>
            <div><Label>Phone</Label><Input name="phone" defaultValue={traveler.phone} /></div>
            <div><Label>Partner / Spouse</Label><Input name="partner_name" defaultValue={traveler.partner_name} placeholder="e.g. Omar" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Age</Label><Input name="age" type="number" defaultValue={traveler.age?.toString()} placeholder="e.g. 42" /></div>
            <div><Label>Languages</Label><Input name="languages" defaultValue={traveler.languages} placeholder="English (native), French (basic)" /></div>
          </div>

          {/* Hospitality */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-navy uppercase tracking-widest mb-3" style={{ letterSpacing: '0.12em' }}>Hotel Preferences</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Pillow Firmness</Label>
                <select name="pillow_firmness" defaultValue={traveler.pillow_firmness || ''} className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold" style={{ background: '#faf8f4' }}>
                  {PILLOW_OPTIONS.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                </select>
              </div>
              <div>
                <Label>Curtains on Arrival</Label>
                <select name="curtains_preference" defaultValue={traveler.curtains_arrival || ''} className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold" style={{ background: '#faf8f4' }}>
                  {CURTAINS_OPTIONS.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                </select>
              </div>
              <div><Label>Coffee Order</Label><Input name="coffee_order" defaultValue={traveler.coffee_order} placeholder="Black, no sugar" /></div>
            </div>
          </div>

          {/* Dietary */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-navy uppercase tracking-widest mb-3" style={{ letterSpacing: '0.12em' }}>Food & Drink</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Allergies</Label><Input name="allergies" defaultValue={traveler.allergies} placeholder="Shellfish, tree nuts…" /></div>
              <div><Label>Dietary Notes</Label><Input name="dietary_notes" defaultValue={traveler.dietary_notes} placeholder="Vegetarian-curious, no pork…" /></div>
            </div>
            <div className="mt-3"><Label>Wine & Drink Preferences</Label><Textarea name="wine_preferences" defaultValue={traveler.wine_preferences} placeholder="Prefers red Burgundy, dry whites. Enjoys local aperitifs. Doesn't drink spirits." rows={2} /></div>
          </div>

          {/* Personality & Travel */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-navy uppercase tracking-widest mb-3" style={{ letterSpacing: '0.12em' }}>Personality & Travel Style</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Travel Style</Label><Input name="travel_style" defaultValue={traveler.travel_style} placeholder="Slow explorer, needs downtime each afternoon" /></div>
              <div><Label>Personality / Framing</Label><Input name="personality" defaultValue={traveler.personality} placeholder="The planner. Needs the 'why' before the 'what'." /></div>
            </div>
            <div className="mt-3"><Label>Interests & Passions</Label><Textarea name="interests" defaultValue={traveler.interests} placeholder="Architecture, Moorish history, photography, local markets, contemporary art…" rows={2} /></div>
            <div className="mt-3"><Label>Preferred Activities</Label><Textarea name="activities" defaultValue={traveler.activities} placeholder="Loves walking tours and cooking classes. Avoids extreme heat, no extreme sports." rows={2} /></div>
            <div className="mt-3"><Label>Music Preferences</Label><Input name="music_preferences" defaultValue={traveler.music_preferences} placeholder="Jazz, flamenco, ambient. Dislikes EDM." /></div>
          </div>

          {/* Dates & notes */}
          <div className="pt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Anniversary Date</Label><Input name="anniversary_date" type="date" defaultValue={traveler.anniversary_date?.split('T')[0]} /></div>
              <div><Label>Bucket List (this trip)</Label><Input name="bucket_list" defaultValue={traveler.bucket_list} placeholder="See the sunrise at the Alhambra" /></div>
            </div>
            <div className="mt-3"><Label>Mobility Notes</Label><Textarea name="mobility_notes" defaultValue={traveler.mobility_notes} placeholder="Prefers flat routes, no cobblestones…" rows={2} /></div>
            <div className="mt-3"><Label>Curator Notes</Label><Textarea name="notes" defaultValue={traveler.notes} placeholder="Any private notes for this traveler…" rows={2} /></div>
          </div>

          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted hover:text-navy">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Events Tab ───────────────────────────────────────────────────────────────

function EventsTab({ trip, days, events }: { trip: Trip; days: Day[]; events: Event[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()

  // Group events by day
  const byDay = days.map(d => ({
    day: d,
    events: events.filter(e => e.day_id === d.id),
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add Event
        </button>
      </div>

      {adding && (
        <Card>
          <SectionHeader title="New Event" />
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertEventAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-4"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Day</Label>
                <select name="day_id" required className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                  {days.map(d => <option key={d.id} value={d.id}>Day {d.day_number} — {d.title}</option>)}
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <Select name="type" options={EVENT_TYPES} />
              </div>
            </div>
            <div><Label>Title *</Label><Input name="title" required placeholder="e.g. Dinner at Le Cabestan" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Time</Label><Input name="time_start" placeholder="19:30" /></div>
              <div><Label>Confirmation #</Label><Input name="confirmation" placeholder="ABC123" /></div>
            </div>
            <div><Label>Address</Label><Input name="address" placeholder="Full address" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input name="phone" placeholder="+212 522-000-000" /></div>
              <div><Label>Booking URL</Label><Input name="booking_url" placeholder="https://…" /></div>
            </div>
            <div><Label>Notes</Label><Textarea name="notes" placeholder="Any important notes for travelers…" /></div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted hover:text-navy">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {byDay.map(({ day, events: dayEvents }) => (
        <div key={day.id}>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest" style={{ letterSpacing: '0.16em' }}>Day {day.day_number}</span>
            <span className="text-sm font-semibold text-navy">{day.title}</span>
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-xs text-ink-muted">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</span>
          </div>
          {dayEvents.length === 0 && (
            <p className="text-xs text-ink-muted italic pl-2 mb-4">No events for this day.</p>
          )}
          <div className="space-y-3">
            {dayEvents.map(ev => (
              <EventRow key={ev.id} event={ev} tripId={trip.id} days={days} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventRow({ event, tripId, days }: { event: Event; tripId: string; days: Day[] }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', letterSpacing: '0.1em' }}>{event.type}</span>
              {event.time_start && <span className="text-xs text-ink-muted">{event.time_start}</span>}
              {event.confirmation && <span className="text-xs font-mono text-navy bg-gray-50 px-2 py-0.5 rounded-sm">{event.confirmation}</span>}
            </div>
            <p className="font-semibold text-navy text-sm">{event.title}</p>
            {event.address && <p className="text-xs text-ink-muted mt-0.5">{event.address}</p>}
            {event.phone && <p className="text-xs text-ink-muted">{event.phone}</p>}
            {event.notes && <p className="text-xs text-ink-muted mt-1 italic">{event.notes}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this event?')) {
                  await deleteEventAction(event.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', event.id)
            fd.set('trip_id', tripId)
            await upsertEventAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Day</Label>
              <select name="day_id" defaultValue={event.day_id} className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                {days.map(d => <option key={d.id} value={d.id}>Day {d.day_number} — {d.title}</option>)}
              </select>
            </div>
            <div><Label>Type</Label><Select name="type" defaultValue={event.type} options={EVENT_TYPES} /></div>
          </div>
          <div><Label>Title *</Label><Input name="title" defaultValue={event.title} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Time</Label><Input name="time_start" defaultValue={event.time_start} /></div>
            <div><Label>Confirmation #</Label><Input name="confirmation" defaultValue={event.confirmation} /></div>
          </div>
          <div><Label>Address</Label><Input name="address" defaultValue={event.address} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Phone</Label><Input name="phone" defaultValue={event.phone} /></div>
            <div><Label>Booking URL</Label><Input name="booking_url" defaultValue={event.booking_url} /></div>
          </div>
          <div><Label>Notes</Label><Textarea name="notes" defaultValue={event.notes} /></div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted hover:text-navy">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Contacts Tab ─────────────────────────────────────────────────────────────

function ContactsTab({ trip, contacts }: { trip: Trip; contacts: Contact[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const bulk = useBulkSelect(contacts.map(c => c.id))

  return (
    <div className="space-y-4">
      <SectionHeader title={`Who to Call (${contacts.length})`} onAdd={() => setAdding(true)} />
      <BulkDeleteBar selected={bulk.selected} total={contacts.length} table="local_contacts" label="contact" onDone={bulk.clear} onToggleAll={bulk.toggleAll} />

      {adding && (
        <Card>
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertContactAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input name="name" required placeholder="Full name" /></div>
              <div><Label>Phone *</Label><Input name="phone" required placeholder="+212 600-000-000" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Role</Label><Select name="role" options={ROLE_OPTIONS} /></div>
              <div><Label>Destination / City</Label><Input name="destination" required placeholder="Casablanca" /></div>
            </div>
            <div><Label>Specialty</Label><Input name="specialty" placeholder="Airport transfers, Medina, Rabat run" /></div>
            <div><Label>Intro Note</Label><Textarea name="intro_note" placeholder="Brief note for travelers about who this person is…" rows={2} /></div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {contacts.length === 0 && !adding && (
        <p className="text-sm text-ink-muted italic">No contacts yet. Add real contacts above — placeholder data has been removed.</p>
      )}

      {contacts.map(c => (
        <div key={c.id} className="flex items-start gap-2">
          <input type="checkbox" checked={bulk.selected.has(c.id)} onChange={() => bulk.toggle(c.id)} className="mt-3 shrink-0 accent-navy cursor-pointer" />
          <div className="flex-1 min-w-0"><ContactRow contact={c} tripId={trip.id} /></div>
        </div>
      ))}
    </div>
  )
}

function ContactRow({ contact, tripId }: { contact: Contact; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const roleColors: Record<string, string> = {
    driver: '#1B2B4B', guide: '#0d9488', fixer: '#7c3aed',
    restaurant_contact: '#b45309', other: '#6b7280',
  }
  const roleColor = roleColors[contact.role] || '#6b7280'

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: roleColor, letterSpacing: '0.14em' }}>{contact.role}</span>
              <span className="text-xs text-ink-muted">· {contact.destination}</span>
            </div>
            <p className="font-serif font-bold text-navy">{contact.name}</p>
            <p className="text-sm text-ink-muted">{contact.phone}</p>
            {contact.specialty && <p className="text-xs text-ink-muted mt-0.5 italic">{contact.specialty}</p>}
            {contact.intro_note && <p className="text-xs text-ink mt-1" style={{ color: '#555' }}>{contact.intro_note}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this contact?')) {
                  await deleteContactAction(contact.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', contact.id)
            fd.set('trip_id', tripId)
            await upsertContactAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={contact.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name *</Label><Input name="name" defaultValue={contact.name} required /></div>
            <div><Label>Phone *</Label><Input name="phone" defaultValue={contact.phone} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Role</Label><Select name="role" defaultValue={contact.role} options={ROLE_OPTIONS} /></div>
            <div><Label>Destination</Label><Input name="destination" defaultValue={contact.destination} required /></div>
          </div>
          <div><Label>Specialty</Label><Input name="specialty" defaultValue={contact.specialty} /></div>
          <div><Label>Intro Note</Label><Textarea name="intro_note" defaultValue={contact.intro_note} rows={2} /></div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Hotels Tab ───────────────────────────────────────────────────────────────

function HotelsTab({ trip, hotels }: { trip: Trip; hotels: Hotel[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const bulk = useBulkSelect(hotels.map(h => h.id))

  return (
    <div className="space-y-4">
      <SectionHeader title={`Hotels (${hotels.length})`} onAdd={() => setAdding(true)} />
      <BulkDeleteBar selected={bulk.selected} total={hotels.length} table="reference_items" label="hotel" onDone={bulk.clear} onToggleAll={bulk.toggleAll} />

      {adding && (
        <Card>
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertHotelAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div><Label>Hotel Name *</Label><Input name="name" required placeholder="Villa Sahrai" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Check-in</Label><Input name="check_in" type="date" /></div>
              <div><Label>Check-out</Label><Input name="check_out" type="date" /></div>
            </div>
            <div><Label>Confirmation #</Label><Input name="confirmation" placeholder="ABC-123456" /></div>
            <div><Label>Address</Label><Input name="address" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input name="phone" /></div>
              <div><Label>Website</Label><Input name="website" placeholder="https://…" /></div>
            </div>
            <div><Label>Notes</Label><Textarea name="notes" /></div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {hotels.map(h => (
        <div key={h.id} className="flex items-start gap-2">
          <input type="checkbox" checked={bulk.selected.has(h.id)} onChange={() => bulk.toggle(h.id)} className="mt-3 shrink-0 accent-navy cursor-pointer" />
          <div className="flex-1 min-w-0"><HotelRow hotel={h} tripId={trip.id} /></div>
        </div>
      ))}
    </div>
  )
}

function HotelRow({ hotel, tripId }: { hotel: Hotel; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-serif font-bold text-navy text-lg">{hotel.name}</p>
            <div className="flex gap-6 mt-1">
              {hotel.check_in && <span className="text-xs text-ink-muted">Check-in: <strong className="text-navy">{hotel.check_in}</strong></span>}
              {hotel.check_out && <span className="text-xs text-ink-muted">Check-out: <strong className="text-navy">{hotel.check_out}</strong></span>}
            </div>
            {hotel.confirmation && <p className="text-xs font-mono text-navy mt-1 bg-gray-50 inline-block px-2 py-0.5 rounded-sm">{hotel.confirmation}</p>}
            {hotel.address && <p className="text-xs text-ink-muted mt-1">{hotel.address}</p>}
            {hotel.phone && <p className="text-xs text-ink-muted">{hotel.phone}</p>}
            {hotel.website && <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:opacity-75">{hotel.website}</a>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this hotel?')) {
                  await deleteHotelAction(hotel.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', hotel.id)
            fd.set('trip_id', tripId)
            await upsertHotelAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={hotel.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div><Label>Hotel Name *</Label><Input name="name" defaultValue={hotel.name} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Check-in</Label><Input name="check_in" type="date" defaultValue={hotel.check_in?.split('T')[0]} /></div>
            <div><Label>Check-out</Label><Input name="check_out" type="date" defaultValue={hotel.check_out?.split('T')[0]} /></div>
          </div>
          <div><Label>Confirmation #</Label><Input name="confirmation" defaultValue={hotel.confirmation} /></div>
          <div><Label>Address</Label><Input name="address" defaultValue={hotel.address} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Phone</Label><Input name="phone" defaultValue={hotel.phone} /></div>
            <div><Label>Website</Label><Input name="website" defaultValue={hotel.website} /></div>
          </div>
          <div><Label>Notes</Label><Textarea name="notes" defaultValue={hotel.notes} /></div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Hunt Tab ─────────────────────────────────────────────────────────────────

function HuntTab({ trip, challenges }: { trip: Trip; challenges: Challenge[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const totalPts = challenges.reduce((s, c) => s + (c.points || 0), 0)
  const bulk = useBulkSelect(challenges.map(c => c.id))

  return (
    <div className="space-y-4">
      <SectionHeader title={`Hunt Challenges (${challenges.length} · ${totalPts} pts total)`} onAdd={() => setAdding(true)} />
      <BulkDeleteBar selected={bulk.selected} total={challenges.length} table="hunt_challenges" label="challenge" onDone={bulk.clear} onToggleAll={bulk.toggleAll} />

      {adding && (
        <Card>
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertChallengeWithCoordsAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-4 gap-3">
              <div><Label>Day #</Label><Input name="day_number" placeholder="e.g. 3" /></div>
              <div><Label>Points</Label><Input name="points" defaultValue="10" /></div>
              <div><Label>Type</Label><Select name="challenge_type" options={CHALLENGE_TYPES} /></div>
              <div><Label>Leg</Label><Select name="leg" options={LEG_OPTIONS} /></div>
            </div>
            <div><Label>Title *</Label><Input name="title" required placeholder="Find the Blue Door" /></div>
            <div><Label>Description *</Label><Textarea name="description" required placeholder="Full challenge text shown to travelers…" rows={3} /></div>
            <div><Label>Transliteration (optional)</Label><Input name="transliteration" placeholder="Arabic/French pronunciation guide…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Longitude</Label><Input name="coord_lon" placeholder="-7.6114 (lon first)" /></div>
              <div><Label>Latitude</Label><Input name="coord_lat" placeholder="33.5892" /></div>
            </div>
            <p className="text-xs text-ink-muted -mt-1">Get from Google Maps or latlong.net — longitude is the negative number for Morocco (e.g. -7.6114), latitude is positive (e.g. 33.5892).</p>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {challenges.map(c => (
        <div key={c.id} className="flex items-start gap-2">
          <input type="checkbox" checked={bulk.selected.has(c.id)} onChange={() => bulk.toggle(c.id)} className="mt-3 shrink-0 accent-navy cursor-pointer" />
          <div className="flex-1 min-w-0"><ChallengeRow challenge={c} tripId={trip.id} /></div>
        </div>
      ))}
    </div>
  )
}

function ChallengeRow({ challenge, tripId }: { challenge: Challenge; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {challenge.day_number && <span className="text-xs text-gold font-semibold">Day {challenge.day_number}</span>}
              <span className="text-xs text-ink-muted uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>{challenge.challenge_type}</span>
              <span className="text-xs font-mono text-navy">{challenge.points} pts</span>
            </div>
            <p className="font-semibold text-navy text-sm">{challenge.title}</p>
            <p className="text-xs text-ink-muted mt-1 line-clamp-2">{challenge.description}</p>
            {challenge.transliteration && <p className="text-xs text-gold mt-0.5 italic">{challenge.transliteration}</p>}
            {challenge.coordinates
              ? <p className="text-xs text-green-600 mt-0.5">📍 {challenge.coordinates}</p>
              : <p className="text-xs text-amber-500 mt-0.5">⚠️ No coordinates set — pin will not appear on map</p>
            }
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this challenge?')) {
                  await deleteChallengeAction(challenge.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', challenge.id)
            fd.set('trip_id', tripId)
            await upsertChallengeWithCoordsAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={challenge.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-4 gap-3">
            <div><Label>Day #</Label><Input name="day_number" defaultValue={String(challenge.day_number || '')} /></div>
            <div><Label>Points</Label><Input name="points" defaultValue={String(challenge.points)} /></div>
            <div><Label>Type</Label><Select name="challenge_type" defaultValue={challenge.challenge_type} options={CHALLENGE_TYPES} /></div>
            <div><Label>Leg</Label><Select name="leg" defaultValue={challenge.leg || 'morocco'} options={LEG_OPTIONS} /></div>
          </div>
          <div><Label>Title *</Label><Input name="title" defaultValue={challenge.title} required /></div>
          <div><Label>Description *</Label><Textarea name="description" defaultValue={challenge.description} required rows={3} /></div>
          <div><Label>Transliteration</Label><Input name="transliteration" defaultValue={challenge.transliteration} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Longitude</Label>
              <Input
                name="coord_lon"
                defaultValue={challenge.coordinates ? challenge.coordinates.replace(/^\(([^,]+),.+\)$/, '$1') : ''}
                placeholder="-7.6114"
              />
            </div>
            <div>
              <Label>Latitude</Label>
              <Input
                name="coord_lat"
                defaultValue={challenge.coordinates ? challenge.coordinates.replace(/^\([^,]+,([^)]+)\)$/, '$1') : ''}
                placeholder="33.5892"
              />
            </div>
          </div>
          <p className="text-xs text-ink-muted -mt-1">Longitude first (negative for Morocco), then latitude. Get from Google Maps or latlong.net.</p>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Packing Tab ───────────────────────────────────────────────────────────────

const PACKING_CATEGORIES = ['Clothing', 'Cycling Gear', 'Evening Wear', 'Footwear', 'Toiletries', 'Documents', 'Tech', 'Health', 'Other']
const TRAVELER_KEYS = ['all', 'omar', 'kristi', 'todd', 'erica']
const SEGMENTS = ['', 'cycling', 'evening', 'beach', 'city', 'all']

function PackingTab({ trip, packing }: { trip: Trip; packing: PackingItem[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const bulk = useBulkSelect(packing.map(p => p.id))

  const byCategory = packing.reduce((acc, item) => {
    const cat = item.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, PackingItem[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">{packing.length} items across {Object.keys(byCategory).length} categories.</p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add Item
        </button>
      </div>
      <BulkDeleteBar selected={bulk.selected} total={packing.length} table="packing_items" label="item" onDone={bulk.clear} onToggleAll={bulk.toggleAll} />

      {adding && (
        <Card>
          <SectionHeader title="New Packing Item" />
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertPackingItemAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div><Label>Item Name *</Label><Input name="item" required placeholder="e.g. Cycling jersey" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select name="category" options={PACKING_CATEGORIES} />
              </div>
              <div>
                <Label>Traveler</Label>
                <Select name="traveler_key" options={TRAVELER_KEYS} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Segment</Label>
                <select name="segment" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold" style={{ background: '#faf8f4' }}>
                  <option value="">None</option>
                  {SEGMENTS.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><Label>Sort Order</Label><Input name="sort_order" placeholder="0" /></div>
            </div>
            <div><Label>Reason / Note</Label><Textarea name="reason" placeholder="Why this item matters for this trip…" rows={2} /></div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="font-serif font-bold text-navy mb-3">{cat}</h3>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-2">
                <input type="checkbox" checked={bulk.selected.has(item.id)} onChange={() => bulk.toggle(item.id)} className="mt-2.5 shrink-0 accent-navy cursor-pointer" />
                <div className="flex-1 min-w-0"><PackingRow item={item} tripId={trip.id} /></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PackingRow({ item, tripId }: { item: PackingItem; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-navy font-medium">{item.item}</p>
            <div className="flex gap-3 mt-0.5 flex-wrap">
              {item.traveler_key && item.traveler_key !== 'all' && (
                <span className="text-xs text-gold">{item.traveler_key}</span>
              )}
              {item.segment && <span className="text-xs text-ink-muted">{item.segment}</span>}
              {item.reason && <span className="text-xs text-ink-muted italic">{item.reason}</span>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this packing item?')) {
                  await deletePackingItemAction(item.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', item.id)
            fd.set('trip_id', tripId)
            await upsertPackingItemAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div><Label>Item Name *</Label><Input name="item" defaultValue={item.item} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Category</Label><Select name="category" defaultValue={item.category} options={PACKING_CATEGORIES} /></div>
            <div><Label>Traveler</Label><Select name="traveler_key" defaultValue={item.traveler_key || 'all'} options={TRAVELER_KEYS} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Segment</Label>
              <select name="segment" defaultValue={item.segment || ''} className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                <option value="">None</option>
                {SEGMENTS.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><Label>Sort Order</Label><Input name="sort_order" defaultValue={String(item.sort_order || '')} /></div>
          </div>
          <div><Label>Reason / Note</Label><Textarea name="reason" defaultValue={item.reason} rows={2} /></div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Recommendations Tab ───────────────────────────────────────────────────────

const REC_TYPES = ['book', 'audiobook', 'film', 'podcast', 'music', 'documentary', 'other']
const STREAMING_PLATFORMS = ['', 'Netflix', 'Apple TV+', 'Amazon Prime', 'Spotify', 'YouTube', 'Disney+', 'Audible', 'Other']

function RecsTab({ trip, recs }: { trip: Trip; recs: Rec[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const bulk = useBulkSelect(recs.map(r => r.id))

  const byType = recs.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, Rec[]>)

  return (
    <div className="space-y-6">
      <BulkDeleteBar selected={bulk.selected} total={recs.length} table="recommendations" label="recommendation" onDone={bulk.clear} onToggleAll={bulk.toggleAll} />
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">{recs.length} recommendations.</p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add Rec
        </button>
      </div>

      {adding && (
        <Card>
          <SectionHeader title="New Recommendation" />
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertRecAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title *</Label><Input name="title" required placeholder="Book / film / album title" /></div>
              <div><Label>Type</Label><Select name="type" options={REC_TYPES} /></div>
            </div>
            <div><Label>Author / Artist / Director</Label><Input name="author" placeholder="Author or creator" /></div>
            <div><Label>Description</Label><Textarea name="description" placeholder="Brief synopsis or description…" rows={2} /></div>
            <div><Label>Why Relevant to This Trip</Label><Textarea name="why_relevant" placeholder="How does this connect to Morocco, France, the journey…" rows={2} /></div>
            <div><Label>When to Enjoy</Label><Input name="when_to_enjoy" placeholder="Before departure / On the plane / During the trip…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amazon URL</Label><Input name="amazon_url" placeholder="https://amazon.com/…" /></div>
              <div><Label>Streaming URL</Label><Input name="streaming_url" placeholder="https://…" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Streaming Platform</Label>
                <select name="streaming_platform" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                  {STREAMING_PLATFORMS.map(p => <option key={p} value={p}>{p || '—'}</option>)}
                </select>
              </div>
              <div><Label>Sort Order</Label><Input name="sort_order" placeholder="0" /></div>
            </div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {Object.entries(byType).map(([type, items]) => (
        <div key={type}>
          <h3 className="font-serif font-bold text-navy mb-3 capitalize">{type}s</h3>
          <div className="space-y-3">
            {items.map(r => (
              <div key={r.id} className="flex items-start gap-2">
                <input type="checkbox" checked={bulk.selected.has(r.id)} onChange={() => bulk.toggle(r.id)} className="mt-3 shrink-0 accent-navy cursor-pointer" />
                <div className="flex-1 min-w-0"><RecRow rec={r} tripId={trip.id} /></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function RecRow({ rec, tripId }: { rec: Rec; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', letterSpacing: '0.1em' }}>{rec.type}</span>
            </div>
            <p className="font-semibold text-navy text-sm">{rec.title}</p>
            {rec.author && <p className="text-xs text-ink-muted">{rec.author}</p>}
            {rec.why_relevant && <p className="text-xs text-ink-muted italic mt-1">{rec.why_relevant}</p>}
            {rec.when_to_enjoy && <p className="text-xs text-ink-muted mt-0.5">⏱ {rec.when_to_enjoy}</p>}
            <div className="flex gap-3 mt-1">
              {rec.amazon_url && <a href={rec.amazon_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:opacity-75">Amazon →</a>}
              {rec.streaming_url && <a href={rec.streaming_url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-muted hover:text-navy">{rec.streaming_platform} →</a>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this recommendation?')) {
                  await deleteRecAction(rec.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', rec.id)
            fd.set('trip_id', tripId)
            await upsertRecAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={rec.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Title *</Label><Input name="title" defaultValue={rec.title} required /></div>
            <div><Label>Type</Label><Select name="type" defaultValue={rec.type} options={REC_TYPES} /></div>
          </div>
          <div><Label>Author / Artist</Label><Input name="author" defaultValue={rec.author} /></div>
          <div><Label>Description</Label><Textarea name="description" defaultValue={rec.description} rows={2} /></div>
          <div><Label>Why Relevant</Label><Textarea name="why_relevant" defaultValue={rec.why_relevant} rows={2} /></div>
          <div><Label>When to Enjoy</Label><Input name="when_to_enjoy" defaultValue={rec.when_to_enjoy} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Amazon URL</Label><Input name="amazon_url" defaultValue={rec.amazon_url} /></div>
            <div><Label>Streaming URL</Label><Input name="streaming_url" defaultValue={rec.streaming_url} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Streaming Platform</Label>
              <select name="streaming_platform" defaultValue={rec.streaming_platform || ''} className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                {STREAMING_PLATFORMS.map(p => <option key={p} value={p}>{p || '—'}</option>)}
              </select>
            </div>
            <div><Label>Sort Order</Label><Input name="sort_order" defaultValue={String(rec.sort_order || '')} /></div>
          </div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Read · Watch · Listen Tab (mobile app) ──────────────────────────────────

const RWL_TYPES = ['book', 'film', 'series', 'podcast', 'music', 'documentary', 'other']
const RWL_STREAMING_PLATFORMS = ['', 'Netflix', 'Apple TV+', 'Amazon Prime', 'Spotify', 'YouTube', 'Disney+', 'Audible', 'Other']

function RWLTab({ trip, items }: { trip: Trip; items: RWLItem[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const bulk = useBulkSelect(items.map(i => i.id))

  const byType = items.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, RWLItem[]>)

  return (
    <div className="space-y-6">
      <BulkDeleteBar selected={bulk.selected} total={items.length} table="read_watch_listen" label="item" onDone={bulk.clear} onToggleAll={bulk.toggleAll} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink-muted">{items.length} items — feeds the <strong>Read · Watch · Listen</strong> section in the Joie app.</p>
          <p className="text-xs text-ink-muted mt-1">Books need <code className="bg-gray-100 px-1 rounded">isbn</code>. Films/series need <code className="bg-gray-100 px-1 rounded">tmdb_id</code>. Both are used to auto-fetch cover art.</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85 shrink-0"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add Item
        </button>
      </div>

      {adding && (
        <Card>
          <SectionHeader title="New Read · Watch · Listen Item" />
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertRWLAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Title *</Label><Input name="title" required placeholder="A Moveable Feast" /></div>
              <div>
                <Label>Type *</Label>
                <Select name="type" options={RWL_TYPES} />
              </div>
            </div>
            <div><Label>Author / Director</Label><Input name="author_director" placeholder="Ernest Hemingway" /></div>
            <div><Label>Why Relevant</Label><Textarea name="reason" placeholder="Why this book or film connects to this journey…" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3 p-3 rounded-sm border border-gold border-opacity-30" style={{ background: 'rgba(201,168,76,0.05)' }}>
              <div>
                <Label>ISBN (books only)</Label>
                <Input name="isbn" placeholder="9780684833637 — 13-digit ISBN from Amazon or back cover" />
                <p className="text-xs text-ink-muted mt-1">Used to auto-fetch book cover from Google Books. Always fill for books.</p>
              </div>
              <div>
                <Label>TMDB ID (films & series)</Label>
                <Input name="tmdb_id" placeholder="840 — from themoviedb.org URL (/movie/840 or /tv/96677)" />
                <p className="text-xs text-ink-muted mt-1">Used to auto-fetch poster. Always fill for films and series.</p>
              </div>
            </div>
            <div><Label>Cover Image URL (override only)</Label><ImageUrlInput name="cover_image_url" placeholder="Only if ISBN/TMDB auto-fetch fails — direct .jpg or .png URL" folder="trip-media" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Amazon URL</Label><Input name="amazon_url" placeholder="https://amazon.com/…" /></div>
              <div><Label>Streaming URL</Label><Input name="streaming_url" placeholder="https://…" /></div>
              <div>
                <Label>Streaming Platform</Label>
                <select name="streaming_platform" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                  {RWL_STREAMING_PLATFORMS.map(p => <option key={p} value={p}>{p || '—'}</option>)}
                </select>
              </div>
            </div>
            <div style={{ maxWidth: '160px' }}><Label>Display Order</Label><Input name="display_order" defaultValue="0" placeholder="1" /></div>
            <p className="text-xs text-ink-muted -mt-1">Lower number = appears first in app. Use sequential integers (1, 2, 3…). Gaps are fine.</p>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {Object.entries(byType).map(([type, typeItems]) => (
        <div key={type}>
          <h3 className="font-serif font-bold text-navy mb-3 capitalize">{type}s</h3>
          <div className="space-y-3">
            {typeItems
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map(item => (
                <div key={item.id} className="flex items-start gap-2">
                  <input type="checkbox" checked={bulk.selected.has(item.id)} onChange={() => bulk.toggle(item.id)} className="mt-3 shrink-0 accent-navy cursor-pointer" />
                  <div className="flex-1 min-w-0"><RWLRow item={item} tripId={trip.id} /></div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function RWLRow({ item, tripId }: { item: RWLItem; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const hasCoverHint = item.isbn || item.tmdb_id
  const missingCoverHint = !item.isbn && !item.tmdb_id && !item.cover_image_url

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', letterSpacing: '0.1em' }}>{item.type}</span>
              {item.display_order !== undefined && <span className="text-xs text-ink-muted font-mono">#{item.display_order}</span>}
              {item.isbn && <span className="text-xs text-green-600">📖 ISBN</span>}
              {item.tmdb_id && <span className="text-xs text-green-600">🎬 TMDB</span>}
              {missingCoverHint && <span className="text-xs text-amber-500">⚠️ No ISBN/TMDB — cover will use placeholder</span>}
            </div>
            <p className="font-semibold text-navy text-sm">{item.title}</p>
            {item.author_director && <p className="text-xs text-ink-muted">{item.author_director}</p>}
            {item.reason && <p className="text-xs text-ink-muted italic mt-1">{item.reason}</p>}
            <div className="flex gap-3 mt-1 flex-wrap">
              {item.amazon_url && <a href={item.amazon_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:opacity-75">Amazon →</a>}
              {item.streaming_url && <a href={item.streaming_url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-muted hover:text-navy">{item.streaming_platform || 'Stream'} →</a>}
              {item.cover_image_url && <a href={item.cover_image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-muted hover:text-navy">Cover →</a>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this item?')) {
                  await deleteRWLAction(item.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', item.id)
            fd.set('trip_id', tripId)
            await upsertRWLAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Title *</Label><Input name="title" defaultValue={item.title} required /></div>
            <div><Label>Type</Label><Select name="type" defaultValue={item.type} options={RWL_TYPES} /></div>
          </div>
          <div><Label>Author / Director</Label><Input name="author_director" defaultValue={item.author_director} /></div>
          <div><Label>Why Relevant</Label><Textarea name="reason" defaultValue={item.reason} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3 p-3 rounded-sm border border-gold border-opacity-30" style={{ background: 'rgba(201,168,76,0.05)' }}>
            <div>
              <Label>ISBN (books)</Label>
              <Input name="isbn" defaultValue={item.isbn} placeholder="9780684833637" />
            </div>
            <div>
              <Label>TMDB ID (films/series)</Label>
              <Input name="tmdb_id" defaultValue={item.tmdb_id} placeholder="840" />
            </div>
          </div>
          <div><Label>Cover Image URL (override)</Label><ImageUrlInput name="cover_image_url" defaultValue={item.cover_image_url} placeholder="Direct .jpg or .png URL" folder="trip-media" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Amazon URL</Label><Input name="amazon_url" defaultValue={item.amazon_url} /></div>
            <div><Label>Streaming URL</Label><Input name="streaming_url" defaultValue={item.streaming_url} /></div>
            <div>
              <Label>Streaming Platform</Label>
              <select name="streaming_platform" defaultValue={item.streaming_platform || ''} className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                {RWL_STREAMING_PLATFORMS.map(p => <option key={p} value={p}>{p || '—'}</option>)}
              </select>
            </div>
          </div>
          <div style={{ maxWidth: '160px' }}><Label>Display Order</Label><Input name="display_order" defaultValue={String(item.display_order ?? 0)} /></div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Pre-Trip Drops Tab ────────────────────────────────────────────────────────

const DROP_TYPES = ['history', 'music', 'phrase', 'weather', 'tip', 'story', 'challenge', 'announcement']

function PreTripDropsTab({ trip, drops }: { trip: Trip; drops: PreTripDrop[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()

  const sorted = [...drops].sort((a, b) => a.date_offset_days - b.date_offset_days)

  function offsetLabel(n: number) {
    if (n === 0) return 'Day of departure'
    if (n < 0) return `${Math.abs(n)} days before`
    return `${n} days after`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">{drops.length} pre-trip content drops. Negative offset = days before departure.</p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add Drop
        </button>
      </div>

      {adding && (
        <Card>
          <SectionHeader title="New Pre-Trip Drop" />
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertPreTripDropAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Days Offset *</Label>
                <Input name="date_offset_days" required placeholder="-7 (7 days before)" />
              </div>
              <div><Label>Type</Label><Select name="type" options={DROP_TYPES} /></div>
              <div><Label>Title</Label><Input name="title" placeholder="Optional headline" /></div>
            </div>
            <div><Label>Content *</Label><Textarea name="content" required placeholder="The drop content shown to travelers…" rows={4} /></div>
            <div><Label>Media URL</Label><Input name="media_url" placeholder="https://… (optional image or audio link)" /></div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {sorted.map(drop => <PreTripDropRow key={drop.id} drop={drop} tripId={trip.id} offsetLabel={offsetLabel} />)}
    </div>
  )
}

function PreTripDropRow({ drop, tripId, offsetLabel }: { drop: PreTripDrop; tripId: string; offsetLabel: (n: number) => string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-gold">{offsetLabel(drop.date_offset_days)}</span>
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', letterSpacing: '0.1em' }}>{drop.type}</span>
              {drop.sent && <span className="text-xs text-green-600 font-semibold">Sent ✓</span>}
            </div>
            {drop.title && <p className="font-semibold text-navy text-sm">{drop.title}</p>}
            <p className="text-xs text-ink-muted mt-1 line-clamp-3" style={{ color: '#555' }}>{drop.content}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this drop?')) {
                  await deletePreTripDropAction(drop.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', drop.id)
            fd.set('trip_id', tripId)
            await upsertPreTripDropAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={drop.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Days Offset *</Label><Input name="date_offset_days" defaultValue={String(drop.date_offset_days)} required /></div>
            <div><Label>Type</Label><Select name="type" defaultValue={drop.type} options={DROP_TYPES} /></div>
            <div><Label>Title</Label><Input name="title" defaultValue={drop.title} /></div>
          </div>
          <div><Label>Content *</Label><Textarea name="content" defaultValue={drop.content} required rows={4} /></div>
          <div><Label>Media URL</Label><Input name="media_url" defaultValue={drop.media_url} /></div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-navy cursor-pointer">
              <input type="checkbox" name="sent" value="true" defaultChecked={drop.sent} className="rounded" />
              Mark as sent
            </label>
          </div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Feedback Tab ─────────────────────────────────────────────────────────────

function FeedbackTab({ days, feedback }: { days: Day[]; feedback: Feedback[] }) {
  const dayMap = Object.fromEntries(days.map(d => [d.id, d]))

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">{feedback.length} feedback entries from travelers.</p>
      {feedback.length === 0 && (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-sm">No feedback submitted yet.</p>
        </div>
      )}
      {feedback.map(f => {
        const day = dayMap[f.day_id]
        return (
          <Card key={f.id}>
            <div className="flex items-center gap-3 mb-2">
              {day && <span className="text-xs text-gold font-semibold">Day {day.day_number} — {day.title}</span>}
              <span className="text-xs text-ink-muted ml-auto">{new Date(f.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-xs font-semibold text-navy mb-1">{f.traveler_name}</p>
            <p className="text-sm text-ink leading-relaxed" style={{ color: '#3d3d3d' }}>{f.comment}</p>
          </Card>
        )
      })}
    </div>
  )
}

// ── Image Health Tab ──────────────────────────────────────────────────────────

function ImageHealthTab({ days }: { days: Day[] }) {
  const defaultIds = new Set(DEFAULT_PHOTOS.map(p => p.id))

  const rows = days.map(day => {
    const locPool = day.location ? getPhotoPool(day.location) : null
    const regionPool = getPhotoPool(day.region || '')
    const resolvedPool = (locPool && locPool !== DEFAULT_PHOTOS) ? locPool : regionPool
    const isDefault = resolvedPool === DEFAULT_PHOTOS || resolvedPool.every(p => defaultIds.has(p.id))

    // Determine which key matched
    const matchedVia = (locPool && locPool !== DEFAULT_PHOTOS)
      ? `location: "${day.location}"`
      : regionPool !== DEFAULT_PHOTOS
        ? `region: "${day.region}"`
        : 'DEFAULT (no match)'

    const photo = getPhotoForDay(day.region || '', day.day_number, 400, 225, 75, day.location)

    return { day, photo, isDefault, matchedVia, poolSize: resolvedPool.length }
  })

  const defaultCount = rows.filter(r => r.isDefault).length
  const okCount = rows.length - defaultCount

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex gap-4">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-sm px-5 py-4 text-center">
          <p className="font-serif text-2xl font-bold text-green-700">{okCount}</p>
          <p className="text-xs uppercase tracking-widest text-green-600 mt-1">✓ Matched</p>
        </div>
        <div className={`flex-1 rounded-sm px-5 py-4 text-center border ${defaultCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`font-serif text-2xl font-bold ${defaultCount > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{defaultCount}</p>
          <p className={`text-xs uppercase tracking-widest mt-1 ${defaultCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>⚠ Default Fallback</p>
        </div>
        <div className="flex-1 bg-white border border-gray-100 rounded-sm px-5 py-4 text-center">
          <p className="font-serif text-2xl font-bold text-navy">{rows.length}</p>
          <p className="text-xs uppercase tracking-widest text-ink-muted mt-1">Total Days</p>
        </div>
      </div>

      {/* Day rows */}
      <div className="space-y-2">
        {rows.map(({ day, photo, isDefault, matchedVia, poolSize }) => (
          <div
            key={day.id}
            className={`flex items-center gap-4 rounded-sm border px-4 py-3 ${isDefault ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'}`}
          >
            {/* Thumbnail */}
            <div className="shrink-0 w-16 h-9 rounded overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url.replace('w=1600&h=900', 'w=120&h=68')} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Day info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gold" style={{ letterSpacing: '0.12em' }}>Day {day.day_number}</span>
                <span className="text-xs text-navy font-medium truncate">{day.title}</span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5 truncate">{matchedVia} · pool: {poolSize} photos</p>
            </div>

            {/* Status badge */}
            <div className={`shrink-0 text-xs px-2 py-1 rounded-sm font-semibold ${isDefault ? 'bg-amber-200 text-amber-800' : 'bg-green-100 text-green-700'}`}>
              {isDefault ? '⚠ DEFAULT' : '✓ OK'}
            </div>
          </div>
        ))}
      </div>

      {defaultCount > 0 && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-sm px-4 py-3 leading-relaxed">
          <strong>Fix:</strong> Update the day&apos;s <code>location</code> or <code>region</code> field in the Days tab to match a keyword in{' '}
          <code>lib/unsplash.ts</code> POOL_MAP — e.g. <em>casablanca, rabat, fez, lyon, paris, loire, burgundy</em>. Or paste a direct Hero Image URL in the Days tab.
        </div>
      )}
    </div>
  )
}

// ── Haggle Triggers Tab ───────────────────────────────────────────────────────

const CURRENCY_OPTIONS = ['MAD', 'EUR', 'USD', 'TND', 'DZD', 'GBP', 'OTHER']

function HaggleTab({ trip, triggers }: { trip: Trip; triggers: HaggleTrigger[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const bulk = useBulkSelect(triggers.map(t => t.id))

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-navy mb-1">Haggle Triggers</h3>
          <p className="text-xs text-ink-muted max-w-prose">
            Geofenced market locations. The app activates the Haggle tab when a traveler is within the trigger radius.
            Each record needs valid coordinates and a currency — everything else is optional but recommended.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85 shrink-0"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add Location
        </button>
      </div>
      <BulkDeleteBar selected={bulk.selected} total={triggers.length} table="joie_haggle_triggers" label="trigger" onDone={bulk.clear} onToggleAll={bulk.toggleAll} />

      {adding && (
        <Card>
          <SectionHeader title="New Haggle Location" />
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertHaggleTriggerAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-4"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location Name *</Label><Input name="location_name" required placeholder="Casablanca — Quartier des Habous" /></div>
              <div>
                <Label>Currency</Label>
                <Select name="currency" options={CURRENCY_OPTIONS} />
              </div>
            </div>
            <div>
              <Label>Coordinates (required) *</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input name="coord_lon" required placeholder="Longitude: -7.5898" />
                <Input name="coord_lat" required placeholder="Latitude: 33.5731" />
              </div>
              <p className="text-xs text-ink-muted mt-1">Get from Google Maps — longitude is negative for Morocco (e.g. -7.5898), latitude is positive (e.g. 33.5731). <strong>Longitude first.</strong></p>
            </div>
            <div style={{ maxWidth: '200px' }}><Label>Geofence Radius (metres)</Label><Input name="radius_meters" defaultValue="500" placeholder="500" /></div>
            <div>
              <Label>Haggle Tips (one tip per line)</Label>
              <Textarea name="tips" placeholder={"Start at 40% of asking price\nWalk away if needed — they will call you back\nPay in cash for better rates"} rows={4} />
              <p className="text-xs text-ink-muted mt-1">Each line becomes a separate tip in the app.</p>
            </div>
            <div>
              <Label>Phrases (JSON)</Label>
              <Textarea name="phrases" placeholder={'{\n  "opening": "بكم هذا؟",\n  "too_expensive": "هذا غالي جداً",\n  "final_offer": "هذا آخر عرضي",\n  "thank_you": "شكراً"\n}'} rows={5} />
              <p className="text-xs text-ink-muted mt-1">Key-value JSON. Keys are phrase names; values are the local-language text.</p>
            </div>
            <div>
              <Label>Price Anchors (JSON)</Label>
              <Textarea name="price_anchors" placeholder={'{\n  "leather_bag": {"low": 80, "mid": 150, "high": 300},\n  "spices_100g": {"low": 10, "mid": 20, "high": 40}\n}'} rows={5} />
              <p className="text-xs text-ink-muted mt-1">Each key is an item name; value is an object with low/mid/high price range in the local currency.</p>
            </div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {triggers.map(t => (
        <div key={t.id} className="flex items-start gap-2">
          <input type="checkbox" checked={bulk.selected.has(t.id)} onChange={() => bulk.toggle(t.id)} className="mt-3 shrink-0 accent-navy cursor-pointer" />
          <div className="flex-1 min-w-0"><HaggleTriggerRow trigger={t} tripId={trip.id} /></div>
        </div>
      ))}
    </div>
  )
}

function HaggleTriggerRow({ trigger, tripId }: { trigger: HaggleTrigger; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const lonRaw = trigger.coordinates?.replace(/^\(([^,]+),.+\)$/, '$1') || ''
  const latRaw = trigger.coordinates?.replace(/^\([^,]+,([^)]+)\)$/, '$1') || ''
  const tipsText = Array.isArray(trigger.tips) ? trigger.tips.join('\n') : ''
  const phrasesText = trigger.phrases ? JSON.stringify(trigger.phrases, null, 2) : ''
  const priceAnchorsText = trigger.price_anchors ? JSON.stringify(trigger.price_anchors, null, 2) : ''

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {trigger.currency && <span className="text-xs font-mono px-2 py-0.5 rounded-sm" style={{ background: 'rgba(27,43,75,0.1)', color: '#1B2B4B' }}>{trigger.currency}</span>}
              {trigger.radius_meters && <span className="text-xs text-ink-muted">{trigger.radius_meters}m radius</span>}
              {trigger.coordinates
                ? <span className="text-xs text-green-600">📍 {trigger.coordinates}</span>
                : <span className="text-xs text-red-500">⚠️ No coordinates — trigger will not fire</span>
              }
            </div>
            <p className="font-semibold text-navy text-sm">{trigger.location_name}</p>
            {Array.isArray(trigger.tips) && trigger.tips.length > 0 && (
              <p className="text-xs text-ink-muted mt-1">{trigger.tips.length} tips · {Object.keys(trigger.phrases || {}).length} phrases · {Object.keys(trigger.price_anchors || {}).length} price anchors</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm(`Delete "${trigger.location_name}"?`)) {
                  await deleteHaggleTriggerAction(trigger.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', trigger.id)
            fd.set('trip_id', tripId)
            await upsertHaggleTriggerAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={trigger.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Location Name *</Label><Input name="location_name" defaultValue={trigger.location_name} required /></div>
            <div>
              <Label>Currency</Label>
              <Select name="currency" defaultValue={trigger.currency || 'MAD'} options={CURRENCY_OPTIONS} />
            </div>
          </div>
          <div>
            <Label>Coordinates *</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input name="coord_lon" defaultValue={lonRaw} placeholder="-7.5898" required />
              <Input name="coord_lat" defaultValue={latRaw} placeholder="33.5731" required />
            </div>
          </div>
          <div style={{ maxWidth: '200px' }}><Label>Radius (metres)</Label><Input name="radius_meters" defaultValue={String(trigger.radius_meters || 500)} /></div>
          <div>
            <Label>Tips (one per line)</Label>
            <Textarea name="tips" defaultValue={tipsText} rows={4} />
          </div>
          <div>
            <Label>Phrases (JSON)</Label>
            <Textarea name="phrases" defaultValue={phrasesText} rows={5} />
          </div>
          <div>
            <Label>Price Anchors (JSON)</Label>
            <Textarea name="price_anchors" defaultValue={priceAnchorsText} rows={5} />
          </div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Journey Facts Tab ─────────────────────────────────────────────────────────

const FACT_CATEGORIES = ['history', 'culture', 'food', 'language', 'art', 'architecture', 'nature', 'sport', 'music', 'literature', 'religion', 'other']
const MUSIC_PLATFORMS = ['', 'apple_music', 'spotify']

function JourneyFactsTab({ trip, facts }: { trip: Trip; facts: JourneyFact[] }) {
  const [adding, setAdding] = useState(false)
  const [pending, startTransition] = useTransition()
  const bulk = useBulkSelect(facts.map(f => f.id))

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-navy mb-1">Journey Facts</h3>
          <div className="text-xs text-ink-muted max-w-prose">
            <p>The <strong>&ldquo;Did you know?&rdquo;</strong> rotating facts shown in the Today tab of the Joie app. {facts.length} facts entered.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85 shrink-0"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          + Add Fact
        </button>
      </div>
      <BulkDeleteBar selected={bulk.selected} total={facts.length} table="journey_facts" label="fact" onDone={bulk.clear} onToggleAll={bulk.toggleAll} />

      {adding && (
        <Card>
          <SectionHeader title="New Journey Fact" />
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertJourneyFactAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Category</Label>
                <Select name="category" options={FACT_CATEGORIES} />
              </div>
              <div><Label>Sort Order</Label><Input name="sort_order" placeholder="1" /></div>
              <div>
                <Label>Active</Label>
                <Select name="is_active" options={['true', 'false']} />
              </div>
            </div>
            <div><Label>Headline *</Label><Input name="headline" required placeholder="Short hook (~60 chars max)" /></div>
            <div><Label>Body *</Label><Textarea name="body" required placeholder="Full fact text (2–4 sentences)…" rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Music URL (optional)</Label><Input name="music_url" placeholder="Apple Music or Spotify link" /></div>
              <div>
                <Label>Music Platform</Label>
                <select name="music_platform" className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                  {MUSIC_PLATFORMS.map(p => <option key={p} value={p}>{p || '—'}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Destinations (JSON array, optional)</Label>
              <Input name="destinations" placeholder='["Morocco", "France"]' />
              <p className="text-xs text-ink-muted mt-1">Controls which trips see this fact. Leave blank to show on all trips.</p>
            </div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {facts.length === 0 && !adding && (
        <div className="text-center py-12 text-ink-muted text-sm">
          No facts yet. Add some to build the library for this trip.
        </div>
      )}

      {facts
        .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
        .map(fact => (
          <div key={fact.id} className="flex items-start gap-2">
            <input type="checkbox" checked={bulk.selected.has(fact.id)} onChange={() => bulk.toggle(fact.id)} className="mt-3 shrink-0 accent-navy cursor-pointer" />
            <div className="flex-1 min-w-0"><JourneyFactRow fact={fact} tripId={trip.id} /></div>
          </div>
        ))}
    </div>
  )
}

function JourneyFactRow({ fact, tripId }: { fact: JourneyFact; tripId: string }) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <Card>
      {!editing ? (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', letterSpacing: '0.1em' }}>{fact.category}</span>
              {fact.sort_order !== undefined && fact.sort_order !== null && <span className="text-xs text-ink-muted font-mono">#{fact.sort_order}</span>}
              {!fact.is_active && <span className="text-xs text-red-400 px-2 py-0.5 rounded-sm border border-red-200">hidden</span>}
              {fact.music_url && <span className="text-xs text-ink-muted">🎵 {fact.music_platform || 'music'}</span>}
            </div>
            <p className="font-semibold text-navy text-sm">{fact.headline}</p>
            <p className="text-xs text-ink-muted mt-1 line-clamp-3">{fact.body}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-ink-muted hover:text-navy border border-gray-200 px-3 py-1.5 rounded-sm hover:border-navy transition-colors">Edit</button>
            <DeleteBtn
              pending={pending}
              onClick={() => startTransition(async () => {
                if (confirm('Delete this fact?')) {
                  await deleteJourneyFactAction(fact.id)
                  window.location.reload()
                }
              })}
            />
          </div>
        </div>
      ) : (
        <form
          action={async (fd) => {
            fd.set('id', fact.id)
            fd.set('trip_id', tripId)
            await upsertJourneyFactAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={fact.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Category</Label>
              <Select name="category" defaultValue={fact.category} options={FACT_CATEGORIES} />
            </div>
            <div><Label>Sort Order</Label><Input name="sort_order" defaultValue={String(fact.sort_order ?? '')} placeholder="1" /></div>
            <div>
              <Label>Active</Label>
              <Select name="is_active" defaultValue={fact.is_active ? 'true' : 'false'} options={['true', 'false']} />
            </div>
          </div>
          <div><Label>Headline *</Label><Input name="headline" defaultValue={fact.headline} required /></div>
          <div><Label>Body *</Label><Textarea name="body" defaultValue={fact.body} required rows={4} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Music URL</Label><Input name="music_url" defaultValue={fact.music_url} /></div>
            <div>
              <Label>Music Platform</Label>
              <select name="music_platform" defaultValue={fact.music_platform || ''} className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none" style={{ background: '#faf8f4' }}>
                {MUSIC_PLATFORMS.map(p => <option key={p} value={p}>{p || '—'}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Destinations (JSON array)</Label>
            <Input
              name="destinations"
              defaultValue={fact.destinations ? JSON.stringify(fact.destinations) : ''}
              placeholder='["Morocco", "France"]'
            />
          </div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

const TRIP_HERO_SLOTS: { field: string; label: string }[] = [
  { field: 'hero_image_url',   label: 'Hero Image 1' },
  { field: 'hero_image_url_2', label: 'Hero Image 2' },
  { field: 'hero_image_url_3', label: 'Hero Image 3' },
  { field: 'hero_image_url_4', label: 'Hero Image 4' },
]

function TripImageSlot({ trip, field, label, savedKey }: { trip: Trip; field: string; label: string; savedKey: string }) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const inputId = `trip-${field}`
  const currentVal = (trip as unknown as Record<string, unknown>)[field] as string | undefined

  function handleSave() {
    const el = document.getElementById(inputId) as HTMLInputElement
    const val = el?.value || ''
    startTransition(async () => {
      await updateTripFieldAction(trip.id, field, val)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {currentVal && <span className="text-xs text-gold">📷 set</span>}
      </div>
      <p className="text-xs text-ink-muted">
        Paste a direct image URL. For Unsplash, click <strong>Share → Copy Link</strong>, then replace the URL domain with{' '}
        <code className="bg-gray-100 px-1 rounded">images.unsplash.com/photo-XXXXX</code>{' '}
        and append <code className="bg-gray-100 px-1 rounded">?w=2400&h=1400&fit=crop&q=90</code>. Leave blank to skip this slot.
      </p>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="url"
          defaultValue={currentVal || ''}
          placeholder="https://images.unsplash.com/photo-XXXX?w=2400&h=1400&fit=crop&q=90"
          className="flex-1 min-w-0 border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold"
          style={{ background: '#faf8f4' }}
        />
        <ImageUploadBtn
          targetInputName={field}
          targetInputId={inputId}
          folder="trip-media"
          onUploaded={handleSave}
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="text-xs uppercase tracking-widest px-5 py-2 text-white rounded-sm disabled:opacity-50"
          style={{ background: '#1B2B4B', letterSpacing: '0.14em' }}
        >
          {pending ? 'Saving…' : `Save ${label}`}
        </button>
        {saved && <span className="text-xs text-green-600">Saved ✓</span>}
        {currentVal && (
          <>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(inputId) as HTMLInputElement
                if (el) el.value = ''
                startTransition(async () => {
                  await updateTripFieldAction(trip.id, field, '')
                  setSaved(true)
                  setTimeout(() => setSaved(false), 2000)
                })
              }}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Clear
            </button>
            <a href={currentVal} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:opacity-75">
              Preview →
            </a>
          </>
        )}
      </div>
      {currentVal && (
        <div className="mt-2 rounded-sm overflow-hidden border border-gray-100" style={{ aspectRatio: '16/5' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentVal} alt={label} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  )
}

function TripTextField({ trip, field, label, placeholder, multiline, isImage }: { trip: Trip; field: string; label: string; placeholder?: string; multiline?: boolean; isImage?: boolean }) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const inputId = `trip-field-${field}`
  const currentVal = (trip as unknown as Record<string, unknown>)[field] as string | undefined

  function handleSave() {
    const el = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement
    startTransition(async () => {
      await updateTripFieldAction(trip.id, field, el?.value || '')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const sharedProps = {
    id: inputId,
    defaultValue: currentVal || '',
    placeholder,
    className: 'w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold',
    style: { background: '#faf8f4' } as React.CSSProperties,
  }

  return (
    <div>
      <Label>{label}</Label>
      {multiline
        ? <textarea {...sharedProps} rows={4} />
        : isImage
          ? (
            <div className="flex items-center gap-2">
              <input {...sharedProps} type="url" className="flex-1 min-w-0 border border-gray-200 rounded-sm px-3 py-2 text-sm text-navy focus:outline-none focus:border-gold" />
              <ImageUploadBtn
                targetInputName={field}
                targetInputId={inputId}
                folder="trip-media"
                onUploaded={url => {
                  const el = document.getElementById(inputId) as HTMLInputElement | null
                  if (el) {
                    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
                    nativeSetter?.call(el, url)
                    el.dispatchEvent(new Event('input', { bubbles: true }))
                    el.dispatchEvent(new Event('change', { bubbles: true }))
                  }
                  startTransition(async () => {
                    await updateTripFieldAction(trip.id, field, url)
                    setSaved(true)
                    setTimeout(() => setSaved(false), 2000)
                  })
                }}
              />
            </div>
          )
          : <input {...sharedProps} type="text" />
      }
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="text-xs uppercase tracking-widest px-4 py-1.5 text-white rounded-sm disabled:opacity-50"
          style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
        >
          {pending ? 'Saving…' : `Save ${label}`}
        </button>
        {saved && <span className="text-xs text-green-600">Saved ✓</span>}
      </div>
    </div>
  )
}

function SettingsTab({ trip }: { trip: Trip }) {
  const curatorCount = TRIP_HERO_SLOTS.filter(s => (trip as unknown as Record<string, unknown>)[s.field]).length

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="font-serif text-lg font-bold text-navy mb-1">Trip Info</h3>
        <p className="text-xs text-ink-muted">Edit trip name, dates, narrative, and hero images. Changes take effect immediately.</p>
      </div>

      {/* Trip name & dates */}
      <Card>
        <h4 className="font-semibold text-sm text-navy mb-5">Trip Details</h4>
        <div className="space-y-5">
          <TripTextField trip={trip} field="title" label="Trip Title" placeholder="The Andalusian Thread" />
          <TripTextField trip={trip} field="subtitle" label="Subtitle" placeholder="A journey through southern Spain…" />
          <TripTextField trip={trip} field="trip_narrative" label="Trip Narrative" placeholder="The story of this journey…" multiline />
          <div className="grid grid-cols-2 gap-4">
            <TripTextField trip={trip} field="start_date" label="Start Date" placeholder="2026-10-01" />
            <TripTextField trip={trip} field="end_date" label="End Date" placeholder="2026-10-14" />
          </div>
        </div>
      </Card>

      {/* Access code */}
      <Card>
        <h4 className="font-semibold text-sm text-navy mb-1">Trip Access Code</h4>
        <p className="text-xs text-ink-muted mb-4">
          This is the <strong>web_password</strong> travelers enter at the join page, and is embedded in the QR code URL.
          Share it with travelers directly, or just hand them the QR code — the code is pre-filled in the link.
          {!trip.web_password && <span className="ml-1 text-amber-600 font-medium">⚠️ Not set — QR link is unprotected.</span>}
        </p>
        <TripTextField trip={trip} field="web_password" label="Access Code" placeholder="e.g. andalusia2026" />
        {trip.web_password && (
          <p className="mt-3 text-xs text-green-600">
            ✓ Set — QR code URL includes <code className="bg-gray-100 px-1 rounded">?p={trip.web_password}</code>
          </p>
        )}
      </Card>

      {/* Journey tab story banner (mobile app) */}
      <Card>
        <h4 className="font-semibold text-sm text-navy mb-1">Journey Tab Banner</h4>
        <p className="text-xs text-ink-muted mb-5">
          Full-bleed image shown at the top of the <strong>Journey</strong> tab in the Joie app. Must be set before the trip goes live.
          High-resolution landscape or portrait editorial photo — landscapes, medinas, markets work best.
          {!trip.story_image_url && (
            <span className="ml-2 text-amber-600 font-semibold">⚠️ Not set — app will show a gradient placeholder.</span>
          )}
        </p>
        <TripTextField trip={trip} field="story_image_url" label="Story Image URL" placeholder="https://images.unsplash.com/photo-HASH?w=1600&h=900&fit=crop&q=85" isImage />
        {trip.story_image_url && (
          <div className="mt-3 rounded-sm overflow-hidden border border-gray-100" style={{ aspectRatio: '16/9', maxWidth: '400px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={trip.story_image_url} alt="Story banner preview" className="w-full h-full object-cover" />
          </div>
        )}
      </Card>

      <Card>
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-semibold text-sm text-navy">Trip Hero Images</h4>
              {curatorCount > 0 && (
                <span className="text-xs bg-gold bg-opacity-15 text-gold px-2 py-0.5 rounded-full">
                  {curatorCount} slot{curatorCount > 1 ? 's' : ''} set — cycling active
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mb-6">
              Add up to 4 images and the hero will cycle through them every 6 seconds (same behaviour as day pages).
              If all slots are blank, the hero falls back to an auto-selected Unsplash photo based on the first day&apos;s location.
            </p>
            <div className="space-y-8">
              {TRIP_HERO_SLOTS.map(slot => (
                <TripImageSlot key={slot.field} trip={trip} field={slot.field} label={slot.label} savedKey={slot.field} />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
