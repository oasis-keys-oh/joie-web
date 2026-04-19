# Joie Web Portal

The traveler-facing trip viewer for Oukala Journeys using Next.js 14, TypeScript, and Supabase.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your actual keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ticwkdkngtsklwlottzs.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## Architecture

### Pages
- `/` — Landing page with trip link instructions
- `/trip/[slug]` — Trip overview with hero image and day cards
- `/trip/[slug]/day/[day_number]` — Full day detail page

### Key Components

**TripHeader** — Hero banner with trip title and subtitle
**DayCard** — Clickable day card for trip overview (region-colored)
**DayHeader** — Day number, date, region, location
**MealRow** — Breakfast, lunch, dinner display
**HotelCard** — Hotel information, check-in/out times
**ReservationCard** — Event/reservation with confirmation, briefing card
**NarrativeSection** — Editorial itinerary segments with time labels, prose, logistics
**CalloutBox** — WOW moment, Thread, One Thing, Phrase (styled variants)
**DayNavigation** — Previous/next day links, back to trip

### Data Flow

1. **Supabase** provides real-time data via JS client (public anon key)
2. **Server Components** (default in App Router) fetch trip, day, event data
3. **Components** render with full server-side type safety
4. **Images** use Next.js `Image` component with Unsplash for placeholders

## Supabase Schema

### trips
- id, title, subtitle, dedication, epigraph, start_date, end_date, web_slug
- color_theme (JSONB), has_phrases, has_ef, has_thread_boxes

### trip_days
- id, trip_id, day_number, date, title, region, location
- phrase (JSONB), wow_moment, thread_content, thread_title
- local_insider_tip, morning_brief, itinerary_narrative (JSONB)
- unsplash_query, meal_breakfast, meal_lunch, meal_dinner

### events
- id, day_id, trip_id, type, title, time_start, address
- confirmation, notes, booking_status, callout_type
- briefing_card (JSONB), traveler_ids

### reference_items
- id, trip_id, type (hotel/flight), name
- check_in, check_out, address, confirmation, notes

## Design System

### Colors
- Navy: `#1B2B4B` (primary)
- Gold: `#C9A84C` (accent)
- Region colors: Dynamically assigned (Andalusia, Barcelona, etc.)

### Fonts
- Inter (body) via Google Fonts
- Playfair Display (headlines) via Google Fonts

### Component Variants
- Region-based card colors
- Callout box types (wow/purple, thread/amber, one_thing/teal, phrase/rose)
- Meal row accent colors (breakfast/yellow, lunch/blue, dinner/orange)

## Development

### TypeScript Types
All database entities have full TypeScript interfaces in `lib/types.ts`:
- Trip, TripDay, Event, ReferenceItem
- Nested JSONB types (ColorTheme, PhraseItem, BriefingCard, etc.)

### Supabase Client
- Located in `lib/supabase.ts`
- Provides typed data fetching functions
- Public anon key (safe for client-side use)

### Styling
- Tailwind CSS with custom theme colors
- shadcn/ui utility setup (components can be added as needed)
- Component-level styling with responsive utilities

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Build: `npm run build`
- Start: `npm run start`
- Port: 3000 (default)

## Environment Variables

Required for runtime:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public anon key (safe to expose)

Note: These are prefixed with `NEXT_PUBLIC_` so they're available in the browser.

## Extending

### Adding Components
1. Create in `components/`
2. Import in pages or other components
3. Use TypeScript interfaces from `lib/types.ts`

### Adding Pages
1. Create in `app/` following App Router conventions
2. Use dynamic parameters like `[slug]` for URL segments
3. Fetch data with server-side functions from `lib/supabase.ts`

### Styling New Components
Use Tailwind classes and refer to `tailwind.config.ts` for color tokens and font families.

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase credentials valid and not exposed
- [ ] All Supabase tables populated with sample data
- [ ] Hero images optimized (use Unsplash or CDN)
- [ ] Test all trip links work
- [ ] Verify mobile responsiveness
- [ ] Set up domain/SSL
- [ ] Configure Supabase CORS if needed

## Support

For issues with:
- **Next.js** — See [Next.js docs](https://nextjs.org/docs)
- **Supabase** — See [Supabase docs](https://supabase.com/docs)
- **Tailwind** — See [Tailwind docs](https://tailwindcss.com/docs)
