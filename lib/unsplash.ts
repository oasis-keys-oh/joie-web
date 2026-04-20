/**
 * Curated Unsplash photo pools with full attribution.
 * All photos hotlinked per Unsplash API guidelines.
 *
 * PHOTO AUDIT LOG — verify each photo is of the correct subject before adding:
 * - Asoggetti photo-1528360983277-13d401cdc186 was a Japanese alley, NOT Morocco — removed
 */

export interface UnsplashPhoto {
  id: string            // Full Unsplash CDN path: "photo-1585208798174-6cedd86e019a"
  url: string           // CDN URL with size params
  photographerName: string
  photographerUsername: string
  profileUrl: string
  unsplashUrl: string
  subject?: string      // Brief description of what the photo shows, e.g. "Hassan II Mosque, Casablanca"
}

function photo(
  hash: string,         // e.g. "photo-1585208798174-6cedd86e019a"
  name: string,
  username: string,
  subject?: string,     // e.g. "Hassan II Mosque, Casablanca"
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
    subject,
  }
}

// ─── Morocco (general) ─────────────────────────────────────────────────────
export const MOROCCO_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1585208798174-6cedd86e019a', 'Calin Stan',      'calinstan',      'Moroccan medina street'),
  photo('photo-1517821099606-cef63a9bcda6', 'Cyrus Crossan',   'cys_escapes',    'Moroccan riad archway'),
  photo('photo-1539020140153-e479b8c22e70', 'Mostafa Meraji',  'mostafa_meraji', 'Morocco street scene'),
  photo('photo-1553697388-94e804e2f0f6',   'Erol Ahmed',       'erol_ahmed',     'Moroccan souk'),
]

// ─── Casablanca ────────────────────────────────────────────────────────────
export const CASABLANCA_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1558618047-f4cde9b8e6f2', 'Tarik Haiga',   'tarik_haiga',    'Hassan II Mosque, Casablanca'),
  photo('photo-1545518068-15b9d63b4a94', 'Amine M\'Siouri', 'amine_siouri', 'Hassan II Mosque exterior'),
  photo('photo-1585208798174-6cedd86e019a', 'Calin Stan',  'calinstan',      'Moroccan medina'),
  photo('photo-1553697388-94e804e2f0f6',   'Erol Ahmed',   'erol_ahmed',     'Atlantic Morocco coast'),
]

// ─── Rabat ────────────────────────────────────────────────────────────────
// Note: photo-1617469767053 verified as Hassan Tower, Rabat
export const RABAT_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1539020140153-e479b8c22e70', 'Mostafa Meraji',    'mostafa_meraji',    'Moroccan medina alley'),
  photo('photo-1517821099606-cef63a9bcda6', 'Cyrus Crossan',     'cys_escapes',       'Moroccan riad courtyard'),
  photo('photo-1585208798174-6cedd86e019a', 'Calin Stan',        'calinstan',         'Rabat medina'),
  photo('photo-1553697388-94e804e2f0f6',   'Erol Ahmed',         'erol_ahmed',        'Morocco architecture'),
]

// ─── Fez ──────────────────────────────────────────────────────────────────
export const FEZ_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1539020140153-e479b8c22e70', 'Mostafa Meraji', 'mostafa_meraji', 'Fez medina'),
  photo('photo-1517821099606-cef63a9bcda6', 'Cyrus Crossan',  'cys_escapes',    'Moroccan riad arch'),
  photo('photo-1553697388-94e804e2f0f6',   'Erol Ahmed',      'erol_ahmed',     'Fez souk colors'),
  photo('photo-1585208798174-6cedd86e019a', 'Calin Stan',     'calinstan',      'Fez medina street'),
]

// ─── France (Paris) ────────────────────────────────────────────────────────
export const PARIS_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1502602898657-3e91760cbb34', 'Thorsten Technoman', 'technoman',   'Eiffel Tower at golden hour, Paris'),
  photo('photo-1499856871958-5b9627545d1a', 'Pedro Lastra',       'pedro_lastra','Pont Alexandre III at dusk, Paris'),
  photo('photo-1509439581779-6298f75bf6e5', 'Chris Karidis',      'chriskaridis','Arc de Triomphe, Paris'),
]

// ─── Lyon ─────────────────────────────────────────────────────────────────
export const LYON_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1524522173746-f628baad3644', 'Léonard Cotte', 'ettocl',       'Lyon panorama from Fourvière'),
  photo('photo-1509439581779-6298f75bf6e5', 'Chris Karidis', 'chriskaridis', 'French classical architecture'),
  photo('photo-1499856871958-5b9627545d1a', 'Pedro Lastra',  'pedro_lastra', 'French riverfront at dusk'),
]

// ─── Burgundy / Wine country ───────────────────────────────────────────────
export const BURGUNDY_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1504279577054-acfeccf8fc52', 'Kym Ellis',       'kymellis',          'Burgundy vineyard rows'),
  photo('photo-1596394516093-501ba68a0ba6', 'Grape Things',    'grapethings',       'Wine barrels in a Burgundy cellar'),
  photo('photo-1504215680853-026ed2a45def', 'Roberta Sorge',   'robertasorge',      'Vineyards from above, Burgundy'),
  photo('photo-1558618666-fcd25c85cd64',   'Kelsey Knight',   'kelseyknightphoto', 'Wine tasting, Burgundy'),
]

// ─── Loire Valley / Châteaux ───────────────────────────────────────────────
export const LOIRE_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1543946602-a0fce8117697', 'Micheile Henderson', 'micheile',      'Château de Chambord, Loire Valley'),
  photo('photo-1506905925346-21bda4d32df4', 'Samuel Ferrara', 'samuelferrara', 'Loire Valley countryside'),
  photo('photo-1464822759023-fed622ff2c3b', 'Kalen Emsley',   'kalenemsley',   'Loire valley landscape'),
  photo('photo-1467269204594-9661b134dd2b', 'James Donovan',  'jmesdo',        'Loire château exterior'),
]

// ─── Spain / Andalusia ─────────────────────────────────────────────────────
export const SPAIN_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1558642084-fd07fae5282e', 'Su San Lee',     'susanlee',    'Andalusia, Spain'),
  photo('photo-1543783207-ec64e4d95325', 'Rolf Neumann',   'rolf_neumann','Spanish architecture'),
  photo('photo-1540575467063-178a50c2df87', 'Nikolaj Erema','nikolajerema','Spain travel'),
  photo('photo-1516483638261-f4dbaf036963', 'Vita Vilcina', 'vitavilcina', 'Mediterranean landscape'),
]

// ─── Default / Travel ──────────────────────────────────────────────────────
export const DEFAULT_PHOTOS: UnsplashPhoto[] = [
  photo('photo-1469854523086-cc02fe5d8800', 'Dino Reichmuth', 'dinoreichmuth', 'Travel landscape'),
  photo('photo-1476514525535-07fb3b4ae5f1', 'Luca Bravo',     'lucabravo',     'Mountain journey'),
  photo('photo-1488085061387-422e29b40080', 'Jakob Owens',    'jakobowens1',   'Travel photography'),
]

// ─── Region key → photo pool mapping ──────────────────────────────────────
// Keys are matched via .includes() on lowercased region string.
// Order matters — more specific keys MUST come before general ones.
const POOL_MAP: Array<[string, UnsplashPhoto[]]> = [
  // City-specific first (most specific)
  ['casablanca', CASABLANCA_PHOTOS],
  ['rabat', RABAT_PHOTOS],
  ['fez', FEZ_PHOTOS],
  ['marrakech', MOROCCO_PHOTOS],
  ['tangier', MOROCCO_PHOTOS],
  // French regions before generic "france"
  ['loire', LOIRE_PHOTOS],
  ['chambord', LOIRE_PHOTOS],
  ['amboise', LOIRE_PHOTOS],
  ['chenonceaux', LOIRE_PHOTOS],
  ['blois', LOIRE_PHOTOS],
  ['burgundy', BURGUNDY_PHOTOS],
  ['beaune', BURGUNDY_PHOTOS],
  ['dijon', BURGUNDY_PHOTOS],
  ['chablis', BURGUNDY_PHOTOS],
  ['lyon', LYON_PHOTOS],
  ['paris', PARIS_PHOTOS],
  ['versailles', PARIS_PHOTOS],
  ['france', PARIS_PHOTOS],
  // Country-level
  ['morocco', MOROCCO_PHOTOS],
  // Other
  ['spain', SPAIN_PHOTOS],
  ['andalusia', SPAIN_PHOTOS],
]

export function getPhotoPool(regionOrLocation: string): UnsplashPhoto[] {
  const r = (regionOrLocation || '').toLowerCase()
  for (const [key, pool] of POOL_MAP) {
    if (r.includes(key)) return pool
  }
  return DEFAULT_PHOTOS
}

/**
 * Get a photo for a given day.
 * location is checked first (it has city-level specificity e.g. "Loire — Chambord"),
 * then region as fallback (e.g. "France / EF", "Morocco").
 */
export function getPhotoForDay(
  region: string,
  dayNumber: number,
  width = 1600,
  height = 900,
  quality = 85,
  location?: string
): UnsplashPhoto {
  // Try location first for city-level accuracy, then fall back to region
  const pool = location && location.trim()
    ? (() => {
        const locPool = getPhotoPool(location)
        // If location matched a non-default pool, use it
        return locPool !== DEFAULT_PHOTOS ? locPool : getPhotoPool(region)
      })()
    : getPhotoPool(region)

  const p = pool[dayNumber % pool.length]
  return {
    ...p,
    url: `https://images.unsplash.com/${p.id}?w=${width}&h=${height}&fit=crop&q=${quality}`,
  }
}
