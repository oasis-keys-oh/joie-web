'use client'

/**
 * NavBar — the global sticky top navigation.
 * Transparent over hero images, transitions to navy once the user scrolls past ~80px.
 * Applies to every page — no per-page config needed.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavBreadcrumb from '@/components/NavBreadcrumb'
import PersonaSwitcher from '@/components/PersonaSwitcher'

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // check on mount in case page loads mid-scroll
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(27,43,75,0.97)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(201,168,76,0.12)'
          : '1px solid transparent',
      }}
    >
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span
              className="text-xs tracking-widest uppercase text-white opacity-75 hover:opacity-100 transition-opacity duration-200"
              style={{ letterSpacing: '0.22em', textShadow: scrolled ? 'none' : '0 1px 10px rgba(0,0,0,0.5)' }}
            >
              Oukala Journeys
            </span>
          </Link>
          <span className="text-white opacity-30 text-xs hidden sm:inline">/</span>
          <NavBreadcrumb />
        </div>

        {/* Right: persona switcher */}
        <div className="flex items-center gap-5">
          <PersonaSwitcher />
        </div>
      </div>
    </header>
  )
}
