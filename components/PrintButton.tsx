'use client'

interface PrintButtonProps {
  dayTitle?: string
  className?: string
}

export default function PrintButton({ dayTitle, className }: PrintButtonProps) {
  function handlePrint() {
    if (dayTitle) {
      document.title = dayTitle + ' | Oukala Journeys'
    }
    window.print()
  }

  return (
    <button
      onClick={handlePrint}
      className={`no-print inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-all duration-200 rounded-sm ${className ?? ''}`}
      style={{
        letterSpacing: '0.12em',
        color: '#6b7280',
        border: '1px solid rgba(27,43,75,0.15)',
        background: 'transparent',
      }}
      title="Print or save as PDF"
      aria-label="Print this day"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 6 2 18 2 18 9"/>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      Print / PDF
    </button>
  )
}
