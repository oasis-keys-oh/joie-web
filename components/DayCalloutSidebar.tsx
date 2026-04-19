import { TripDay, LiteraryQuote, PhotoSpot } from '@/lib/types'

interface DayCalloutSidebarProps {
  day: TripDay
}

// Helper to extract thread text regardless of storage format
function getThreadText(thread: TripDay['thread_content']): string {
  if (!thread) return ''
  if (typeof thread === 'string') return thread
  return thread.content || ''
}

// Individual box primitives
function SidebarBox({
  icon,
  label,
  accentColor,
  children,
}: {
  icon: string
  label: string
  accentColor: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{
        background: 'rgba(27, 43, 75, 0.04)',
        border: '1px solid rgba(27, 43, 75, 0.07)',
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span style={{ fontSize: '0.75rem', color: accentColor }}>{icon}</span>
          <span
            className="uppercase font-semibold tracking-widest"
            style={{ fontSize: '0.6rem', letterSpacing: '0.18em', color: accentColor }}
          >
            {label}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}

/**
 * Split "خيط الأندلس · The Thread Begins" → { arabic: "خيط الأندلس", english: "The Thread Begins" }
 * Always display English first.
 */
function parseThreadTitle(title?: string): { english: string; arabic: string | null } {
  if (!title) return { english: 'The Thread', arabic: null }
  const parts = title.split(' · ')
  if (parts.length >= 2) {
    // Detect which part is Arabic (RTL characters present)
    const isRTL = (s: string) => /[\u0600-\u06FF\u0750-\u077F]/.test(s)
    if (isRTL(parts[0])) {
      return { english: parts.slice(1).join(' · '), arabic: parts[0] }
    }
    return { english: parts[0], arabic: parts.slice(1).join(' · ') }
  }
  return { english: title, arabic: null }
}

export default function DayCalloutSidebar({ day }: DayCalloutSidebarProps) {
  const threadText = getThreadText(day.thread_content)

  // Build phrase display
  const phrase = day.phrase
  const phraseText = phrase?.text
  const phrasePronounciation = phrase?.pronunciation
  const phraseMeaning = phrase?.meaning
  const phraseContext = phrase?.context

  // Only render if at least one box has content
  const hasContent =
    day.wow_moment ||
    (day.thread_content && threadText) ||
    day.local_insider_tip ||
    phraseText ||
    day.literary_quote?.text ||
    day.photo_spot?.location

  if (!hasContent) return null

  return (
    <div className="space-y-4">

      {/* Section header */}
      <div className="flex items-center gap-4 mb-2">
        <p className="label shrink-0">Highlights</p>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      {/* WOW Moment */}
      {day.wow_moment && (
        <SidebarBox icon="✦" label="WOW Moment" accentColor="#7c3aed">
          <p
            className="font-serif text-navy leading-relaxed"
            style={{ fontSize: '0.78rem', lineHeight: '1.65' }}
          >
            {day.wow_moment}
          </p>
        </SidebarBox>
      )}

      {/* The Thread */}
      {threadText && (() => {
        const { english, arabic } = parseThreadTitle(day.thread_title)
        return (
          <SidebarBox icon="◉" label={english} accentColor="#C9A84C">
            {arabic && (
              <p
                className="text-gold opacity-70 mb-2"
                style={{ fontSize: '0.68rem', direction: 'rtl', letterSpacing: '0.02em' }}
              >
                {arabic}
              </p>
            )}
            <p
              className="text-navy leading-relaxed"
              style={{ fontSize: '0.75rem', lineHeight: '1.65' }}
            >
              {threadText}
            </p>
          </SidebarBox>
        )
      })()}

      {/* Local Insider */}
      {day.local_insider_tip && (
        <SidebarBox icon="→" label="Local Insider" accentColor="#0d9488">
          <p
            className="text-navy leading-relaxed"
            style={{ fontSize: '0.75rem', lineHeight: '1.65' }}
          >
            {day.local_insider_tip}
          </p>
        </SidebarBox>
      )}

      {/* Phrase of the Day */}
      {phraseText && (
        <SidebarBox icon="«" label="Phrase of the Day" accentColor="#e11d48">
          <p
            className="font-serif text-navy font-semibold mb-1"
            style={{ fontSize: '0.88rem', letterSpacing: '0.01em' }}
          >
            {phraseText}
          </p>
          {phrasePronounciation && (
            <p
              className="text-ink-muted italic mb-1.5"
              style={{ fontSize: '0.68rem', letterSpacing: '0.03em' }}
            >
              {phrasePronounciation}
            </p>
          )}
          {phraseMeaning && (
            <p
              className="text-navy"
              style={{ fontSize: '0.72rem', lineHeight: '1.5' }}
            >
              {phraseMeaning}
            </p>
          )}
          {phraseContext && (
            <p
              className="text-ink-muted mt-1.5 italic"
              style={{ fontSize: '0.68rem', lineHeight: '1.55' }}
            >
              {phraseContext}
            </p>
          )}
        </SidebarBox>
      )}

      {/* Literary Quote */}
      {day.literary_quote?.text && (
        <SidebarBox icon="❝" label="From the Literature" accentColor="#6366f1">
          <p
            className="font-serif text-navy italic leading-relaxed mb-2"
            style={{ fontSize: '0.8rem', lineHeight: '1.7' }}
          >
            {day.literary_quote.text}
          </p>
          {day.literary_quote.attribution && (
            <p
              className="text-ink-muted text-right"
              style={{ fontSize: '0.66rem', letterSpacing: '0.04em' }}
            >
              {day.literary_quote.attribution}
            </p>
          )}
          {day.literary_quote.context && (
            <p
              className="text-ink-muted mt-1.5"
              style={{ fontSize: '0.68rem', lineHeight: '1.55' }}
            >
              {day.literary_quote.context}
            </p>
          )}
        </SidebarBox>
      )}

      {/* Instagram Photo Spot */}
      {day.photo_spot?.location && (
        <SidebarBox icon="📍" label="Photo Spot" accentColor="#0ea5e9">
          <p
            className="text-navy font-semibold mb-1"
            style={{ fontSize: '0.78rem', letterSpacing: '0.01em' }}
          >
            {day.photo_spot.location}
          </p>
          {day.photo_spot.timing && (
            <p className="text-ink-muted mt-1" style={{ fontSize: '0.7rem', lineHeight: '1.5' }}>
              🕐 {day.photo_spot.timing}
            </p>
          )}
          {day.photo_spot.angle && (
            <p className="text-ink mt-1" style={{ fontSize: '0.7rem', lineHeight: '1.5' }}>
              {day.photo_spot.angle}
            </p>
          )}
          {day.photo_spot.instagram_caption && (
            <p
              className="text-ink-muted mt-2 italic"
              style={{ fontSize: '0.67rem', lineHeight: '1.55' }}
            >
              &ldquo;{day.photo_spot.instagram_caption}&rdquo;
            </p>
          )}
          {day.photo_spot.hashtags && day.photo_spot.hashtags.length > 0 && (
            <p
              className="mt-2"
              style={{ fontSize: '0.64rem', color: '#0ea5e9', lineHeight: '1.6' }}
            >
              {day.photo_spot.hashtags.join(' ')}
            </p>
          )}
        </SidebarBox>
      )}

    </div>
  )
}
