import Image from 'next/image'
import { TripDay } from '@/lib/types'

interface DayHeaderProps {
  day: TripDay
}

function getDayHeroImage(day: TripDay): string {
  const images: Record<string, string[]> = {
    'morocco': [
      'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1548018560-c7196548f4af?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1517821099606-cef63a9bcda6?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=2000&h=900&fit=crop&q=85',
    ],
    'france': [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=2000&h=900&fit=crop&q=85',
    ],
    'spain': [
      'https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=2000&h=900&fit=crop&q=85',
    ],
    'default': [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=2000&h=900&fit=crop&q=85',
      'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=2000&h=900&fit=crop&q=85',
    ],
  }

  const regionLower = (day.region || '').toLowerCase()
  let pool = images.default
  for (const [key, imgs] of Object.entries(images)) {
    if (regionLower.includes(key)) {
      pool = imgs
      break
    }
  }
  return pool[day.day_number % pool.length]
}

export default function DayHeader({ day }: DayHeaderProps) {
  const heroImage = getDayHeroImage(day)

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '70vh', minHeight: '480px' }}>
      <Image
        src={heroImage}
        alt={day.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
        quality={85}
      />

      {/* Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end px-8 sm:px-14 pb-14 sm:pb-18">

        {/* Day number + region */}
        <div className="flex items-center gap-4 mb-5">
          <span
            className="text-white text-xs tracking-widest uppercase opacity-60"
            style={{ letterSpacing: '0.22em' }}
          >
            Day {day.day_number}
          </span>
          <div className="h-px w-8 bg-gold opacity-50" />
          <span
            className="text-white text-xs tracking-widest uppercase opacity-60"
            style={{ letterSpacing: '0.22em' }}
          >
            {day.region}
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-serif font-bold text-white mb-4"
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 5rem)',
            lineHeight: '1.0',
            letterSpacing: '-0.015em',
            maxWidth: '800px',
          }}
        >
          {day.title}
        </h1>

        {/* Date + location */}
        <div className="flex items-center gap-6 mt-2">
          {day.date && (
            <p
              className="text-white opacity-55 text-sm"
              style={{ letterSpacing: '0.04em' }}
            >
              {day.date}
            </p>
          )}
          {day.location && (
            <>
              <div className="w-px h-4 bg-white opacity-30" />
              <p
                className="text-white opacity-55 text-sm"
                style={{ letterSpacing: '0.04em' }}
              >
                {day.location}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
