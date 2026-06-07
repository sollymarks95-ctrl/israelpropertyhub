import Sidebar from '@/components/Sidebar'

// Force all dashboard pages to be server-rendered at request time,
// never statically prerendered at build time.
export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
