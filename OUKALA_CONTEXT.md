# Oukala Journeys — Master Context & Rules
_Last updated: April 2026. This file is the single source of truth for all platform decisions, design rules, workflow, and product specs. Update it whenever a decision is made or changed._

---

## 1. What This Platform Is

**Oukala Journeys** creates bespoke luxury travel itineraries. Every itinerary is one product expressed in three forms simultaneously:

1. **Print document** — a magazine-quality PDF/docx mailed to the traveler before departure
2. **Web portal** — `oukalajourney.com/trip/[slug]` — the living digital itinerary
3. **Joie mobile app** — React Native, offline-capable, the on-the-ground companion

**One database drives all three.** Change a row in Supabase; all outputs reflect it. This is the foundational architectural rule — nothing is hardcoded in any output layer.

---

## 2. Brand & Naming Rules (LOCKED)

- **Public-facing brand:** Oukala Journeys — used on the web portal, nav, document cover, marketing site, all communications
- **App brand:** Joie — standalone brand for the app. "Joie by Oukala Journeys" in App Store description. The app icon and name read "Joie" only.
- **"Joie" appears only:** in the footer ("Powered by Joie"), app context, App Store copy
- **Never:** "Joie" in page titles, hero headings, metadata, or the web nav
- **Never:** "by Oukala Journeys" next to Joie anywhere
- **Tier names (LOCKED):** Journey (lower tier) + Bespoke (higher tier) — these are the public names on the order page, magazine cover, app, and all communications

---

## 3. Tech Stack (Confirmed)

| Layer | Tech | Notes |
|---|---|---|
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) | Project: `joie-prod`, ID: `khxrhpjmperubjdqxrxq` |
| Web | Next.js on Netlify | Auto-deploys on push to `main` |
| Mobile | React Native + Expo | Expo Router, Zustand, EAS Build |
| Distribution | TestFlight v1 | No App Store until free |
| Notifications | Expo local (pre-scheduled at download) | No push server needed for v1 |
| Offline | expo-sqlite | Full trip data synced on wifi |
| Print-on-demand | Artifact Uprising | Matches luxury positioning |
| Order intake | Existing oukalajourney.com form | Upgrade this — don't replace with Typeform |

### Web repo
- GitHub: `https://github.com/oasis-keys-oh/joie-web.git`
- Branch: `main`
- Local: `/Users/o/Documents/Documents-icloud/Claude/Projects/Oukala Journeys/joie-web`
- Deploy: Netlify → `oukalajourney.com`

---

## 4. Supabase Schema — Core Tables

### `trips`
Primary row per itinerary. Key fields:
- `id`, `title`, `subtitle`, `web_slug`, `status`, `tier` (journey | bespoke)
- `start_date`, `end_date`
- `dedication`, `epigraph`, `epigraph_translation`, `epigraph_transliteration`
- `trip_narrative` (long-form welcome essay)
- `color_theme` (JSONB: `{ primary, secondary, accent }`) — each trip has its own palette
- `has_phrases`, `has_ef`, `has_thread_boxes` — section toggle flags
- `dedications` (JSONB) — per-traveler dedications

### `trip_days`
One row per day. Key fields:
- `day_number`, `date`, `title`, `region`, `location`
- `meal_breakfast`, `meal_lunch`, `meal_dinner`
- `wow_moment` — evocative first-person present-tense peak experience
- `thread_content` / `thread_title` — historical/intellectual editorial
- `local_insider_tip` — "one thing most people miss" (REQUIRED every named destination day)
- `morning_brief` — editorial curator note, not logistical
- `phrase` (JSONB: `{ text, context, meaning, pronunciation }`)
- `photo_spot` (JSONB: `{ location, timing, angle, hashtags, instagram_caption }`)
- `literary_quote` (JSONB: `{ text, attribution, context }`)
- `itinerary_narrative` (JSONB array of `{ time_label, headline, prose, logistics }`)
- `must_buy` (JSONB array)
- `wine_food_picks` (JSONB array)
- `cultural_notes` (JSONB array of `{ term, explanation }`)
- `pace_morning`, `pace_afternoon`, `pace_note` — activity level (easy/moderate/active/intense)
- `unsplash_query` — drives hero image selection

### `events`
Every schedulable item per day. Key fields:
- `type`: flight | hotel | restaurant | activity | transfer | ef_meeting | other
- `time_start`, `title`, `address`, `phone`, `confirmation`, `notes`
- `booking_status`, `booking_url`
- `callout_type` — drives which callout box renders (see §8 below)
- `briefing_card` (JSONB) — restaurant briefing: chef name, off-menu dish, server note, dress tone, arrival note
- `traveler_ids` (array) — for traveler-specific events

### `reference_items`
Hotels and flights as standalone reference objects (not day-specific). Used in the document's Hotels and Flights sections.

### `traveler_profiles`
Reusable across trips. Key fields:
- `pillow_firmness`, `coffee_order`, `curtains_preference`
- `dietary_notes`, `mobility_notes`
- `anniversary_date`, `personality`
- Persists forever — "the advisor remembers"

### `packing_items`
Per traveler, per trip. Includes `reason` field and `packed` toggle. Weather-aware.

### `recommendations`
Books, films, podcasts per trip. `physical_ship` bool for Bespoke tier (books mailed with magazine).

### `hunt_challenges`
25 challenges per trip including Grand Finale. Scavenger hunt with points system.

### `pre_trip_content`
Daily drops before departure. `date_offset_days` is negative (e.g. -14 = two weeks before). Types: history, music, phrase, weather, tip. Unlocks by date in app and web.

### `curator_messages`
Real-time Supabase chat for the CuratorThread component. Travelers write; curator replies via admin.

### `feedback`
Per-day traveler notes. Curators (Omar/Kristi) see full thread.

### `hunt_submissions`
Challenge completions and finale verses.

### `per_person_moments`
Per-traveler, per-day emotional assignments. Drives `PersonaDayCallout` on web.

### `local_contacts`
Per destination, higher tiers: fixer name, WhatsApp, specialty, personal intro note.

### `media`
Photos. `curator_selected` bool for the Bespoke 40-best edit. `editorial_caption` by Claude/Omar.

### `anniversary_touches`
Scheduled 1 year after trip start. One photo, one WOW MOMENT line. Memory, not sales pitch.

---

## 5. Callout Box Types

These appear in both the print document and web itinerary. The `callout_type` field on events/days controls which renders.

| Type | Color | Purpose |
|---|---|---|
| `WOW_MOMENT` | Gold/amber | Peak experience, first-person present tense. REQUIRED every major day. |
| `THREAD` / `HISTORY_DYK` | Navy/blue | Historical/intellectual context. Editorial, not logistical. |
| `CONFIRMED_RES` | Green | Restaurant/venue, address, party size, dietary flags, briefing card |
| `TRANSPORT` / `ROUTING_NOTE` | Grey | Distances, timing, transport options. Always include +15 min buffer + "leave by" time. |
| `STILL_NEEDS_BOOKING` | Orange/amber | Unconfirmed meals — action items |
| `PHOTOGRAPHY_NOTES` | Light | Specific shot: time of day, where to stand, composition, Instagram tip, what to avoid. REQUIRED every day with an outdoor landmark. |
| `THE_INSIDER` | Dark/charcoal | "One thing most people miss." Hyper-specific, not on TripAdvisor. REQUIRED every named destination day. |
| `EF_ALERT` | Purple | EF Adventures meeting point/time. At the very top of every EF day, before meal table. |
| `BOOK_NOW` | Amber | Action required booking |
| `ACCESSIBILITY` | Teal | Accessibility notes |
| `GRANDMA_MOMENT` | Soft | Per-trip emotional spotlight (Charleston-type trips) |
| `LOCAL_SECRET` | Charcoal | Charleston-type trips — local insider |
| `PER_PERSON_SPOTLIGHT` | Themed | Persona-specific highlight |

---

## 6. Document Style Rules (All Itineraries)

### Structure (LOCKED)
Every document contains:
- **Cover page** — full-bleed image, title in large serif script, traveler names, dedication, epigraph
- **Table of Contents**
- **Welcome narrative** — 4–6 paragraphs of historical/literary essay connecting the destinations
- **At a Glance table** — full trip overview
- **Traveler profiles** — personality notes, key preferences
- **Day cards** — see below
- **Meal Planning Reference** — color-coded full-trip table
- **Per-person order guides** — WHO / ORDER THIS / NOTE table for every confirmed dinner
- **Flights section** — separate table per couple/party
- **Hotels section** — boxed entries per property
- **Read, Watch & Listen**
- **Packing Guide** — personalized per traveler
- **Action Items Worksheet**

### Optional sections (controlled by trip flags)
- `has_phrases` → Phrase of the Day per day
- `has_ef` → EF Adventures detail section, purple alert boxes
- `has_thread_boxes` → THE ANDALUSIAN THREAD navy historical boxes
- Safety & Health (with vaccinations: required vs. recommended, with timing)
- Entry Requirements, Emergency Planner
- Cultural Etiquette
- Connectivity & Money
- Shopping Guide
- Scavenger Hunt / Photograph Challenge Card
- Capital One Venture X benefits (trip-specific credit card perks)
- Hotel preference automation or template (tier-dependent)
- Local Contacts (Bespoke tier)

### Per-day structure (REQUIRED on every day card)
1. Bold day header: Day N · Weekday, Date · Location
2. EF alert box (if EF day) — BEFORE meal table
3. Meal table: 3 columns (Breakfast | Lunch | Dinner) with status
4. Bullet itinerary (activities, timing, logistics)
5. At least one WOW MOMENT or THREAD callout
6. CONFIRMED RESERVATION box (if applicable) with restaurant briefing card
7. TRANSPORT box (if travel day) — includes duration, +15 min buffer, "leave by" time
8. PHOTOGRAPHY NOTES — every day with a named outdoor location
9. THE INSIDER — every day visiting a named destination
10. Phrase of the Day (if `has_phrases`) — specific to neighborhood/situation, not generic

### Day design principles (LOCKED)
- Every day is **fully self-contained** — no "see above," all critical details repeated
- Each day is designed as a **rip-out standalone card** — someone should detach that day and have everything: reservations, addresses, phones, transport, hotel info
- The document has TWO coexisting layers: master reference sections (for planning) + day cards (for on-the-ground use)

### Color coding (per trip)
Each trip has its own `color_theme`. For Andalusian Thread:
- Morocco days: amber/warm gold
- France/EF days: green
- Paris extension (Todd & Erica): slate/grey-blue
- EF Adventures alerts: purple
- Transit: grey

### Typography signals
- **Bold** — restaurant names, hotel names, key logistics
- _Italics_ — captions and quotations
- ALL CAPS — callout box titles
- Arabic/French/local script included where contextually relevant
- Em-dashes (—) for pauses; en-dashes (–) for date ranges; arrows (→) for routes

---

## 7. Tone & Voice (ALL Outputs)

- Literary and specific — never generic travel copy
- Historical depth without being academic
- Personal, warm, occasionally humorous
- Second person ("you will see," "you are standing") — addressing travelers directly
- Local language phrases included with pronunciation and translation
- **Dietary flags:** mention ONCE in Traveler Profiles. Never repeat throughout document.
- **Activity levels:** stored as text strings (easy/gentle/light → moderate/medium → active/busy → intense/full), rendered as 4-bar visual indicator on web

---

## 8. Tier Differences

### Journey tier
- Magazine mailed by post
- Web portal + Joie app
- Personalized packing list with reasons
- Weather-aware packing
- Restaurant briefing cards
- Neighborhood-specific daily phrase
- Photo timing notes per day
- "One thing most people miss" per day
- Pre-trip content unlocks
- Per-person emotional assignments
- Live "you're here now" awareness
- Post-trip "your story" page
- Anniversary card (1 year later)
- Trip countdown (app + widget)
- Hotel preference email template (customer sends it themselves)

### Bespoke tier (adds)
- Books from Read/Watch/Listen list physically mailed with magazine
- Hotel preference email automated and sent on customer's behalf (pillow firmness, coffee order, curtains, spouse name, room preferences)
- Local fixer/contact per destination (WhatsApp, intro note)
- Photo curation: curator selects 40 best from uploaded photos
- Photobook with editorial captions (Artifact Uprising)

---

## 9. The Itinerary Creation Workflow (NEW — April 2026)

### How a new trip gets built

**The principle:** The order form captures the raw material. The admin Curator screen structures it. Claude turns structured input into a complete database population. The web app, app, and document all derive from the database.

**Step 1 — Intake**
Customer completes the order form on oukalajourney.com. This pushes a record to Supabase (`trip_intake` table — to be built). Key fields captured:
- Traveler names and relationships
- Destinations and dates
- Tier (Journey / Bespoke)
- Trip type (cultural / beach / family / adventure)
- Dietary notes, mobility notes, preferences
- Budget signals
- Special occasions (anniversaries, milestones)
- How they heard about it

**Step 2 — Curator Intake Screen (admin)**
A dedicated `/admin/intake/[id]` screen in the web admin. The curator (Omar) adds structured detail gathered from the phone call:
- Hotel confirmations (name, dates, confirmation numbers)
- Flight details per traveler
- Restaurant reservations
- Per-traveler personality notes
- Emotional register of the trip (celebration? adventure? slow travel?)
- Any EF Adventures days
- Credit card in use (for benefits section)
- Theme / epigraph / dedication
- Trip color palette choice

**Step 3 — Prompt Generation**
The curator screen outputs a formatted Claude prompt — a structured brief that includes everything above, organized by section, so Claude can populate the entire Supabase database for the trip in one session.

**Step 4 — Claude populates the database**
Claude reads the prompt and writes SQL / Supabase inserts for every table: trip, trip_days, events, reference_items, packing_items, recommendations, hunt_challenges, pre_trip_content, per_person_moments. Research tasks (history, photography notes, restaurant briefing cards) are flagged for Perplexity follow-up.

**Step 5 — All outputs derive automatically**
- Web portal: reads from DB, renders immediately
- Joie app: reads from DB via same Supabase client
- Print document: generated from DB via the document generator

---

## 10. Photography Notes Standard

Every day with a named outdoor landmark MUST include `photo_spot` with:
- `location` — exact spot name (not just "the medina")
- `timing` — exact time window for best light at that specific location
- `angle` — where to stand, what direction to face
- `hashtags` — 2–4 relevant Instagram hashtags
- `instagram_caption` — one suggested caption line

This is researched/verified per location, not generated generically.

---

## 11. "One Thing Most People Miss" Standard

Every day visiting a named destination MUST include `local_insider_tip`. Rules:
- Hyper-specific to that exact place — not findable on TripAdvisor
- One concrete, actionable insight
- Example format: "Most visitors walk past the second courtyard of the Bahia Palace. The first one has all the tourists. Turn left at the pomegranate tree."
- Appears in: document (THE INSIDER callout), web itinerary sidebar, app day view, morning brief

---

## 12. Restaurant Briefing Card Standard

Every confirmed dinner reservation MUST include `briefing_card` on the event with:
- Chef name (where known)
- One off-menu or signature dish suggestion
- What to mention to the server
- Dress tone
- Arrival note ("arrive exactly at reservation time" vs "10 minutes early")
- Dietary flags for the party (brief)

Appears as WHO / ORDER THIS / NOTE table in the print document.

---

## 13. Traveler Personas (Andalusian Thread)

Web portal uses `PersonaProvider` — first-visit modal asks "who are you?" Stored in `localStorage` as `joie_traveler`. Travelers: Omar, Kristi, Todd, Erica. Drives `PersonaDayCallout` component (reads `per_person_moments` table).

---

## 14. Web Admin CMS — Current Tabs

Located at `/admin/trip/[id]?tab=...`

Built tabs: Days, Events, Contacts, Hotels, Hunt, Packing, Recommendations, Pre-Trip Drops, Feedback, 🩺 Health

Health tab: per-day image pool resolution check, DEFAULT fallback warnings with thumbnails.

---

## 15. Image System

- All Unsplash photo IDs stored in `lib/unsplash.ts`
- Verified via `scripts/check-images.mjs` (also runs in Netlify build via `netlify.toml`)
- `unsplash_query` field on `trip_days` drives hero image lookup
- Image check command: `npm run check:images`
- Build will fail on Netlify if any photo ID is broken

---

## 16. Activity Level System

Stored as plain text on `trip_days.pace_morning` and `trip_days.pace_afternoon`. The `PaceIndicator` component does keyword matching:

| Keyword | Bars | Color |
|---|---|---|
| easy / gentle / light | 1 | Green |
| moderate / medium | 2 | Amber |
| active / busy | 3 | Dark amber |
| intense / full | 4 | Red |

Default if no match: 2 bars / Moderate.

---

## 17. Key Pending Work (as of April 2026)

### Immediate (before June trip)
1. Run 3 Supabase migrations: `20260419_feedback.sql`, `20260419_hunt_submissions.sql`, `20260419_pre_trip_content.sql`
2. Seed `pre_trip_content` — drops start May 25 (date_offset_days = -14)
3. Seed `per_person_moments` — `PersonaDayCallout` is built but won't render without data
4. Seed `literary_quote` + `photo_spot` per day
5. Git push to Netlify

### Platform build
- `/admin/intake/[id]` — Curator intake screen (new trip workflow)
- `trip_intake` table in Supabase
- Prompt generator output from intake screen
- Document generator (docx from DB)
- Joie mobile app scaffold (Phase 3)

---

## 18. Deployment

```bash
cd '/Users/o/Documents/Documents-icloud/Claude/Projects/Oukala Journeys/joie-web'
git add -A
git commit -m "your message"
git push origin main
```

Claude writes all code. Omar runs the final push.

---

## 19. Decisions That Are LOCKED (Do Not Revisit)

- One Supabase database drives all three outputs
- Tier names: Journey + Bespoke
- App brand: Joie (not "Oukala Journeys app")
- "Joie" never in web nav, page titles, or headings
- Print-on-demand: Artifact Uprising
- Order intake: upgrade existing oukalajourney.com form (no Typeform)
- Supabase MCP: connect to Cowork as first infrastructure step for each build session
- Every day card is a rip-out standalone (all critical info duplicated on the day)
- local_insider_tip and photo_spot are REQUIRED for every named destination day — not optional
- Erica dietary flag: ONE mention in Traveler Profiles only, never repeated elsewhere
- Restaurant briefing card: ALL confirmed dinners, not just upscale ones
