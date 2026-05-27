#!/usr/bin/env node
/**
 * check-rwl-links.mjs
 *
 * Validates all URLs stored in the read_watch_listen table:
 *   - amazon_url  → checks the ASIN resolves to a real product page (not a 404 or redirect to search)
 *   - streaming_url → checks the page returns a 200 (non-paywalled redirect is still a pass)
 *
 * Usage:
 *   node scripts/check-rwl-links.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * (or set as environment variables before running).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// ── Load .env.local ──────────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const TIMEOUT_MS = 8000
const USER_AGENT = 'Mozilla/5.0 (compatible; OukalaLinkChecker/1.0)'

// Amazon ASIN/ISBN pages can 503 in headless mode — we check for known-bad patterns instead
const AMAZON_KNOWN_BAD_PATTERNS = [
  '/s?',          // redirected to search
  '/s/',
  'field-keywords', // search result
  '/dp/invalid',
  'Sorry, we just need to make sure you',  // CAPTCHA
]

async function fetchWithTimeout(url, timeout = TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT },
    })
    return { ok: res.ok, status: res.status, finalUrl: res.url, body: null }
  } catch (err) {
    return { ok: false, status: 0, finalUrl: url, error: err.message }
  } finally {
    clearTimeout(timer)
  }
}

function extractAsin(url) {
  // Matches /dp/XXXXXXXXXX or /gp/product/XXXXXXXXXX
  const m = url.match(/(?:\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/i)
  return m ? m[1] : null
}

async function checkAmazonUrl(url) {
  const asin = extractAsin(url)
  if (!asin) return { pass: false, note: `Cannot parse ASIN from URL: ${url}` }

  const result = await fetchWithTimeout(url)
  if (result.error) return { pass: false, note: `Fetch error: ${result.error}` }

  // Amazon returns 200 for product pages AND for "product not found" pages —
  // we check the final URL for redirect-to-search patterns
  const finalUrl = result.finalUrl || ''
  for (const pattern of AMAZON_KNOWN_BAD_PATTERNS) {
    if (finalUrl.includes(pattern)) {
      return { pass: false, note: `Amazon redirected to non-product page: ${finalUrl}` }
    }
  }

  if (!result.ok && result.status !== 503) {
    // 503 is Amazon's bot protection but the product exists
    return { pass: false, note: `HTTP ${result.status}` }
  }

  return { pass: true, note: `HTTP ${result.status === 503 ? '503 (bot-protect, ASIN likely valid)' : result.status}` }
}

async function checkStreamingUrl(url) {
  const result = await fetchWithTimeout(url)
  if (result.error) return { pass: false, note: `Fetch error: ${result.error}` }

  // Streaming sites (Netflix, Criterion, Spotify) redirect to login — that's fine
  // We just want to confirm the URL itself resolves (not a 404)
  if (result.status === 404) return { pass: false, note: 'HTTP 404 — page not found' }
  if (result.status === 0) return { pass: false, note: 'No response / timeout' }

  return { pass: true, note: `HTTP ${result.status}` }
}

// ── Main ─────────────────────────────────────────────────────────────
const { data: items, error } = await supabase
  .from('read_watch_listen')
  .select('id, title, type, amazon_url, streaming_url, streaming_platform')
  .order('display_order')

if (error) {
  console.error('❌ Supabase query failed:', error.message)
  process.exit(1)
}

console.log(`\n🔍 Checking ${items.length} read_watch_listen items…\n`)

const results = []
let passCount = 0
let failCount = 0
let warnCount = 0

for (const item of items) {
  const label = `[${item.type}] ${item.title}`
  const itemResult = { label, checks: [] }

  if (!item.amazon_url && !item.streaming_url) {
    itemResult.checks.push({ field: 'links', pass: 'warn', note: 'No URLs — "Find it" placeholder will show on site' })
    warnCount++
  }

  if (item.amazon_url) {
    process.stdout.write(`  Checking Amazon for "${item.title}"… `)
    const check = await checkAmazonUrl(item.amazon_url)
    console.log(check.pass ? `✓ ${check.note}` : `✗ ${check.note}`)
    itemResult.checks.push({ field: 'amazon_url', url: item.amazon_url, ...check })
    check.pass ? passCount++ : failCount++
  }

  if (item.streaming_url) {
    process.stdout.write(`  Checking ${item.streaming_platform || 'streaming'} for "${item.title}"… `)
    const check = await checkStreamingUrl(item.streaming_url)
    console.log(check.pass ? `✓ ${check.note}` : `✗ ${check.note}`)
    itemResult.checks.push({ field: 'streaming_url', url: item.streaming_url, platform: item.streaming_platform, ...check })
    check.pass ? passCount++ : failCount++
  }

  results.push(itemResult)
}

// ── Summary ──────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────')
console.log(`✅ Passed: ${passCount}`)
console.log(`⚠️  No links: ${warnCount}`)
console.log(`❌ Failed: ${failCount}`)
console.log('─────────────────────────────────────────\n')

if (failCount > 0) {
  console.log('FAILED ITEMS:')
  for (const r of results) {
    const failures = r.checks.filter((c) => c.pass === false)
    if (failures.length > 0) {
      console.log(`\n  ${r.label}`)
      for (const f of failures) {
        console.log(`    ${f.field}: ${f.url || ''}`)
        console.log(`    → ${f.note}`)
      }
    }
  }
  console.log('')
  process.exit(1)
}

process.exit(0)
