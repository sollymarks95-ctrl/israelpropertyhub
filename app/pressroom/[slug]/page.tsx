import { getNewsSite, getLatestArticles } from '@/lib/news'
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
const BASE = 'https://rephuby.com'
function siteBase(slug: string) { return CUSTOM_DOMAINS[slug] || BASE }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const site = await getNewsSite(slug)
  if (!site) return {}
  const canonicalBase = CUSTOM_DOMAINS[slug] || BASE
  const url = canonicalBase
  const seoTitle = site.seo_title || `${site.name} — ${site.tagline || 'Intelligence & Analysis'}`
  const seoDesc = site.tagline || `${site.name} delivers real-time intelligence, analysis and market data.`
  const seoKw = `${site.name}, finance, markets, intelligence, analysis, ${slug.replace(/-/g,' ')}`
  return {
    title: seoTitle,
    description: seoDesc,
    keywords: seoKw,
    robots: 'index, follow',
    alternates: { canonical: url },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url, type: 'website', siteName: site.name,
      images: [{ url: site.logo_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200', width: 1200, height: 630, alt: site.name }],
      locale: 'en_GB',
    },
    twitter: { card: 'summary_large_image', title: seoTitle, description: seoDesc },
    other: {
      'application-name': site.name,
      'theme-color': site.primary_color || '#dc2626',
      'news_keywords': site.tagline || 'Finance Intelligence Markets',
    },
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
  const site = await getNewsSite(slug)
  if (!site) notFound()
  const articles = await getLatestArticles(site.id, 60)
  const p = site.primary_color || '#dc2626'

  // JSON-LD structured data for AI agents and search engines
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: site.name,
      description: site.tagline,
      url: siteBase(slug),
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
      url: siteBase(slug),
      description: site.tagline,
      inLanguage: 'en-GB',
      publisher: { '@type': 'Organization', name: 'RepHuby Intelligence Ltd', url: BASE },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${siteBase(slug)}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'RepHuby Intelligence', item: BASE },
        { '@type': 'ListItem', position: 2, name: site.name, item: `${BASE}/pressroom/${slug}` },
      ],
    },
  ]

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <SiteRenderer
        articles={articles}
        site={site}
        routePrefix="pressroom"
        siteSlug={slug}
        primaryColor={p}
        searchParams={sp}
      />
    </>
  )
}
