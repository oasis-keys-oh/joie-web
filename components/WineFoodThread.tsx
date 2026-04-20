import { WineFoodPick } from '@/lib/types'

interface Props {
  picks: WineFoodPick[]
}

const TYPE_COLOR: Record<string, string> = {
  wine:    '#7c3aed',
  cheese:  '#b45309',
  spice:   '#dc2626',
  pastry:  '#d97706',
  olive:   '#15803d',
  produce: '#15803d',
  fish:    '#0284c7',
  meat:    '#9f1239',
  default: '#C9A84C',
}

const TYPE_ICON: Record<string, string> = {
  wine:    '🍷',
  cheese:  '🧀',
  spice:   '🌿',
  pastry:  '🥐',
  olive:   '🫒',
  produce: '🫒',
  fish:    '🐟',
  meat:    '🥩',
  default: '✦',
}

export default function WineFoodThread({ picks }: Props) {
  if (!picks || picks.length === 0) return null

  return (
    <div className="mt-12">
      <div className="flex items-center gap-5 mb-6">
        <p className="label shrink-0">Pick Up Today</p>
        <div className="flex-1 border-t border-gray-100" />
        <span className="text-gold shrink-0" style={{ fontSize: '0.9rem' }}>🍷</span>
      </div>

      <div className="space-y-3">
        {picks.map((pick, i) => {
          const typeKey = pick.type?.toLowerCase() || 'default'
          const color = TYPE_COLOR[typeKey] || TYPE_COLOR.default
          const icon = TYPE_ICON[typeKey] || TYPE_ICON.default

          return (
            <div
              key={i}
              className="flex items-start gap-4 px-5 py-4 rounded-sm"
              style={{
                background: `${color}06`,
                border: `1px solid ${color}22`,
                borderLeft: `3px solid ${color}`,
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                  <p className="font-serif font-bold text-navy text-sm leading-snug">
                    {pick.name}
                  </p>
                  {pick.type && (
                    <span
                      className="uppercase tracking-widest"
                      style={{ fontSize: '0.58rem', letterSpacing: '0.16em', color }}
                    >
                      {pick.type}
                    </span>
                  )}
                </div>
                {pick.note && (
                  <p className="text-ink leading-relaxed" style={{ fontSize: '0.78rem', color: '#555', lineHeight: '1.6' }}>
                    {pick.note}
                  </p>
                )}
                {pick.when_to_get && (
                  <p
                    className="mt-2 italic"
                    style={{ fontSize: '0.68rem', color, letterSpacing: '0.02em' }}
                  >
                    → {pick.when_to_get}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
