import Image from 'next/image'
import { Trip } from '@/lib/types'

interface TripHeaderProps {
  trip: Trip
  imageUrl?: string
}

export default function TripHeader({ trip, imageUrl }: TripHeaderProps) {
  const defaultImageUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=400&fit=crop`
  const finalImageUrl = imageUrl || defaultImageUrl

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg mb-12">
      <Image
        src={finalImageUrl}
        alt={trip.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <h1 className="font-serif text-5xl font-bold text-white mb-2">
          {trip.title}
        </h1>
        {trip.subtitle && (
          <p className="text-xl text-white opacity-90">
            {trip.subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
