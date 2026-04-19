import { ReferenceItem } from '@/lib/types'

interface HotelCardProps {
  hotel: ReferenceItem
}

export default function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="border border-gray-100 rounded-sm overflow-hidden">
      {/* Top band */}
      <div
        className="px-8 py-5 flex items-center justify-between"
        style={{ background: '#1B2B4B' }}
      >
        <p
          className="text-white text-xs font-semibold uppercase tracking-widest opacity-80"
          style={{ letterSpacing: '0.2em' }}
        >
          Tonight&apos;s Stay
        </p>
        <div className="w-px h-4 bg-white opacity-20" />
        <div
          className="text-xs text-white opacity-50 tracking-widest uppercase"
          style={{ letterSpacing: '0.15em' }}
        >
          Hotel
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 bg-white">
        <h4
          className="font-serif text-2xl font-bold text-navy mb-6"
          style={{ letterSpacing: '-0.01em' }}
        >
          {hotel.name}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {hotel.address && (
            <div>
              <p className="label mb-1.5">Address</p>
              <p className="text-sm text-ink leading-relaxed" style={{ color: '#3d3d3d' }}>
                {hotel.address}
              </p>
            </div>
          )}
          {(hotel.check_in || hotel.check_out) && (
            <div className="flex gap-8">
              {hotel.check_in && (
                <div>
                  <p className="label mb-1.5">Check-in</p>
                  <p className="font-serif text-base font-semibold text-navy">{hotel.check_in}</p>
                </div>
              )}
              {hotel.check_out && (
                <div>
                  <p className="label mb-1.5">Check-out</p>
                  <p className="font-serif text-base font-semibold text-navy">{hotel.check_out}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {hotel.confirmation && (
          <div
            className="flex items-center gap-4 px-5 py-4 mb-4 rounded-sm"
            style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)' }}
          >
            <p className="label shrink-0">Confirmation</p>
            <p className="font-mono text-sm text-navy font-medium">{hotel.confirmation}</p>
          </div>
        )}

        {hotel.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="label mb-2">Notes</p>
            <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a', lineHeight: '1.7' }}>
              {hotel.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
