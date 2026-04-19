interface CalloutBoxProps {
  type: 'wow' | 'thread' | 'one_thing' | 'phrase'
  title?: string
  content: string
}

const config = {
  wow: {
    icon: '✦',
    label: 'WOW Moment',
    accent: '#7C3AED',
    bg: 'rgba(124,58,237,0.04)',
    border: 'rgba(124,58,237,0.15)',
    labelColor: 'rgba(124,58,237,0.7)',
    textColor: '#2d1a5e',
  },
  thread: {
    icon: '◉',
    label: 'The Thread',
    accent: '#C9A84C',
    bg: 'rgba(201,168,76,0.04)',
    border: 'rgba(201,168,76,0.2)',
    labelColor: 'rgba(201,168,76,0.9)',
    textColor: '#4a3a18',
  },
  one_thing: {
    icon: '→',
    label: 'Local Insider',
    accent: '#0f766e',
    bg: 'rgba(15,118,110,0.04)',
    border: 'rgba(15,118,110,0.15)',
    labelColor: 'rgba(15,118,110,0.7)',
    textColor: '#0c3d38',
  },
  phrase: {
    icon: '«',
    label: 'Phrase of the Day',
    accent: '#be185d',
    bg: 'rgba(190,24,93,0.04)',
    border: 'rgba(190,24,93,0.12)',
    labelColor: 'rgba(190,24,93,0.7)',
    textColor: '#4a0a25',
  },
}

export default function CalloutBox({ type, title, content }: CalloutBoxProps) {
  const c = config[type]

  return (
    <div
      className="relative rounded-sm overflow-hidden"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-0.5"
        style={{ background: c.accent, opacity: 0.6 }}
      />

      <div className="px-8 py-8 pl-10">
        {/* Label row */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-base font-light"
            style={{ color: c.accent, opacity: 0.8 }}
          >
            {c.icon}
          </span>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ letterSpacing: '0.2em', color: c.labelColor }}
          >
            {c.label}
          </p>
        </div>

        {title && (
          <h3
            className="font-serif text-xl font-bold mb-3"
            style={{ color: c.textColor, lineHeight: '1.25' }}
          >
            {title}
          </h3>
        )}

        <p
          className="leading-relaxed"
          style={{ color: c.textColor, opacity: 0.85, lineHeight: '1.75', fontSize: '0.975rem' }}
        >
          {content}
        </p>
      </div>
    </div>
  )
}
