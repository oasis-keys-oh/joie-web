import { TripDay } from '@/lib/types'

interface Props {
  day: TripDay
}

function PaceBar({ label, intensity }: { label: string; intensity: string }) {
  // Parse intensity from text: "easy", "moderate", "active", "intense"
  const levels: Record<string, { bars: number; color: string; word: string }> = {
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

  const lower = intensity.toLowerCase()
  const match = Object.keys(levels).find((k) => lower.includes(k))
  const { bars, color, word } = match ? levels[match] : { bars: 2, color: '#d97706', word: 'Moderate' }

  return (
    <div className="flex items-center gap-3">
      <span className="text-ink-muted shrink-0" style={{ fontSize: '0.65rem', width: '70px', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="rounded-sm"
            style={{
              width: '18px',
              height: '6px',
              background: n <= bars ? color : 'rgba(27,43,75,0.08)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.65rem', color, letterSpacing: '0.06em' }}>{word}</span>
    </div>
  )
}

export default function PaceIndicator({ day }: Props) {
  if (!day.pace_morning && !day.pace_afternoon) return null

  return (
    <div
      className="mt-10 px-5 py-4 rounded-sm"
      style={{ background: 'rgba(27,43,75,0.03)', border: '1px solid rgba(27,43,75,0.07)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span style={{ fontSize: '0.7rem', color: '#C9A84C' }}>⏱</span>
        <p className="label" style={{ fontSize: '0.6rem' }}>Today&apos;s Pace</p>
      </div>
      <div className="space-y-2">
        {day.pace_morning && <PaceBar label="Morning" intensity={day.pace_morning} />}
        {day.pace_afternoon && <PaceBar label="Afternoon" intensity={day.pace_afternoon} />}
      </div>
      {day.pace_note && (
        <p className="text-ink-muted mt-3 leading-relaxed" style={{ fontSize: '0.72rem', lineHeight: '1.55', borderTop: '1px solid rgba(27,43,75,0.07)', paddingTop: '10px' }}>
          {day.pace_note}
        </p>
      )}
    </div>
  )
}
