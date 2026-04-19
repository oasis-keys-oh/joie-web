import { ReferenceItem } from '@/lib/types'
import { MapPin, Phone, Mail } from 'lucide-react'

interface HotelCardProps {
  hotel: ReferenceItem
}

export default function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="mb-8 rounded-lg border-2 border-gold bg-yellow-50 p-6">
      <h3 className="font-serif text-2xl font-bold text-navy mb-4">
        Hotel Tonight
      </h3>

      <h4 className="font-serif text-xl font-semibold text-gray-900 mb-4">
        {hotel.name}
      </h4>

      <div className="grid gap-3 mb-4">
        {hotel.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 flex-shrink-0 text-gold mt-1" />
            <span className="text-gray-700">{hotel.address}</span>
          </div>
        )}
        {hotel.check_in && (
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Check-in:</span> {hotel.check_in}
          </div>
        )}
        {hotel.check_out && (
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Check-out:</span> {hotel.check_out}
          </div>
        )}
      </div>

      {hotel.confirmation && (
        <div className="bg-white rounded p-3 mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-1">Confirmation #</p>
          <p className="font-mono text-sm text-gray-900">{hotel.confirmation}</p>
        </div>
      )}

      {hotel.notes && (
        <div className="bg-white rounded p-3">
          <p className="text-sm font-semibold text-gray-600 mb-2">Notes</p>
          <p className="text-sm text-gray-700">{hotel.notes}</p>
        </div>
      )}
    </div>
  )
}
