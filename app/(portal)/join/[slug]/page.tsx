import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'

interface Props {
  params: { slug: string }
  searchParams: { p?: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: 'Join Your Journey | Oukala',
    description: 'Access your personalised Oukala Journeys itinerary.',
  }
}

export default async function JoinPage({ params, searchParams }: Props) {
  const admin = createAdminClient()

  // Fetch trip by slug (public lookup — slug is the only secret needed)
  const { data: trip } = await admin
    .from('trips')
    .select('id, title, subtitle, web_slug, web_password, start_date, end_date')
    .eq('web_slug', params.slug)
    .single()

  // If trip doesn't exist, show a graceful error
  if (!trip) {
    return <JoinError message="This journey link is no longer valid." />
  }

  const suppliedPassword = searchParams.p || ''
  const passwordMatch = trip.web_password && suppliedPassword === trip.web_password

  // ── Auto-redirect if password is correct ─────────────────────────────────
  if (passwordMatch) {
    redirect(`/trip/${params.slug}`)
  }

  // ── Wrong password provided ───────────────────────────────────────────────
  if (suppliedPassword && !passwordMatch) {
    return (
      <JoinLayout>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-500 bg-opacity-10 flex items-center justify-center mx-auto mb-6">
            <span style={{ fontSize: '1.4rem' }}>🔒</span>
          </div>
          <p className="text-gold text-xs tracking-widest uppercase mb-3" style={{ letterSpacing: '0.2em' }}>
            Access Denied
          </p>
          <h1 className="font-serif text-2xl font-bold text-white mb-4" style={{ lineHeight: '1.2' }}>
            Invalid access code
          </h1>
          <p className="text-white opacity-50 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            The link you followed contains an incorrect access code. Please check with your Oukala curator.
          </p>
          <a
            href="mailto:hello@oukalajourney.com"
            className="inline-block px-6 py-3 border border-gold border-opacity-40 text-gold text-xs tracking-widest uppercase hover:border-opacity-80 transition-all duration-300"
            style={{ letterSpacing: '0.15em' }}
          >
            Contact Your Curator
          </a>
        </div>
      </JoinLayout>
    )
  }

  // ── No password provided — show branded access gate ───────────────────────
  return (
    <JoinLayout>
      <div className="text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(196,155,84,0.12)', border: '1px solid rgba(196,155,84,0.3)' }}>
          <span style={{ fontSize: '1.6rem' }}>✈️</span>
        </div>

        {/* Label */}
        <p className="text-gold text-xs tracking-widest uppercase mb-4" style={{ letterSpacing: '0.22em' }}>
          Oukala Journeys
        </p>

        {/* Trip title */}
        <h1 className="font-serif text-3xl font-bold text-white mb-3" style={{ lineHeight: '1.1', letterSpacing: '-0.01em' }}>
          {trip.title}
        </h1>

        {trip.subtitle && (
          <p className="text-white opacity-50 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
            {trip.subtitle}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 justify-center mb-10">
          <div className="h-px bg-gold opacity-25" style={{ width: '40px' }} />
          <p className="text-white opacity-30 text-xs tracking-widest uppercase" style={{ letterSpacing: '0.18em' }}>
            Private Access Required
          </p>
          <div className="h-px bg-gold opacity-25" style={{ width: '40px' }} />
        </div>

        {/* Password form */}
        <form action={`/join/${params.slug}`} method="GET" className="flex flex-col items-center gap-4">
          <input
            type="text"
            name="p"
            placeholder="Enter your access code"
            autoComplete="off"
            className="w-full max-w-xs px-5 py-3 text-sm text-center tracking-widest bg-white bg-opacity-5 border border-white border-opacity-15 text-white placeholder-white placeholder-opacity-25 focus:outline-none focus:border-gold focus:border-opacity-60 transition-colors"
            style={{ letterSpacing: '0.12em' }}
          />
          <button
            type="submit"
            className="w-full max-w-xs px-6 py-3 text-xs tracking-widest uppercase transition-all duration-300"
            style={{
              letterSpacing: '0.18em',
              background: 'linear-gradient(135deg, #C49B54, #b8883c)',
              color: 'white',
            }}
          >
            Open My Journey
          </button>
        </form>

        {/* Help */}
        <p className="text-white opacity-25 text-xs mt-8 leading-relaxed">
          Access codes are provided by your curator.
          <br />
          <a href="mailto:hello@oukalajourney.com" className="underline opacity-70 hover:opacity-100 transition-opacity">
            hello@oukalajourney.com
          </a>
        </p>
      </div>
    </JoinLayout>
  )
}

// ── Shared layout wrapper ─────────────────────────────────────────────────────

function JoinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 py-16"
      style={{
        background: 'linear-gradient(160deg, #0e1828 0%, #1B2B4B 40%, #0e1828 100%)',
      }}
    >
      {/* Top wordmark */}
      <div className="absolute top-8 left-0 right-0 flex justify-center">
        <Link
          href="/"
          className="text-white opacity-20 hover:opacity-40 transition-opacity font-serif text-sm tracking-widest uppercase"
          style={{ letterSpacing: '0.22em' }}
        >
          Oukala
        </Link>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm p-10 relative"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {children}
      </div>

      {/* Bottom note */}
      <p className="mt-8 text-white opacity-15 text-xs tracking-widest uppercase" style={{ letterSpacing: '0.16em' }}>
        Private Travel, Beautifully Planned
      </p>
    </div>
  )
}

// ── Generic error card ────────────────────────────────────────────────────────

function JoinError({ message }: { message: string }) {
  return (
    <JoinLayout>
      <div className="text-center">
        <p className="text-gold text-xs tracking-widest uppercase mb-4" style={{ letterSpacing: '0.2em' }}>
          Oukala Journeys
        </p>
        <h1 className="font-serif text-2xl font-bold text-white mb-4">Link Not Found</h1>
        <p className="text-white opacity-40 text-sm leading-relaxed mb-8">{message}</p>
        <a
          href="mailto:hello@oukalajourney.com"
          className="text-gold text-xs tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity"
          style={{ letterSpacing: '0.15em' }}
        >
          Contact Your Curator →
        </a>
      </div>
    </JoinLayout>
  )
}
