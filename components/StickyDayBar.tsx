'use client'

/**
 * StickyDayBar — appears once the hero scrolls out of view.
 * Shows: Day #  ·  Title  ·  Location
 * Applies to every day page automatically — no per-trip config needed.
 */

import { useState, useEffect } from 'react'

interface Props {
  dayNumber: number
  title: string
  location?: string
  region?: string
}

export default function StickyDayBar({ dayNumber, title, location, region }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      // Show after scrolling past ~60vh (roughly past the hero)
      setVisible(window.scrollY > window.innerHeight * 0.55)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const place = location || region || ''

  return (
    <div
      className="fixed left-0 right-0 z-40 transition-all duration-300"
      style={{
        top: '60px',  /* sits flush below the main nav bar */
        transform: visible ? 'translateY(0)' : 'translateY(-200%)',
        opacity: visible ? 1 : 0,
        background: 'rgba(27,43,75,0.96)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center gap-4 h-12">
        {/* Day badge */}
        <span
          className="text-gold text-xs font-semibold uppercase shrink-0"
          style={{ letterSpacing: '0.18em' }}
        >
          Day {dayNumber}
        </span>

        <div className="w-px h-4 bg-white opacity-20 shrink-0" />

        {/* Title */}
        <span
          className="font-serif text-white font-bold text-sm truncate"
          style={{ letterSpacing: '-0.01em' }}
        >
          {title}
        </span>

        {/* Location — hidden on very small screens */}
        {place && (
          <>
            <div className="w-px h-4 bg-white opacity-20 shrink-0 hidden sm:block" />
            <span className="text-white opacity-40 text-xs hidden sm:block truncate" style={{ letterSpacing: '0.04em' }}>
              {place}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
