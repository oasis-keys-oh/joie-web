'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getPhotoPool, UnsplashPhoto } from '@/lib/unsplash'
import UnsplashCredit from '@/components/UnsplashCredit'

interface PhotoFooterProps {
  region: string
  caption?: string
}

export default function PhotoFooter({ region, caption }: PhotoFooterProps) {
  const pool = getPhotoPool(region)
  // Show all photos from the pool as a horizontal strip
  const [active, setActive] = useState(0)
  const featured = pool[active]
  const featuredUrl = `https://images.unsplash.com/${featured.id}?w=2400&h=900&fit=crop&q=85`

  return (
    <section className="mt-0">
      {/* Full-bleed feature photo */}
      <div className="relative w-full overflow-hidden" style={{ height: '55vh', minHeight: '360px' }}>
        <Image
          src={featuredUrl}
          alt={caption || region}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
        {/* Gradient top */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.0) 100%)' }}
        />
        {/* Caption */}
        {caption && (
          <div className="absolute top-10 left-0 right-0 text-center">
            <p
              className="text-white opacity-70 text-xs tracking-widest uppercase"
              style={{ letterSpacing: '0.22em' }}
            >
              {caption}
            </p>
          </div>
        )}
        {/* Thumbnail strip */}
        {pool.length > 1 && (
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2 px-6">
            {pool.map((p, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="relative overflow-hidden rounded-sm border-2 transition-all duration-200 shrink-0"
                style={{
                  width: i === active ? '64px' : '44px',
                  height: '44px',
                  borderColor: i === active ? '#C9A84C' : 'rgba(255,255,255,0.3)',
                  opacity: i === active ? 1 : 0.65,
                }}
                aria-label={`View photo ${i + 1}`}
              >
                <Image
                  src={`https://images.unsplash.com/${p.id}?w=128&h=88&fit=crop&q=70`}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
        <UnsplashCredit photo={{ ...featured, url: featuredUrl }} variant="hero" />
      </div>
    </section>
  )
}
