/**
 * Portal root layout — minimal passthrough.
 * Trip pages get their chrome (NavBar, PersonaProvider, footer) from trip/layout.tsx.
 * Admin pages get their chrome from admin/layout.tsx.
 * This wrapper exists only because Next.js requires a layout at each route group level.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
