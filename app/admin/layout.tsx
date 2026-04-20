import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/app/admin/auth'
import { logoutAction } from '@/app/admin/actions'

export const metadata = { title: 'Curator — Oukala Journeys' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdminAuthenticated()
  // Let login page through unauthenticated
  return (
    <div className="min-h-screen" style={{ background: '#f5f2ed' }}>
      {authed && (
        <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-serif font-bold text-navy text-lg">Oukala</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs uppercase tracking-widest text-ink-muted" style={{ letterSpacing: '0.18em' }}>Curator</span>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-ink-muted hover:text-navy transition-colors uppercase tracking-widest" style={{ letterSpacing: '0.12em' }}>
              Sign out
            </button>
          </form>
        </header>
      )}
      {children}
    </div>
  )
}
