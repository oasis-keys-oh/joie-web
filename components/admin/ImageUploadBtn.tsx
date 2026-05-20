'use client'

import { useRef, useState } from 'react'

interface Props {
  /** The name of the <input> element whose value this button should update.
   *  The button will find the sibling input by name within the nearest form. */
  targetInputName: string
  /** Optional — if provided, targets the input by id instead of by name.
   *  Use when the input is not inside a <form> and may share its name with
   *  other inputs on the page (e.g. repeating day image fields). */
  targetInputId?: string
  /** Supabase Storage folder to upload into. Defaults to "trip-media". */
  folder?: string
  /** Called with the uploaded URL so the parent can update controlled state
   *  or do additional work. Optional — the button also writes directly into
   *  the DOM input so uncontrolled forms pick up the new value. */
  onUploaded?: (url: string) => void
}

export default function ImageUploadBtn({ targetInputName, targetInputId, folder = 'general', onUploaded }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setState('uploading')
    setErrMsg('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Upload failed')
      }

      // Write URL into the target input (works for both controlled and uncontrolled)
      const targetInput = targetInputId
        ? document.getElementById(targetInputId) as HTMLInputElement | null
        : (() => {
            const form = fileRef.current?.closest('form') ?? document
            return (form as HTMLElement).querySelector<HTMLInputElement>(`input[name="${targetInputName}"]`)
          })()
      if (targetInput) {
        // Trigger React's synthetic onChange so controlled inputs update
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        )?.set
        nativeInputValueSetter?.call(targetInput, json.url)
        targetInput.dispatchEvent(new Event('input', { bubbles: true }))
        targetInput.dispatchEvent(new Event('change', { bubbles: true }))
      }

      onUploaded?.(json.url)
      setState('done')
      setTimeout(() => setState('idle'), 3000)
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Upload failed')
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }

    // Reset file input so the same file can be re-uploaded if needed
    if (fileRef.current) fileRef.current.value = ''
  }

  const label =
    state === 'uploading' ? '↑ Uploading…'
    : state === 'done'    ? '✓ Uploaded'
    : state === 'error'   ? '✗ Failed'
    : '↑ Upload'

  const color =
    state === 'uploading' ? '#9ca3af'
    : state === 'done'    ? '#16a34a'
    : state === 'error'   ? '#dc2626'
    : '#6b7280'

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={state === 'uploading'}
        onClick={() => fileRef.current?.click()}
        className="text-xs px-2.5 py-1.5 border rounded-sm whitespace-nowrap transition-colors disabled:cursor-not-allowed"
        style={{
          borderColor: color,
          color,
          background: state === 'done' ? 'rgba(22,163,74,0.05)' : 'white',
        }}
        title="Upload image to Supabase Storage"
      >
        {label}
      </button>
      {state === 'error' && errMsg && (
        <span className="text-xs text-red-600 mt-1 max-w-[180px] leading-tight">{errMsg}</span>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleChange}
      />
    </span>
  )
}
