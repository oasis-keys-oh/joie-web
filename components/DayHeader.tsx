import { TripDay } from '@/lib/types'
import { getRegionColor } from '@/lib/colors'

interface DayHeaderProps {
  day: TripDay
}

export default function DayHeader({ day }: DayHeaderProps) {
  const regionColorClass = getRegionColor(day.region)

  return (
    <div className={`mb-8 p-6 rounded-lg border-l-4 ${regionColorClass}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">{day.title}</h1>
          <p className="text-lg text-gray-600">Day {day.day_number} • {day.date}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Region
          </p>
          <p className="text-lg font-semibold">{day.region}</p>
        </div>
        {day.location && (
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Location
            </p>
            <p className="text-lg font-semibold">{day.location}</p>
          </div>
        )}
      </div>
    </div>
  )
}
