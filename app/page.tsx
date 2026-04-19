import Link from 'next/link'

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="text-center">
        <h1 className="font-serif text-5xl font-bold text-navy mb-4">
          Welcome to Joie
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your personalized journey with Oukala Journeys
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 max-w-md mx-auto mb-8">
          <p className="text-gray-700 mb-4">
            To access your trip, you'll need a secret link. Ask your Oukala Journeys guide
            for your personalized trip URL.
          </p>
          <p className="text-sm text-gray-500">
            The link will look like: <code className="bg-white px-2 py-1 rounded">/trip/your-secret-slug</code>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <a
            href="https://oukala.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-gold text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Visit Oukala Journeys
          </a>
        </div>
      </div>
    </div>
  )
}
