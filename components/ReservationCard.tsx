import { Event, BriefingCard } from '@/lib/types'
import { MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface ReservationCardProps {
  event: Event
}

export default function ReservationCard({ event }: ReservationCardProps) {
  const statusColor = {
    confirmed: 'bg-green-50 border-green-200',
    pending: 'bg-yellow-50 border-yellow-200',
    cancelled: 'bg-red-50 border-red-200',
  }[event.booking_status || 'confirmed'] || 'bg-gray-50 border-gray-200'

  const statusIcon = {
    confirmed: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    pending: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    cancelled: <AlertCircle className="w-5 h-5 text-red-600" />,
  }[event.booking_status || 'confirmed']

  return (
    <div className={`mb-6 rounded-lg border p-6 ${statusColor}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-gray-900">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 capitalize">
            {event.type.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className="text-sm font-semibold text-gray-600 capitalize">
            {event.booking_status || 'confirmed'}
          </span>
        </div>
      </div>

      <div className="grid gap-3 mb-4">
        {event.time_start && (
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{event.time_start}</span>
          </div>
        )}
        {event.address && (
          <div className="flex items-start gap-3 text-gray-700">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
            <span>{event.address}</span>
          </div>
        )}
      </div>

      {event.confirmation && (
        <div className="bg-white bg-opacity-50 rounded p-3 mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">Confirmation #</p>
          <p className="font-mono text-sm text-gray-900">{event.confirmation}</p>
        </div>
      )}

      {event.notes && (
        <div className="bg-white bg-opacity-50 rounded p-3 mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{event.notes}</p>
        </div>
      )}

      {event.briefing_card && (
        <div className="border-t border-current border-opacity-20 pt-4 mt-4">
          <p className="text-sm font-semibold text-gray-600 mb-2">Briefing</p>
          {event.briefing_card.title && (
            <h4 className="font-semibold text-gray-900 mb-2">
              {event.briefing_card.title}
            </h4>
          )}
          {event.briefing_card.content && (
            <p className="text-sm text-gray-700">
              {event.briefing_card.content}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
