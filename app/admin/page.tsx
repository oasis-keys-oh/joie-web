import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/admin/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'

export default async function AdminDashboard() {
  if (!isAdminAuthenticated()) redirect('/admin/login')

  const admin = createAdminClient()
  const { data: trips } = await admin
    .from('trips')
    .select('id, title, subtitle, web_slug, start_date, end_date, created_at')
    .order('start_date', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted mb-2" style={{ letterSpacing: '0.2em' }}>Dashboard</p>
          <h1 className="font-serif text-4xl font-bold text-navy">All Trips</h1>
        </div>
        <Link
          href="/admin/intake"
          className="text-xs uppercase tracking-widest px-5 py-2.5 text-white rounded-sm hover:opacity-85 transition-opacity"
          style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
        >
          New Intake →
        </Link>
      </div>

      <div className="space-y-4">
        {(trips || []).map((trip) => (
          <div key={trip.id} className="bg-white border border-gray-100 rounded-sm px-6 py-5 flex items-center justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h2 className="font-serif font-bold text-navy text-lg leading-snug">{trip.title}</h2>
              {trip.subtitle && <p className="text-ink-muted text-sm mt-0.5">{trip.subtitle}</p>}
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-ink-muted">{trip.start_date} → {trip.end_date}</span>
                <span className="text-xs text-ink-muted font-mono">/{trip.web_slug}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={`/trip/${trip.web_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest px-4 py-2 border border-gray-200 text-ink-muted hover:border-navy hover:text-navy transition-colors rounded-sm"
                style={{ letterSpacing: '0.12em' }}
              >
                View Live →
              </a>
              <Link
                href={`/admin/trip/${trip.id}`}
                className="text-xs uppercase tracking-widest px-4 py-2 text-white transition-opacity hover:opacity-85 rounded-sm"
                style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      {(!trips || trips.length === 0) && (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-sm">No trips found in the database.</p>
        </div>
      )}
    </div>
  )
}
