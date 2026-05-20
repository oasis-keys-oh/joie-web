import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/(portal)/admin/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'
import AdminTripEditor from '@/components/admin/AdminTripEditor'
import QRShareModal from '@/components/admin/QRShareModal'

interface Props {
  params: { id: string }
  searchParams: { tab?: string }
}

export default async function AdminTripPage({ params, searchParams }: Props) {
  if (!await isAdminAuthenticated()) redirect('/admin/login')

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
    { data: drops },
    { data: feedback },
    { data: rwl },
    { data: haggle },
    { data: facts },
  ] = await Promise.all([
    admin.from('trips').select('*').eq('id', tripId).single(),
    admin.from('trip_days').select('*').eq('trip_id', tripId).order('day_number'),
    admin.from('events').select('*').eq('trip_id', tripId).order('day_id'),
    admin.from('local_contacts').select('*').eq('trip_id', tripId).order('destination'),
    admin.from('reference_items').select('*').eq('trip_id', tripId).eq('type', 'hotel').order('check_in'),
    admin.from('hunt_challenges').select('*').eq('trip_id', tripId).order('day_number'),
    admin.from('packing_items').select('*').eq('trip_id', tripId).order('category'),
    admin.from('recommendations').select('*').eq('trip_id', tripId).order('sort_order'),
    admin.from('pre_trip_content').select('*').eq('trip_id', tripId).order('date_offset_days'),
    admin.from('feedback').select('*').eq('trip_id', tripId).order('created_at', { ascending: false }),
    admin.from('read_watch_listen').select('*').eq('trip_id', tripId).order('display_order'),
    admin.from('joie_haggle_triggers').select('*').eq('trip_id', tripId).order('location_name'),
    admin.from('journey_facts').select('*').eq('trip_id', tripId).order('sort_order'),
  ])

  if (!trip) redirect('/admin')

  // Query travelers — tables may not exist yet if migration hasn't run
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let travelers: any[] = []
  try {
    const { data: linkRows } = await admin
      .from('trip_travelers')
      .select('traveler_id')
      .eq('trip_id', tripId)
    if (linkRows && linkRows.length > 0) {
      const ids = linkRows.map((r) => r.traveler_id)
      const { data: profiles } = await admin
        .from('traveler_profiles')
        .select('*')
        .in('id', ids)
        .order('full_name')
      travelers = profiles || []
    }
  } catch {
    // traveler_profiles table not yet created — migration pending
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <Link href="/admin" className="text-xs text-ink-muted hover:text-navy uppercase tracking-widest" style={{ letterSpacing: '0.14em' }}>
          ← All Trips
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-xs text-navy uppercase tracking-widest font-semibold" style={{ letterSpacing: '0.14em' }}>
          {trip.title}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <QRShareModal
            tripSlug={trip.web_slug}
            tripTitle={trip.title}
            webPassword={trip.web_password}
          />
          <a
            href={`/trip/${trip.web_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gold hover:opacity-75 transition-opacity"
          >
            View live →
          </a>
        </div>
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
        drops={drops || []}
        feedback={feedback || []}
        travelers={travelers}
        rwl={rwl || []}
        haggle={haggle || []}
        facts={facts || []}
        activeTab={activeTab}
      />
    </div>
  )
}
