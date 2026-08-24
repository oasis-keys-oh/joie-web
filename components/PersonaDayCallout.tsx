'use client'

import { usePersona } from '@/components/PersonaProvider'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface PersonaMoment {
  traveler_key: string
  headline?: string
  note?: string
  emphasis?: string   // e.g. "spa", "competition", "nature", "culture"
}

interface Props {
  dayId: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PersonaDayCallout({ dayId }: Props) {
  const { traveler } = usePersona()
  const [moment, setMoment] = useState<PersonaMoment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!traveler) { setLoading(false); return }

    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('per_person_moments')
        .select('traveler_key, headline, note, emphasis')
        .eq('day_id', dayId)
        .eq('traveler_key', traveler!.key)
        .maybeSingle()

      setMoment(data || null)
      setLoading(false)
    }

    load()
  }, [dayId, traveler])

  if (!traveler || loading || !moment) return null

  const accent = traveler.color || '#1B2B4B'
  const icon = traveler.emoji || '✦'

  return (
    <div
      className="mt-10 rounded-sm overflow-hidden"
      style={{
        borderLeft: `3px solid ${accent}`,
        background: `${accent}08`,
        border: `1px solid ${accent}22`,
        borderLeftWidth: '3px',
        borderLeftColor: accent,
      }}
    >
      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: '0.75rem' }}>{icon}</span>
          <span
            className="uppercase font-semibold tracking-widest"
            style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: accent }}
          >
            {traveler.name}&apos;s View
          </span>
        </div>

        {moment.headline && (
          <p
            className="font-serif font-bold text-navy mb-2 leading-snug"
            style={{ fontSize: '1.05rem' }}
          >
            {moment.headline}
          </p>
        )}
        {moment.note && (
          <p
            className="text-ink leading-relaxed"
            style={{ fontSize: '0.875rem', lineHeight: '1.7', color: '#444' }}
          >
            {moment.note}
          </p>
        )}
      </div>
    </div>
  )
}
