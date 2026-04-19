import Image from 'next/image'

export default function Landing() {
  return (
    <div className="relative min-h-screen flex items-end">
      {/* Full-bleed background */}
      <Image
        src="https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=2400&h=1600&fit=crop&q=90"
        alt="Oukala Journeys"
        fill
        className="object-cover"
        priority
      />

      {/* Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.82) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-10 sm:px-16 pb-20 sm:pb-28">
        <div className="max-w-3xl">
          <p
            className="text-white text-xs font-medium mb-6 tracking-widest uppercase opacity-60"
            style={{ letterSpacing: '0.25em' }}
          >
            Private Client Portal
          </p>

          <h1
            className="font-serif font-bold text-white mb-6"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              lineHeight: '0.95',
              letterSpacing: '-0.025em',
            }}
          >
            Joie
          </h1>

          <p
            className="text-white opacity-70 mb-10 font-light"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              letterSpacing: '0.01em',
              maxWidth: '400px',
              lineHeight: '1.6',
            }}
          >
            Your personalized journey, crafted by Oukala Journeys.
            Access your trip through the private link provided by your guide.
          </p>

          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-gold opacity-60" />
            <p
              className="text-white opacity-50 text-xs tracking-widest uppercase"
              style={{ letterSpacing: '0.2em' }}
            >
              Awaiting your arrival
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-white border-opacity-10 pt-8">
          <a
            href="https://oukala.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-white text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity duration-200"
            style={{ letterSpacing: '0.2em' }}
          >
            oukala.com →
          </a>
        </div>
      </div>
    </div>
  )
}
