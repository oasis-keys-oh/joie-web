'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  upsertIntakeFieldAction,
  upsertIntakeJsonFieldAction,
  generateBriefAction,
  updateIntakeStatusAction,
} from '@/app/admin/intake/actions'

// ── Types ────────────────────────────────────────────────────────────────────

interface TravelerProfile {
  name: string
  role: string
  personality: string
  dietary: string
  mobility: string
  pillow: string
  coffee: string
  curtains: string
  anniversary_date: string
  instagram: string
}

interface Hotel {
  name: string
  destination: string
  check_in: string
  check_out: string
  confirmation: string
  address: string
  phone: string
  website: string
  tier_notes: string
}

interface Flight {
  traveler_names: string
  origin: string
  destination: string
  flight_number: string
  airline: string
  departure_datetime: string
  arrival_datetime: string
  class: string
  confirmation: string
}

interface Restaurant {
  name: string
  destination: string
  date: string
  time: string
  party_size: string
  confirmation: string
  address: string
  phone: string
  notes: string
}

interface DayOutline {
  day_number: number
  date: string
  location: string
  region: string
  title: string
  headline_activity: string
  notes: string
  pace: string
  ef_day: boolean
  has_reservation: boolean
}

interface ResearchFlag {
  day_number: string
  type: string
  note: string
}

interface IntakeRecord {
  id: string
  status: string
  // Form fields
  primary_traveler_name: string | null
  partner_name: string | null
  additional_travelers: string | null
  traveler_count: number | null
  contact_email: string | null
  contact_phone: string | null
  destinations: string | null
  start_date: string | null
  end_date: string | null
  trip_duration_days: number | null
  is_flexible_dates: boolean | null
  tier: string | null
  trip_type: string | null
  special_occasion: string | null
  is_surprise: boolean | null
  surprise_notes: string | null
  dietary_notes: string | null
  mobility_notes: string | null
  accommodation_style: string | null
  pace_preference: string | null
  interests: string | null
  budget_signal: string | null
  instagram_handle: string | null
  referral_source: string | null
  form_notes: string | null
  // Curator fields
  trip_title: string | null
  trip_subtitle: string | null
  web_slug: string | null
  color_theme_primary: string | null
  color_theme_accent: string | null
  dedication: string | null
  epigraph: string | null
  epigraph_translation: string | null
  epigraph_transliteration: string | null
  trip_narrative_notes: string | null
  has_phrases: boolean | null
  has_ef: boolean | null
  has_thread_boxes: boolean | null
  has_scavenger_hunt: boolean | null
  has_cultural_etiquette: boolean | null
  has_shopping_guide: boolean | null
  traveler_profiles: TravelerProfile[] | null
  primary_credit_card: string | null
  card_benefits_notes: string | null
  hotels: Hotel[] | null
  flights: Flight[] | null
  restaurants: Restaurant[] | null
  days_outline: DayOutline[] | null
  research_needed: ResearchFlag[] | null
  curator_notes: string | null
  phone_call_notes: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function saved() {
  // could show toast — for now we just log
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs uppercase tracking-widest text-ink-muted mb-1" style={{ letterSpacing: '0.12em' }}>
      {children}
    </label>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif text-xl font-bold text-navy mb-4 mt-8 pb-2 border-b border-gray-200">
      {children}
    </h3>
  )
}

function TextInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  placeholder?: string
  hint?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-ink-muted mb-1 italic">{hint}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-navy transition-colors bg-white"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  onBlur,
  rows = 3,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={rows}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-navy transition-colors bg-white resize-y"
      />
    </div>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded-sm accent-navy"
      />
      <span className="text-sm text-ink">{label}</span>
    </label>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs uppercase tracking-widest px-4 py-2 border border-dashed border-gray-300 text-ink-muted rounded-sm hover:border-navy hover:text-navy transition-colors"
      style={{ letterSpacing: '0.1em' }}
    >
      + {label}
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest"
      style={{ letterSpacing: '0.1em' }}
    >
      Remove
    </button>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-sm bg-white p-4 space-y-3">
      {children}
    </div>
  )
}

// ── Readonly submission summary ───────────────────────────────────────────────

function SubmissionSummary({ rec }: { rec: IntakeRecord }) {
  const rows = [
    ['Primary Traveler', rec.primary_traveler_name],
    ['Partner', rec.partner_name],
    ['Additional Travelers', rec.additional_travelers],
    ['Contact Email', rec.contact_email],
    ['Contact Phone', rec.contact_phone],
    ['Destinations', rec.destinations],
    ['Dates', [rec.start_date, rec.end_date].filter(Boolean).join(' → ')],
    ['Duration', rec.trip_duration_days ? `${rec.trip_duration_days} days` : null],
    ['Flexible Dates', rec.is_flexible_dates ? 'Yes' : null],
    ['Tier', rec.tier],
    ['Trip Type', rec.trip_type],
    ['Special Occasion', rec.special_occasion],
    ['Surprise', rec.is_surprise ? `Yes — ${rec.surprise_notes || ''}` : null],
    ['Dietary Notes', rec.dietary_notes],
    ['Mobility Notes', rec.mobility_notes],
    ['Accommodation Style', rec.accommodation_style],
    ['Pace Preference', rec.pace_preference],
    ['Interests', rec.interests],
    ['Budget Signal', rec.budget_signal],
    ['Instagram', rec.instagram_handle],
    ['Referral Source', rec.referral_source],
    ['Form Notes', rec.form_notes],
  ].filter(([, v]) => v)

  return (
    <div className="bg-white border border-gray-100 rounded-sm p-6 mb-6">
      <p className="text-xs uppercase tracking-widest text-ink-muted mb-4" style={{ letterSpacing: '0.18em' }}>
        Order Form Submission (read-only)
      </p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label as string} className="flex gap-2">
            <span className="text-xs text-ink-muted w-36 shrink-0">{label}</span>
            <span className="text-sm text-ink">{value as string}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main form ────────────────────────────────────────────────────────────────

export default function IntakeCuratorForm({ record }: { record: IntakeRecord }) {
  const router = useRouter()
  const id = record.id

  // ── Simple text/textarea field state ──────────────────────────────────────

  const [tripTitle, setTripTitle] = useState(record.trip_title ?? '')
  const [tripSubtitle, setTripSubtitle] = useState(record.trip_subtitle ?? '')
  const [webSlug, setWebSlug] = useState(record.web_slug ?? '')
  const [colorPrimary, setColorPrimary] = useState(record.color_theme_primary ?? '#1B2B4B')
  const [colorAccent, setColorAccent] = useState(record.color_theme_accent ?? '#C9A84C')
  const [dedication, setDedication] = useState(record.dedication ?? '')
  const [epigraph, setEpigraph] = useState(record.epigraph ?? '')
  const [epigraphTranslation, setEpigraphTranslation] = useState(record.epigraph_translation ?? '')
  const [epigraphTranslit, setEpigraphTranslit] = useState(record.epigraph_transliteration ?? '')
  const [narrativeNotes, setNarrativeNotes] = useState(record.trip_narrative_notes ?? '')

  // ── Flags ─────────────────────────────────────────────────────────────────

  const [hasPhrases, setHasPhrases] = useState(record.has_phrases ?? true)
  const [hasEf, setHasEf] = useState(record.has_ef ?? false)
  const [hasThreadBoxes, setHasThreadBoxes] = useState(record.has_thread_boxes ?? true)
  const [hasScavengerHunt, setHasScavengerHunt] = useState(record.has_scavenger_hunt ?? false)
  const [hasCulturalEtiquette, setHasCulturalEtiquette] = useState(record.has_cultural_etiquette ?? true)
  const [hasShoppingGuide, setHasShoppingGuide] = useState(record.has_shopping_guide ?? false)

  // ── Credit card ───────────────────────────────────────────────────────────

  const [creditCard, setCreditCard] = useState(record.primary_credit_card ?? '')
  const [cardBenefits, setCardBenefits] = useState(record.card_benefits_notes ?? '')

  // ── Curator notes ─────────────────────────────────────────────────────────

  const [phoneCallNotes, setPhoneCallNotes] = useState(record.phone_call_notes ?? '')
  const [curatorNotes, setCuratorNotes] = useState(record.curator_notes ?? '')

  // ── JSONB arrays ──────────────────────────────────────────────────────────

  const [travelerProfiles, setTravelerProfiles] = useState<TravelerProfile[]>(
    record.traveler_profiles ?? []
  )
  const [hotels, setHotels] = useState<Hotel[]>(record.hotels ?? [])
  const [flights, setFlights] = useState<Flight[]>(record.flights ?? [])
  const [restaurants, setRestaurants] = useState<Restaurant[]>(record.restaurants ?? [])
  const [daysOutline, setDaysOutline] = useState<DayOutline[]>(() => {
    if (record.days_outline && record.days_outline.length > 0) return record.days_outline
    // Auto-generate day skeleton from start/end dates if present
    if (record.start_date && record.end_date) {
      const start = new Date(record.start_date)
      const end = new Date(record.end_date)
      const days: DayOutline[] = []
      let current = new Date(start)
      let dayNum = 1
      while (current <= end) {
        days.push({
          day_number: dayNum,
          date: current.toISOString().split('T')[0],
          location: '',
          region: '',
          title: '',
          headline_activity: '',
          notes: '',
          pace: 'moderate',
          ef_day: false,
          has_reservation: false,
        })
        current.setDate(current.getDate() + 1)
        dayNum++
      }
      return days
    }
    return []
  })
  const [researchFlags, setResearchFlags] = useState<ResearchFlag[]>(
    record.research_needed ?? []
  )

  // ── Save indicator ────────────────────────────────────────────────────────

  const [saveIndicator, setSaveIndicator] = useState<string | null>(null)

  const showSaved = () => {
    setSaveIndicator('Saved')
    setTimeout(() => setSaveIndicator(null), 1500)
  }

  // ── Blur save helpers ─────────────────────────────────────────────────────

  const saveField = useCallback(async (field: string, value: string | boolean | null) => {
    await upsertIntakeFieldAction(id, field, value)
    showSaved()
  }, [id])

  const saveJson = useCallback(async (field: string, value: unknown[]) => {
    await upsertIntakeJsonFieldAction(id, field, value)
    showSaved()
  }, [id])

  // ── Generate brief ────────────────────────────────────────────────────────

  const handleGenerateBrief = async () => {
    await generateBriefAction(id)
  }

  // ── Traveler profile helpers ──────────────────────────────────────────────

  const emptyTraveler = (): TravelerProfile => ({
    name: '', role: '', personality: '', dietary: '', mobility: '',
    pillow: '', coffee: '', curtains: '', anniversary_date: '', instagram: '',
  })

  const updateTraveler = (idx: number, field: keyof TravelerProfile, val: string) => {
    const updated = travelerProfiles.map((t, i) => i === idx ? { ...t, [field]: val } : t)
    setTravelerProfiles(updated)
  }

  const saveTravelers = () => saveJson('traveler_profiles', travelerProfiles)

  // ── Hotel helpers ─────────────────────────────────────────────────────────

  const emptyHotel = (): Hotel => ({
    name: '', destination: '', check_in: '', check_out: '', confirmation: '',
    address: '', phone: '', website: '', tier_notes: '',
  })

  const updateHotel = (idx: number, field: keyof Hotel, val: string) => {
    const updated = hotels.map((h, i) => i === idx ? { ...h, [field]: val } : h)
    setHotels(updated)
  }

  const saveHotels = () => saveJson('hotels', hotels)

  // ── Flight helpers ────────────────────────────────────────────────────────

  const emptyFlight = (): Flight => ({
    traveler_names: '', origin: '', destination: '', flight_number: '',
    airline: '', departure_datetime: '', arrival_datetime: '', class: '', confirmation: '',
  })

  const updateFlight = (idx: number, field: keyof Flight, val: string) => {
    const updated = flights.map((f, i) => i === idx ? { ...f, [field]: val } : f)
    setFlights(updated)
  }

  const saveFlights = () => saveJson('flights', flights)

  // ── Restaurant helpers ────────────────────────────────────────────────────

  const emptyRestaurant = (): Restaurant => ({
    name: '', destination: '', date: '', time: '', party_size: '',
    confirmation: '', address: '', phone: '', notes: '',
  })

  const updateRestaurant = (idx: number, field: keyof Restaurant, val: string) => {
    const updated = restaurants.map((r, i) => i === idx ? { ...r, [field]: val } : r)
    setRestaurants(updated)
  }

  const saveRestaurants = () => saveJson('restaurants', restaurants)

  // ── Day outline helpers ───────────────────────────────────────────────────

  const emptyDay = (dayNum: number): DayOutline => ({
    day_number: dayNum, date: '', location: '', region: '', title: '',
    headline_activity: '', notes: '', pace: 'moderate', ef_day: false, has_reservation: false,
  })

  const updateDay = (idx: number, field: keyof DayOutline, val: string | boolean | number) => {
    const updated = daysOutline.map((d, i) => i === idx ? { ...d, [field]: val } : d)
    setDaysOutline(updated)
  }

  const saveDays = () => saveJson('days_outline', daysOutline)

  // ── Research flag helpers ─────────────────────────────────────────────────

  const emptyResearchFlag = (): ResearchFlag => ({ day_number: '', type: 'photo_spot', note: '' })

  const updateFlag = (idx: number, field: keyof ResearchFlag, val: string) => {
    const updated = researchFlags.map((f, i) => i === idx ? { ...f, [field]: val } : f)
    setResearchFlags(updated)
  }

  const saveFlags = () => saveJson('research_needed', researchFlags)

  // ── Status ────────────────────────────────────────────────────────────────

  const handleStatusChange = async (newStatus: string) => {
    await updateIntakeStatusAction(id, newStatus)
    router.refresh()
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 relative">

      {/* Save indicator */}
      {saveIndicator && (
        <div className="fixed top-4 right-4 bg-navy text-white text-xs uppercase tracking-widest px-4 py-2 rounded-sm shadow-lg z-50" style={{ letterSpacing: '0.12em' }}>
          ✓ {saveIndicator}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted mb-2" style={{ letterSpacing: '0.2em' }}>
            Intake Curator
          </p>
          <h1 className="font-serif text-4xl font-bold text-navy">
            {record.primary_traveler_name
              ? `${record.primary_traveler_name}${record.partner_name ? ' & ' + record.partner_name : ''}`
              : 'New Intake'}
          </h1>
          {record.destinations && (
            <p className="text-ink-muted text-sm mt-1">{record.destinations}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={record.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs uppercase tracking-widest border border-gray-200 rounded-sm px-3 py-2 bg-white text-ink focus:outline-none focus:border-navy"
            style={{ letterSpacing: '0.1em' }}
          >
            <option value="submitted">Submitted</option>
            <option value="in_review">In Review</option>
            <option value="brief_generated">Brief Generated</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      {/* Submission summary (read-only) */}
      <SubmissionSummary rec={record} />

      {/* ── Section 1: Trip Identity ── */}
      <SectionTitle>1 — Trip Identity</SectionTitle>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Trip Title" value={tripTitle} onChange={setTripTitle}
            onBlur={() => saveField('trip_title', tripTitle)}
            placeholder="The Andalusian Thread" />
          <TextInput label="Subtitle" value={tripSubtitle} onChange={setTripSubtitle}
            onBlur={() => saveField('trip_subtitle', tripSubtitle)}
            placeholder="Morocco · France · June 2026" />
        </div>
        <TextInput label="Web Slug" value={webSlug} onChange={setWebSlug}
          onBlur={() => saveField('web_slug', webSlug)}
          placeholder="hamid-andalusia-2026"
          hint="Format: first-last-destination-year" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Color Theme — Primary</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={colorPrimary}
                onChange={(e) => setColorPrimary(e.target.value)}
                onBlur={() => saveField('color_theme_primary', colorPrimary)}
                className="w-10 h-9 border border-gray-200 rounded-sm cursor-pointer" />
              <input type="text" value={colorPrimary}
                onChange={(e) => setColorPrimary(e.target.value)}
                onBlur={() => saveField('color_theme_primary', colorPrimary)}
                className="flex-1 border border-gray-200 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-navy" />
            </div>
          </div>
          <div>
            <Label>Color Theme — Accent</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={colorAccent}
                onChange={(e) => setColorAccent(e.target.value)}
                onBlur={() => saveField('color_theme_accent', colorAccent)}
                className="w-10 h-9 border border-gray-200 rounded-sm cursor-pointer" />
              <input type="text" value={colorAccent}
                onChange={(e) => setColorAccent(e.target.value)}
                onBlur={() => saveField('color_theme_accent', colorAccent)}
                className="flex-1 border border-gray-200 rounded-sm px-3 py-2 text-sm font-mono focus:outline-none focus:border-navy" />
            </div>
          </div>
        </div>
        <TextArea label="Dedication" value={dedication} onChange={setDedication}
          onBlur={() => saveField('dedication', dedication)}
          placeholder="For Omar & Kristi — twenty-five years of choosing each other." />
        <TextArea label="Epigraph (original language)" value={epigraph} onChange={setEpigraph}
          onBlur={() => saveField('epigraph', epigraph)} rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <TextArea label="Epigraph Translation" value={epigraphTranslation}
            onChange={setEpigraphTranslation}
            onBlur={() => saveField('epigraph_translation', epigraphTranslation)} rows={2} />
          <TextArea label="Epigraph Transliteration" value={epigraphTranslit}
            onChange={setEpigraphTranslit}
            onBlur={() => saveField('epigraph_transliteration', epigraphTranslit)} rows={2} />
        </div>
        <TextArea label="Welcome Narrative Notes" value={narrativeNotes}
          onChange={setNarrativeNotes}
          onBlur={() => saveField('trip_narrative_notes', narrativeNotes)}
          rows={5}
          placeholder="Curator's rough notes — Claude will write the full 5-paragraph literary essay from these." />
      </div>

      {/* ── Section 2: Trip Flags ── */}
      <SectionTitle>2 — Trip Flags</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Phrase of the Day', val: hasPhrases, set: setHasPhrases, field: 'has_phrases' },
          { label: 'EF Adventures Days', val: hasEf, set: setHasEf, field: 'has_ef' },
          { label: 'Historical Thread Boxes', val: hasThreadBoxes, set: setHasThreadBoxes, field: 'has_thread_boxes' },
          { label: 'Scavenger Hunt', val: hasScavengerHunt, set: setHasScavengerHunt, field: 'has_scavenger_hunt' },
          { label: 'Cultural Etiquette Section', val: hasCulturalEtiquette, set: setHasCulturalEtiquette, field: 'has_cultural_etiquette' },
          { label: 'Shopping Guide', val: hasShoppingGuide, set: setHasShoppingGuide, field: 'has_shopping_guide' },
        ].map(({ label, val, set, field }) => (
          <CheckboxField
            key={field}
            label={label}
            checked={val}
            onChange={(v) => { set(v); saveField(field, v) }}
          />
        ))}
      </div>

      {/* ── Section 3: Traveler Profiles ── */}
      <SectionTitle>3 — Traveler Profiles</SectionTitle>
      <div className="space-y-4">
        {travelerProfiles.map((tp, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-ink-muted" style={{ letterSpacing: '0.1em' }}>
                Traveler {idx + 1}
              </span>
              <RemoveButton onClick={() => {
                const updated = travelerProfiles.filter((_, i) => i !== idx)
                setTravelerProfiles(updated)
                saveJson('traveler_profiles', updated)
              }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Name', 'name'], ['Role in Group', 'role'],
                ['Pillow Firmness', 'pillow'], ['Morning Coffee Order', 'coffee'],
                ['Curtain Preference', 'curtains'], ['Anniversary Date', 'anniversary_date'],
                ['Instagram Handle', 'instagram'],
              ] as [string, keyof TravelerProfile][]).map(([label, field]) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <input type="text" value={tp[field] as string}
                    onChange={(e) => updateTraveler(idx, field, e.target.value)}
                    onBlur={saveTravelers}
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
                </div>
              ))}
            </div>
            <div>
              <Label>Personality</Label>
              <textarea value={tp.personality}
                onChange={(e) => updateTraveler(idx, 'personality', e.target.value)}
                onBlur={saveTravelers}
                rows={2}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dietary Notes</Label>
                <input type="text" value={tp.dietary}
                  onChange={(e) => updateTraveler(idx, 'dietary', e.target.value)}
                  onBlur={saveTravelers}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
              </div>
              <div>
                <Label>Mobility Notes</Label>
                <input type="text" value={tp.mobility}
                  onChange={(e) => updateTraveler(idx, 'mobility', e.target.value)}
                  onBlur={saveTravelers}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
              </div>
            </div>
          </Card>
        ))}
        <AddButton label="Add Traveler" onClick={() => {
          const updated = [...travelerProfiles, emptyTraveler()]
          setTravelerProfiles(updated)
          saveJson('traveler_profiles', updated)
        }} />
      </div>

      {/* ── Section 4: Hotels ── */}
      <SectionTitle>4 — Hotels (Confirmed)</SectionTitle>
      <div className="space-y-4">
        {hotels.map((hotel, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-ink-muted" style={{ letterSpacing: '0.1em' }}>
                Hotel {idx + 1}
              </span>
              <RemoveButton onClick={() => {
                const updated = hotels.filter((_, i) => i !== idx)
                setHotels(updated)
                saveJson('hotels', updated)
              }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Hotel Name', 'name'], ['City / Destination', 'destination'],
                ['Check-In Date', 'check_in'], ['Check-Out Date', 'check_out'],
                ['Confirmation #', 'confirmation'], ['Phone', 'phone'],
                ['Website', 'website'],
              ] as [string, keyof Hotel][]).map(([label, field]) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <input type="text" value={hotel[field] as string}
                    onChange={(e) => updateHotel(idx, field, e.target.value)}
                    onBlur={saveHotels}
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
                </div>
              ))}
            </div>
            <div>
              <Label>Address</Label>
              <input type="text" value={hotel.address}
                onChange={(e) => updateHotel(idx, 'address', e.target.value)}
                onBlur={saveHotels}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
            </div>
            <div>
              <Label>Curator Tier Notes</Label>
              <textarea value={hotel.tier_notes}
                onChange={(e) => updateHotel(idx, 'tier_notes', e.target.value)}
                onBlur={saveHotels}
                rows={2}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white resize-y" />
            </div>
          </Card>
        ))}
        <AddButton label="Add Hotel" onClick={() => {
          const updated = [...hotels, emptyHotel()]
          setHotels(updated)
          saveJson('hotels', updated)
        }} />
      </div>

      {/* ── Section 5: Flights ── */}
      <SectionTitle>5 — Flights (Confirmed)</SectionTitle>
      <div className="space-y-4">
        {flights.map((flight, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-ink-muted" style={{ letterSpacing: '0.1em' }}>
                Flight {idx + 1}
              </span>
              <RemoveButton onClick={() => {
                const updated = flights.filter((_, i) => i !== idx)
                setFlights(updated)
                saveJson('flights', updated)
              }} />
            </div>
            <div>
              <Label>Traveler Names</Label>
              <input type="text" value={flight.traveler_names}
                onChange={(e) => updateFlight(idx, 'traveler_names', e.target.value)}
                onBlur={saveFlights}
                placeholder="Omar & Kristi"
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Origin (IATA)', 'origin'], ['Destination (IATA)', 'destination'],
                ['Airline', 'airline'], ['Flight Number', 'flight_number'],
                ['Departure', 'departure_datetime'], ['Arrival', 'arrival_datetime'],
                ['Class', 'class'], ['Confirmation #', 'confirmation'],
              ] as [string, keyof Flight][]).map(([label, field]) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <input type="text" value={flight[field] as string}
                    onChange={(e) => updateFlight(idx, field, e.target.value)}
                    onBlur={saveFlights}
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
                </div>
              ))}
            </div>
          </Card>
        ))}
        <AddButton label="Add Flight Leg" onClick={() => {
          const updated = [...flights, emptyFlight()]
          setFlights(updated)
          saveJson('flights', updated)
        }} />
      </div>

      {/* ── Section 6: Restaurants ── */}
      <SectionTitle>6 — Confirmed Restaurant Reservations</SectionTitle>
      <div className="space-y-4">
        {restaurants.map((res, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-ink-muted" style={{ letterSpacing: '0.1em' }}>
                Restaurant {idx + 1}
              </span>
              <RemoveButton onClick={() => {
                const updated = restaurants.filter((_, i) => i !== idx)
                setRestaurants(updated)
                saveJson('restaurants', updated)
              }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Restaurant Name', 'name'], ['City', 'destination'],
                ['Date', 'date'], ['Time', 'time'],
                ['Party Size', 'party_size'], ['Confirmation #', 'confirmation'],
                ['Phone', 'phone'],
              ] as [string, keyof Restaurant][]).map(([label, field]) => (
                <div key={field}>
                  <Label>{label}</Label>
                  <input type="text" value={res[field] as string}
                    onChange={(e) => updateRestaurant(idx, field, e.target.value)}
                    onBlur={saveRestaurants}
                    className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
                </div>
              ))}
            </div>
            <div>
              <Label>Address</Label>
              <input type="text" value={res.address}
                onChange={(e) => updateRestaurant(idx, 'address', e.target.value)}
                onBlur={saveRestaurants}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
            </div>
            <div>
              <Label>Notes</Label>
              <textarea value={res.notes}
                onChange={(e) => updateRestaurant(idx, 'notes', e.target.value)}
                onBlur={saveRestaurants}
                rows={2}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white resize-y" />
            </div>
          </Card>
        ))}
        <AddButton label="Add Restaurant" onClick={() => {
          const updated = [...restaurants, emptyRestaurant()]
          setRestaurants(updated)
          saveJson('restaurants', updated)
        }} />
      </div>

      {/* ── Section 7: Day-by-Day Outline ── */}
      <SectionTitle>7 — Day-by-Day Outline</SectionTitle>
      <div className="space-y-4">
        {daysOutline.map((day, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-serif font-bold text-navy text-sm">
                Day {day.day_number}{day.date ? ` — ${day.date}` : ''}
              </span>
              <RemoveButton onClick={() => {
                const updated = daysOutline.filter((_, i) => i !== idx)
                setDaysOutline(updated)
                saveJson('days_outline', updated)
              }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Location</Label>
                <input type="text" value={day.location}
                  onChange={(e) => updateDay(idx, 'location', e.target.value)}
                  onBlur={saveDays}
                  placeholder="Marrakech"
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
              </div>
              <div>
                <Label>Region</Label>
                <input type="text" value={day.region}
                  onChange={(e) => updateDay(idx, 'region', e.target.value)}
                  onBlur={saveDays}
                  placeholder="Morocco"
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
              </div>
              <div>
                <Label>Day Title</Label>
                <input type="text" value={day.title}
                  onChange={(e) => updateDay(idx, 'title', e.target.value)}
                  onBlur={saveDays}
                  placeholder="The Medina Unveiled"
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
              </div>
              <div>
                <Label>Headline Activity</Label>
                <input type="text" value={day.headline_activity}
                  onChange={(e) => updateDay(idx, 'headline_activity', e.target.value)}
                  onBlur={saveDays}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 items-end">
              <div>
                <Label>Pace</Label>
                <select value={day.pace}
                  onChange={(e) => { updateDay(idx, 'pace', e.target.value); saveDays() }}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white">
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="intense">Intense</option>
                </select>
              </div>
              <CheckboxField label="EF Day" checked={day.ef_day}
                onChange={(v) => { updateDay(idx, 'ef_day', v); saveDays() }} />
              <CheckboxField label="Confirmed Reservation" checked={day.has_reservation}
                onChange={(v) => { updateDay(idx, 'has_reservation', v); saveDays() }} />
            </div>
            <div>
              <Label>Curator Notes</Label>
              <textarea value={day.notes}
                onChange={(e) => updateDay(idx, 'notes', e.target.value)}
                onBlur={saveDays}
                rows={2}
                className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white resize-y" />
            </div>
          </Card>
        ))}
        <AddButton label="Add Day" onClick={() => {
          const nextNum = daysOutline.length > 0 ? Math.max(...daysOutline.map(d => d.day_number)) + 1 : 1
          const updated = [...daysOutline, emptyDay(nextNum)]
          setDaysOutline(updated)
          saveJson('days_outline', updated)
        }} />
      </div>

      {/* ── Section 8: Research Flags ── */}
      <SectionTitle>8 — Research Flags</SectionTitle>
      <p className="text-xs text-ink-muted mb-4">
        Flag anything that needs live research (Perplexity, Google Maps, etc.) — Claude will mark these RESEARCH_NEEDED in the SQL output rather than inventing a generic answer.
      </p>
      <div className="space-y-3">
        {researchFlags.map((flag, idx) => (
          <Card key={idx}>
            <div className="flex items-center gap-3">
              <div className="w-20">
                <Label>Day #</Label>
                <input type="text" value={flag.day_number}
                  onChange={(e) => updateFlag(idx, 'day_number', e.target.value)}
                  onBlur={saveFlags}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
              </div>
              <div className="w-40">
                <Label>Type</Label>
                <select value={flag.type}
                  onChange={(e) => { updateFlag(idx, 'type', e.target.value); saveFlags() }}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white">
                  <option value="photo_spot">Photo Spot</option>
                  <option value="insider_tip">Insider Tip</option>
                  <option value="briefing_card">Briefing Card</option>
                  <option value="history">History</option>
                  <option value="phrase">Phrase</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex-1">
                <Label>Note</Label>
                <input type="text" value={flag.note}
                  onChange={(e) => updateFlag(idx, 'note', e.target.value)}
                  onBlur={saveFlags}
                  className="w-full border border-gray-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white" />
              </div>
              <div className="pt-5">
                <RemoveButton onClick={() => {
                  const updated = researchFlags.filter((_, i) => i !== idx)
                  setResearchFlags(updated)
                  saveJson('research_needed', updated)
                }} />
              </div>
            </div>
          </Card>
        ))}
        <AddButton label="Add Research Flag" onClick={() => {
          const updated = [...researchFlags, emptyResearchFlag()]
          setResearchFlags(updated)
          saveJson('research_needed', updated)
        }} />
      </div>

      {/* ── Section 9: Credit Card & Benefits ── */}
      <SectionTitle>9 — Credit Card & Benefits</SectionTitle>
      <div className="space-y-4">
        <TextInput label="Primary Credit Card" value={creditCard} onChange={setCreditCard}
          onBlur={() => saveField('primary_credit_card', creditCard)}
          placeholder="Capital One Venture X" />
        <TextArea label="Benefits Relevant to This Trip" value={cardBenefits}
          onChange={setCardBenefits}
          onBlur={() => saveField('card_benefits_notes', cardBenefits)}
          rows={4}
          placeholder="Lounge access at departure airport, $300 annual travel credit, hotel collection perks, etc." />
      </div>

      {/* ── Section 10: Curator Notes ── */}
      <SectionTitle>10 — Curator Notes (Internal)</SectionTitle>
      <div className="space-y-4">
        <TextArea label="Phone Call Notes" value={phoneCallNotes}
          onChange={setPhoneCallNotes}
          onBlur={() => saveField('phone_call_notes', phoneCallNotes)}
          rows={6}
          placeholder="Freeform — anything from the call. Surprises, special moments, things to avoid, tone of the trip, etc." />
        <TextArea label="Internal Curator Notes" value={curatorNotes}
          onChange={setCuratorNotes}
          onBlur={() => saveField('curator_notes', curatorNotes)}
          rows={4} />
      </div>

      {/* ── Generate Brief button ── */}
      <div className="mt-12 pt-8 border-t-2 border-navy/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-navy">Ready to Generate the Brief?</h3>
            <p className="text-sm text-ink-muted mt-1">
              This will lock the intake status to "Brief Generated" and open the formatted Claude prompt.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateBrief}
            className="text-sm uppercase tracking-widest px-8 py-4 text-white rounded-sm hover:opacity-85 transition-opacity font-bold shadow-md"
            style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
          >
            Generate Claude Brief →
          </button>
        </div>
      </div>

    </div>
  )
}
