'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

interface Props {
  startDate: string
  endDate: string
}

export default function DaysUntilBadge({ startDate, endDate }: Props) {
  const [daysUntil, setDaysUntil] = useState<number | null>(null)

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    setDaysUntil(diff)
  }, [startDate])

  // Don't render on server — avoids hydration mismatch
  if (daysUntil === null) return null

  return (
    <div
      className="rounded-sm border border-gold border-opacity-30 px-5 py-4 text-center"
      style={{ background: 'linear-gradient(135deg, #fdf8ef 0%, #f9f3e3 100%)' }}
    >
      {daysUntil > 0 ? (
        <>
          <p className="label mb-1">Departure In</p>
          <p
            className="font-serif font-bold text-navy"
            style={{ fontSize: '2.8rem', lineHeight: '1', letterSpacing: '-0.02em' }}
          >
            {daysUntil}
          </p>
          <p className="text-ink-muted text-xs uppercase tracking-widest mt-1" style={{ letterSpacing: '0.18em' }}>
            {daysUntil === 1 ? 'Day' : 'Days'}
          </p>
          <p className="text-ink-muted mt-2" style={{ fontSize: '0.68rem' }}>
            {formatDate(startDate)}
          </p>
        </>
      ) : (
        <>
          <p className="label mb-1">The Journey</p>
          <p className="font-serif font-bold text-navy text-lg">
            {daysUntil === 0 ? 'Departs Today' : 'Underway'}
          </p>
          <p className="text-ink-muted mt-1" style={{ fontSize: '0.68rem' }}>
            {formatDate(startDate)} — {formatDate(endDate)}
          </p>
        </>
      )}
    </div>
  )
}
