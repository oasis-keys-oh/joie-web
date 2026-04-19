import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DayNavigationProps {
  tripSlug: string
  currentDay: number
  totalDays: number
}

export default function DayNavigation({
  tripSlug,
  currentDay,
  totalDays,
}: DayNavigationProps) {
  const previousDay = currentDay > 1 ? currentDay - 1 : null
  const nextDay = currentDay < totalDays ? currentDay + 1 : null

  return (
    <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t">
      {previousDay ? (
        <Link
          href={`/trip/${tripSlug}/day/${previousDay}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white hover:bg-opacity-90 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous Day
        </Link>
      ) : (
        <div />
      )}

      <Link
        href={`/trip/${tripSlug}`}
        className="px-4 py-2 rounded-lg border border-navy text-navy hover:bg-navy hover:bg-opacity-5 transition"
      >
        Back to Trip
      </Link>

      {nextDay ? (
        <Link
          href={`/trip/${tripSlug}/day/${nextDay}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white hover:bg-opacity-90 transition"
        >
          Next Day
          <ChevronRight className="w-5 h-5" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
