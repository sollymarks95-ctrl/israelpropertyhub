import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: 'index, follow',
  openGraph: { type: 'website', siteName: 'Verivex Trust Intelligence' },
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
