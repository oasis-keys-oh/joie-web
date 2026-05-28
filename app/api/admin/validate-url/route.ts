import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/app/(portal)/admin/auth'

// Server-side URL checker — bypasses browser CORS restrictions.
// Called by the client Validate tab for each URL it needs to check.

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawUrl = req.nextUrl.searchParams.get('url')
  if (!rawUrl) return NextResponse.json({ ok: false, error: 'No URL provided' })

  // Basic URL sanity check
  try { new URL(rawUrl) } catch {
    return NextResponse.json({ ok: false, error: 'Invalid URL' })
  }

  // Assign to a const so TypeScript knows it's definitely a string inside closures
  const url: string = rawUrl

  const UA = 'Mozilla/5.0 (compatible; OukalaJourneysAdmin/1.0)'
  const TIMEOUT_MS = 10_000

  async function tryFetch(method: 'HEAD' | 'GET'): Promise<Response> {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        method,
        signal: ac.signal,
        headers: {
          'User-Agent': UA,
          ...(method === 'GET' ? { Range: 'bytes=0-1023' } : {}),
        },
        redirect: 'follow',
      })
      clearTimeout(timer)
      return res
    } catch (err) {
      clearTimeout(timer)
      throw err
    }
  }

  // Try HEAD first (fast), fall back to partial GET (some servers reject HEAD)
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const res = await tryFetch(method)
      const contentType = res.headers.get('content-type') ?? null
      return NextResponse.json({
        ok:          res.status < 400,
        status:      res.status,
        contentType,
        isImage:     contentType?.startsWith('image/') ?? false,
      })
    } catch (err: unknown) {
      if (method === 'GET') {
        // Both methods failed
        const msg  = err instanceof Error ? err.message : String(err)
        const isTimeout = /abort|timeout/i.test(msg)
        return NextResponse.json({
          ok:    false,
          error: isTimeout ? `Timed out after ${TIMEOUT_MS / 1000}s` : msg.slice(0, 120),
        })
      }
      // HEAD failed — loop around and try GET
    }
  }

  return NextResponse.json({ ok: false, error: 'All fetch methods failed' })
}
