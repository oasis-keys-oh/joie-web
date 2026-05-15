/**
 * Marketing layout — pass-through only.
 * Marketing pages (landing, intake, success, cancel) own
 * their own nav, footer, fonts, and dark-mode CSS.
 * No Joie portal chrome is injected here.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
