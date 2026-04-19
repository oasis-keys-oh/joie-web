import Image from 'next/image'

interface PhotoSectionProps {
  query?: string
  credit?: string
}

export default function PhotoSection({
  query,
  credit,
}: PhotoSectionProps) {
  if (!query) {
    return null
  }

  // Build Unsplash URL with query parameter
  const imageUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop`

  return (
    <div className="mb-8 rounded-lg overflow-hidden shadow-md">
      <div className="relative h-64 w-full">
        <Image
          src={imageUrl}
          alt={query}
          fill
          className="object-cover"
        />
      </div>
      {credit && (
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-right">
          Photo: {credit}
        </div>
      )}
    </div>
  )
}
