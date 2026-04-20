'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import TripSearch from '@/components/TripSearch'
import { usePersona } from '@/components/PersonaProvider'

// Hard-coded trip ID — search needs it to load data.
// When multiple trips exist this should come from a context or prop.
const TRIP_ID = 'b1000000-0000-0000-0000-000000000001'

export default function NavBreadcrumb() {
  const pathname = usePathname()
  const { traveler } = usePersona()

  // Extract slug from any /trip/[slug]/... path
  const tripPathMatch = pathname.match(/^\/trip\/([^/]+)/)
  const slug = tripPathMatch?.[1]

  // Persona color accent for nav indicator
  const accentColor = traveler?.color || '#C9A84C'

  if (!slug) return null

  const isRoot = pathname === `/trip/${slug}`
  const isDay = /^\/trip\/[^/]+\/day\/\d+$/.test(pathname)
  const isHunt = pathname === `/trip/${slug}/hunt`
  const isPrep = pathname === `/trip/${slug}/prep`

  const backLink = (
    <Link
      href={`/trip/${slug}`}
      className="flex items-center gap-2 group"
      style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
    >
      <span className="text-white opacity-60 group-hover:opacity-100 transition-opacity text-sm">←</span>
      <span
        className="text-white opacity-60 group-hover:opacity-100 transition-opacity text-xs uppercase tracking-widest hidden sm:inline"
        style={{ letterSpacing: '0.16em' }}
      >
        The Journey
      </span>
    </Link>
  )

  // Persona dot — visible on all trip pages
  const personaDot = traveler ? (
    <span
      className="w-2 h-2 rounded-full shrink-0 hidden sm:inline-block"
      style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}80` }}
    />
  ) : null

  const divider = <span className="text-white opacity-20 text-xs hidden md:inline">·</span>

  const huntLink = (
    <Link
      href={`/trip/${slug}/hunt`}
      className={`text-white transition-opacity text-xs uppercase tracking-widest hidden md:inline ${isHunt ? 'opacity-90' : 'opacity-40 hover:opacity-80'}`}
      style={{ letterSpacing: '0.14em', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
    >
      The Hunt
    </Link>
  )

  const prepLink = (
    <Link
      href={`/trip/${slug}/prep`}
      className={`text-white transition-opacity text-xs uppercase tracking-widest hidden md:inline ${isPrep ? 'opacity-90' : 'opacity-40 hover:opacity-80'}`}
      style={{ letterSpacing: '0.14em', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
    >
      Before You Go
    </Link>
  )

  const searchButton = (
    <TripSearch tripSlug={slug} tripId={TRIP_ID} />
  )

  if (isRoot) {
    return (
      <div className="flex items-center gap-4">
        {personaDot}
        {huntLink}
        {divider}
        {prepLink}
        {divider}
        {searchButton}
      </div>
    )
  }

  if (isDay) {
    return (
      <div className="flex items-center gap-4">
        {backLink}
        {divider}
        {huntLink}
        {divider}
        {prepLink}
        {divider}
        {searchButton}
      </div>
    )
  }

  if (isHunt || isPrep) {
    return (
      <div className="flex items-center gap-4">
        {backLink}
        {divider}
        {isHunt ? prepLink : huntLink}
        {divider}
        {searchButton}
      </div>
    )
  }

  return null
}
