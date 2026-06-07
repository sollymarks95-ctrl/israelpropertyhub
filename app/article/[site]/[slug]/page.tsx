import { getNewsSite, getArticle, getLatestArticles, timeAgo } from '@/lib/news'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ArticleImage from '@/app/components/ArticleImage'
import ArticleViewTracker from '@/app/components/ArticleViewTracker'
import TrackView from '@/app/components/TrackView'
import type { Metadata } from 'next'
import NewsletterInline from '@/app/components/NewsletterInline'

const ROUTE_MAP: Record<string, string> = {
  'global-trade-wire':'news','finance-terminal':'finance','gold-markets-today':'commodities',
  'business-pulse':'magazine','trust-score':'reviews-hub','company-pedia':'wiki',
  'press-central':'pressroom','invest-data':'investdb','trade-board':'forum',
  'global-trade-assoc':'association','executive-network':'executive','market-radar':'market-radar',
}

export async function generateMetadata({ params }: { params: Promise<{ site: string; slug: string }> }): Promise<Metadata> {
  const { site: siteSlug, slug } = await params
  const site = await getNewsSite(siteSlug)
  if (!site) return {}
  const article = await getArticle(site.id, slug)
  if (!article) return {}
  const domainMap: Record<string,string> = {
    'global-trade-wire':  'https://nex-wire.com',
    'finance-terminal':   'https://finvexx.com',
    'business-pulse':     'https://bizplezx.com',
    'gold-markets-today': 'https://aurexhq.com',
    'trust-score':        'https://verivex.co',
    'invest-data':        'https://invexhuby.com',
    'market-radar':       'https://signalixx.com',
    'executive-network':  'https://execvex.com',
    'crypto-hub':         'https://cryptoxos.com',
    'global-trade-assoc': 'https://certivade.com',
  }
  const BASE = domainMap[siteSlug] || 'https://rephuby.com'
  const canonicalUrl = `${BASE}/article/${siteSlug}/${slug}`
  const isNoindex = site?.noindex ?? false
  // Extract brand mentions for keyword enrichment
  const bodyText = (article.body || '').toLowerCase()
  const clientKeywords = ['etoro'].filter(k => bodyText.includes(k))
  const allKeywords = [article.category, site.name, ...(article.tags||[]), ...clientKeywords].filter(Boolean).join(', ')
  return {
    title: `${article.title} | ${site.name}`,
    description: article.excerpt,
    keywords: (article.tags || []).join(', '),
    authors: [{ name: article.author_name || site.name }],
    robots: isNoindex ? 'noindex, nofollow' : 'index, follow',
    alternates: { canonical: canonicalUrl },
    icons: {
      icon: siteSlug === 'global-trade-wire' ? '/icon-nexwire.svg' :
            siteSlug === 'finance-terminal'  ? '/icon-finvexx.svg' :
            siteSlug === 'business-pulse'    ? '/icon-bizplezx.svg' :
            siteSlug === 'executive-network' ? '/icon-execvex.svg' :
            siteSlug === 'crypto-hub'        ? '/icon-cryptoxos.svg' :
            '/icon-rephuby.svg',
    },
    openGraph: {
      title: article.title, description: article.excerpt,
      images: article.cover_image_url ? [{ url: article.cover_image_url, width: 1200, height: 630 }] : [],
      type: 'article', publishedTime: article.published_at, url: canonicalUrl,
      siteName: site.name,
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.excerpt, images: article.cover_image_url ? [article.cover_image_url] : [] },
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
}
function formatShort(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'numeric' })
}
function readTime(body: string) {
  return Math.max(1, Math.ceil((body || '').split(' ').length / 200))
}

export default async function ArticlePage({ params }: { params: Promise<{ site: string; slug: string }> }) {
  const { site: siteSlug, slug } = await params
  const site = await getNewsSite(siteSlug)
  if (!site) notFound()

  // Detect dark theme from site template_config
  const cfg = site.template_config || {}
  const isDark = false // Always light — matches all 9 portal homepage templates
  const siteColor = cfg.primary || '#1a56db'
  const bg = '#f3f4f6'
  const bgCard = '#ffffff'
  const bgHeader = '#ffffff'
  const textPrimary = '#1a1a1a'
  const textSecondary = '#6b7280'
  const textMuted = '#9ca3af'
  const borderColor = '#e5e7eb'
  const bodyText = '#222222'
  const headingText = '#111111'
  const blockquoteBg = '#fafafa'
  const blockquoteText = '#555555'

  const PORTAL_URLS: Record<string,{name:string,url:string}> = {
    'global-trade-wire':  { name:'Nex-Wire',   url:'https://nex-wire.com' },
    'finance-terminal':   { name:'Finvexx',     url:'https://finvexx.com' },
    'business-pulse':     { name:'Bizplezx',    url:'https://bizplezx.com' },
    'gold-markets-today': { name:'AurexHQ',     url:'https://aurexhq.com' },
    'trust-score':        { name:'Verivex',     url:'https://verivex.co' },
    'company-pedia':      { name:'Bizpedia',    url:'https://rephuby.com/wiki/company-pedia' },
    'press-central':      { name:'PresxWire',   url:'https://rephuby.com/pressroom/press-central' },
    'invest-data':        { name:'InvexHuby',   url:'https://invexhuby.com' },
    'trade-board':        { name:'Tradvex',     url:'https://rephuby.com/forum/trade-board' },
    'global-trade-assoc': { name:'Certivade',   url:'https://rephuby.com/association/global-trade-assoc' },
    'executive-network':  { name:'Execvex',     url:'https://rephuby.com/executive/executive-network' },
    'market-radar':       { name:'Signalixx',   url:'https://signalixx.com' },
  }

  const [article, allArticles] = await Promise.all([
    getArticle(site.id, slug),
    getLatestArticles(site.id, 24)
  ])
  if (!article) notFound()

  // Auto cross-portal: find articles on OTHER portals that share tags or mention same brands
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const tags = article.tags || []
  const bodyLowerFull = (article.body||'').toLowerCase()

  // Find cross-portal articles — same tags OR same brand mentions
  let crossPortalArticles: any[] = []
  if (tags.length > 0 || bodyLowerFull.includes('etoro')) {
    const { data: crossData } = await sb.from('news_articles')
      .select('title, slug, news_site_id')
      .neq('news_site_id', site.id)
      .eq('status', 'published')
      .overlaps('tags', tags.length > 0 ? tags : ['eToro'])
      .limit(6)
    if (crossData && crossData.length > 0) {
      crossPortalArticles = crossData.map((a: any) => {
        const portalSlug = Object.keys(PORTAL_URLS).find(k => {
          // match by news_site_id — we'd need to look it up, use slug from tags for now
          return false
        })
        return { ...a, portalInfo: null }
      })
    }
    // Fallback: search by brand mention
    if (crossPortalArticles.length === 0 && bodyLowerFull.includes('etoro')) {
      const { data: brandData } = await sb.from('news_articles')
        .select('title, slug, news_site_id')
        .neq('news_site_id', site.id)
        .ilike('body', '%eToro%')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6)
      crossPortalArticles = brandData || []
    }
  }

  // Resolve portal info for cross-portal articles (no require() inside map!)
  const SITE_ID_MAP: Record<string,string> = {
    '4d048bde-1dcd-4891-8434-a7960ab9d3ae': 'global-trade-wire',
    '48bed332-6525-4d76-aaa5-6d10a5112d77': 'finance-terminal',
    'c0f14745-8189-444d-af09-39d7248fa319': 'business-pulse',
    '3b440202-e1c3-4f54-8a4e-65cf7e7dbfe1': 'gold-markets-today',
    '6ae7e692-bce9-489d-b835-87dcba9ffc47': 'trust-score',
    'aa04790b-9aed-4fa9-867d-3481adc828c5': 'company-pedia',
    '104ceccb-e3d0-4979-85be-b7297abb7f90': 'press-central',
    '1cd6688f-bec9-4d1b-a024-80952bf31a21': 'invest-data',
    'd020965e-d84d-4c9e-a068-d3b90f6902d0': 'trade-board',
    '1972c09e-a68e-4997-b2a8-00756ead609c': 'global-trade-assoc',
    '64a6087d-480f-4040-9df1-ad020faf5796': 'executive-network',
    '27fdf1e6-8c0c-4591-ae9b-5a2c5cacee22': 'market-radar',
  }
  const resolvedCrossPortal = crossPortalArticles.map((a: any) => {
    const portalSlug = SITE_ID_MAP[a.news_site_id]
    if (!portalSlug) return null
    const portalInfo = PORTAL_URLS[portalSlug]
    if (!portalInfo) return null
    return { title: a.title, url: `${portalInfo.url}/article/${portalSlug}/${a.slug}`, portal: portalInfo.name }
  }).filter(Boolean)

  const p = site.primary_color || '#1971C2'
  const route = ROUTE_MAP[siteSlug] || 'news'
  // On custom domains (nex-wire.com etc), use "/" for home — not the internal route path
  const hdrs = await (await import('next/headers')).headers()
  const homeUrl = hdrs.get('x-custom-domain') === 'true' ? '/' : `/${route}/${siteSlug}`
  const related = allArticles.filter((a: any) => a.slug !== slug).slice(0, 8)
  const cats = [...new Set(allArticles.map((a: any) => a.category).filter(Boolean))].slice(0, 8)
  // Normalize body: handle both real newlines and literal \n from DB
  const rawBody = (article.body || '')
    .replace(/\\n/g, '\n')   // literal \n → real newline
    .replace(/\\t/g, ' ')    // literal \t → space
    .trim()
  const paragraphs = rawBody.split(/\n\n+/).filter(b => b.trim().length > 0)
  // SEO: canonical must point to custom domain, not rephuby.com
  const DOMAIN_MAP: Record<string,string> = {
    'global-trade-wire': 'https://nex-wire.com',
    'finance-terminal':  'https://finvexx.com',
    'business-pulse':    'https://bizplezx.com',
    'gold-markets-today':'https://aurexhq.com',
    'trust-score':       'https://verivex.co',
    'invest-data':       'https://invexhuby.com',
    'market-radar':      'https://signalixx.com',
    'executive-network': 'https://execvex.com',
    'crypto-hub':        'https://cryptoxos.com',
  }
  const BASE = DOMAIN_MAP[siteSlug] || 'https://rephuby.com'
  const canonicalUrl = `${BASE}/article/${siteSlug}/${slug}`

  // Auto-detect client brand mentions — dynamic from portal_clients
  const bodyLower = rawBody.toLowerCase()
  const { data: activeClients } = await sb.from('portal_clients').select('company_name,website_url,regulation').eq('is_active', true)
  const mentionedBrands = ['etoro'].filter(b => bodyLower.includes(b))  // keep for legacy FAQ schema
  const mentionedClients = (activeClients || []).filter((cl: any) =>
    cl.company_name && bodyLower.includes(cl.company_name.toLowerCase())
  )

  // Extract inline FAQ from article body — supports Q:/A: format and itemprop format
  const extractFAQs = (html: string) => {
    const faqs: any[] = []
    // New format: <h3>Q: question</h3><p>A: answer</p>
    const qMatches = [...html.matchAll(/<h3[^>]*>Q:\s*([^<]+)<\/h3>\s*<p[^>]*>A:\s*([^<]+)<\/p>/gi)]
    qMatches.forEach(m => faqs.push({
      '@type': 'Question',
      name: m[1].trim(),
      acceptedAnswer: { '@type': 'Answer', text: m[2].trim() }
    }))
    // Legacy format: itemprop
    if (faqs.length === 0) {
      const legacyMatches = [...html.matchAll(/<h3 itemprop="name">(.*?)<\/h3>[\s\S]*?<p itemprop="text">(.*?)<\/p>/g)]
      legacyMatches.forEach(m => faqs.push({
        '@type': 'Question',
        name: m[1].replace(/<[^>]+>/g, '').trim(),
        acceptedAnswer: { '@type': 'Answer', text: m[2].replace(/<[^>]+>/g, '').trim() }
      }))
    }
    return faqs
  }
  const inlineFAQs = extractFAQs(rawBody)

  // Static eToro trust FAQs for brand articles
  const etoroFAQs = mentionedBrands.length > 0 ? [
    { '@type':'Question', name:'Is eToro regulated?', acceptedAnswer:{ '@type':'Answer', text:'Yes. eToro is regulated by the FCA (UK), CySEC (EU) and ASIC (Australia), with strict capital adequacy requirements and segregated client funds.' }},
    { '@type':'Question', name:'Is eToro safe to use?', acceptedAnswer:{ '@type':'Answer', text:'eToro is a FCA/CySEC/ASIC regulated platform. Client funds are held in segregated accounts and the company is subject to regular regulatory audits.' }},
    { '@type':'Question', name:'Is eToro a legitimate company?', acceptedAnswer:{ '@type':'Answer', text:'Yes. eToro is a legitimate social trading platform founded in 2007, regulated across multiple jurisdictions and serving over 35 million registered users.' }},
  ] : []

  const allFAQs = [...inlineFAQs, ...etoroFAQs]
  const faqSchema = allFAQs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFAQs
  } : null

  // Full JSON-LD for Google, Perplexity, ChatGPT, AI overviews
  const jsonLd: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt,
      image: article.cover_image_url ? [article.cover_image_url] : [],
      datePublished: article.published_at,
      dateModified: article.updated_at || article.published_at,
      author: { '@type': 'Person', name: article.author_name || 'Editorial Team', url: `${BASE}/author/${(article.author_name||'editorial').toLowerCase().replace(/\s+/g,'-')}` },
      publisher: {
        '@type': 'NewsMediaOrganization', name: site.name, url: BASE,
        logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` }
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      url: canonicalUrl,
      keywords: (article.tags || []).concat([article.category, site.name]).filter(Boolean).join(', '),
      articleSection: article.category,
      wordCount: rawBody.split(' ').length,
      inLanguage: 'en',
      copyrightHolder: { '@type': 'Organization', name: site.name },
      speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', 'h2', '.article-excerpt'] },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.name, item: BASE },
        { '@type': 'ListItem', position: 2, name: article.category || 'Markets', item: `${BASE}/?category=${encodeURIComponent(article.category||'Markets')}` },
        { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
      ]
    },
  ]

  // Dynamic Organization schema for any mentioned active clients
  mentionedClients.forEach((cl: any) => {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: cl.company_name,
      url: cl.website_url || undefined,
      description: cl.regulation ? `${cl.regulation} regulated financial services platform.` : `Leading financial services platform.`,
    })
  })
  // Legacy eToro schema for backwards compatibility
  if (mentionedBrands.includes('etoro') && !mentionedClients.find((c: any) => c.company_name?.toLowerCase() === 'etoro')) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'eToro',
      url: 'https://www.etoro.com',
      description: 'FCA, CySEC and ASIC regulated social trading and investment platform.',
      sameAs: ['https://www.etoro.com'],
    })
  }

  return (
    <div style={{ minHeight:'100vh', background:bg, fontFamily: false ? "'Inter',sans-serif" : '"Georgia","Times New Roman",serif', color:textPrimary }}>
      <ArticleViewTracker siteSlug={siteSlug} slug={slug} />
      <TrackView siteSlug={siteSlug} siteDomain={site?.domain || siteSlug} />
      {jsonLd.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        a:hover{color:${p}}
        .body p{margin-bottom:1.5em;line-height:1.9;font-size:18px;color:${bodyText}}
        .body h2{font-size:22px;font-weight:800;margin:2em 0 0.8em;color:${headingText};font-family:sans-serif;border-left:4px solid ${p};padding-left:12px}
        .body h3{font-size:19px;font-weight:700;margin:1.6em 0 0.6em;color:${headingText};font-family:sans-serif}
        .body blockquote{border-left:4px solid ${p};padding:14px 20px;margin:1.8em 0;background:${blockquoteBg};font-style:italic;font-size:19px;color:${blockquoteText};border-radius:0 4px 4px 0}
        .body ul,.body ol{margin:1em 0 1em 2em;line-height:1.8;font-size:17px;color:${bodyText}}
        .body li{margin-bottom:0.5em;color:${bodyText}}
        .body a{color:${p};font-weight:600;text-decoration:underline}
        @media(max-width:900px){
          .layout{grid-template-columns:1fr!important}
          .sidebar{display:none!important}
          .art-body{padding:20px 16px!important}
          .art-title{font-size:24px!important;line-height:1.25!important}
          .art-nav .nav-brand{font-size:15px!important}
        }
        @media(max-width:600px){
          .art-nav{padding:10px 14px!important}
          .art-hero{padding:20px 14px!important}
          .art-title{font-size:20px!important}
          .art-meta{flex-wrap:wrap!important;gap:6px!important;font-size:11px!important}
          .art-body{padding:16px 14px!important;font-size:15px!important;line-height:1.75!important}
          .art-body h2{font-size:18px!important}
          .art-body h3{font-size:16px!important}
          .art-faq{padding:16px!important}
          .art-tags{flex-wrap:wrap!important;gap:6px!important}
          .art-related{grid-template-columns:1fr!important}
        }
        @media(max-width:400px){
          .art-title{font-size:18px!important}
          .art-body{padding:12px 10px!important;font-size:14px!important}
        }
        @media(max-width:600px){
          .art-body{padding:16px 14px!important;font-size:15px!important;line-height:1.75!important}
          .art-body h1{font-size:22px!important;line-height:1.25!important}
          .art-body h2{font-size:18px!important}
          .art-body h3{font-size:16px!important}
          .art-hero{padding:16px 14px!important}
          .art-title{font-size:22px!important;line-height:1.25!important}
          .art-meta{flex-wrap:wrap;gap:8px!important;font-size:12px!important}
          .art-nav{padding:10px 14px!important}
          .art-nav .nav-brand{font-size:16px!important}
          .art-faq{padding:16px!important}
          .art-faq h3{font-size:15px!important}
          .art-takeaways{padding:14px!important}
          .art-tags{flex-wrap:wrap;gap:6px!important}
          .art-related{grid-template-columns:1fr!important}
        }
        @media(max-width:400px){
          .art-body{padding:12px 10px!important;font-size:14px!important}
          .art-title{font-size:19px!important}
        }
        /* ── ARTICLE MOBILE OVERRIDES (< 640px) ── */
        @media(max-width:640px){
          /* Top bar: hide on mobile */
          .art-topbar{display:none!important}
          /* Header: compact */
          .art-header-inner{padding:0 14px!important}
          .art-header-inner .art-header-h{font-size:20px!important}
          .art-header-btns .art-sub-btn{display:none!important}
          /* Nav strip: scrollable */
          .art-subnav{overflow-x:auto!important;scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important}
          .art-subnav a,.art-subnav span{font-size:11px!important;padding:0 10px!important;white-space:nowrap!important}
          /* Hero */
          .art-hero-img{height:200px!important}
          .art-title{font-size:20px!important;line-height:1.25!important;padding:0 14px!important}
          .art-meta{padding:0 14px 14px!important;flex-wrap:wrap!important;gap:6px!important;font-size:11px!important}
          /* Body */
          .body p{font-size:16px!important;line-height:1.75!important;margin-bottom:1.2em!important}
          .body h2{font-size:18px!important;margin:1.4em 0 0.6em!important}
          .body h3{font-size:16px!important;margin:1.2em 0 0.5em!important}
          .body blockquote{font-size:16px!important;padding:12px 14px!important}
          .body ul,.body ol{font-size:15px!important;margin-left:1.4em!important}
          /* Layout */
          .layout{grid-template-columns:1fr!important;gap:0!important}
          .sidebar{display:none!important}
          .art-body{padding:16px 14px!important}
          /* FAQ + takeaways */
          .art-faq{padding:14px!important;margin:12px 14px!important}
          .art-takeaways{padding:12px 14px!important;margin:12px 14px!important}
          .art-tags{padding:0 14px 16px!important;flex-wrap:wrap!important;gap:6px!important}
          .art-related{grid-template-columns:1fr!important;padding:14px!important;gap:12px!important}
        }
      `}</style>

      {/* TOP BAR */}
      <div className="art-topbar" style={{ background:'#f8fafc', color:'#64748b', padding:'5px 20px', fontSize:11, display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #e2e8f0' }}>
        <span>{formatDate(article.published_at || new Date().toISOString())}</span>
        <div style={{ display:'flex', gap:14 }}>
          <a href={`${homeUrl}`} style={{ cursor:'pointer', color:'#64748b', textDecoration:'none', fontSize:11 }}>🏠 Home</a>
          <Link href={homeUrl}><span style={{ cursor:'pointer', color:'#64748b' }}>Home</span></Link>
          <Link href={`${homeUrl}?category=Markets`}><span style={{ cursor:'pointer', color:'#64748b' }}>Markets</span></Link>
        </div>
      </div>

      {/* HEADER */}
      <header style={{ background:bgHeader, borderBottom:`4px solid ${p}`, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
        <div className="art-header-inner" style={{ maxWidth:1260, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ height:58, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <Link href={homeUrl}>
              <a href={homeUrl} style={{textDecoration:'none'}}>
                <span style={{fontFamily:"'Georgia','Times New Roman',serif",fontSize:26,fontWeight:900,letterSpacing:'-0.03em',color:textPrimary}}>
                  {site.name.includes('-')
                    ? <>{site.name.split('-')[0]}<span style={{color:p}}>-</span>{site.name.split('-').slice(1).join('-')}</>
                    : site.name.match(/[A-Z]/, site.name.slice(1))
                      ? <>{site.name.slice(0,site.name.slice(1).search(/[A-Z]/)+1)}<span style={{color:p}}>{site.name.slice(site.name.slice(1).search(/[A-Z]/)+1)}</span></>
                      : <>{site.name.slice(0,-2)}<span style={{color:p}}>{site.name.slice(-2)}</span></>
                  }
                </span>
              </a>
            </Link>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <a href={homeUrl} style={{ background:bg, borderRadius:5, padding:'6px 14px', fontSize:13, fontFamily:'sans-serif', cursor:'pointer', color:textPrimary, textDecoration:'none' }}>← Back</a>
              <Link href={homeUrl}>
                <div style={{ background:p, color:'#fff', borderRadius:5, padding:'6px 16px', fontSize:13, fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>Subscribe Free</div>
              </Link>
            </div>
          </div>
          <nav className="art-subnav" style={{ borderTop:'1px solid #f3f4f6', height:38, display:'flex', alignItems:'center', gap:0, overflowX:'auto' }}>
            <Link href={homeUrl}>
              <span style={{ padding:'0 14px', height:38, display:'flex', alignItems:'center', fontSize:13, fontWeight:800, color:p, borderBottom:`2px solid ${p}`, whiteSpace:'nowrap' }}>Home</span>
            </Link>
            {cats.map((cat: string) => (
              <Link key={cat} href={`${homeUrl}?category=${encodeURIComponent(cat)}`}>
                <span style={{ padding:'0 14px', height:38, display:'flex', alignItems:'center', fontSize:13, fontFamily:'sans-serif', color:textSecondary, whiteSpace:'nowrap' }}>{cat}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div style={{ background:bgHeader, borderBottom:`1px solid ${borderColor}`, padding:'8px 20px' }}>
        <div style={{ maxWidth:1260, margin:'0 auto', fontSize:12, fontFamily:'sans-serif', color:textMuted, display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          <Link href={homeUrl} style={{ color:p }}>Home</Link>
          <span>›</span>
          {article.category && <>
            <Link href={`${homeUrl}?category=${encodeURIComponent(article.category)}`} style={{ color:p }}>{article.category}</Link>
            <span>›</span>
          </>}
          <span style={{ color:textMuted }}>{article.title.substring(0,55)}...</span>
        </div>
      </div>

      <div style={{ maxWidth:1260, margin:'0 auto', padding:'28px 20px' }}>
        <div className="layout" style={{ display:'grid', gridTemplateColumns:'1fr 330px', gap:28 }}>

          {/* ARTICLE */}
          <main>
            {/* CATEGORY + BREAKING */}
            <div style={{ display:'flex', gap:8, marginBottom:12, fontFamily:'sans-serif', alignItems:'center' }}>
              {article.category && (
                <Link href={`${homeUrl}?category=${encodeURIComponent(article.category)}`}>
                  <span style={{ background:p, color:'#fff', padding:'3px 10px', fontSize:10, fontWeight:900, letterSpacing:'0.08em', borderRadius:3, textTransform:'uppercase' }}>{article.category}</span>
                </Link>
              )}
              {article.is_breaking && <span style={{ background:'#ef4444', color:'#fff', padding:'3px 10px', fontSize:10, fontWeight:900, borderRadius:3, letterSpacing:'0.08em' }}>BREAKING</span>}
            </div>

            {/* HEADLINE */}
            <h1 style={{ fontSize:38, fontWeight:900, lineHeight:1.15, marginBottom:14, letterSpacing:'-0.5px', fontFamily:'sans-serif', color:headingText }}>
              {article.title}
            </h1>

            {/* STANDFIRST */}
            {article.excerpt && (
              <p style={{ fontSize:20, color:textPrimary, lineHeight:1.65, marginBottom:18, fontWeight:400, borderLeft:`4px solid ${p}`, paddingLeft:14, fontStyle:'italic' }}>
                {article.excerpt}
              </p>
            )}

            {/* AUTHOR META — NO AVATAR IMAGE */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18, paddingBottom:14, borderBottom:`2px solid ${borderColor}`, fontFamily:'sans-serif', flexWrap:'wrap' }}>

              <div>
                <div style={{ fontWeight:800, fontSize:14, color:headingText }}>By {article.author_name || 'Editorial Team'}</div>
                <div style={{ fontSize:12, color:textMuted, marginTop:2 }}>
                  {site.name} · {article.published_at ? formatShort(article.published_at) : 'Today'}
                </div>
              </div>
              <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontSize:12, color:textMuted }}>⏱ {readTime(article.body)} min read</span>
                <span style={{ fontSize:12, color:textMuted }}>· {(article.body||'').split(' ').length} words</span>
              </div>
            </div>

            {/* COVER IMAGE */}
            {article.cover_image_url && (
              <figure style={{ marginBottom:26 }}>
                <ArticleImage src={article.cover_image_url} alt={article.title} style={{ width:'100%', maxHeight:480, objectFit:'cover', display:'block', borderRadius:4 }} />
                <figcaption style={{ fontSize:11, color:textMuted, marginTop:6, fontFamily:'sans-serif', fontStyle:'italic', textAlign:'center' }}>
                  {site.name} Editorial · {article.category || 'News'}
                </figcaption>
              </figure>
            )}

            {/* ARTICLE BODY */}
            <div className="body" style={{ background:bgHeader, padding:'28px 32px', borderRadius:4, marginBottom:4 }}>
              {(() => {
                // If body contains HTML tags, render as HTML (new articles from improved cron)
                const hasHTML = /<[a-z][^>]*>/i.test(rawBody)
                if (hasHTML) {
                  return <div dangerouslySetInnerHTML={{ __html: rawBody }} />
                }
                // Legacy: plain text with markdown-style headers
                return paragraphs.map((para: string, i: number) => {
                  if (para.startsWith('##') || para.startsWith('# ')) return <h2 key={i}>{para.replace(/^#{1,3}\s*/, '')}</h2>
                  if (para.startsWith('>')) return <blockquote key={i}>{para.replace(/^>\s*/, '')}</blockquote>
                  if (para.startsWith('- ') || para.startsWith('* ')) {
                    const items = para.split('\n').filter(l => l.startsWith('- ') || l.startsWith('* '))
                    return <ul key={i}>{items.map((item, j) => <li key={j}>{item.replace(/^[-*]\s*/, '')}</li>)}</ul>
                  }
                  if (para.toUpperCase() === para && para.length < 80 && para.trim().length > 3) return <h3 key={i}>{para}</h3>
                  return <p key={i}>{para.replace(/\n/g, ' ').trim()}</p>
                })
              })()}
            </div>

            {/* TAGS */}
            {article.tags && article.tags.length > 0 && (
              <div style={{ background:bgHeader, padding:'14px 32px', borderTop:'1px solid #f3f4f6', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', fontFamily:'sans-serif', borderRadius:'0 0 4px 4px' }}>
                <span style={{ fontSize:11, fontWeight:800, color:textMuted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Topics:</span>
                {article.tags.map((tag: string) => (
                  <Link key={tag} href={`${homeUrl}?q=${encodeURIComponent(tag)}`}>
                    <span style={{ fontSize:12, fontWeight:600, color:p, border:`1px solid ${p}30`, background:`${p}08`, padding:'3px 10px', borderRadius:3, cursor:'pointer' }}>{tag}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* NEWSLETTER INLINE */}
            <NewsletterInline siteId={site.id} siteName={site.name} primaryColor={p} />

            {/* AUTHOR BIO — NO AVATAR IMAGE, JUST INITIAL */}
            <div style={{ background:bgHeader, border:`2px solid ${p}20`, borderLeft:`4px solid ${p}`, borderRadius:4, padding:'20px 24px', marginTop:20, fontFamily:'sans-serif' }}>
              <div>
                  <div style={{ fontWeight:800, fontSize:15, color:headingText }}>{article.author_name || 'Editorial Team'}</div>
                  <div style={{ fontSize:11, color:p, fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>{site.name} Correspondent · {article.category || 'Markets'}</div>
                  <p style={{ fontSize:13, color:textSecondary, lineHeight:1.65 }}>
                    {article.author_name || 'The editorial team'} at {site.name} delivers expert analysis and breaking coverage across global markets, trade intelligence, and business strategy — combining deep industry expertise with rigorous reporting standards to provide actionable intelligence for business leaders worldwide.
                  </p>
              </div>
            </div>

            {/* CROSS-PORTAL COVERAGE — auto-links to other portals covering same brand/topic */}
            {resolvedCrossPortal.length > 0 && (
              <div style={{ marginTop:24, background:bgHeader, border:`1px solid ${borderColor}`, borderLeft:`4px solid ${p}`, borderRadius:4, padding:'20px 24px', fontFamily:'sans-serif' }}>
                <div style={{ fontSize:11, fontWeight:800, color:p, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>📡 Also Covered Across Our Network</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {resolvedCrossPortal.map((item: any, i: number) => (
                    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i < resolvedCrossPortal.length-1 ? '1px solid #f3f4f6' : 'none', textDecoration:'none' }}>
                      <span style={{ fontSize:13, color:headingText, fontWeight:500, lineHeight:1.4, flex:1, marginRight:12 }}>{item.title}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:p, background:`${p}12`, padding:'3px 8px', borderRadius:3, whiteSpace:'nowrap', flexShrink:0 }}>{item.portal}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* MORE ARTICLES */}
            {related.length > 0 && (
              <div style={{ marginTop:32 }}>
                <h2 style={{ fontFamily:'sans-serif', fontSize:20, fontWeight:900, marginBottom:18, paddingBottom:10, borderBottom:`3px solid ${p}` }}>
                  More from {site.name}
                </h2>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  {related.slice(0,4).map((rel: any) => (
                    <Link key={rel.slug} href={`/article/${siteSlug}/${rel.slug}`}>
                      <div style={{ background:bgHeader, borderRadius:4, overflow:'hidden', border:`1px solid ${borderColor}`, cursor:'pointer' }}>
                        {rel.cover_image_url && <img src={rel.cover_image_url} alt={rel.title} style={{ width:'100%', height:130, objectFit:'cover', display:'block' }} loading="lazy" />}
                        <div style={{ padding:12 }}>
                          {rel.category && <span style={{ fontSize:9, fontWeight:900, color:p, letterSpacing:'0.08em', fontFamily:'sans-serif', textTransform:'uppercase' }}>{rel.category}</span>}
                          <div style={{ fontSize:14, fontWeight:700, lineHeight:1.3, marginTop:4, marginBottom:5, fontFamily:'sans-serif', color:headingText }}>{rel.title}</div>
                          <div style={{ fontSize:11, color:textMuted, fontFamily:'sans-serif', display:'flex', gap:8 }}>
                            <span>By {rel.author_name || 'Editorial'}</span>
                            <span>·</span>
                            <span>{rel.read_time_minutes || 5} min</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* SIDEBAR */}
          <aside className="sidebar" style={{ position:'sticky', top:110, alignSelf:'start' }}>
            {/* NEWSLETTER */}
            <div style={{ background:`linear-gradient(135deg,${p},#1e293b)`, borderRadius:6, padding:18, marginBottom:14, color:'#fff', fontFamily:'sans-serif' }}>
              <div style={{ fontWeight:900, fontSize:16, marginBottom:6 }}>📧 Free Daily Briefing</div>
              <p style={{ fontSize:12, opacity:0.85, lineHeight:1.6, marginBottom:14 }}>Top stories from {site.name} every morning. 50,000+ subscribers.</p>
              <NewsletterInlineDark siteId={site.id} siteName={site.name} p={p} />
            </div>

            {/* LATEST */}
            <div style={{ background:bgHeader, borderRadius:6, padding:16, marginBottom:14, border:`1px solid ${borderColor}` }}>
              <div style={{ fontWeight:900, fontSize:13, textTransform:'uppercase', letterSpacing:'0.06em', paddingBottom:10, marginBottom:12, borderBottom:`3px solid ${p}`, fontFamily:'sans-serif' }}>Latest</div>
              {related.slice(0,5).map((rel: any, i: number) => (
                <Link key={i} href={`/article/${siteSlug}/${rel.slug}`}>
                  <div style={{ display:'flex', gap:10, marginBottom:12, paddingBottom:12, borderBottom:i<4?'1px solid #f3f4f6':'none', cursor:'pointer' }}>
                    {rel.cover_image_url && <img src={rel.cover_image_url} alt="" style={{ width:70, height:50, objectFit:'cover', borderRadius:3, flexShrink:0 }} loading="lazy" />}
                    <div>
                      {rel.category && <span style={{ fontSize:9, fontWeight:900, color:p, letterSpacing:'0.06em', fontFamily:'sans-serif', textTransform:'uppercase' }}>{rel.category}</span>}
                      <div style={{ fontFamily:'sans-serif', fontWeight:700, fontSize:13, lineHeight:1.3, color:headingText, marginTop:2 }}>{rel.title}</div>
                      <div style={{ fontSize:11, color:textMuted, marginTop:3, fontFamily:'sans-serif' }}>{rel.published_at ? timeAgo(rel.published_at) : ''}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* MOST READ — numbered, no avatars */}
            <div style={{ background:bgHeader, borderRadius:6, padding:16, marginBottom:14, border:`1px solid ${borderColor}` }}>
              <div style={{ fontWeight:900, fontSize:13, textTransform:'uppercase', letterSpacing:'0.06em', paddingBottom:10, marginBottom:12, borderBottom:`3px solid ${p}`, fontFamily:'sans-serif' }}>Most Read</div>
              {related.slice(0,5).map((rel: any, i: number) => (
                <Link key={i} href={`/article/${siteSlug}/${rel.slug}`}>
                  <div style={{ display:'flex', gap:10, marginBottom:12, paddingBottom:12, borderBottom:i<4?'1px solid #f3f4f6':'none', cursor:'pointer', alignItems:'flex-start' }}>
                    <span style={{ fontSize:24, fontWeight:900, color:'#374151', lineHeight:1, flexShrink:0, minWidth:28, fontFamily:'sans-serif' }}>{i+1}</span>
                    <div style={{ fontFamily:'sans-serif', fontWeight:700, fontSize:13, lineHeight:1.35, color:headingText }}>{rel.title}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* TOPICS */}
            <div style={{ background:bgHeader, borderRadius:6, padding:16, marginBottom:14, border:`1px solid ${borderColor}` }}>
              <div style={{ fontWeight:900, fontSize:13, textTransform:'uppercase', letterSpacing:'0.06em', paddingBottom:10, marginBottom:12, borderBottom:`3px solid ${p}`, fontFamily:'sans-serif' }}>Topics</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {cats.map((cat: string) => (
                  <Link key={cat} href={`${homeUrl}?category=${encodeURIComponent(cat)}`}>
                    <span style={{ fontSize:12, fontWeight:600, color:p, border:`1px solid ${p}30`, background:`${p}08`, padding:'4px 12px', borderRadius:3, fontFamily:'sans-serif', cursor:'pointer', display:'block' }}>{cat}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* SEARCH */}
            <div style={{ background:bgHeader, borderRadius:6, padding:16, border:`1px solid ${borderColor}` }}>
              <div style={{ fontWeight:900, fontSize:13, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, fontFamily:'sans-serif' }}>Search</div>
              <form action={homeUrl} method="GET" style={{ display:'flex', gap:6 }}>
                <input name="q" placeholder="Search articles..." style={{ flex:1, padding:'8px 10px', border:`1px solid ${borderColor}`, borderRadius:4, fontSize:13, fontFamily:'sans-serif', outline:'none' }} />
                <button type="submit" style={{ background:p, color:'#fff', border:'none', borderRadius:4, padding:'8px 12px', cursor:'pointer', fontFamily:'sans-serif', fontWeight:700, fontSize:13 }}>→</button>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background:'#f8fafc', color:'#64748b', padding:'40px 20px 20px', marginTop:40, fontFamily:'sans-serif' }}>
        <div style={{ maxWidth:1260, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:28, marginBottom:28 }}>
            <div>
              <Link href={homeUrl}><div style={{ fontWeight:900, fontSize:20, color:'#fff', marginBottom:10 }}>{site.name}</div></Link>
              <p style={{ fontSize:13, lineHeight:1.7, color:'#475569' }}>{site.tagline || 'Global business intelligence and market analysis.'}</p>
            </div>
            {[
              { title:'Coverage', links: cats.slice(0,5).map((c: string) => ({ label:c, href:`/${route}/${siteSlug}?category=${encodeURIComponent(c)}` })) },
              { title:'Company', links:[{label:'About Us',href:'/legal/about'},{label:'Our Team',href:'/legal/about'},{label:'Contact Us',href:'/legal/contact'},{label:'Advertise',href:'/legal/advertise'}] },
              { title:'Legal', links:[{label:'Privacy Policy',href:'/legal/privacy'},{label:'Terms of Use',href:'/legal/terms'},{label:'Risk Warning',href:'/legal/risk-warning'},{label:'Cookie Policy',href:'/legal/cookies'},{label:'Sitemap',href:'/sitemap.xml'}] }
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:700, fontSize:11, color:'#64748b', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.08em' }}>{col.title}</div>
                {col.links.map((l: any) => <Link key={l.label} href={l.href}><div style={{ fontSize:13, color:'#475569', marginBottom:8 }}>{l.label}</div></Link>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid #1e293b', paddingTop:16, fontSize:11, color:'#334155', lineHeight:1.8, marginBottom:12 }}>
            <strong style={{color:'#475569'}}>Risk Disclosure:</strong> Trading in financial instruments involves high risks. Prices may not be real-time or accurate. {site.name} does not accept liability for losses resulting from reliance on information provided. Content is for informational purposes only and does not constitute investment advice.
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #1e293b', paddingTop:14, flexWrap:'wrap', gap:8 }}>
            <span style={{ fontSize:12, color:'#334155' }}>© {new Date().getFullYear()} {site.name} · RepHuby Intelligence Ltd · All Rights Reserved</span>
            <div style={{ display:'flex', gap:14 }}>
              {[{l:'Privacy',h:'/legal/privacy'},{l:'Terms',h:'/legal/terms'},{l:'Risk Warning',h:'/legal/risk-warning'},{l:'Cookies',h:'/legal/cookies'},{l:'Sitemap',h:'/sitemap.xml'}].map(({l,h}) => (
                <Link key={l} href={h}><span style={{ fontSize:11, color:'#334155', cursor:'pointer' }}>{l}</span></Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Sidebar newsletter (dark version) — server-safe wrapper
function NewsletterInlineDark({ siteId, siteName, p }: { siteId: string; siteName: string; p: string }) {
  return <NewsletterInline siteId={siteId} siteName={siteName} primaryColor={p} dark />
}
// light theme enforced Sat Jun  6 21:22:48 UTC 2026
