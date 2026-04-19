/**
 * Pre-deploy image URL checker.
 * Run: npm run check:images
 *
 * Checks ALL Unsplash photo IDs used in lib/unsplash.ts return HTTP 200.
 * This list is the source of truth — keep it in sync with all pool arrays
 * in lib/unsplash.ts.
 *
 * Also wired into netlify.toml — runs before every Netlify build.
 * A single broken ID fails the deploy.
 */

const PHOTOS = [
  // ── Morocco ──────────────────────────────────────────────────────────────
  { pool: 'Morocco', id: 'photo-1585208798174-6cedd86e019a' },
  { pool: 'Morocco', id: 'photo-1517821099606-cef63a9bcda6' },
  { pool: 'Morocco', id: 'photo-1539020140153-e479b8c22e70' },
  { pool: 'Morocco', id: 'photo-1553697388-94e804e2f0f6' },
  { pool: 'Morocco', id: 'photo-1528360983277-13d401cdc186' },

  // ── France (general) ─────────────────────────────────────────────────────
  { pool: 'France',  id: 'photo-1502602898657-3e91760cbb34' },
  { pool: 'France',  id: 'photo-1499856871958-5b9627545d1a' },
  { pool: 'France',  id: 'photo-1509439581779-6298f75bf6e5' },

  // ── Burgundy / Wine country ───────────────────────────────────────────────
  { pool: 'Burgundy', id: 'photo-1504279577054-acfeccf8fc52' },
  { pool: 'Burgundy', id: 'photo-1596394516093-501ba68a0ba6' },
  { pool: 'Burgundy', id: 'photo-1504215680853-026ed2a45def' },
  { pool: 'Burgundy', id: 'photo-1558618666-fcd25c85cd64' },

  // ── Loire Valley / Châteaux ───────────────────────────────────────────────
  { pool: 'Loire', id: 'photo-1543946602-a0fce8117697' },
  { pool: 'Loire', id: 'photo-1506905925346-21bda4d32df4' },
  { pool: 'Loire', id: 'photo-1464822759023-fed622ff2c3b' },
  { pool: 'Loire', id: 'photo-1467269204594-9661b134dd2b' },

  // ── Spain / Andalusia ─────────────────────────────────────────────────────
  { pool: 'Spain', id: 'photo-1558642084-fd07fae5282e' },
  { pool: 'Spain', id: 'photo-1543783207-ec64e4d95325' },
  { pool: 'Spain', id: 'photo-1540575467063-178a50c2df87' },
  { pool: 'Spain', id: 'photo-1516483638261-f4dbaf036963' },

  // ── Default / Travel ──────────────────────────────────────────────────────
  { pool: 'Default', id: 'photo-1469854523086-cc02fe5d8800' },
  { pool: 'Default', id: 'photo-1476514525535-07fb3b4ae5f1' },
  { pool: 'Default', id: 'photo-1488085061387-422e29b40080' },

  // ── Home page hero ────────────────────────────────────────────────────────
  { pool: 'Home', id: 'photo-1558642084-fd07fae5282e' },
]

let passed = 0
let failed = 0
const errors = []

async function check({ pool, id }) {
  const url = `https://images.unsplash.com/${id}?w=200&q=60`
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) {
      passed++
      process.stdout.write('.')
    } else {
      failed++
      errors.push({ pool, id, status: res.status })
      process.stdout.write('✗')
    }
  } catch (e) {
    failed++
    errors.push({ pool, id, error: e.message })
    process.stdout.write('E')
  }
}

console.log(`Checking ${PHOTOS.length} Unsplash photo URLs...\n`)

// Run checks sequentially to avoid hammering the CDN
for (const photo of PHOTOS) {
  await check(photo)
}

console.log(`\n\n${passed} passed, ${failed} failed`)

if (errors.length) {
  console.error('\n❌ Broken images — replace these IDs in lib/unsplash.ts:')
  for (const e of errors) {
    console.error(`  [${e.pool}] ${e.id}  →  HTTP ${e.status || e.error}`)
  }
  process.exit(1)
} else {
  console.log('✅ All images OK — safe to deploy')
}
