'use client'

import { useState } from 'react'
import { CulturalNote } from '@/lib/types'

interface Props {
  notes: CulturalNote[]
}

export default function CulturalNotesBox({ notes }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  if (!notes || notes.length === 0) return null

  return (
    <div className="mt-12">
      <div className="flex items-center gap-5 mb-6">
        <p className="label shrink-0">Cultural Notes</p>
        <div className="flex-1 border-t border-gray-100" />
        <span className="text-gold shrink-0" style={{ fontSize: '0.9rem' }}>◉</span>
      </div>

      <div className="space-y-2">
        {notes.map((note, i) => {
          const isOpen = openIdx === i
          return (
            <div
              key={i}
              className="rounded-sm overflow-hidden"
              style={{
                border: '1px solid rgba(27,43,75,0.09)',
                borderLeft: `3px solid ${isOpen ? '#C9A84C' : 'rgba(27,43,75,0.15)'}`,
                transition: 'border-color 0.2s',
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-serif font-bold text-navy text-sm">{note.term}</span>
                <span
                  className="text-ink-muted transition-transform duration-200 shrink-0 ml-4"
                  style={{
                    fontSize: '0.75rem',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    color: isOpen ? '#C9A84C' : undefined,
                  }}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div
                  className="px-5 pb-4"
                  style={{ borderTop: '1px solid rgba(27,43,75,0.06)' }}
                >
                  <p
                    className="text-ink leading-relaxed pt-3"
                    style={{ fontSize: '0.82rem', lineHeight: '1.75', color: '#444' }}
                  >
                    {note.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
