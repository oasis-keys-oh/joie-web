import { loginAction } from '@/app/admin/actions'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> | { error?: string } }) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f2ed' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-ink-muted mb-3" style={{ letterSpacing: '0.22em' }}>
            Oukala Journeys
          </p>
          <h1 className="font-serif text-3xl font-bold text-navy">Curator Access</h1>
        </div>

        <form action={loginAction} className="bg-white rounded-sm border border-gray-100 px-8 py-8 shadow-sm">
          {params.error && (
            <p className="text-red-600 text-sm mb-5 text-center">{params.error}</p>
          )}
          <label className="block mb-6">
            <span className="text-xs uppercase tracking-widest text-ink-muted block mb-2" style={{ letterSpacing: '0.16em' }}>
              Password
            </span>
            <input
              type="password"
              name="password"
              autoFocus
              required
              className="w-full border border-gray-200 rounded-sm px-4 py-3 text-navy text-sm focus:outline-none focus:border-gold"
              style={{ background: '#faf8f4' }}
            />
          </label>
          <button
            type="submit"
            className="w-full py-3 text-white text-xs uppercase tracking-widest font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#1B2B4B', letterSpacing: '0.18em', borderRadius: '2px' }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  )
}
