import { getSiteBySlug } from '@/lib/site'
import { notFound } from 'next/navigation'

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const site = await getSiteBySlug(slug)
  if (!site) notFound()

  return (
    <>
      <style>{`
        :root {
          --site-primary: ${site.primary_color || '#2563eb'};
          --site-secondary: ${site.secondary_color || '#1e40af'};
        }
      `}</style>
      {children}
    </>
  )
}
