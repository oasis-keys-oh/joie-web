import { redirect, notFound } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/admin/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import IntakeCuratorForm from '@/components/admin/IntakeCuratorForm'

interface Props {
  params: { id: string }
}

export default async function IntakeCuratorPage({ params }: Props) {
  if (!isAdminAuthenticated()) redirect('/admin/login')

  const admin = createAdminClient()
  const { data: record, error } = await admin
    .from('trip_intake')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !record) notFound()

  return (
    <div>
      <div className="border-b border-gray-200 bg-white px-6 py-2 flex items-center gap-4 text-xs text-ink-muted">
        <Link href="/admin" className="hover:text-navy transition-colors uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>
          Dashboard
        </Link>
        <span className="text-gray-300">›</span>
        <Link href="/admin/intake" className="hover:text-navy transition-colors uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>
          Intake
        </Link>
        <span className="text-gray-300">›</span>
        <span className="text-ink uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>
          {record.primary_traveler_name ?? params.id.slice(0, 8)}
        </span>
        {record.status === 'brief_generated' && (
          <>
            <span className="flex-1" />
            <Link
              href={`/admin/intake/${params.id}/brief`}
              className="px-3 py-1 rounded-sm text-white hover:opacity-85 transition-opacity uppercase tracking-widest"
              style={{ background: '#5B21B6', letterSpacing: '0.1em' }}
            >
              View Generated Brief →
            </Link>
          </>
        )}
      </div>
      <IntakeCuratorForm record={record} />
    </div>
  )
}
