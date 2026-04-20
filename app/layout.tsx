import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Link from 'next/link'
import { PersonaProvider } from '@/components/PersonaProvider'
import PersonaSwitcher from '@/components/PersonaSwitcher'
import NavBreadcrumb from '@/components/NavBreadcrumb'
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

        {/* Minimal top nav — floats over hero imagery */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center justify-between px-8 py-5">
            {/* Left: logo OR back breadcrumb depending on current route */}
            <div className="flex items-center gap-5">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <span
                  className="text-xs tracking-widest uppercase text-white opacity-75 hover:opacity-100 transition-opacity duration-200"
                  style={{ letterSpacing: '0.22em', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
                >
                  Oukala Journeys
                </span>
              </Link>
              {/* Breadcrumb back link — renders only on sub-pages (day, hunt, prep) */}
              <span className="text-white opacity-30 text-xs hidden sm:inline">/</span>
              <NavBreadcrumb />
            </div>

            {/* Right: persona switcher */}
            <div className="flex items-center gap-5">
              <PersonaSwitcher />
            </div>
          </div>
        </header>

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
