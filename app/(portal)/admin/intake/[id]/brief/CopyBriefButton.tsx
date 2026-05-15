'use client'

import { useState } from 'react'

export default function CopyBriefButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs uppercase tracking-widest px-5 py-2 rounded-sm transition-all font-medium"
      style={{
        background: copied ? '#238636' : '#C9A84C',
        color: '#fff',
        letterSpacing: '0.12em',
      }}
    >
      {copied ? '✓ Copied!' : 'Copy to Clipboard'}
    </button>
  )
}
