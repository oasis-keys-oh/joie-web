import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/admin/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import AdminTripEditor from '@/components/admin/AdminTripEditor'

interface Props {
  params: { id: string }
  searchParams: { tab?: string }
}

export default async function AdminTripPage({ params, searchParams }: Props) {
  if (!isAdminAuthenticated()) redirect('/admin/login')

  const admin = createAdminClient()
  const tripId = params.id
  const activeTab = searchParams.tab || 'days'

  const [
    { data: trip },
    { data: days },
    { data: events },
    { data: contacts },
    { data: hotels },
    { data: challenges },
    { data: packing },
    { data: recs },
    { data: feedback },
  ] = await Promise.all([
    admin.from('trips').select('*').eq('id', tripId).single(),
    admin.from('trip_days').select('*').eq('trip_id', tripId).order('day_number'),
    admin.from('events').select('*').eq('trip_id', tripId).order('day_id'),
    admin.from('local_contacts').select('*').eq('trip_id', tripId).order('destination'),
    admin.from('reference_items').select('*').eq('trip_id', tripId).eq('type', 'hotel').order('check_in'),
    admin.from('hunt_challenges').select('*').eq('trip_id', tripId).order('day_number'),
    admin.from('packing_items').select('*').eq('trip_id', tripId).order('category'),
    admin.from('recommendations').select('*').eq('trip_id', tripId).order('type'),
    admin.from('feedback').select('*').eq('trip_id', tripId).order('created_at', { ascending: false }),
  ])

  if (!trip) redirect('/admin')

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-xs text-ink-muted hover:text-navy uppercase tracking-widest" style={{ letterSpacing: '0.14em' }}>
          ← All Trips
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs text-navy uppercase tracking-widest font-semibold" style={{ letterSpacing: '0.14em' }}>
          {trip.title}
        </span>
        <a
          href={`/trip/${trip.web_slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-gold hover:opacity-75 transition-opacity"
        >
          View live →
        </a>
      </div>

      <AdminTripEditor
        trip={trip}
        days={days || []}
        events={events || []}
        contacts={contacts || []}
        hotels={hotels || []}
        challenges={challenges || []}
        packing={packing || []}
        recs={recs || []}
        feedback={feedback || []}
        activeTab={activeTab}
      />
    </div>
  )
}
