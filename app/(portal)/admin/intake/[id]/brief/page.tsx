import { redirect, notFound } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/admin/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import CopyBriefButton from './CopyBriefButton'

interface Props {
  params: { id: string }
}

// ── Prompt generator ─────────────────────────────────────────────────────────

function generatePrompt(rec: Record<string, any>): string {
  const lines: string[] = []

  const line = (s: string) => lines.push(s)
  const blank = () => lines.push('')

  line(`# Oukala Journeys — New Trip Population Brief`)
  line(`Session type: ITINERARY BUILD`)
  line(`Trip: ${rec.trip_title ?? '[TITLE NOT SET]'}`)
  line(`Curator: Omar Hamid`)
  blank()
  line(`## Your Role`)
  line(`You are populating a new Oukala Journeys itinerary into Supabase.`)
  line(`Read this entire brief before writing any SQL. When done, you will have`)
  line(`produced INSERT statements for every relevant table, organized in the`)
  line(`correct dependency order.`)
  blank()
  line(`## Platform Rules (Non-Negotiable)`)
  line(`- One database drives three outputs: web portal, Joie app, print document.`)
  line(`  Never hardcode content in any output layer.`)
  line(`- Every day card is a rip-out standalone — all critical info must be on the day itself.`)
  line(`- local_insider_tip is REQUIRED for every day visiting a named destination.`)
  line(`- photo_spot is REQUIRED for every day with an outdoor landmark.`)
  line(`- Restaurant briefing_card is REQUIRED for every confirmed dinner reservation.`)
  line(`- Phrase of the Day: specific to the neighborhood/situation, never generic.`)
  line(`- Dietary flags: mention ONCE in traveler profiles. Never repeat in day content.`)
  line(`- All times include a +15 min buffer and an explicit "leave by" time.`)
  line(`- Confidence: if you don't know something with specificity, flag it as`)
  line(`  RESEARCH_NEEDED rather than inventing a generic answer.`)
  blank()
  line(`## The Travelers`)
  if (rec.traveler_profiles && rec.traveler_profiles.length > 0) {
    for (const tp of rec.traveler_profiles) {
      blank()
      line(`Name: ${tp.name ?? '—'}`)
      line(`Role: ${tp.role ?? '—'}`)
      line(`Personality: ${tp.personality ?? '—'}`)
      line(`Dietary: ${tp.dietary ?? 'None noted'}`)
      line(`Mobility: ${tp.mobility ?? 'None noted'}`)
      line(`Hotel preferences: pillow ${tp.pillow ?? '—'}, coffee ${tp.coffee ?? '—'}, curtains ${tp.curtains ?? '—'}`)
      if (tp.instagram) line(`Instagram: ${tp.instagram}`)
      if (tp.anniversary_date) line(`Anniversary: ${tp.anniversary_date}`)
    }
  } else {
    blank()
    line(`Primary Traveler: ${rec.primary_traveler_name ?? '—'}`)
    if (rec.partner_name) line(`Partner: ${rec.partner_name}`)
    if (rec.additional_travelers) line(`Additional: ${rec.additional_travelers}`)
    if (rec.dietary_notes) line(`Dietary: ${rec.dietary_notes}`)
    if (rec.mobility_notes) line(`Mobility: ${rec.mobility_notes}`)
  }
  blank()
  line(`## Trip Shell`)
  line(`Title: ${rec.trip_title ?? '—'}`)
  line(`Subtitle: ${rec.trip_subtitle ?? '—'}`)
  line(`Web slug: ${rec.web_slug ?? '—'}`)
  line(`Dates: ${rec.start_date ?? '—'} → ${rec.end_date ?? '—'}${rec.trip_duration_days ? ` (${rec.trip_duration_days} days)` : ''}`)
  line(`Tier: ${rec.tier ?? '—'}`)
  line(`Trip type: ${rec.trip_type ?? '—'}`)
  if (rec.special_occasion) line(`Special occasion: ${rec.special_occasion}`)
  if (rec.is_surprise) line(`⚠️  SURPRISE TRIP — ${rec.surprise_notes ?? 'see curator notes'}`)
  line(`Color theme: primary ${rec.color_theme_primary ?? '#1B2B4B'}, accent ${rec.color_theme_accent ?? '#C9A84C'}`)
  if (rec.dedication) line(`Dedication: "${rec.dedication}"`)
  if (rec.epigraph) {
    line(`Epigraph: "${rec.epigraph}"`)
    if (rec.epigraph_translation) line(`  Translation: ${rec.epigraph_translation}`)
    if (rec.epigraph_transliteration) line(`  Transliteration: ${rec.epigraph_transliteration}`)
  }
  blank()
  if (rec.trip_narrative_notes) {
    line(`Trip narrative notes (write ~5 paragraphs of literary welcome prose from these):`)
    line(rec.trip_narrative_notes)
    blank()
  }
  line(`## Trip Flags`)
  line(`has_phrases: ${rec.has_phrases ? 'true' : 'false'}`)
  line(`has_ef: ${rec.has_ef ? 'true' : 'false'}`)
  line(`has_thread_boxes: ${rec.has_thread_boxes ? 'true' : 'false'}`)
  line(`has_scavenger_hunt: ${rec.has_scavenger_hunt ? 'true' : 'false'}`)
  line(`has_cultural_etiquette: ${rec.has_cultural_etiquette ? 'true' : 'false'}`)
  line(`has_shopping_guide: ${rec.has_shopping_guide ? 'true' : 'false'}`)
  blank()

  if (rec.primary_credit_card || rec.card_benefits_notes) {
    line(`## Credit Card & Benefits`)
    if (rec.primary_credit_card) line(`Card: ${rec.primary_credit_card}`)
    if (rec.card_benefits_notes) line(`Benefits relevant to this trip:\n${rec.card_benefits_notes}`)
    blank()
  }

  if (rec.hotels && rec.hotels.length > 0) {
    line(`## Hotels (Confirmed)`)
    for (const h of rec.hotels) {
      line(`- ${h.name ?? '—'}, ${h.destination ?? '—'}`)
      line(`  Check-in: ${h.check_in ?? '—'} | Check-out: ${h.check_out ?? '—'}`)
      if (h.confirmation) line(`  Confirmation: ${h.confirmation}`)
      if (h.address) line(`  Address: ${h.address}`)
      if (h.phone) line(`  Phone: ${h.phone}`)
      if (h.website) line(`  Website: ${h.website}`)
      if (h.tier_notes) line(`  Notes: ${h.tier_notes}`)
    }
    blank()
  }

  if (rec.flights && rec.flights.length > 0) {
    line(`## Flights (Confirmed)`)
    for (const f of rec.flights) {
      line(`- ${f.traveler_names ?? '—'}: ${f.origin ?? '—'} → ${f.destination ?? '—'}`)
      line(`  ${f.airline ?? '—'} ${f.flight_number ?? '—'} | Departs: ${f.departure_datetime ?? '—'} | Arrives: ${f.arrival_datetime ?? '—'}`)
      if (f.class || f.confirmation) {
        line(`  Class: ${f.class ?? '—'} | Confirmation: ${f.confirmation ?? '—'}`)
      }
    }
    blank()
  }

  if (rec.restaurants && rec.restaurants.length > 0) {
    line(`## Confirmed Restaurant Reservations`)
    for (const r of rec.restaurants) {
      line(`- ${r.name ?? '—'}, ${r.destination ?? '—'} — ${r.date ?? '—'} at ${r.time ?? '—'}, party of ${r.party_size ?? '—'}`)
      if (r.confirmation) line(`  Confirmation: ${r.confirmation}`)
      if (r.address) line(`  Address: ${r.address}`)
      if (r.phone) line(`  Phone: ${r.phone}`)
      if (r.notes) line(`  Notes: ${r.notes}`)
      line(`  → You must write a briefing_card for this restaurant.`)
    }
    blank()
  }

  if (rec.days_outline && rec.days_outline.length > 0) {
    line(`## Day-by-Day Outline`)
    for (const d of rec.days_outline) {
      blank()
      line(`Day ${d.day_number} — ${d.date ?? '—'} — ${d.location ?? '—'}${d.region ? ', ' + d.region : ''}`)
      if (d.title) line(`Title: ${d.title}`)
      if (d.headline_activity) line(`Headline activity: ${d.headline_activity}`)
      line(`Pace: ${d.pace ?? 'moderate'}`)
      line(`EF day: ${d.ef_day ? 'yes' : 'no'}`)
      line(`Confirmed reservation: ${d.has_reservation ? 'yes' : 'no'}`)
      if (d.notes) line(`Curator notes: ${d.notes}`)
    }
    blank()
  }

  if (rec.research_needed && rec.research_needed.length > 0) {
    line(`## Research Flags`)
    line(`The following items need live research (Perplexity or web search).`)
    line(`Do not invent these — mark them RESEARCH_NEEDED in your SQL output and note what's needed.`)
    blank()
    for (const f of rec.research_needed) {
      line(`- Day ${f.day_number} | ${f.type}: ${f.note}`)
    }
    blank()
  }

  if (rec.phone_call_notes || rec.curator_notes) {
    line(`## Curator Notes`)
    if (rec.phone_call_notes) {
      line(`### Phone Call Notes`)
      line(rec.phone_call_notes)
      blank()
    }
    if (rec.curator_notes) {
      line(`### Internal Notes`)
      line(rec.curator_notes)
      blank()
    }
  }

  line(`---`)
  blank()
  line(`## What to Produce`)
  blank()
  line(`Generate SQL INSERT statements in this order:`)
  blank()
  line(`### 1. trips (1 row)`)
  line(`Insert the trip shell. Use gen_random_uuid() for id. Set web_slug, status='active',`)
  line(`tier, color_theme as JSONB, has_phrases, has_ef, has_thread_boxes,`)
  line(`trip_narrative (write the welcome essay from the narrative notes above),`)
  line(`dedication, epigraph, epigraph_translation, epigraph_transliteration,`)
  line(`start_date, end_date.`)
  blank()
  line(`### 2. reference_items — hotels (1 row per hotel)`)
  line(`Insert each confirmed hotel. type='hotel'. Link to trip via trip_id.`)
  blank()
  line(`### 3. reference_items — flights (1 row per flight leg)`)
  line(`Insert each confirmed flight. type='flight'. Include confirmation, notes with`)
  line(`full traveler names and routing.`)
  blank()
  line(`### 4. trip_days (${rec.trip_duration_days ?? 'N'} rows, one per day)`)
  line(`For each day, write a complete row. Do not leave required fields blank.`)
  line(`For each day you must include:`)
  line(`- wow_moment: evocative, first-person present tense, 3–5 sentences`)
  line(`- thread_content + thread_title: historical/intellectual editorial (if has_thread_boxes)`)
  line(`- local_insider_tip: hyper-specific "one thing most people miss" (NOT generic)`)
  line(`- morning_brief: editorial curator note for the day (not logistical)`)
  line(`- phrase: { text, context, meaning, pronunciation } in Darija (Morocco days) or French (France days)`)
  line(`- photo_spot: { location, timing, angle, hashtags, instagram_caption } — flag RESEARCH_NEEDED if unsure of exact timing`)
  line(`- literary_quote: { text, attribution, context }`)
  line(`- meal_breakfast / meal_lunch / meal_dinner: status or venue name`)
  line(`- pace_morning / pace_afternoon: easy | moderate | active | intense`)
  line(`- unsplash_query: 3–5 word search query for the hero image`)
  blank()
  line(`### 5. events (all confirmed events)`)
  line(`For each hotel check-in/check-out, flight, restaurant, and known activity:`)
  line(`- Set type, title, time_start, address, phone, confirmation, notes, callout_type`)
  line(`- For every confirmed restaurant: write the briefing_card JSONB`)
  line(`  { chef_name, off_menu_dish, server_note, dress_tone, arrival_note }`)
  line(`  Flag RESEARCH_NEEDED if you don't know the chef.`)
  blank()
  line(`### 6. packing_items`)
  line(`Write 20–30 packing items. Personalize per traveler where relevant.`)
  line(`Include: category, item, reason (why this specific trip), traveler_key (or 'all').`)
  if (rec.destinations?.toLowerCase().includes('morocco')) {
    line(`Morocco-specific: sun protection, modest dress for medinas, Darija phrasebook,`)
    line(`unlocked phone, dirhams (MAD — remind that MAD ≠ AED).`)
  }
  if (rec.destinations?.toLowerCase().includes('france')) {
    line(`France-specific: layers for Loire evenings, cycling clothes (if EF days).`)
  }
  blank()
  line(`### 7. recommendations (Read/Watch/Listen)`)
  line(`8–12 items: books, films, documentaries, podcasts relevant to the destinations.`)
  line(`Include: type (book/film/podcast/documentary), title, author/director, note,`)
  line(`sort_order.${rec.tier === 'bespoke' ? ' Flag physical_ship=true for all books (Bespoke tier — books mailed with magazine).' : ''}`)
  blank()
  if (rec.has_scavenger_hunt) {
    line(`### 8. hunt_challenges`)
    line(`25 challenges + 1 Grand Finale. Mix of location-specific and traveler-behavior`)
    line(`challenges. Points system. Grand Finale requires a verse submission.`)
    blank()
  }
  line(`### ${rec.has_scavenger_hunt ? '9' : '8'}. pre_trip_content`)
  line(`15 daily drops (date_offset_days -15 through -1).`)
  line(`Types: history, music, phrase, weather, tip.`)
  line(`Each drop: title + 2–3 paragraphs of editorial content.`)
  line(`Anchor to real dates: ${rec.start_date ?? '[start_date]'} minus the offset.`)
  blank()
  line(`### ${rec.has_scavenger_hunt ? '10' : '9'}. UPDATE trip_intake`)
  line(`After all inserts are confirmed, produce:`)
  line(`UPDATE trip_intake SET status='active', trip_id='[new trip uuid]' WHERE id='${rec.id}';`)
  blank()
  line(`---`)
  blank()
  line(`## Output Format`)
  blank()
  line(`For each section, output:`)
  line(`1. A brief explanation of what you're writing and any assumptions`)
  line(`2. The SQL block`)
  line(`3. A RESEARCH_NEEDED list at the end (items flagged during generation)`)
  blank()
  line(`Write the trip_days section day by day — don't batch all days into one unreadable`)
  line(`block. One day, one SQL block, one note.`)
  blank()
  line(`Begin with Step 1 — the trips row.`)

  return lines.join('\n')
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BriefPage({ params }: Props) {
  if (!await isAdminAuthenticated()) redirect('/admin/login')

  const admin = createAdminClient()
  const { data: record, error } = await admin
    .from('trip_intake')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !record) notFound()

  const prompt = generatePrompt(record)
  const travelerLine = [record.primary_traveler_name, record.partner_name]
    .filter(Boolean).join(' & ') || 'Unnamed'

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      {/* Top bar */}
      <div className="border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: '#30363d', background: '#161b22' }}>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/intake/${params.id}`}
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-200 transition-colors"
            style={{ letterSpacing: '0.12em' }}
          >
            ← Back to Intake
          </Link>
          <span style={{ color: '#30363d' }}>|</span>
          <span className="text-xs uppercase tracking-widest text-gray-400" style={{ letterSpacing: '0.12em' }}>
            Claude Brief — {travelerLine}
          </span>
          {record.brief_generated_at && (
            <span className="text-xs text-gray-500">
              Generated {new Date(record.brief_generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
        <CopyBriefButton text={prompt} />
      </div>

      {/* Instructions */}
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
        <div className="rounded-sm border px-5 py-4 text-sm" style={{ background: '#161b22', borderColor: '#30363d', color: '#8b949e' }}>
          <strong style={{ color: '#e6edf3' }}>How to use this brief:</strong> Click "Copy to Clipboard" above, then open a new Claude conversation (claude.ai), and paste this entire prompt. Claude will generate all SQL inserts for this trip in a single session. Review each section before running in Supabase.
        </div>
      </div>

      {/* The prompt */}
      <div className="max-w-5xl mx-auto px-6 py-4">
        <pre
          className="rounded-sm border p-6 text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap"
          style={{
            background: '#0d1117',
            borderColor: '#30363d',
            color: '#e6edf3',
            fontFamily: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
          }}
        >
          {prompt}
        </pre>
      </div>
    </div>
  )
}
