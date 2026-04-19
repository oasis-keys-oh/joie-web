// Server component — fetches Open-Meteo forecast for the day's city/date
// No API key needed. Free, GDPR-compliant.

import { TripDay } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface WeatherWidgetProps {
  day: TripDay
}

// Known city coordinates for the itinerary
const CITY_COORDS: Record<string, { lat: number; lon: number; label: string }> = {
  casablanca:   { lat: 33.5731, lon: -7.5898,  label: 'Casablanca' },
  rabat:        { lat: 33.9716, lon: -6.8498,  label: 'Rabat' },
  fez:          { lat: 34.0181, lon: -5.0078,  label: 'Fez' },
  marrakech:    { lat: 31.6295, lon: -7.9811,  label: 'Marrakech' },
  lyon:         { lat: 45.7640, lon: 4.8357,   label: 'Lyon' },
  dijon:        { lat: 47.3220, lon: 5.0415,   label: 'Dijon' },
  beaune:       { lat: 47.0231, lon: 4.8400,   label: 'Beaune' },
  amboise:      { lat: 47.4133, lon: 0.9828,   label: 'Amboise' },
  blois:        { lat: 47.5861, lon: 1.3359,   label: 'Blois' },
  chambord:     { lat: 47.6161, lon: 1.5168,   label: 'Chambord' },
  chenonceaux:  { lat: 47.3250, lon: 1.0700,   label: 'Chenonceaux' },
  paris:        { lat: 48.8566, lon: 2.3522,   label: 'Paris' },
  versailles:   { lat: 48.8014, lon: 2.1301,   label: 'Versailles' },
  noizay:       { lat: 47.4367, lon: 0.8986,   label: 'Noizay' },
  chablis:      { lat: 47.8152, lon: 3.7984,   label: 'Chablis' },
  burgundy:     { lat: 47.0550, lon: 4.8550,   label: 'Burgundy' },
  loire:        { lat: 47.4133, lon: 0.9828,   label: 'Loire Valley' },
}

function getCoords(day: TripDay) {
  const raw = (day.location || day.region || '').toLowerCase()
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (raw.includes(key)) return coords
  }
  return null
}

// WMO weather interpretation codes → label + emoji
function interpretWeather(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: 'Clear sky', emoji: '☀️' }
  if (code <= 2)  return { label: 'Partly cloudy', emoji: '⛅' }
  if (code === 3) return { label: 'Overcast', emoji: '☁️' }
  if (code <= 49) return { label: 'Foggy', emoji: '🌫️' }
  if (code <= 59) return { label: 'Drizzle', emoji: '🌦️' }
  if (code <= 69) return { label: 'Rain', emoji: '🌧️' }
  if (code <= 79) return { label: 'Snow', emoji: '❄️' }
  if (code <= 84) return { label: 'Rain showers', emoji: '🌦️' }
  if (code <= 94) return { label: 'Thunderstorm', emoji: '⛈️' }
  return { label: 'Stormy', emoji: '🌩️' }
}

async function fetchWeather(lat: number, lon: number, date: string) {
  try {
    // Open-Meteo historical forecast — works for future dates within 16-day window
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto&start_date=${date}&end_date=${date}&wind_speed_unit=mph&temperature_unit=fahrenheit`
    const res = await fetch(url, { next: { revalidate: 3600 } }) // cache 1 hr
    if (!res.ok) return null
    const data = await res.json()
    if (!data.daily?.temperature_2m_max?.[0]) return null
    return {
      maxF: Math.round(data.daily.temperature_2m_max[0]),
      minF: Math.round(data.daily.temperature_2m_min[0]),
      maxC: Math.round((data.daily.temperature_2m_max[0] - 32) * 5 / 9),
      minC: Math.round((data.daily.temperature_2m_min[0] - 32) * 5 / 9),
      code: data.daily.weathercode[0],
      precipitation: data.daily.precipitation_sum[0],
    }
  } catch {
    return null
  }
}

export default async function WeatherWidget({ day }: WeatherWidgetProps) {
  const coords = getCoords(day)
  if (!coords || !day.date) return null

  // Open-Meteo only provides 16-day forecast. For past/far-future dates, gracefully skip.
  const dateObj = new Date(day.date)
  const now = new Date()
  const diffDays = Math.abs((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays > 16) {
    // Show climate normals for Morocco/France in June instead
    return <WeatherClimatePlaceholder day={day} coords={coords} />
  }

  const weather = await fetchWeather(coords.lat, coords.lon, day.date)
  if (!weather) return null

  const { label, emoji } = interpretWeather(weather.code)

  return (
    <div
      className="rounded-sm px-4 py-4"
      style={{ background: 'rgba(27,43,75,0.04)', border: '1px solid rgba(27,43,75,0.07)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span style={{ fontSize: '1.3rem' }}>{emoji}</span>
        <div>
          <p className="text-navy font-semibold" style={{ fontSize: '0.73rem' }}>{label}</p>
          <p className="text-ink-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>
            {coords.label} · {formatDate(day.date)}
          </p>
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <p className="font-serif text-navy font-bold" style={{ fontSize: '1.4rem' }}>
          {weather.maxF}°F
        </p>
        <p className="text-ink-muted" style={{ fontSize: '0.72rem' }}>
          / {weather.minF}°F
        </p>
        <p className="text-ink-muted ml-auto" style={{ fontSize: '0.68rem' }}>
          {weather.maxC}°C / {weather.minC}°C
        </p>
      </div>
      {weather.precipitation > 0 && (
        <p className="text-ink-muted mt-1" style={{ fontSize: '0.65rem' }}>
          💧 {weather.precipitation.toFixed(1)} mm expected
        </p>
      )}
    </div>
  )
}

// Climate-average placeholder for dates beyond the 16-day window
function WeatherClimatePlaceholder({ day, coords }: { day: TripDay; coords: { label: string } }) {
  // June climate normals for Morocco vs France
  const isMorocco = (day.region || '').toLowerCase().includes('morocco') ||
    ['casablanca', 'rabat', 'fez'].some(c => (day.location || '').toLowerCase().includes(c))

  const climate = isMorocco
    ? { maxF: 81, minF: 64, maxC: 27, minC: 18, desc: 'Warm & sunny', emoji: '☀️', note: 'June Rabat UV index: 9–10 (very high)' }
    : { maxF: 77, minF: 57, maxC: 25, minC: 14, desc: 'Warm with possible showers', emoji: '⛅', note: 'Loire/Burgundy June: occasional Atlantic rain' }

  return (
    <div
      className="rounded-sm px-4 py-4"
      style={{ background: 'rgba(27,43,75,0.04)', border: '1px solid rgba(27,43,75,0.07)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span style={{ fontSize: '1.3rem' }}>{climate.emoji}</span>
        <div>
          <p className="text-navy font-semibold" style={{ fontSize: '0.73rem' }}>{climate.desc}</p>
          <p className="text-ink-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>
            {coords.label} · June typical
          </p>
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <p className="font-serif text-navy font-bold" style={{ fontSize: '1.4rem' }}>
          {climate.maxF}°F
        </p>
        <p className="text-ink-muted" style={{ fontSize: '0.72rem' }}>
          / {climate.minF}°F
        </p>
        <p className="text-ink-muted ml-auto" style={{ fontSize: '0.68rem' }}>
          {climate.maxC}°C / {climate.minC}°C
        </p>
      </div>
      <p className="text-ink-muted mt-1.5" style={{ fontSize: '0.62rem', lineHeight: '1.5' }}>
        {climate.note}
      </p>
    </div>
  )
}
