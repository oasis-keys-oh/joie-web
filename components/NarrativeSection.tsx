import { ItineraryNarrativeSegment } from '@/lib/types'

interface NarrativeSectionProps {
  segment: ItineraryNarrativeSegment
  /** Optional pace string for this segment's time period (e.g. "Active — lots of walking") */
  pace?: string
}

const PACE_LEVELS: Record<string, { bars: number; color: string; word: string }> = {
  easy:     { bars: 1, color: '#15803d', word: 'Easy' },
  gentle:   { bars: 1, color: '#15803d', word: 'Gentle' },
  light:    { bars: 1, color: '#15803d', word: 'Light' },
  moderate: { bars: 2, color: '#d97706', word: 'Moderate' },
  medium:   { bars: 2, color: '#d97706', word: 'Moderate' },
  active:   { bars: 3, color: '#b45309', word: 'Active' },
  busy:     { bars: 3, color: '#b45309', word: 'Busy' },
  intense:  { bars: 4, color: '#dc2626', word: 'Intense' },
  full:     { bars: 4, color: '#dc2626', word: 'Full-on' },
}

function parsePace(intensity: string): { bars: number; color: string; word: string } {
  const lower = intensity.toLowerCase()
  const match = Object.keys(PACE_LEVELS).find((k) => lower.includes(k))
  return match ? PACE_LEVELS[match] : { bars: 2, color: '#d97706', word: 'Moderate' }
}

/** Compact inline pace pill shown above the segment headline */
function InlinePace({ pace }: { pace: string }) {
  const { bars, color, word } = parsePace(pace)
  return (
    <div
      className="inline-flex items-center gap-2 mb-3"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: '2px',
        padding: '3px 8px',
      }}
    >
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              width: '12px',
              height: '4px',
              borderRadius: '1px',
              background: n <= bars ? color : 'rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.6rem', color, letterSpacing: '0.08em', fontWeight: 600 }}>
        {word}
      </span>
    </div>
  )
}

export default function NarrativeSection({ segment, pace }: NarrativeSectionProps) {
  return (
    <div className="relative mb-0 pb-12 pt-2">
      {/* Timeline line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px bg-gold opacity-20"
        style={{ left: '-1px' }}
      />
      <div
        className="absolute top-3 w-1.5 h-1.5 rounded-full bg-gold opacity-60"
        style={{ left: '-4px' }}
      />

      <div className="pl-8">
        {segment.time_label && (
          <p
            className="text-xs font-semibold text-gold uppercase tracking-widest mb-3"
            style={{ letterSpacing: '0.2em' }}
          >
            {segment.time_label}
          </p>
        )}

        {/* Inline pace pill — shown right after time label, before headline */}
        {pace && <InlinePace pace={pace} />}

        {segment.headline && (
          <h3
            className="font-serif text-2xl font-bold text-navy mb-4"
            style={{ lineHeight: '1.2', letterSpacing: '-0.01em' }}
          >
            {segment.headline}
          </h3>
        )}
        {segment.prose && (
          <p
            className="text-ink leading-relaxed mb-5"
            style={{ lineHeight: '1.85', color: '#3d3d3d', fontSize: '1.0rem' }}
          >
            {segment.prose}
          </p>
        )}
        {segment.logistics && (
          <div
            className="inline-flex items-start gap-3 text-sm py-3 px-5 rounded-sm"
            style={{
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.2)',
              color: '#6b5a2e',
            }}
          >
            <span className="opacity-50 mt-0.5">◈</span>
            <span style={{ lineHeight: '1.6' }}>{segment.logistics}</span>
          </div>
        )}
      </div>
    </div>
  )
}
