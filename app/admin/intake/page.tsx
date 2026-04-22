import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/admin/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import { createIntakeAction } from './actions'

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  submitted:       { label: 'Submitted',       bg: '#FEF3C7', color: '#92400E' },
  in_review:       { label: 'In Review',        bg: '#DBEAFE', color: '#1E40AF' },
  brief_generated: { label: 'Brief Generated',  bg: '#EDE9FE', color: '#5B21B6' },
  active:          { label: 'Active',           bg: '#D1FAE5', color: '#065F46' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? { label: status, bg: '#F3F4F6', color: '#374151' }
  return (
    <span
      className="text-xs uppercase tracking-widest px-2 py-1 rounded-sm font-medium"
      style={{ background: s.bg, color: s.color, letterSpacing: '0.1em' }}
    >
      {s.label}
    </span>
  )
}

export default async function IntakeListPage() {
  if (!isAdminAuthenticated()) redirect('/admin/login')

  const admin = createAdminClient()
  const { data: records } = await admin
    .from('trip_intake')
    .select('id, status, primary_traveler_name, partner_name, destinations, start_date, end_date, tier, created_at, brief_generated_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-muted mb-2" style={{ letterSpacing: '0.2em' }}>
            Intake Pipeline
          </p>
          <h1 className="font-serif text-4xl font-bold text-navy">New Trip Orders</h1>
        </div>
        <form action={createIntakeAction}>
          <button
            type="submit"
            className="text-xs uppercase tracking-widest px-5 py-2.5 text-white rounded-sm hover:opacity-85 transition-opacity"
            style={{ background: '#C9A84C', letterSpacing: '0.12em' }}
          >
            + New Intake
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {(records || []).map((rec) => {
          const travelerLine = [rec.primary_traveler_name, rec.partner_name]
            .filter(Boolean)
            .join(' & ') || 'Unnamed traveler'

          return (
            <div
              key={rec.id}
              className="bg-white border border-gray-100 rounded-sm px-6 py-5 flex items-center justify-between gap-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-serif font-bold text-navy text-lg leading-snug">
                    {travelerLine}
                  </h2>
                  <StatusBadge status={rec.status} />
                </div>
                {rec.destinations && (
                  <p className="text-ink-muted text-sm">{rec.destinations}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  {rec.start_date && (
                    <span className="text-xs text-ink-muted">
                      {rec.start_date}{rec.end_date ? ` → ${rec.end_date}` : ''}
                    </span>
                  )}
                  {rec.tier && (
                    <span
                      className="text-xs uppercase tracking-widest px-2 py-0.5 rounded-sm"
                      style={{
                        background: rec.tier === 'bespoke' ? '#1B2B4B' : '#F3F4F6',
                        color: rec.tier === 'bespoke' ? '#C9A84C' : '#6B7280',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {rec.tier}
                    </span>
                  )}
                  <span className="text-xs text-ink-muted font-mono">
                    {new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {rec.status === 'brief_generated' && (
                  <Link
                    href={`/admin/intake/${rec.id}/brief`}
                    className="text-xs uppercase tracking-widest px-4 py-2 border rounded-sm transition-colors"
                    style={{ borderColor: '#5B21B6', color: '#5B21B6', letterSpacing: '0.12em' }}
                  >
                    View Brief →
                  </Link>
                )}
                <Link
                  href={`/admin/intake/${rec.id}`}
                  className="text-xs uppercase tracking-widest px-4 py-2 text-white rounded-sm hover:opacity-85 transition-opacity"
                  style={{ background: '#1B2B4B', letterSpacing: '0.12em' }}
                >
                  Open
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {(!records || records.length === 0) && (
        <div className="text-center py-20 text-ink-muted">
          <p className="text-sm">No intake records yet. Create one above.</p>
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/admin"
          className="text-xs uppercase tracking-widest text-ink-muted hover:text-navy transition-colors"
          style={{ letterSpacing: '0.12em' }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
