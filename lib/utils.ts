/**
 * Parse any date string robustly — handles both:
 *   "2026-06-09"               → plain date (parse as UTC)
 *   "2026-06-19 14:00:00+00"   → timestamptz from Supabase
 */
function parseDate(dateStr: string): Date {
  // If it looks like a plain YYYY-MM-DD (no time component), parse as UTC
  // to avoid timezone-shift off-by-one errors.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day))
  }
  // Otherwise let the JS engine parse it (handles ISO 8601 with offset)
  return new Date(dateStr)
}

/**
 * Full format: "June 9, 2026"
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = parseDate(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Short format: "Jun 9"
 */
export function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = parseDate(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Time-only from a timestamp: "2:00 PM"
 */
export function formatTime(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = parseDate(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}
