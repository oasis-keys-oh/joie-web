import { Event } from '@/lib/types'
import { CheckCircle2, Clock, MapPin } from 'lucide-react'
import PlaceTooltip from '@/components/PlaceTooltip'

interface ReservationCardProps {
  event: Event
}

const typeLabel: Record<string, string> = {
  restaurant: 'Dining',
  activity: 'Activity',
  transport: 'Transport',
  flight: 'Flight',
  hotel: 'Hotel',
  experience: 'Experience',
  tour: 'Tour',
  transfer: 'Transfer',
}

export default function ReservationCard({ event }: ReservationCardProps) {
  const isConfirmed = !event.booking_status || event.booking_status === 'confirmed'
  const label = typeLabel[event.type] || event.type.replace('_', ' ')

  return (
    <div
      className="border rounded-sm overflow-hidden"
      style={{ borderColor: '#e8e4dc' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-4 bg-parchment border-b border-gray-100">
        <div className="flex items-center gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-widest text-ink-muted"
            style={{ letterSpacing: '0.18em' }}
          >
            {label}
          </p>
        </div>
        {isConfirmed && (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 opacity-80" />
            <span
              className="text-xs font-medium text-green-700 opacity-80 uppercase tracking-widest"
              style={{ letterSpacing: '0.12em' }}
            >
              Confirmed
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-6 bg-white">
        <h3
          className="font-serif text-xl font-bold text-navy mb-4"
          style={{ letterSpacing: '-0.01em' }}
        >
          <PlaceTooltip
            name={event.title}
            address={event.address}
            className="font-serif text-xl font-bold text-navy"
          />
        </h3>

        <div className="space-y-3 mb-5">
          {event.time_start && (
            <div className="flex items-center gap-3">
              <Clock className="w-3.5 h-3.5 text-gold opacity-70 shrink-0" />
              <span className="text-sm text-ink" style={{ color: '#3d3d3d' }}>
                {event.time_start}
              </span>
            </div>
          )}
          {event.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-3.5 h-3.5 text-gold opacity-70 shrink-0 mt-0.5" />
              <span className="text-sm text-ink" style={{ color: '#3d3d3d', lineHeight: '1.5' }}>
                {event.address}
              </span>
            </div>
          )}
        </div>

        {event.confirmation && (
          <div
            className="inline-flex items-center gap-3 px-4 py-2.5 mb-4 rounded-sm"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}
          >
            <p className="label">Confirmation</p>
            <p className="font-mono text-xs text-navy font-semibold">{event.confirmation}</p>
          </div>
        )}

        {event.notes && (
          <p
            className="text-sm leading-relaxed border-t border-gray-100 pt-4 mt-4"
            style={{ color: '#5a5a5a', lineHeight: '1.7' }}
          >
            {event.notes}
          </p>
        )}

        {event.briefing_card && event.briefing_card.content && (
          <div
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <p className="label mb-2">Briefing</p>
            {event.briefing_card.title && (
              <p className="font-semibold text-navy text-sm mb-1">{event.briefing_card.title}</p>
            )}
            <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a', lineHeight: '1.7' }}>
              {event.briefing_card.content}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
