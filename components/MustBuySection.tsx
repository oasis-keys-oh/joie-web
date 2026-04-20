import { MustBuyItem } from '@/lib/types'

interface Props {
  items: MustBuyItem[]
}

export default function MustBuySection({ items }: Props) {
  if (!items || items.length === 0) return null

  return (
    <div className="mt-12">
      <div className="flex items-center gap-5 mb-6">
        <p className="label shrink-0">Must Buy Today</p>
        <div className="flex-1 border-t border-gray-100" />
        <span className="text-gold shrink-0" style={{ fontSize: '0.9rem' }}>🛍️</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="px-5 py-4 rounded-sm"
            style={{
              background: 'rgba(201,168,76,0.04)',
              border: '1px solid rgba(201,168,76,0.18)',
              borderLeft: '3px solid #C9A84C',
            }}
          >
            <p className="font-serif font-bold text-navy text-sm leading-snug mb-1">
              {item.item}
            </p>
            {item.why && (
              <p className="text-ink leading-relaxed mb-2" style={{ fontSize: '0.78rem', color: '#555', lineHeight: '1.6' }}>
                {item.why}
              </p>
            )}
            <div className="flex items-center gap-3 flex-wrap mt-2">
              {item.where && (
                <span
                  className="flex items-center gap-1 text-ink-muted"
                  style={{ fontSize: '0.65rem', letterSpacing: '0.04em' }}
                >
                  <span style={{ color: '#C9A84C' }}>📍</span>
                  {item.where}
                </span>
              )}
              {item.price_range && (
                <span
                  className="px-2 py-0.5 rounded-sm text-ink-muted"
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.08em',
                    background: 'rgba(27,43,75,0.05)',
                  }}
                >
                  {item.price_range}
                </span>
              )}
              {item.amazon_url && (
                <a
                  href={item.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.1em',
                    color: '#1B2B4B',
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    padding: '2px 7px',
                    borderRadius: '2px',
                  }}
                >
                  Amazon →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
