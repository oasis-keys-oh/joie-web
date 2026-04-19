'use client'

/**
 * PlaceTooltip — hover over any place name to see its address + map pin.
 *
 * Usage:
 *   <PlaceTooltip name="Villa Sahrai" address="Avenue Moulay Idriss, Fez, Morocco" lat={34.0181} lon={-5.0078} />
 *
 * The component renders the name inline; on hover it shows a floating card
 * with the address and an OpenStreetMap mini-embed centered on that location.
 */

import { useState, useRef } from 'react'

interface PlaceTooltipProps {
  name: string
  address?: string
  lat?: number
  lon?: number
  /** Optional city label to show if address not provided */
  city?: string
  className?: string
}

function buildOsmUrl(lat: number, lon: number): string {
  const d = 0.008
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lon}`
}

export default function PlaceTooltip({ name, address, lat, lon, city, className }: PlaceTooltipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<'above' | 'below'>('above')
  const ref = useRef<HTMLSpanElement>(null)

  function handleMouseEnter() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      // If less than 300px above, show below
      setPos(rect.top < 320 ? 'below' : 'above')
    }
    setVisible(true)
  }

  const hasMap = lat !== undefined && lon !== undefined
  const label = address || city || ''

  return (
    <span
      ref={ref}
      className="relative inline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
      onFocus={handleMouseEnter}
      onBlur={() => setVisible(false)}
    >
      {/* The place name — underlined with a subtle dotted gold line */}
      <span
        className={`cursor-default ${className || ''}`}
        style={{
          borderBottom: '1px dotted #C9A84C',
          paddingBottom: '1px',
        }}
      >
        {name}
      </span>

      {/* Tooltip card */}
      {visible && (
        <span
          className="absolute z-50 left-0 pointer-events-none"
          style={{
            ...(pos === 'above'
              ? { bottom: 'calc(100% + 8px)' }
              : { top: 'calc(100% + 8px)' }),
            minWidth: '260px',
            maxWidth: '320px',
          }}
        >
          <span
            className="block rounded-sm overflow-hidden"
            style={{
              background: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              border: '1px solid rgba(27,43,75,0.1)',
            }}
          >
            {/* Map */}
            {hasMap && (
              <span className="block" style={{ height: '130px' }}>
                <iframe
                  src={buildOsmUrl(lat!, lon!)}
                  width="100%"
                  height="130"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  title={name}
                />
              </span>
            )}
            {/* Text */}
            <span className="block px-3 py-2.5">
              <span className="block font-serif font-bold text-navy text-sm leading-snug">{name}</span>
              {label && (
                <span className="block text-ink-muted mt-1" style={{ fontSize: '0.68rem', lineHeight: '1.5' }}>
                  📍 {label}
                </span>
              )}
              {hasMap && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1.5 text-xs"
                  style={{ color: '#C9A84C', fontSize: '0.65rem', letterSpacing: '0.06em' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Open in maps →
                </a>
              )}
            </span>
          </span>

          {/* Arrow */}
          <span
            className="block mx-3"
            style={{
              width: 0,
              height: 0,
              ...(pos === 'above'
                ? {
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solid white',
                  }
                : {
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '6px solid white',
                    order: -1,
                  }),
            }}
          />
        </span>
      )}
    </span>
  )
}
