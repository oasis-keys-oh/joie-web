'use client'

import { useState, useCallback } from 'react'

interface QRShareModalProps {
  tripSlug: string
  tripTitle: string
  webPassword?: string | null
}

export default function QRShareModal({ tripSlug, tripTitle, webPassword }: QRShareModalProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Build the join URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://joie.oukalajourney.com'
  const joinPath = `/join/${tripSlug}${webPassword ? `?p=${encodeURIComponent(webPassword)}` : ''}`
  const joinUrl = `${baseUrl}${joinPath}`

  // QR code via qrserver.com (free, no API key)
  const qrSize = 280
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&margin=1&data=${encodeURIComponent(joinUrl)}&color=1B2B4B&bgcolor=ffffff`

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = joinUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [joinUrl])

  const handleDownload = useCallback(async () => {
    try {
      // Fetch the QR image and trigger download
      const downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=2&data=${encodeURIComponent(joinUrl)}&color=1B2B4B&bgcolor=ffffff&format=png`
      const response = await fetch(downloadUrl)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `oukala-qr-${tripSlug}.png`
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      // Fallback: open in new tab
      window.open(qrSrc, '_blank')
    }
  }, [joinUrl, tripSlug, qrSrc])

  return (
    <>
      {/* Trigger button — sits in the breadcrumb header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink-muted border border-gray-200 hover:border-gold hover:text-navy transition-all duration-200"
        style={{ letterSpacing: '0.08em' }}
        title="Share QR code"
      >
        <QRIcon />
        <span className="hidden sm:inline uppercase tracking-widest" style={{ letterSpacing: '0.14em' }}>Share QR</span>
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="bg-white w-full max-w-sm overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}
          >
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <p className="text-xs text-gold uppercase tracking-widest mb-1" style={{ letterSpacing: '0.18em' }}>
                  Share Journey
                </p>
                <h2 className="font-serif font-bold text-navy text-xl" style={{ lineHeight: '1.1' }}>
                  {tripTitle}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-gray-600 transition-colors mt-0.5 ml-4 shrink-0 text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center px-6 pt-6 pb-4">
              <div
                className="p-3 mb-4"
                style={{ border: '1px solid #e5e7eb', background: '#fff' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrc}
                  alt={`QR code for ${tripTitle}`}
                  width={qrSize}
                  height={qrSize}
                  style={{ display: 'block' }}
                />
              </div>

              {/* Scan instructions */}
              <p className="text-center text-xs text-ink-muted leading-relaxed mb-1">
                Scan to open journey on web or app
              </p>
              {!webPassword && (
                <p className="text-center text-xs text-amber-500 leading-relaxed mb-1">
                  ⚠️ No web password set — anyone with the link can access
                </p>
              )}
            </div>

            {/* URL strip */}
            <div className="px-6 pb-4">
              <div
                className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100"
              >
                <p
                  className="flex-1 text-xs text-ink-muted truncate font-mono"
                  style={{ fontSize: '0.7rem' }}
                >
                  {joinUrl}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-widest border transition-all duration-200"
                style={{
                  letterSpacing: '0.14em',
                  borderColor: copied ? '#C49B54' : '#e5e7eb',
                  color: copied ? '#C49B54' : '#6b7280',
                  background: copied ? 'rgba(196,155,84,0.05)' : 'white',
                }}
              >
                {copied ? (
                  <>
                    <CheckIcon />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon />
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-widest text-white transition-all duration-200 hover:opacity-90"
                style={{
                  letterSpacing: '0.14em',
                  background: 'linear-gradient(135deg, #1B2B4B, #243660)',
                }}
              >
                <DownloadIcon />
                Download
              </button>
            </div>

            {/* Universal Links note */}
            <div
              className="px-6 py-3 border-t border-gray-50"
              style={{ background: '#fafafa' }}
            >
              <p className="text-center text-xs text-ink-muted opacity-60 leading-relaxed">
                Web portal opens immediately. Cavé app deep-linking coming soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Tiny inline SVG icons ─────────────────────────────────────────────────────

function QRIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <line x1="17" y1="18" x2="21" y2="18" />
      <line x1="21" y1="14" x2="21" y2="18" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
