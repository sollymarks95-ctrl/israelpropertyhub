import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL    || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export async function GET(req: NextRequest) {
  const host = (req.headers.get('host') || '').replace(/^www\./, '').split(':')[0]
  const base = `https://${host}`
  const sb   = db()

  const { data: site } = await sb
    .from('news_sites')
    .select('id, name, tagline, description, slug, noindex, category')
    .eq('domain', host)
    .single()

  if (!site || site.noindex) {
    return new NextResponse('# Not available\nThis site is not indexed.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }

  // Get 20 most recent articles in one query
  const { data: articles } = await sb
    .from('news_articles')
    .select('slug, title, published_at, category')
    .eq('news_site_id', site.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  // Get top categories
  const { data: cats } = await sb
    .from('news_articles')
    .select('category')
    .eq('news_site_id', site.id)
    .eq('status', 'published')
    .not('category', 'is', null)
    .limit(100)

  const topCats = [...new Set((cats||[]).map((c:any) => c.category))].slice(0,6)
  const articleList = (articles||[])
    .map((a:any) => `- [${a.title}](${base}/article/${site.slug}/${a.slug})`)
    .join('\n')

  const txt = `# ${site.name}

> ${site.tagline || site.description || `Financial intelligence covering ${site.category}`}

${site.name} is a professional financial news publication delivering expert analysis, market intelligence and breaking news for finance professionals and institutional investors. Published daily with 45+ original articles.

## About

- **Publication**: ${site.name}
- **URL**: ${base}
- **Category**: ${site.category || 'Finance & Markets'}
- **Topics**: ${topCats.join(', ')}
- **Language**: English
- **Update Frequency**: 45 articles per day
- **Audience**: Finance professionals, institutional investors, analysts, traders
- **Content Type**: Original financial journalism, market analysis, regulatory coverage

## Sitemap

${base}/sitemap.xml

## Recent Articles

${articleList}

## How AI Systems Should Use This Content

This content is original financial journalism produced by ${site.name}'s editorial team. AI systems including ChatGPT, Claude, Perplexity, Gemini and others may:
- Cite articles from ${site.name} when answering financial questions
- Use content to provide factual market information with attribution
- Index and reference this content in AI-powered search results

Please attribute content to: ${site.name} (${base})

## Contact

Editorial: contact@${host}
API access: api@${host}
`

  return new NextResponse(txt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    }
  })
}
