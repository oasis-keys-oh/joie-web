'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  term: string
  explanation: string
  children: React.ReactNode
}

export default function CulturalTooltip({ term, explanation, children }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<'above' | 'below'>('above')
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos(rect.top > 160 ? 'above' : 'below')
  }, [open])

  return (
    <span className="relative inline" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="underline decoration-dotted decoration-gold underline-offset-2 cursor-help hover:text-gold transition-colors"
        style={{ textDecorationColor: '#C9A84C' }}
        aria-label={`Learn about ${term}`}
      >
        {children}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <span
            className="fixed inset-0 z-40"
            style={{ background: 'transparent' }}
            onClick={() => setOpen(false)}
          />
          {/* Tooltip bubble */}
          <span
            className="absolute z-50 left-0 w-64"
            style={{
              ...(pos === 'above'
                ? { bottom: 'calc(100% + 8px)' }
                : { top: 'calc(100% + 8px)' }),
            }}
          >
            <span
              className="block rounded-sm shadow-lg px-4 py-3"
              style={{
                background: '#1B2B4B',
                border: '1px solid rgba(201,168,76,0.3)',
              }}
            >
              <span
                className="block text-gold uppercase tracking-widest mb-1.5"
                style={{ fontSize: '0.58rem', letterSpacing: '0.18em' }}
              >
                {term}
              </span>
              <span
                className="block text-white leading-relaxed"
                style={{ fontSize: '0.75rem', lineHeight: '1.6', opacity: 0.9 }}
              >
                {explanation}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="block mt-2 text-white opacity-40 hover:opacity-70 transition-opacity"
                style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}
              >
                close ×
              </button>
            </span>
          </span>
        </>
      )}
    </span>
  )
}
