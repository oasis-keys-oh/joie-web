import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface DayNavigationProps {
  tripSlug: string
  currentDay: number
  totalDays: number
}

export default function DayNavigation({ tripSlug, currentDay, totalDays }: DayNavigationProps) {
  const previousDay = currentDay > 1 ? currentDay - 1 : null
  const nextDay = currentDay < totalDays ? currentDay + 1 : null

  return (
    <div className="mt-20 pt-10 border-t border-gray-100">
      <div className="flex items-center justify-between gap-6">

        {/* Previous */}
        {previousDay ? (
          <Link
            href={`/trip/${tripSlug}/day/${previousDay}`}
            className="group flex items-center gap-4 text-left"
          >
            <span
              className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full group-hover:border-gold group-hover:bg-gold group-hover:bg-opacity-5 transition-all duration-200"
              style={{ display: 'flex' }}
            >
              <ArrowLeft className="w-4 h-4 text-ink-muted group-hover:text-gold transition-colors" />
            </span>
            <span style={{ display: 'block' }}>
              <span className="label mb-0.5" style={{ display: 'block' }}>Previous</span>
              <span className="font-serif text-sm font-medium text-navy" style={{ display: 'block' }}>Day {previousDay}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}

        {/* Back to trip overview */}
        <Link
          href={`/trip/${tripSlug}`}
          className="group flex flex-col items-center gap-1"
        >
          <span className="flex gap-1" style={{ display: 'flex' }}>
            {Array.from({ length: Math.min(totalDays, 5) }).map((_, i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full transition-colors duration-200"
                style={{
                  display: 'block',
                  background: i === (currentDay - 1) % 5 ? '#C9A84C' : '#d1d5db',
                }}
              />
            ))}
          </span>
          <span
            className="text-xs text-ink-muted group-hover:text-gold transition-colors uppercase tracking-widest mt-1"
            style={{ display: 'block', letterSpacing: '0.15em' }}
          >
            All Days
          </span>
        </Link>

        {/* Next */}
        {nextDay ? (
          <Link
            href={`/trip/${tripSlug}/day/${nextDay}`}
            className="group flex items-center gap-4 text-right"
          >
            <span className="text-right" style={{ display: 'block' }}>
              <span className="label mb-0.5" style={{ display: 'block' }}>Next</span>
              <span className="font-serif text-sm font-medium text-navy" style={{ display: 'block' }}>Day {nextDay}</span>
            </span>
            <span
              className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full group-hover:border-gold group-hover:bg-gold group-hover:bg-opacity-5 transition-all duration-200"
              style={{ display: 'flex' }}
            >
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-gold transition-colors" />
            </span>
          </Link>
        ) : (
          <span />
        )}

      </div>
    </div>
  )
}
