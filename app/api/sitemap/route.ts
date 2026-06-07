export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const revalidate = 1800 // 30 min cache

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

const DOMAIN_MAP: Record<string, { slug: string; base: string; name: string }> = {
  'nex-wire.com':  { slug:'global-trade-wire',  base:'https://nex-wire.com',  name:'Nex-Wire Intelligence' },
  'finvexx.com':   { slug:'finance-terminal',   base:'https://finvexx.com',   name:'Finvexx Markets' },
  'bizplezx.com':  { slug:'business-pulse',     base:'https://bizplezx.com',  name:'Bizplezx Executive' },
  'aurexhq.com':   { slug:'gold-markets-today', base:'https://aurexhq.com',   name:'AurexHQ' },
  'verivex.co':    { slug:'trust-score',        base:'https://verivex.co',    name:'Verivex Trust' },
  'bizpedia.com':  { slug:'company-pedia',      base:'https://bizpedia.com',  name:'Bizpedia' },
  'presxwire.com': { slug:'press-central',      base:'https://presxwire.com', name:'PresxWire' },
  'invexhub.com':  { slug:'invest-data',        base:'https://invexhub.com',  name:'InvexHub' },
  'tradvex.com':   { slug:'trade-board',        base:'https://tradvex.com',   name:'Tradvex' },
  'certivade.com': { slug:'global-trade-assoc', base:'https://certivade.com', name:'Certivade' },
  'execvex.com':   { slug:'executive-network',  base:'https://execvex.com',   name:'Execvex' },
  'signalix.com':  { slug:'market-radar',       base:'https://signalix.com',  name:'Signalix' },
}

const CLIENT_SLUGS = ['etoro']

function xe(s: string) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function urlEntry(loc: string, lastmod: string, priority: string, freq: string) {
  return `  <url>\n    <loc>${xe(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

function newsEntry(loc: string, title: string, pubDate: string, pubName: string, category: string) {
  // Google News sitemap format — gets articles indexed within minutes
  const d = new Date(pubDate)
  const iso = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
  return `  <url>
    <loc>${xe(loc)}</loc>
    <lastmod>${iso.split('T')[0]}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>${xe(pubName)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${iso}</news:publication_date>
      <news:title>${xe(title)}</news:title>
      <news:keywords>${xe(category)}, finance, markets</news:keywords>
    </news:news>
  </url>`
}

export async function GET(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', { headers: { 'Content-Type': 'application/xml' } })
  }
  // Host can come from header (direct access) or query param (middleware rewrite)
  const rawHost = req.nextUrl.searchParams.get('host') || req.headers.get('x-forwarded-host') || req.headers.get('host') || ''
  const host = rawHost.replace(/:\d+$/,'').replace(/^www\./,'')
  const cfg = DOMAIN_MAP[host]
  const today = new Date().toISOString().split('T')[0]

  let urls: string[] = []

  if (cfg) {
    const { base, slug: siteSlug, name: siteName } = cfg

    // Get site from DB
    const { data: site } = await getDb().from('news_sites').select('id').eq('slug', siteSlug).single()

    // 1. HOMEPAGE
    urls.push(urlEntry(`${base}/`, today, '1.0', 'daily'))

    // 2. FAQ PAGES — SEO/AI only, not in nav
    for (const c of CLIENT_SLUGS) {
      urls.push(urlEntry(`${base}/faq/${c}`, today, '0.9', 'weekly'))
    }

    // 3. VERIVEX: review pages per company (verivex.co/reviews/[slug])
    if (siteSlug === 'trust-score') {
      const REVIEW_COMPANIES = ['etoro','ic-markets','pepperstone','xm','ftmo','binance','coinbase','interactive-brokers','plus500','myforexfunds']
      for (const cs of REVIEW_COMPANIES) {
        urls.push(urlEntry(`${base}/reviews/${cs}`, today, '0.8', 'daily'))
      }
    }

    // 3. SEARCH PAGE
    urls.push(urlEntry(`${base}/search`, today, '0.5', 'monthly'))

    if (site) {
      // 4. ALL ARTICLES — with Google News extension for fast indexing
      const { data: articles } = await getDb()
        .from('news_articles')
        .select('slug, title, published_at, category, tags')
        .eq('news_site_id', site.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5000)

      const allCategories = new Set<string>()

      for (const a of articles || []) {
        const articleUrl = `${base}/article/${siteSlug}/${a.slug}`
        // Use Google News format for recent articles (last 2 days), standard for older
        const pubDate = new Date(a.published_at || today)
        const isRecent = (Date.now() - pubDate.getTime()) < 48 * 60 * 60 * 1000

        if (isRecent) {
          urls.push(newsEntry(articleUrl, a.title || '', a.published_at, siteName, a.category || 'Markets'))
        } else {
          urls.push(urlEntry(articleUrl, (a.published_at||today).split('T')[0], '0.8', 'never'))
        }

        if (a.category) allCategories.add(a.category)
        ;(a.tags || []).forEach((t: string) => { /* tags used for cross-linking */ })
      }

      // 5. CATEGORY PAGES — one URL per unique category
      for (const cat of allCategories) {
        urls.push(urlEntry(`${base}/?category=${encodeURIComponent(cat)}`, today, '0.6', 'daily'))
      }

      // 6. CLIENT BRAND ARTICLE PAGES — specifically articles mentioning the client
      // (already included in step 4, but boosted separately for signal)
      const { data: brandArticles } = await getDb()
        .from('news_articles')
        .select('slug, published_at')
        .eq('news_site_id', site.id)
        .eq('status', 'published')
        .ilike('body', '%etoro%')
        .order('published_at', { ascending: false })
        .limit(100)

      // These are already in step 4 — no duplicate, just confirms they exist
      console.log(`${siteSlug}: ${brandArticles?.length || 0} eToro articles indexed`)
    }

  } else {
    // rephuby.com — internal infrastructure, nothing to index
    // Return empty sitemap
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  })
}
