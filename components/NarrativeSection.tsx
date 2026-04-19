import { ItineraryNarrativeSegment } from '@/lib/types'

interface NarrativeSectionProps {
  segment: ItineraryNarrativeSegment
}

export default function NarrativeSection({ segment }: NarrativeSectionProps) {
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
