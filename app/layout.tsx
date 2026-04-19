import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Link from 'next/link'
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
  title: 'Joie by Oukala Journeys',
  description: 'Your personalized journey awaits',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-white text-ink`}>

        {/* Minimal top nav — doesn't compete with hero imagery */}
        <header className="fixed top-0 left-0 right-0 z-50 mix-blend-normal">
          <div className="flex items-center justify-between px-8 py-5">
            <Link href="/" className="flex items-center gap-3 group">
              <span
                className="font-serif text-xl font-bold text-white drop-shadow-sm tracking-tight"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,0.4)' }}
              >
                Joie
              </span>
              <span
                className="text-xs tracking-widest uppercase text-white opacity-70 drop-shadow-sm hidden sm:inline"
                style={{ letterSpacing: '0.18em', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
              >
                by Oukala Journeys
              </span>
            </Link>
          </div>
        </header>

        <main className="min-h-screen bg-white overflow-x-hidden">
          {children}
        </main>

        <footer className="bg-navy text-white">
          <div className="max-w-6xl mx-auto px-8 py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="font-serif text-2xl font-bold text-white mb-1">Joie</p>
                <p className="text-xs tracking-widest uppercase opacity-50" style={{ letterSpacing: '0.2em' }}>
                  by Oukala Journeys
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm opacity-40 tracking-wide">
                  © {new Date().getFullYear()} Oukala Journeys
                </p>
                <p className="text-xs opacity-25 mt-1 tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
                  All rights reserved
                </p>
              </div>
            </div>
            <div className="mt-12 border-t border-white border-opacity-10" />
          </div>
        </footer>

      </body>
    </html>
  )
}
