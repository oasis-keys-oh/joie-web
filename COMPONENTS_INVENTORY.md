# Joie Web Portal — Components Inventory

## Complete Component Reference

### Layout Components

#### `TripHeader`
- **Purpose**: Full-width hero banner with trip title overlay
- **Props**: `trip: Trip`, `imageUrl?: string`
- **Features**: 
  - Next.js Image optimization
  - Gradient overlay (dark background)
  - Serif headline + subtitle
  - Fallback Unsplash image
- **Used in**: `/trip/[slug]` page

#### `DayHeader`
- **Purpose**: Day-specific header with metadata
- **Props**: `day: TripDay`
- **Features**:
  - Region-color coded background
  - Day number + date
  - Location display
  - Left-border accent bar
- **Used in**: `/trip/[slug]/day/[day_number]` page

### Card Components

#### `DayCard`
- **Purpose**: Clickable day preview card for trip overview
- **Props**: `day: TripDay`, `tripSlug: string`
- **Features**:
  - Link to `/trip/[slug]/day/[day_number]`
  - Region-based color styling
  - Day number, date, title, region
  - Hover effects
- **Used in**: `/trip/[slug]` page (grid layout)

#### `HotelCard`
- **Purpose**: Hotel information display
- **Props**: `hotel: ReferenceItem`
- **Features**:
  - Hotel name, address
  - Check-in/check-out times
  - Confirmation number
  - Notes/additional info
  - Gold accent border
- **Used in**: `/trip/[slug]/day/[day_number]` page

#### `ReservationCard`
- **Purpose**: Event/reservation with detailed information
- **Props**: `event: Event`
- **Features**:
  - Status-based coloring (confirmed/pending/cancelled)
  - Status icon (CheckCircle2, AlertCircle)
  - Time + address with Lucide icons
  - Confirmation number display
  - Notes section
  - Optional briefing card content
  - Fully responsive
- **Used in**: `/trip/[slug]/day/[day_number]` page

### Content Components

#### `MealRow`
- **Purpose**: Display breakfast, lunch, dinner in a row
- **Props**: `breakfast?: string`, `lunch?: string`, `dinner?: string`
- **Features**:
  - Color-coded by meal (yellow/blue/orange)
  - 3-column grid (responsive to 1 column on mobile)
  - Left-border accent
  - Semi-transparent background
- **Used in**: `/trip/[slug]/day/[day_number]` page

#### `NarrativeSection`
- **Purpose**: Editorial itinerary content rendering
- **Props**: `segment: ItineraryNarrativeSegment`
- **Features**:
  - Time label (gold, uppercase)
  - Headline (large serif font)
  - Prose paragraph (left border gold)
  - Logistics box (gray background)
  - Full responsive width
- **Used in**: `/trip/[slug]/day/[day_number]` page

#### `CalloutBox`
- **Purpose**: Special moment/insight boxes (WOW, Thread, One Thing, Phrase)
- **Props**: `type: 'wow' | 'thread' | 'one_thing' | 'phrase'`, `title?: string`, `content: string`
- **Features**:
  - 4 variants with distinct color schemes:
    - **wow**: Purple background (#EDE9FE), purple border, ✨ label
    - **thread**: Amber background (#FFFBEB), amber border, 🧵 label
    - **one_thing**: Teal background (#F0FDFA), teal border, 💡 label
    - **phrase**: Rose background (#FFF1F2), rose border, 🎭 label
  - Optional title (serif font)
  - Full content text
  - Semantic styling with elevation
- **Used in**: `/trip/[slug]/day/[day_number]` page

#### `PhotoSection`
- **Purpose**: Photo display with caption
- **Props**: `query?: string`, `credit?: string`
- **Features**:
  - Next.js Image with fixed dimensions (h-64)
  - Unsplash integration
  - Optional photo credit attribution
  - Shadow + rounded corners
  - Null-safe (returns null if no query)
- **Used in**: Can be integrated into day detail pages

### Navigation Components

#### `DayNavigation`
- **Purpose**: Pagination between days + back to trip
- **Props**: `tripSlug: string`, `currentDay: number`, `totalDays: number`
- **Features**:
  - ← Previous Day button (if currentDay > 1)
  - Back to Trip link (center)
  - Next Day → button (if currentDay < totalDays)
  - Navy primary, hover effects
  - Full width with top border separator
- **Used in**: `/trip/[slug]/day/[day_number]` page

## Component Type Safety

All components use:
- **TypeScript interfaces** (from `lib/types.ts`)
- **Strict prop typing** (no `any` types)
- **Optional fields** with `?` modifier for conditional rendering
- **Enum-like types** for status/type variants (e.g., `'wow' | 'thread'`)

## Styling Approach

All components:
- Use **Tailwind CSS** utility classes
- Follow **semantic spacing** (mb-4, p-6, gap-3)
- Use **custom colors** from theme (navy, gold, region colors)
- Include **responsive design** (md: breakpoints)
- Have **hover/transition states** for interactivity
- Use **Lucide icons** for visual emphasis

## Reusable Patterns

### Conditional Rendering
```tsx
{property && <div>{property}</div>}
```

### Status-Based Styling
```tsx
const colors = {
  confirmed: 'bg-green-50',
  pending: 'bg-yellow-50',
}[status] || 'bg-gray-50'
```

### Icon Integration
```tsx
<Clock className="w-4 h-4 flex-shrink-0" />
```

## Dependencies

Each component imports:
- React (for JSX)
- Next.js (Image, Link)
- `lib/types.ts` (TypeScript interfaces)
- `lib/colors.ts` (color utilities - DayCard, DayHeader)
- lucide-react (Icons - ReservationCard, DayNavigation, HotelCard)

## Component Composition

### Page: Trip Overview
```
TripHeader
  ↓
Trip Info (dedication, dates)
  ↓
Grid of DayCard components
```

### Page: Day Detail
```
DayHeader
  ↓
MealRow
  ↓
HotelCard (if hotel for that day)
  ↓
ReservationCard[] (for each event)
  ↓
NarrativeSection[] (for each itinerary segment)
  ↓
CalloutBox[] (wow/thread/one_thing/phrase - if present)
  ↓
DayNavigation
```

## Production Notes

- All components are **Server Components** (default in App Router)
- No `'use client'` directives needed
- Image optimization via Next.js Image component
- Icons from lucide-react (tree-shakeable)
- Fully responsive (mobile-first approach)
- SEO-friendly (semantic HTML, proper headings)
- Accessible (proper contrast, icon labels)

## Extension Points

To add new components:
1. Create `.tsx` file in `components/` directory
2. Define TypeScript interfaces for props
3. Import from `lib/types.ts` as needed
4. Use Tailwind utilities for styling
5. Export as default function component
6. Import in pages/other components

Example structure:
```tsx
import { YourType } from '@/lib/types'

interface YourComponentProps {
  data: YourType
  optional?: string
}

export default function YourComponent({ data, optional }: YourComponentProps) {
  return <div className="...">...</div>
}
```
