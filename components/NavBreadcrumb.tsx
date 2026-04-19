'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * NavBreadcrumb — renders a back link in the global nav when on a day page.
 * Placed inside the layout header so it doesn't conflict with any fixed overlay.
 *
 * Patterns recognised:
 *   /trip/[slug]/day/[n]  → "← The Andalusian Thread" (links to /trip/[slug])
 *   /trip/[slug]/hunt     → "← The Hunt" (links to /trip/[slug])
 *   /trip/[slug]/prep     → "← Before You Go" (links to /trip/[slug])
 */
export default function NavBreadcrumb() {
  const pathname = usePathname()

  // Match /trip/[slug]/day/[n]
  const dayMatch = pathname.match(/^\/trip\/([^/]+)\/day\/\d+$/)
  if (dayMatch) {
    const slug = dayMatch[1]
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

  return null
}
