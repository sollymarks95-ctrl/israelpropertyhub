import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic  = 'force-dynamic'
export const runtime  = 'nodejs'
export const revalidate = 0

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL    || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

function xe(s: string) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function url(loc: string, lastmod: string, freq: string, pri: string) {
  return `  <url>\n    <loc>${xe(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${pri}</priority>\n  </url>`
}

export async function GET(req: NextRequest) {
  const host = (req.headers.get('host') || '').replace(/^www\./, '').split(':')[0]
  const base = `https://${host}`

  const xml_header = '<?xml version="1.0" encoding="UTF-8"?>'
  const xmlns      = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'

  try {
    const supabase = db()

    // Get site — single query
    const { data: site, error: siteErr } = await supabase
      .from('news_sites')
      .select('id, slug, name, updated_at, noindex')
      .eq('domain', host)
      .single()

    if (siteErr || !site || site.noindex) {
      // Return empty valid sitemap instead of error
      const empty = `${xml_header}\n<urlset ${xmlns}></urlset>`
      return new NextResponse(empty, {
        status: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
      })
    }

    // Get articles — single query
    const { data: articles } = await supabase
      .from('news_articles')
      .select('slug, published_at, category')
      .eq('news_site_id', site.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5000)

    const entries: string[] = []

    // Homepage
    const homeLastmod = new Date(site.updated_at || Date.now()).toISOString().split('T')[0]
    entries.push(url(base, homeLastmod, 'hourly', '1.0'))

    // Category pages
    const cats = [...new Set((articles || []).map((a: any) => a.category).filter(Boolean))]
    for (const cat of cats.slice(0, 20)) {
      entries.push(url(`${base}/category/${cat.toLowerCase()}`, homeLastmod, 'daily', '0.7'))
    }

    // Articles
    for (const a of (articles || [])) {
      if (!a.slug) continue
      const lastmod = a.published_at
        ? new Date(a.published_at).toISOString().split('T')[0]
        : homeLastmod
      entries.push(url(`${base}/article/${site.slug}/${a.slug}`, lastmod, 'never', '0.8'))
    }

    const body = `${xml_header}\n<urlset ${xmlns}>\n${entries.join('\n')}\n</urlset>`

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Robots-Tag': 'noindex', // prevent sitemap file itself from being indexed
      }
    })

  } catch (err: any) {
    // Never return a 500 — always return a valid minimal sitemap
    console.error('[sitemap] error:', err?.message)
    const fallback = `${xml_header}\n<urlset ${xmlns}>\n  ${url(base, new Date().toISOString().split('T')[0], 'daily', '1.0')}\n</urlset>`
    return new NextResponse(fallback, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' }
    })
  }
}
