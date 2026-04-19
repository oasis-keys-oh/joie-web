import Link from 'next/link'
import { TripDay } from '@/lib/types'
import { getRegionColor } from '@/lib/colors'

interface DayCardProps {
  day: TripDay
  tripSlug: string
}

export default function DayCard({ day, tripSlug }: DayCardProps) {
  const regionColorClass = getRegionColor(day.region)

  return (
    <Link href={`/trip/${tripSlug}/day/${day.day_number}`}>
      <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${regionColorClass}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold">Day {day.day_number}</span>
            <span className="text-sm opacity-75">{day.date}</span>
          </div>
          <h3 className="font-serif text-lg font-semibold">{day.title}</h3>
          <p className="text-sm opacity-75">{day.region}</p>
        </div>
      </div>
    </Link>
  )
}
