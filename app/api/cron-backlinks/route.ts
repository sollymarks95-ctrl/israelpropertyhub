import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic    = 'force-dynamic'
export const maxDuration = 300
const CORS = { 'Access-Control-Allow-Origin': '*' }

// FREE BACKLINK STRATEGY (automated daily):
// 1. Generate press releases from top articles → submit to free PR sites (DA 50-90)
// 2. Ping search engines + RSS aggregators (instant crawl signals)
// 3. Generate Web 2.0 content for syndication
// 4. Track competitor directory opportunities

// Free PR sites that give dofollow backlinks — no payment required
const FREE_PR_SITES = [
  { name: 'PRLog',            url: 'https://www.prlog.org/post-press-release.html',        da: 73 },
  { name: '24-7 Press Release', url: 'https://www.24-7pressrelease.com/submit',            da: 63 },
  { name: 'OpenPR',           url: 'https://www.openpr.com/news/submit-press-release',      da: 62 },
  { name: 'PR Fire',          url: 'https://www.prfire.co.uk/submit-press-release',         da: 52 },
  { name: 'i-Newswire',       url: 'https://www.i-newswire.com/submit-press-release',       da: 48 },
  { name: 'Free Press Release', url: 'https://www.free-press-release.com/submit',          da: 50 },
  { name: 'PR Underground',   url: 'https://prunderground.com/submit',                      da: 44 },
  { name: 'PR Zoom',          url: 'https://www.przoom.com/submit',                         da: 42 },
  { name: 'Newswire Today',   url: 'https://www.newswiretoday.com/submit',                  da: 45 },
  { name: 'SBWire',           url: 'https://www.sbwire.com/submit',                         da: 40 },
]

// Ping services — notify search engines + RSS aggregators of new content
const PING_SERVICES = [
  'https://www.google.com/ping?sitemap=',
  'https://www.bing.com/ping?sitemap=',
  'https://rpc.pingomatic.com/',
  'http://rpc.weblogs.com/RPC2',
  'https://blogsearch.google.com/ping/RPC2',
  'http://ping.feedburner.com/',
  'https://www.feedspot.com/ping/',
]

// Web 2.0 sites for content syndication (dofollow backlinks)
const WEB2_SITES = [
  { name: 'Medium',     url: 'https://medium.com/new-story',    da: 96, note: 'Publish article + link back to original' },
  { name: 'Substack',   url: 'https://substack.com',            da: 91, note: 'Create newsletter for each portal niche' },
  { name: 'Tumblr',     url: 'https://www.tumblr.com/new/text', da: 85, note: 'Post article excerpts with source links' },
  { name: 'WordPress.com', url: 'https://wordpress.com',        da: 93, note: 'Mirror site with backlinks' },
  { name: 'Blogger',    url: 'https://www.blogger.com',         da: 84, note: 'Google-owned = fast indexing' },
  { name: 'LinkedIn Articles', url: 'https://www.linkedin.com/post/new', da: 99, note: 'Publish as thought leadership' },
  { name: 'Reddit Finance', url: 'https://www.reddit.com/r/investing', da: 96, note: 'Share relevant articles' },
  { name: 'StockTwits', url: 'https://stocktwits.com',          da: 83, note: 'Share market articles' },
  { name: 'Seeking Alpha', url: 'https://seekingalpha.com/editor', da: 88, note: 'Submit as contributor' },
  { name: 'Quora',      url: 'https://www.quora.com',           da: 93, note: 'Answer finance questions + cite articles' },
]

// Google search operators to find competitor directories (run manually once a week)
const COMPETITOR_SEARCHES = [
  'site:investing.com -investing.com finance news directory',
  'finance news site inurl:submit OR inurl:add-url',
  'forex trading site inurl:directory OR inurl:listing',
  'cryptocurrency news inurl:business-directory',
  'financial markets site inurl:resources OR inurl:links',
  '"nex-wire.com" OR "finvexx.com" inurl:directory',
  'financial news blog directory submit free',
  'forex broker review site inurl:directory',
]

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function pingSearchEngines(sitemapUrl: string): Promise<string[]> {
  const results: string[] = []
  for (const ping of PING_SERVICES) {
    try {
      const url = ping.includes('sitemap=') ? `${ping}${encodeURIComponent(sitemapUrl)}` : ping
      const r = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) })
      results.push(`${new URL(ping).hostname}: ${r.status}`)
    } catch {
      results.push(`${new URL(ping).hostname}: timeout`)
    }
  }
  return results
}

async function generatePressRelease(article: any, site: any, domain: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const prompt = `Write a professional press release for a financial news publication.

Publication: ${site.name} (${domain})
Article Title: ${article.title}
Article URL: https://${domain}/article/${site.slug}/${article.slug}
Date: ${today}

Write a 300-word press release in standard AP format:
- Headline (newsworthy, includes main keyword)
- Dateline: ${today}
- Lead paragraph (answers who, what, when, where, why)
- 2 body paragraphs with key insights
- Quote from "${site.name} Editorial Team"
- Boilerplate about ${site.name} (2 sentences)
- Contact info: contact@${domain}
- Source URL: https://${domain}/article/${site.slug}/${article.slug}

Return ONLY the press release text, no JSON.`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey||'', 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
    signal: AbortSignal.timeout(30000),
  })
  const d = await r.json()
  return d?.content?.[0]?.text || ''
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })

  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  const report: any = { date: today, pings: [], press_releases: [], opportunities: [] }

  // Get all indexed sites
  const { data: sites } = await db
    .from('news_sites')
    .select('id, slug, name, tagline, domain')
    .eq('is_active', true).eq('is_live', true).eq('noindex', false)

  for (const site of (sites || [])) {
    const domain = site.domain

    // STEP 1: Ping search engines + RSS aggregators
    const sitemapUrl = `https://${domain}/sitemap.xml`
    const pingResults = await pingSearchEngines(sitemapUrl)
    report.pings.push({ site: site.name, sitemap: sitemapUrl, results: pingResults })

    // STEP 2: Generate press release from today's top article
    const { data: topArticle } = await db
      .from('news_articles')
      .select('id, title, slug, excerpt, body')
      .eq('news_site_id', site.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (topArticle) {
      const pr = await generatePressRelease(topArticle, site, domain)

      // Save press release to DB for manual submission
      await db.from('news_articles').insert({
        news_site_id:    site.id,
        title:           `PRESS RELEASE: ${topArticle.title}`,
        slug:            `press-release-${topArticle.slug}-${today}`,
        excerpt:         `Official press release from ${site.name}. ${topArticle.excerpt}`,
        body:            `<pre>${pr}</pre><p><strong>Submit to:</strong></p><ul>${FREE_PR_SITES.map(s => `<li><a href="${s.url}" target="_blank">${s.name} (DA ${s.da})</a></li>`).join('')}</ul>`,
        category:        'Press Release',
        tags:            ['press-release', 'backlinks', site.slug],
        status:          'draft', // kept as draft — human submits manually
        article_type:    'news',
        author_name:     `${site.name} Editorial`,
        published_at:    new Date().toISOString(),
        read_time_minutes: 2,
        source_question: 'press-release-backlink',
        ai_generated:    true,
      }).single()

      report.press_releases.push({
        site: site.name,
        article: topArticle.title,
        pr_length: pr.length,
        submit_to: FREE_PR_SITES.map(s => `${s.name} DA${s.da}`),
      })
    }

    await new Promise(r => setTimeout(r, 500))
  }

  // STEP 3: Return competitor search opportunities
  report.opportunities = {
    competitor_searches: COMPETITOR_SEARCHES,
    web2_sites: WEB2_SITES.map(s => ({ name: s.name, da: s.da, action: s.note, url: s.url })),
    free_pr_sites: FREE_PR_SITES,
    instruction: 'Run competitor searches weekly. Submit press releases to all PR sites above. Create Web 2.0 profiles for each portal.',
  }

  return NextResponse.json(report, { headers: CORS })
}
