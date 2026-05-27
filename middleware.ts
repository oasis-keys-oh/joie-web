import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Normalize double-slash URLs.
 *
 * When a URL arrives with a double slash (e.g. //trip), the browser parses
 * it as a protocol-relative URL pointing to a different host. Next.js then
 * tries to normalize it via history.replaceState, which the browser blocks
 * with a SecurityError.
 *
 * This middleware catches any pathname containing consecutive slashes and
 * 301-redirects to the collapsed form before Next.js routing fires.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.includes('//')) {
    const normalized = pathname.replace(/\/\/+/g, '/')
    const url = request.nextUrl.clone()
    url.pathname = normalized
    return NextResponse.redirect(url, { status: 301 })
  }

  return NextResponse.next()
}

export const config = {
  // Run on all paths except Next.js internals and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
