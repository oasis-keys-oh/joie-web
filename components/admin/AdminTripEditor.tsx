'use client'

import { useState, useTransition } from 'react'
import {
  upsertContactAction, deleteContactAction,
  upsertEventAction, deleteEventAction,
  upsertHotelAction, deleteHotelAction,
  upsertChallengeAction, deleteChallengeAction,
  updateDayFieldAction,
} from '@/app/admin/actions'

// ── Types ────────────────────────────────────────────────────────────────────

interface Trip { id: string; title: string; web_slug: string; start_date: string; end_date: string }
interface Day { id: string; day_number: number; date: string; title: string; region: string; location?: string; morning_brief?: string; wow_moment?: string }
interface Event { id: string; day_id: string; type: string; title: string; time_start?: string; address?: string; phone?: string; confirmation?: string; booking_url?: string; booking_status?: string; notes?: string }
interface Contact { id: string; name: string; phone: string; role: string; destination: string; specialty?: string; intro_note?: string }
interface Hotel { id: string; name: string; check_in?: string; check_out?: string; address?: string; phone?: string; website?: string; confirmation?: string; notes?: string }
interface Challenge { id: string; day_number?: number; title: string; description: string; transliteration?: string; points: number; challenge_type: string }
interface PackingItem { id: string; label: string; category: string; segment?: string; traveler_key?: string; notes?: string; amazon_url?: string }
interface Rec { id: string; type: string; title: string; author?: string; notes?: string; amazon_url?: string; streaming_url?: string; streaming_platform?: string }
interface Feedback { id: string; day_id: string; traveler_name: string; comment: string; created_at: string }

interface Props {
  trip: Trip
  days: Day[]
  events: Event[]
  contacts: Contact[]
  hotels: Hotel[]
  challenges: Challenge[]
  packing: PackingItem[]
  recs: Rec[]
  feedback: Feedback[]
  activeTab: string
}

const TABS = [
  { id: 'days',      label: 'Days' },
  { id: 'events',    label: 'Events' },
  { id: 'contacts',  label: 'Contacts' },
  { id: 'hotels',    label: 'Hotels' },
  { id: 'hunt',      label: 'Hunt' },
  { id: 'packing',   label: 'Packing' },
  { id: 'recs',      label: 'Recommendations' },
  { id: 'feedback',  label: 'Feedback' },
]

const ROLE_OPTIONS = ['driver', 'guide', 'fixer', 'restaurant_contact', 'other']
const EVENT_TYPES = ['restaurant', 'activity', 'transport', 'flight', 'hotel', 'experience', 'tour', 'transfer']
const CHALLENGE_TYPES = ['find', 'photo', 'taste', 'buy', 'ask', 'learn', 'grand_finale']

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

export default function AdminTripEditor({ trip, days, events, contacts, hotels, challenges, packing, recs, feedback, activeTab: initTab }: Props) {
  const [tab, setTab] = useState(initTab)

  return (
    <div>
      {/* Trip title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-navy">{trip.title}</h1>
        <p className="text-ink-muted text-sm mt-1">{trip.start_date} → {trip.end_date} · {days.length} days</p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-8 border-b border-gray-200 overflow-x-auto">
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
      {tab === 'days'     && <DaysTab     trip={trip} days={days} />}
      {tab === 'events'   && <EventsTab   trip={trip} days={days} events={events} />}
      {tab === 'contacts' && <ContactsTab trip={trip} contacts={contacts} />}
      {tab === 'hotels'   && <HotelsTab   trip={trip} hotels={hotels} />}
      {tab === 'hunt'     && <HuntTab     trip={trip} challenges={challenges} />}
      {tab === 'packing'  && <PackingTab  packing={packing} />}
      {tab === 'recs'     && <RecsTab     recs={recs} />}
      {tab === 'feedback' && <FeedbackTab days={days} feedback={feedback} />}
    </div>
  )
}

// ── Days Tab ─────────────────────────────────────────────────────────────────

function DaysTab({ trip, days }: { trip: Trip; days: Day[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  function handleSave(dayId: string, field: string, value: string) {
    startTransition(async () => {
      await updateDayFieldAction(dayId, field, value)
      setSaved(s => ({ ...s, [dayId]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [dayId]: false })), 2000)
    })
  }

  return (
    <div className="space-y-3">
      {days.map(day => (
        <div key={day.id} className="bg-white border border-gray-100 rounded-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setExpanded(expanded === day.id ? null : day.id)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest" style={{ letterSpacing: '0.16em', minWidth: '48px' }}>
                Day {day.day_number}
              </span>
              <span className="font-serif font-bold text-navy text-sm">{day.title}</span>
              <span className="text-xs text-ink-muted">{day.location || day.region}</span>
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
              <span className="text-ink-muted text-sm">{expanded === day.id ? '▲' : '▼'}</span>
            </div>
          </button>

          {expanded === day.id && (
            <div className="border-t border-gray-100 px-6 py-6 space-y-5">
              <div>
                <Label>Morning Brief</Label>
                <Textarea
                  name="morning_brief"
                  defaultValue={day.morning_brief}
                  placeholder="What travelers need to know this morning…"
                  rows={4}
                />
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
            </div>
          )}
        </div>
      ))}
    </div>
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

  return (
    <div className="space-y-4">
      <SectionHeader title={`Who to Call (${contacts.length})`} onAdd={() => setAdding(true)} />

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

      {contacts.map(c => <ContactRow key={c.id} contact={c} tripId={trip.id} />)}
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

  return (
    <div className="space-y-4">
      <SectionHeader title={`Hotels (${hotels.length})`} onAdd={() => setAdding(true)} />

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

      {hotels.map(h => <HotelRow key={h.id} hotel={h} tripId={trip.id} />)}
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

  return (
    <div className="space-y-4">
      <SectionHeader title={`Hunt Challenges (${challenges.length} · ${totalPts} pts total)`} onAdd={() => setAdding(true)} />

      {adding && (
        <Card>
          <form
            action={async (fd) => {
              fd.set('trip_id', trip.id)
              await upsertChallengeAction(fd)
              setAdding(false)
              window.location.reload()
            }}
            className="space-y-3"
          >
            <input type="hidden" name="trip_id" value={trip.id} />
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Day #</Label><Input name="day_number" placeholder="e.g. 3" /></div>
              <div><Label>Points</Label><Input name="points" defaultValue="10" /></div>
              <div><Label>Type</Label><Select name="challenge_type" options={CHALLENGE_TYPES} /></div>
            </div>
            <div><Label>Title *</Label><Input name="title" required placeholder="Find the Blue Door" /></div>
            <div><Label>Description *</Label><Textarea name="description" required placeholder="Full challenge text shown to travelers…" rows={3} /></div>
            <div><Label>Transliteration (optional)</Label><Input name="transliteration" placeholder="Arabic/French pronunciation guide…" /></div>
            <div className="flex gap-3">
              <SaveBtn pending={pending} />
              <button type="button" onClick={() => setAdding(false)} className="text-xs text-ink-muted">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {challenges.map(c => <ChallengeRow key={c.id} challenge={c} tripId={trip.id} />)}
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
            await upsertChallengeAction(fd)
            setEditing(false)
            window.location.reload()
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={challenge.id} />
          <input type="hidden" name="trip_id" value={tripId} />
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Day #</Label><Input name="day_number" defaultValue={String(challenge.day_number || '')} /></div>
            <div><Label>Points</Label><Input name="points" defaultValue={String(challenge.points)} /></div>
            <div><Label>Type</Label><Select name="challenge_type" defaultValue={challenge.challenge_type} options={CHALLENGE_TYPES} /></div>
          </div>
          <div><Label>Title *</Label><Input name="title" defaultValue={challenge.title} required /></div>
          <div><Label>Description *</Label><Textarea name="description" defaultValue={challenge.description} required rows={3} /></div>
          <div><Label>Transliteration</Label><Input name="transliteration" defaultValue={challenge.transliteration} /></div>
          <div className="flex gap-3">
            <SaveBtn pending={pending} />
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-ink-muted">Cancel</button>
          </div>
        </form>
      )}
    </Card>
  )
}

// ── Packing Tab (read-only for now) ──────────────────────────────────────────

function PackingTab({ packing }: { packing: PackingItem[] }) {
  const byCategory = packing.reduce((acc, item) => {
    const cat = item.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, PackingItem[]>)

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink-muted">Packing list — {packing.length} items across {Object.keys(byCategory).length} categories.</p>
      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="font-serif font-bold text-navy mb-3">{cat}</h3>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-4 px-4 py-3 bg-white border border-gray-100 rounded-sm">
                <span className="text-sm text-navy font-medium flex-1">{item.label}</span>
                {item.traveler_key && <span className="text-xs text-ink-muted">{item.traveler_key}</span>}
                {item.amazon_url && <a href={item.amazon_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:opacity-75">Amazon →</a>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Recommendations Tab (read-only for now) ───────────────────────────────────

function RecsTab({ recs }: { recs: Rec[] }) {
  const byType = recs.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, Rec[]>)

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink-muted">{recs.length} recommendations.</p>
      {Object.entries(byType).map(([type, items]) => (
        <div key={type}>
          <h3 className="font-serif font-bold text-navy mb-3 capitalize">{type}s</h3>
          <div className="space-y-2">
            {items.map(r => (
              <div key={r.id} className="px-4 py-3 bg-white border border-gray-100 rounded-sm">
                <p className="font-semibold text-navy text-sm">{r.title}</p>
                {r.author && <p className="text-xs text-ink-muted">{r.author}</p>}
                <div className="flex gap-3 mt-1">
                  {r.amazon_url && <a href={r.amazon_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:opacity-75">Amazon →</a>}
                  {r.streaming_url && <a href={r.streaming_url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-muted hover:text-navy">{r.streaming_platform} →</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
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
