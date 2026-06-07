import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic    = 'force-dynamic'
export const maxDuration = 300
const CORS = { 'Access-Control-Allow-Origin': '*' }

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── LAYER 0: Google Sitemap Ping ──────────────────────────────────────────
// Directly notifies Google of new sitemap content — fastest free Google signal
async function pingGoogle(domain: string): Promise<any> {
  const sitemapUrl = encodeURIComponent(`https://${domain}/sitemap.xml`)
  const results: any[] = []
  const endpoints = [
    `https://www.google.com/ping?sitemap=https://${domain}/sitemap.xml`,
    `https://www.bing.com/ping?sitemap=https://${domain}/sitemap.xml`,
  ]
  for (const url of endpoints) {
    try {
      const r = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) })
      results.push({ engine: new URL(url).hostname, status: r.status })
    } catch (e: any) {
      results.push({ engine: new URL(url).hostname, error: e.message })
    }
  }
  return results
}

// ─── LAYER 1: IndexNow — instant notification to 5 search engines ───────────
// Free, no account needed per domain, notifies Bing + Yandex + Naver + others
async function submitIndexNow(domain: string, urls: string[]): Promise<any> {
  const key = process.env.INDEX_NOW_KEY || ''
  try {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: domain, key, keyLocation: `https://${domain}/${key}.txt`, urlList: urls.slice(0, 10000) }),
      signal: AbortSignal.timeout(10000),
    })
    return { status: r.status, engine: 'IndexNow (Bing+Yandex+Naver+Seznam)' }
  } catch (e: any) {
    return { status: 0, error: e.message }
  }
}

// ─── LAYER 2: Mass RSS ping — 20 aggregators simultaneously ─────────────────
const RSS_PINGS = [
  'https://rpc.pingomatic.com/',         // pings 25 services at once
  'https://ping.feedburner.com/',
  'https://www.feedspot.com/ping/',
  'https://api.feedity.com/ping',
  'http://blogsearch.google.com/ping/RPC2',
  'https://www.bloglines.com/ping',
  'https://ping.blogs.yandex.ru/RPC2',
  'https://ping.blo.gs/',
  'https://rpc.technorati.com/rpc/ping',
  'https://ping.twingly.com/',           // Nordic search engine
  'https://ping.moreover.com/RPC2',
  'https://api.my.yahoo.com/rss/ping',
  'https://newsgator.com/Opml/Subscriptions.aspx',
  'https://ping.feedburner.com/v1',
  'https://services.newsgator.com/ngws/xmlrpcping.aspx',
]

async function massRSSPing(sitemapUrl: string, feedUrl: string): Promise<number> {
  let ok = 0
  const xmlPayload = `<?xml version="1.0"?><methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>${feedUrl}</value></param><param><value>${sitemapUrl}</value></param></params></methodCall>`

  await Promise.allSettled(
    RSS_PINGS.map(async ping => {
      try {
        await fetch(ping, {
          method: 'POST',
          headers: { 'Content-Type': 'text/xml' },
          body: xmlPayload,
          signal: AbortSignal.timeout(5000),
        })
        ok++
      } catch {}
    })
  )
  return ok
}

// ─── LAYER 3: Dev.to API — DA 85 dofollow canonical backlinks ────────────────
// Each article published to dev.to has canonical URL → your portal (real dofollow backlink)
async function publishToDevTo(article: any, site: any, domain: string, apiKey: string): Promise<any> {
  if (!apiKey) return { skipped: true, reason: 'No DEV_TO_API_KEY set' }

  const excerpt = (article.excerpt || '').slice(0, 200)
  const bodyMd  = htmlToMarkdown(article.body || '')
  const canonical = `https://${domain}/article/${site.slug}/${article.slug}`

  const payload = {
    article: {
      title:          article.title,
      published:      true,
      body_markdown:  `> *Originally published at [${site.name}](${canonical})*\n\n${bodyMd.slice(0, 3000)}\n\n---\n*Read the full article at [${site.name}](${canonical})*`,
      tags:           (article.tags || []).slice(0, 4).map((t: string) => t.replace(/\s+/g, '').toLowerCase()),
      canonical_url:  canonical,
      description:    excerpt,
      series:         site.name,
    }
  }

  try {
    const r = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    })
    const d = await r.json()
    return { status: r.status, url: d.url, canonical, da: 85 }
  } catch (e: any) {
    return { status: 0, error: e.message }
  }
}

// ─── LAYER 4: Hashnode API — DA 78 dofollow canonical backlinks ───────────────
async function publishToHashnode(article: any, site: any, domain: string, token: string, publicationId: string): Promise<any> {
  if (!token || !publicationId) return { skipped: true, reason: 'No HASHNODE_TOKEN or HASHNODE_PUBLICATION_ID' }

  const canonical = `https://${domain}/article/${site.slug}/${article.slug}`
  const bodyMd    = htmlToMarkdown(article.body || '')

  const mutation = `mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post { url title }
    }
  }`

  const variables = {
    input: {
      title:          article.title,
      subtitle:       (article.excerpt || '').slice(0, 150),
      publicationId,
      contentMarkdown: `> Originally published at [${site.name}](${canonical})\n\n${bodyMd.slice(0, 4000)}\n\n---\n*Full article: [${site.name}](${canonical})*`,
      originalArticleURL: canonical,
      tags: [],
    }
  }

  try {
    const r = await fetch('https://gql.hashnode.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ query: mutation, variables }),
      signal: AbortSignal.timeout(15000),
    })
    const d = await r.json()
    return { status: r.status, url: d?.data?.publishPost?.post?.url, canonical, da: 78 }
  } catch (e: any) {
    return { status: 0, error: e.message }
  }
}

// ─── LAYER 5: Medium API — DA 96 canonical backlinks ─────────────────────────
async function publishToMedium(article: any, site: any, domain: string, token: string, userId: string): Promise<any> {
  if (!token || !userId) return { skipped: true, reason: 'No MEDIUM_TOKEN or MEDIUM_USER_ID' }

  const canonical  = `https://${domain}/article/${site.slug}/${article.slug}`
  const bodyHtml   = (article.body || '').slice(0, 8000)

  try {
    const r = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title:         article.title,
        contentFormat: 'html',
        content:       `<h1>${article.title}</h1><p><em>Originally published at <a href="${canonical}">${site.name}</a></em></p>${bodyHtml}<p>—<br><a href="${canonical}">Read the full article on ${site.name}</a></p>`,
        canonicalUrl:  canonical,
        publishStatus: 'public',
        tags:          (article.tags || []).slice(0, 5),
      }),
      signal: AbortSignal.timeout(15000),
    })
    const d = await r.json()
    return { status: r.status, url: d?.data?.url, canonical, da: 96 }
  } catch (e: any) {
    return { status: 0, error: e.message }
  }
}

// ─── Helper: minimal HTML → Markdown ─────────────────────────────────────────
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })

  const db  = getDb()
  const today    = new Date().toISOString().split('T')[0]
  const report: any = { date: today, sites: [] }

  // Load API keys from system_api_keys
  const { data: keys } = await db.from('system_api_keys').select('key_name,key_value').eq('is_active', true)
  const km: Record<string,string> = Object.fromEntries((keys||[]).map((k:any) => [k.key_name, k.key_value]))

  const devToKey         = km.DEV_TO_API_KEY        || process.env.DEV_TO_API_KEY        || ''
  const hashnodeToken    = km.HASHNODE_TOKEN         || process.env.HASHNODE_TOKEN         || ''
  const hashnodePubId    = km.HASHNODE_PUBLICATION_ID || process.env.HASHNODE_PUBLICATION_ID || ''
  const mediumToken      = km.MEDIUM_TOKEN           || process.env.MEDIUM_TOKEN           || ''
  const mediumUserId     = km.MEDIUM_USER_ID         || process.env.MEDIUM_USER_ID         || ''

  const { data: sites } = await db
    .from('news_sites').select('id,slug,name,tagline,domain')
    .eq('is_active',true).eq('is_live',true).eq('noindex',false)

  for (const site of (sites || [])) {
    const domain = site.domain
    const siteReport: any = { site: site.name, domain, layers: {} }

    // Get today's top 10 articles for IndexNow + yesterday's top article for Web2
    const { data: todayArts } = await db.from('news_articles')
      .select('id,slug,title,body,excerpt,tags,category')
      .eq('news_site_id', site.id).eq('status','published')
      .gte('published_at', `${today}T00:00:00Z`)
      .order('published_at',{ascending:false}).limit(10)

    const { data: topArt } = await db.from('news_articles')
      .select('id,slug,title,body,excerpt,tags,category')
      .eq('news_site_id', site.id).eq('status','published')
      // Pick article not already syndicated today
      .not('tags','cs','{"syndicated"}')
      .order('published_at',{ascending:false}).limit(1).single()

    // LAYER 0: Google + Bing Sitemap Ping
    siteReport.layers.google_ping = await pingGoogle(domain)

    // LAYER 1: IndexNow
    if (todayArts?.length) {
      const urls = todayArts.map(a => `https://${domain}/article/${site.slug}/${a.slug}`)
      siteReport.layers.indexnow = await submitIndexNow(domain, urls)
    }

    // LAYER 2: RSS Pings
    const pingsOk = await massRSSPing(`https://${domain}/sitemap.xml`, `https://${domain}/feed.xml`)
    siteReport.layers.rss_pings = { services_pinged: pingsOk, out_of: RSS_PINGS.length }

    // LAYER 3: Dev.to (if API key set)
    if (topArt && devToKey) {
      siteReport.layers.devto = await publishToDevTo(topArt, site, domain, devToKey)
    } else {
      siteReport.layers.devto = { skipped: true, setup_url: 'https://dev.to/settings/extensions → API Keys', da: 85 }
    }

    // LAYER 4: Hashnode (if token set)
    if (topArt && hashnodeToken && hashnodePubId) {
      siteReport.layers.hashnode = await publishToHashnode(topArt, site, domain, hashnodeToken, hashnodePubId)
    } else {
      siteReport.layers.hashnode = { skipped: true, setup_url: 'https://hashnode.com/settings/developer → Generate Token', da: 78 }
    }

    // LAYER 5: Medium (if token set)
    if (topArt && mediumToken && mediumUserId) {
      siteReport.layers.medium = await publishToMedium(topArt, site, domain, mediumToken, mediumUserId)
    } else {
      siteReport.layers.medium = { skipped: true, setup_url: 'https://medium.com/me/settings → Integration tokens', da: 96 }
    }

    // Mark article as syndicated
    if (topArt) {
      const currentTags = topArt.tags || []
      if (!currentTags.includes('syndicated')) {
        await db.from('news_articles').update({ tags: [...currentTags, 'syndicated'] }).eq('id', topArt.id)
      }
    }

    report.sites.push(siteReport)
    await new Promise(r => setTimeout(r, 500))
  }

  // Summary
  report.summary = {
    total_sites: report.sites.length,
    indexnow_submitted: report.sites.filter((s:any) => s.layers.indexnow?.status === 200).length,
    rss_pings_total: report.sites.reduce((n:number,s:any) => n + (s.layers.rss_pings?.services_pinged||0), 0),
    devto_published: report.sites.filter((s:any) => s.layers.devto?.status === 201).length,
    hashnode_published: report.sites.filter((s:any) => s.layers.hashnode?.status === 200).length,
    medium_published: report.sites.filter((s:any) => s.layers.medium?.status === 201).length,
    setup_needed: [
      !devToKey && 'DEV_TO_API_KEY (free at dev.to) — DA 85 backlinks',
      !hashnodeToken && 'HASHNODE_TOKEN + HASHNODE_PUBLICATION_ID (free) — DA 78 backlinks',
      !mediumToken && 'MEDIUM_TOKEN + MEDIUM_USER_ID (free) — DA 96 backlinks',
    ].filter(Boolean),
  }

  return NextResponse.json(report, { headers: CORS })
}
