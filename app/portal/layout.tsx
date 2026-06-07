import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Client Portal | RepHuby Intelligence', robots: 'noindex, nofollow' }
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
