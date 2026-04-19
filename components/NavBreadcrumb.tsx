'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * NavBreadcrumb — context-aware nav links in the global header.
 *
 * /trip/[slug]            → shows Hunt + Prep quick-links
 * /trip/[slug]/day/[n]   → shows "← The Journey" + Hunt + Prep
 * /trip/[slug]/hunt      → shows "← The Journey"
 * /trip/[slug]/prep      → shows "← The Journey"
 */
export default function NavBreadcrumb() {
  const pathname = usePathname()

  // Match /trip/[slug]/day/[n]
  const dayMatch = pathname.match(/^\/trip\/([^/]+)\/day\/\d+$/)
  if (dayMatch) {
    const slug = dayMatch[1]
    return (
      <div className="flex items-center gap-4">
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
        <span className="text-white opacity-20 text-xs hidden md:inline">·</span>
        <Link
          href={`/trip/${slug}/hunt`}
          className="text-white opacity-40 hover:opacity-80 transition-opacity text-xs uppercase tracking-widest hidden md:inline"
          style={{ letterSpacing: '0.14em', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
        >
          The Hunt
        </Link>
        <span className="text-white opacity-20 text-xs hidden md:inline">·</span>
        <Link
          href={`/trip/${slug}/prep`}
          className="text-white opacity-40 hover:opacity-80 transition-opacity text-xs uppercase tracking-widest hidden md:inline"
          style={{ letterSpacing: '0.14em', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
        >
          Before You Go
        </Link>
      </div>
    )
  }

  // Match /trip/[slug]/hunt
  const huntMatch = pathname.match(/^\/trip\/([^/]+)\/hunt$/)
  if (huntMatch) {
    const slug = huntMatch[1]
    return (
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
  }

  // Match /trip/[slug]/prep
  const prepMatch = pathname.match(/^\/trip\/([^/]+)\/prep$/)
  if (prepMatch) {
    const slug = prepMatch[1]
    return (
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
  }

  // Match /trip/[slug] — show Hunt + Prep quick-links
  const tripMatch = pathname.match(/^\/trip\/([^/]+)$/)
  if (tripMatch) {
    const slug = tripMatch[1]
    return (
      <div className="flex items-center gap-4">
        <Link
          href={`/trip/${slug}/hunt`}
          className="text-white opacity-50 hover:opacity-90 transition-opacity text-xs uppercase tracking-widest hidden sm:inline"
          style={{ letterSpacing: '0.14em', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
        >
          The Hunt
        </Link>
        <span className="text-white opacity-20 text-xs hidden sm:inline">·</span>
        <Link
          href={`/trip/${slug}/prep`}
          className="text-white opacity-50 hover:opacity-90 transition-opacity text-xs uppercase tracking-widest hidden sm:inline"
          style={{ letterSpacing: '0.14em', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
        >
          Before You Go
        </Link>
      </div>
    )
  }

  return null
}
