'use client'

/**
 * PersonaDedication — shows a traveler-specific dedication line.
 * Reads the current persona from localStorage (joie_traveler).
 * Falls back to the trip's default dedication if no persona match.
 *
 * System rule: every trip can have per-persona dedications stored in
 * trips.dedications (JSONB). Keys match traveler_key: omar, kristi, todd, erica.
 * If a key is missing, falls back to the trip's top-level `dedication` field.
 */

import { useEffect, useState } from 'react'

interface Props {
  /** Per-persona map: { omar: "...", kristi: "...", todd: "...", erica: "..." } */
  dedications: Record<string, string>
  /** Fallback — the trip's original single dedication field */
  fallback?: string
}

export default function PersonaDedication({ dedications, fallback }: Props) {
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    try {
      const key = localStorage.getItem('joie_traveler') || 'omar'
      const line = dedications[key] || dedications['omar'] || fallback || null
      setText(line)
    } catch {
      setText(fallback || null)
    }
  }, [dedications, fallback])

  if (!text) return null

  return (
    <div className="py-14 text-center border-b border-gold border-opacity-20">
      <p className="font-serif text-xl italic text-ink-muted leading-relaxed max-w-2xl mx-auto">
        &ldquo;{text}&rdquo;
      </p>
    </div>
  )
}
