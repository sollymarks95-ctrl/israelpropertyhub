import { getNewsSite, getLatestArticles } from '@/lib/news'
import TrackView from '@/app/components/TrackView'
import { notFound } from 'next/navigation'
import SiteRenderer from '@/app/components/SiteRenderer'
import type { Metadata } from 'next'

const CUSTOM_DOMAINS: Record<string,string> = {
  'global-trade-wire': 'https://nex-wire.com',
  'finance-terminal':  'https://finvexx.com',
  'business-pulse':    'https://bizplezx.com',
  'gold-markets-today':'https://aurexhq.com',
  'trust-score':       'https://verivex.co',
}
const BASE = 'https://rephuby.com' // overridden per-request below

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const site = await getNewsSite(slug)
  if (!site) return {}
  const url = CUSTOM_DOMAINS[slug] || `https://rephuby.com`
  return {
    title: site.seo_title || `${site.name} — Financial Markets Forex Investment Analysis`,
    description: site.tagline || `${site.name} provides professional intelligence on financial markets forex investment analysis.`,
    keywords: `${site.name}, financial, markets, forex, investment, analysis, market analysis, intelligence`,
    robots: 'index, follow',
    icons: { icon: '/icon-finvexx.svg', shortcut: '/icon-finvexx.svg', apple: '/icon-finvexx.svg' },
    alternates: { canonical: url },
    openGraph: {
      title: site.seo_title || site.name,
      description: site.tagline,
      url, type: 'website', siteName: site.name,
      images: [{ url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200', width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: 'summary_large_image', title: site.name, description: site.tagline },
    other: { 'application-name': site.name, 'news_keywords': 'Financial Markets Forex Investment Analysis' },
  }
}

export default async function SitePage({
  params, searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ category?: string }>
}) {
  const { slug } = await params
  const sp = searchParams ? await searchParams : {}
  let site = await getNewsSite(slug)
  if (!site && slug === 'finance-terminal') {
    site = { id:'48bed332-6525-4d76-aaa5-6d10a5112d77', name:'Finvexx', slug:'finance-terminal', primary_color:'#1971C2', site_type:'finance', tagline:'Financial Markets Data & Investment Intelligence', is_live:true, seo_title:'Finvexx — Financial Markets Intelligence' } as any
  }
  if (!site) notFound()
  const articles = await getLatestArticles(site.id, 60)
  const url = CUSTOM_DOMAINS[slug] || 'https://rephuby.com'
  const p = site.primary_color || '#1a73e8'

  // JSON-LD structured data for AI agents and search engines
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: site.name,
      description: site.tagline,
      url,
      logo: { '@type': 'ImageObject', url: `${BASE}/logo.png`, width: 280, height: 60 },
      publishingPrinciples: `${BASE}/legal/about`,
      ethicsPolicy: `${BASE}/legal/terms`,
      masthead: `${BASE}/legal/about`,
      correctionsPolicy: `${BASE}/legal/contact`,
      contactPoint: { '@type': 'ContactPoint', contactType: 'editorial', email: 'editorial@rephub.com', url: `${BASE}/legal/contact` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url,
      description: site.tagline,
      inLanguage: 'en-GB',
      publisher: { '@type': 'Organization', name: 'RepHuby Intelligence Ltd', url: BASE },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${BASE}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'RepHuby Intelligence', item: BASE },
        { '@type': 'ListItem', position: 2, name: site.name, item: `${BASE}/finance/${slug}` },
      ],
    },
  ]

  return (
    <>
    <TrackView siteSlug={slug} siteDomain={'finvexx.com'} />
    
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <SiteRenderer
        articles={articles}
        site={site}
        routePrefix="finance"
        siteSlug={slug}
        primaryColor={p}
        searchParams={sp}
      />
    </>
    </>
  )
}
