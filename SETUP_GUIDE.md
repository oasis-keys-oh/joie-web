# Joie Web Portal — Setup & Deployment Guide

## Prerequisites

- Node.js 18.17+ (with npm or yarn)
- Git (for version control)
- A Supabase account with the Joie schema set up

## Initial Setup (Development)

### 1. Install Dependencies

```bash
cd /sessions/happy-youthful-pasteur/joie-web
npm install
```

This installs:
- **Next.js 14** (React framework)
- **TypeScript** (type safety)
- **Tailwind CSS** (styling)
- **Supabase JS client** (database)
- **Lucide React** (icons)

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://ticwkdkngtsklwlottzs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-actual-anon-key-here>
```

**Where to get these:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/public key
4. Paste into `.env.local`

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

### 4. Test the Portal

Navigate to a trip URL (example):
```
http://localhost:3000/trip/example-slug
```

Replace `example-slug` with an actual `web_slug` from your trips table.

## Project Structure

```
joie-web/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with header/footer
│   ├── page.tsx                 # Landing page (/)
│   ├── globals.css              # Global styles
│   ├── not-found.tsx            # 404 page
│   └── trip/
│       └── [slug]/
│           ├── page.tsx         # Trip overview
│           ├── error.tsx        # Error boundary
│           └── day/
│               └── [day_number]/
│                   └── page.tsx # Day detail
│
├── components/                   # React components (reusable)
│   ├── TripHeader.tsx
│   ├── DayCard.tsx
│   ├── DayHeader.tsx
│   ├── MealRow.tsx
│   ├── HotelCard.tsx
│   ├── ReservationCard.tsx
│   ├── NarrativeSection.tsx
│   ├── CalloutBox.tsx
│   ├── DayNavigation.tsx
│   └── PhotoSection.tsx
│
├── lib/                         # Utilities
│   ├── types.ts                # TypeScript interfaces
│   ├── supabase.ts             # Supabase client
│   └── colors.ts               # Color utilities
│
├── package.json                # Dependencies
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind theme
├── tsconfig.json               # TypeScript config
├── postcss.config.js           # PostCSS config
└── .env.local.example          # Environment template
```

## Key Features

### 1. Server-Side Rendering
All pages use Next.js 14 App Router with Server Components. Data fetching happens on the server, reducing client-side JavaScript.

### 2. Type Safety
Full TypeScript coverage with interfaces for all Supabase entities:
- Trip, TripDay, Event, ReferenceItem
- Nested JSONB types (phrase, thread_content, briefing_card, etc.)

### 3. Responsive Design
Mobile-first approach using Tailwind CSS. All components adapt to:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

### 4. Oukala Branding
Custom color palette:
- Navy: `#1B2B4B` (primary)
- Gold: `#C9A84C` (accent)
- Region-specific colors (Andalusia, Barcelona, etc.)

### 5. SEO Optimization
- Dynamic metadata per page
- Semantic HTML structure
- Image optimization

## Development Workflow

### Running Tests
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm run start
```

### Environment Variables
Only `NEXT_PUBLIC_` variables are exposed to the browser:
- `NEXT_PUBLIC_SUPABASE_URL` — Safe to expose
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Safe to expose (limited permissions)

For sensitive data, use server-only environment variables (no `NEXT_PUBLIC_` prefix).

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Joie web portal"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the project

3. **Configure Environment:**
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel dashboard
   - Deploy

### Option 2: Self-Hosted (Docker)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t joie-web .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... joie-web
```

### Option 3: Other Platforms (Heroku, Railway, etc.)

All platforms that support Node.js will work:
1. Set environment variables
2. Run `npm run build`
3. Start with `npm run start`

## Troubleshooting

### "Missing Supabase environment variables"
**Solution:** Check that `.env.local` is in the root directory and contains both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### "Trip not found"
**Possible causes:**
- The `web_slug` doesn't exist in the trips table
- The trip hasn't been published (check `published` column if it exists)
- The trip has been deleted

**Solution:** Verify the slug in Supabase trips table.

### Images not loading
**Cause:** Unsplash images require internet connection
**Solution:** Ensure the deployment environment has internet access. Or upload images to a CDN and update `next.config.js`.

### Styling looks off
**Cause:** Tailwind CSS build issue
**Solution:** 
- Delete `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Restart dev server: `npm run dev`

## Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      navy: '#1B2B4B',      // Change here
      gold: '#C9A84C',      // Or here
    },
  },
}
```

### Change Fonts
Edit `app/layout.tsx`:
```typescript
import { YourFont } from 'next/font/google'

const yourFont = YourFont({ subsets: ['latin'] })
```

### Add New Components
1. Create `.tsx` file in `components/`
2. Define props interface
3. Build component with Tailwind
4. Import in pages

### Add New Pages
Create files following App Router conventions:
- `/trip/[slug]/reviews` → `app/trip/[slug]/reviews/page.tsx`
- `/faq` → `app/faq/page.tsx`

## Performance Optimization

### Image Optimization
All images use Next.js Image component for:
- Automatic lazy loading
- WebP format conversion
- Responsive images
- Blur-up placeholder support

### Bundle Size
- Tailwind CSS is tree-shaken (only used classes)
- Lucide icons are individually imported (no bundle bloat)
- Next.js automatic code splitting per route

### Caching
- Static pages are cached
- Revalidation can be configured with `revalidate` in page.tsx
- ISR (Incremental Static Regeneration) supported

## Security Notes

### Public Anon Key
The Supabase anon key is intentionally public (prefixed with `NEXT_PUBLIC_`). To protect data:
1. **Enable RLS (Row Level Security)** on Supabase tables
2. **Restrict anon access** in RLS policies to public columns only
3. **Use web_slug as identifier** (hard to guess)
4. **Rate limit** API calls if needed

### Environment Variables
Never commit `.env.local` to git. Keep `.gitignore` updated.

### Headers & CORS
For production, set appropriate CORS headers in `next.config.js` if needed.

## Monitoring & Analytics

To add analytics:
1. Install tracking library: `npm install next-plausible` (or similar)
2. Add provider to `app/layout.tsx`
3. Create account on provider (Plausible, Vercel Analytics, etc.)

Example with Vercel Analytics:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## Next Steps

1. **Populate Supabase**: Add sample data (trips, days, events)
2. **Test routes**: Visit `/trip/[slug]` with actual trip slugs
3. **Customize branding**: Update colors, fonts, images
4. **Deploy**: Push to GitHub and deploy to Vercel
5. **Share links**: Give travelers their unique trip URLs
6. **Monitor**: Set up analytics and error tracking
7. **Iterate**: Gather feedback and improve UI/UX

## Support

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev

## Updates & Maintenance

### Keep Dependencies Current
```bash
npm outdated          # Check for updates
npm update            # Update to latest versions
npm audit            # Check for security issues
```

### Monitor Build Performance
```bash
npm run build -- --debug
```

### Test Locally Before Deploying
```bash
npm run build
npm run start
# Then visit http://localhost:3000
```

## License

© 2024 Oukala Journeys. Built with Next.js, Supabase, and Tailwind CSS.
