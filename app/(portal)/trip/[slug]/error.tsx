'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-navy mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We encountered an error loading your trip.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-navy text-white rounded-lg hover:opacity-90 transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-navy text-navy rounded-lg hover:bg-navy hover:bg-opacity-5 transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
