/**
 * /api/admin/validate-books
 *
 * Validates a single RWL book/media item:
 *   - ISBN → Google Books API: verify title, author, and fetch canonical cover
 *   - Amazon URL → HEAD request: check it resolves (200/301/302)
 *   - Cover image URL → HEAD request: check it loads
 *
 * Called by the admin Health tab's book validation routine.
 * Returns JSON: { id, isbn_ok, isbn_error, google_title, google_author, google_cover,
 *                 amazon_ok, amazon_status, cover_ok, cover_status }
 */

import { NextRequest, NextResponse } from 'next/server'

const TIMEOUT_MS = 8000

async function headUrl(url: string): Promise<{ ok: boolean; status: number; finalUrl?: string }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OukalaAdmin/1.0)' },
    })
    clearTimeout(timer)
    return { ok: res.ok, status: res.status, finalUrl: res.url }
  } catch {
    return { ok: false, status: 0 }
  }
}

/** Convert ISBN-13 (978-prefix) to ISBN-10. Returns null if not applicable. */
function isbn13to10(isbn13: string): string | null {
  if (isbn13.length !== 13 || !isbn13.startsWith('978')) return null
  const nine = isbn13.slice(3, 12)
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(nine[i]) * (10 - i)
  const check = 11 - (sum % 11)
  const checkChar = check === 10 ? 'X' : check === 11 ? '0' : String(check)
  return nine + checkChar
}

async function queryGoogleBooksApi(isbnQuery: string): Promise<{
  title: string | null; authors: string[]; cover: string | null
} | null> {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), TIMEOUT_MS)
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnQuery}&maxResults=1`,
    { signal: controller.signal }
  )
  if (!res.ok) return null
  const data = await res.json() as {
    totalItems: number
    items?: Array<{
      volumeInfo: {
        title?: string
        authors?: string[]
        imageLinks?: { thumbnail?: string; smallThumbnail?: string }
      }
    }>
  }
  if (!data.items?.length) return null
  const vol = data.items[0].volumeInfo
  const rawCover = vol.imageLinks?.thumbnail || vol.imageLinks?.smallThumbnail || null
  const cover = rawCover
    ? rawCover.replace('http://', 'https://').replace('zoom=1', 'zoom=3')
    : null
  return { title: vol.title ?? null, authors: vol.authors ?? [], cover }
}

async function fetchGoogleBooks(isbn: string) {
  try {
    // Try ISBN-13 first; fall back to ISBN-10 (Google Books sometimes indexes only one)
    const result = await queryGoogleBooksApi(isbn)
    if (result) return result
    const isbn10 = isbn13to10(isbn)
    if (isbn10) return await queryGoogleBooksApi(isbn10)
    return null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const isbn       = searchParams.get('isbn') || ''
  const amazon_url = searchParams.get('amazon_url') || ''
  const cover_url  = searchParams.get('cover_url') || ''

  const result: Record<string, unknown> = {}

  // ── ISBN / Google Books ───────────────────────────────────────────────────
  if (isbn) {
    const gb = await fetchGoogleBooks(isbn)
    if (gb) {
      result.isbn_ok      = true
      result.google_title  = gb.title
      result.google_author = gb.authors.join(', ')
      result.google_cover  = gb.cover
    } else {
      result.isbn_ok    = false
      result.isbn_error = `ISBN ${isbn} not found in Google Books`
    }
  } else {
    result.isbn_ok    = null  // not a book / no ISBN provided
  }

  // ── Amazon URL ────────────────────────────────────────────────────────────
  if (amazon_url) {
    const amz = await headUrl(amazon_url)
    result.amazon_ok     = amz.ok
    result.amazon_status = amz.status
    result.amazon_final  = amz.finalUrl
  } else {
    result.amazon_ok = null  // no URL provided
  }

  // ── Cover image ───────────────────────────────────────────────────────────
  if (cover_url) {
    const cov = await headUrl(cover_url)
    result.cover_ok     = cov.ok
    result.cover_status = cov.status
  } else {
    result.cover_ok = null  // no cover URL set
  }

  return NextResponse.json(result)
}
