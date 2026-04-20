import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Link from 'next/link'
import { PersonaProvider } from '@/components/PersonaProvider'
import NavBar from '@/components/NavBar'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Oukala Journeys',
  description: 'Private travel, beautifully planned',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-white text-ink`}>
        <PersonaProvider>

        {/* Global nav — transparent over heroes, navy on scroll */}
        <NavBar />

        <ServiceWorkerRegistration />
        <main className="min-h-screen bg-white overflow-x-hidden">
          {children}
        </main>

        <footer className="bg-navy text-white">
          <div className="max-w-6xl mx-auto px-8 py-16">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10">
              <div>
                <p className="font-serif text-2xl font-bold text-white mb-1">Oukala Journeys</p>
                <p className="text-xs tracking-widest uppercase opacity-40 mb-4" style={{ letterSpacing: '0.18em' }}>
                  Private Travel, Beautifully Planned
                </p>
                <a
                  href="https://oukalajourney.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white opacity-40 hover:opacity-70 transition-opacity tracking-widest uppercase"
                  style={{ letterSpacing: '0.14em' }}
                >
                  oukalajourney.com →
                </a>
              </div>

              <div className="flex flex-col gap-2 text-right">
                <Link href="/" className="text-xs text-white opacity-40 hover:opacity-70 transition-opacity uppercase tracking-widest" style={{ letterSpacing: '0.13em' }}>
                  My Journeys
                </Link>
                <a
                  href="https://oukalajourney.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white opacity-40 hover:opacity-70 transition-opacity uppercase tracking-widest"
                  style={{ letterSpacing: '0.13em' }}
                >
                  Plan a New Trip
                </a>
                <p className="text-xs text-white opacity-20 mt-4" style={{ letterSpacing: '0.1em' }}>
                  Powered by Joie
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white border-opacity-10 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs opacity-25 tracking-wide">
                © {new Date().getFullYear()} Oukala Journeys. All rights reserved.
              </p>
              <p className="text-xs opacity-20 tracking-widest uppercase" style={{ letterSpacing: '0.12em' }}>
                A luxury travel experience
              </p>
            </div>
          </div>
        </footer>

        </PersonaProvider>
      </body>
    </html>
  )
}
