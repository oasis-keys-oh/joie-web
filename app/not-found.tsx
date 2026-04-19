import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="text-center">
        <h1 className="font-serif text-6xl font-bold text-navy mb-2">404</h1>
        <p className="text-2xl text-gray-600 mb-4">Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist.
        </p>
      </div>

      <Link
        href="/"
        className="px-6 py-3 bg-navy text-white rounded-lg hover:opacity-90 transition"
      >
        Return home
      </Link>
    </div>
  )
}
