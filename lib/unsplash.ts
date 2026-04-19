/**
 * Curated Unsplash photo pools with full attribution.
 * All photos hotlinked per Unsplash API guidelines.
 */

export interface UnsplashPhoto {
  id: string            // Full Unsplash CDN path: "photo-1585208798174-6cedd86e019a"
  url: string           // CDN URL with size params
  photographerName: string
  photographerUsername: string
  profileUrl: string
  unsplashUrl: string
}

function photo(
  hash: string,         // e.g. "photo-1585208798174-6cedd86e019a"
  name: string,
  username: string,
  w = 1600,
  h = 900,
  q = 85
): UnsplashPhoto {
  return {
    id: hash,
    url: `https://images.unsplash.com/${hash}?w=${w}&h=${h}&fit=crop&q=${q}`,
    photographerName: name,
    photographerUsername: username,
    profileUrl: `https://unsplash.com/@${username}?utm_source=joie_oukala&utm_medium=referral`,
    unsplashUrl: `https://unsplash.com/?utm_source=joie_oukala&utm_medium=referral`,
  }
}

// ─── Morocco ───────────────────────────────────────────────────────────────
export const MOROCCO_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1585208798174-6cedd86e019a', 'Calin Stan', 'calinstan'),
  photo('photo-1517821099606-cef63a9bcda6', 'Cyrus Crossan', 'cys_escapes'),
  photo('photo-1539020140153-e479b8c22e70', 'Mostafa Meraji', 'mostafa_meraji'),
  photo('photo-1553697388-94e804e2f0f6', 'Erol Ahmed', 'erol_ahmed'),
  photo('photo-1528360983277-13d401cdc186', 'Asoggetti', 'asoggetti'),
]

// ─── France (general) ──────────────────────────────────────────────────────
export const FRANCE_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1502602898657-3e91760cbb34', 'Thorsten Technoman', 'technoman'),
  photo('photo-1499856871958-5b9627545d1a', 'Pedro Lastra', 'pedro_lastra'),
  photo('photo-1509439581779-6298f75bf6e5', 'Chris Karidis', 'chriskaridis'),
]

// ─── Burgundy / Wine country ───────────────────────────────────────────────
export const BURGUNDY_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1504279577054-acfeccf8fc52', 'Kym Ellis', 'kymellis'),
  photo('photo-1596394516093-501ba68a0ba6', 'Grape Things', 'grapethings'),
  photo('photo-1504215680853-026ed2a45def', 'Roberta Sorge', 'robertasorge'),
  photo('photo-1558618666-fcd25c85cd64', 'Kelsey Knight', 'kelseyknightphoto'),
]

// ─── Loire Valley / Châteaux ───────────────────────────────────────────────
export const LOIRE_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1543946602-a0fce8117697', 'Micheile Henderson', 'micheile'),
  photo('photo-1506905925346-21bda4d32df4', 'Samuel Ferrara', 'samuelferrara'),
  photo('photo-1464822759023-fed622ff2c3b', 'Kalen Emsley', 'kalenemsley'),
  photo('photo-1467269204594-9661b134dd2b', 'James Donovan', 'jmesdo'),
]

// ─── Spain / Andalusia ─────────────────────────────────────────────────────
export const SPAIN_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1558642084-fd07fae5282e', 'Su San Lee', 'susanlee'),
  photo('photo-1543783207-ec64e4d95325', 'Rolf Neumann', 'rolf_neumann'),
  photo('photo-1540575467063-178a50c2df87', 'Nikolaj Erema', 'nikolajerema'),
  photo('photo-1516483638261-f4dbaf036963', 'Vita Vilcina', 'vitavilcina'),
]

// ─── Default / Travel ──────────────────────────────────────────────────────
export const DEFAULT_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1469854523086-cc02fe5d8800', 'Dino Reichmuth', 'dinoreichmuth'),
  photo('photo-1476514525535-07fb3b4ae5f1', 'Luca Bravo', 'lucabravo'),
  photo('photo-1488085061387-422e29b40080', 'Jakob Owens', 'jakobowens1'),
]

// ─── Region key → photo pool mapping ──────────────────────────────────────
// Keys are matched via .includes() on lowercased region string.
// Order matters — more specific keys should come first.
const POOL_MAP: Array<[string, UnsplashPhoto[]]> = [
  ['burgundy', BURGUNDY_PHOTOS],
  ['loire', LOIRE_PHOTOS],
  ['morocco', MOROCCO_PHOTOS],
  ['casablanca', MOROCCO_PHOTOS],
  ['rabat', MOROCCO_PHOTOS],
  ['fez', MOROCCO_PHOTOS],
  ['lyon', FRANCE_PHOTOS],
  ['paris', FRANCE_PHOTOS],
  ['france', FRANCE_PHOTOS],
  ['dijon', BURGUNDY_PHOTOS],
  ['beaune', BURGUNDY_PHOTOS],
  ['spain', SPAIN_PHOTOS],
  ['andalusia', SPAIN_PHOTOS],
]

export function getPhotoPool(region: string): UnsplashPhoto[] {
  const r = (region || '').toLowerCase()
  for (const [key, pool] of POOL_MAP) {
    if (r.includes(key)) return pool
  }
  return DEFAULT_PHOTOS
}

export function getPhotoForDay(
  region: string,
  dayNumber: number,
  width = 1600,
  height = 900,
  quality = 85
): UnsplashPhoto {
  const pool = getPhotoPool(region)
  const p = pool[dayNumber % pool.length]
  // id already contains the full "photo-XXXXXXXXXXXXXXXX" hash — do NOT prepend "photo-"
  return {
    ...p,
    url: `https://images.unsplash.com/${p.id}?w=${width}&h=${height}&fit=crop&q=${quality}`,
  }
}
