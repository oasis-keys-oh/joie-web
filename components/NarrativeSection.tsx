import { ItineraryNarrativeSegment } from '@/lib/types'

interface NarrativeSectionProps {
  segment: ItineraryNarrativeSegment
}

export default function NarrativeSection({
  segment,
}: NarrativeSectionProps) {
  return (
    <div className="mb-8 border-l-4 border-gold pl-6">
      {segment.time_label && (
        <p className="text-sm font-semibold text-gold uppercase tracking-wide mb-2">
          {segment.time_label}
        </p>
      )}
      {segment.headline && (
        <h3 className="font-serif text-2xl font-bold text-navy mb-4">
          {segment.headline}
        </h3>
      )}
      {segment.prose && (
        <p className="text-gray-700 leading-relaxed mb-4">
          {segment.prose}
        </p>
      )}
      {segment.logistics && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Logistics
          </p>
          <p className="text-gray-700">{segment.logistics}</p>
        </div>
      )}
    </div>
  )
}
