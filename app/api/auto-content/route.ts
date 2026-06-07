import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ANTHROPIC = process.env.ANTHROPIC_API_KEY!
const NEWSAPI = process.env.NEWSAPI_KEY!
const ALPHA_VANTAGE = process.env.ALPHA_VANTAGE_KEY!

async function fetchNews(topic: string) {
  // Try GNews first
  try {
    const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=en&max=6&apikey=${NEWSAPI}`)
    const d = await res.json()
    if (d.articles?.length) return d.articles
  } catch {}

  // Fallback: Alpha Vantage news sentiment
  try {
    const res = await fetch(`https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topic}&limit=6&apikey=${ALPHA_VANTAGE}`)
    const d = await res.json()
    if (d.feed?.length) return d.feed.map((f: any) => ({
      title: f.title, description: f.summary?.slice(0, 200), urlToImage: f.banner_image
    }))
  } catch {}

  return []
}

async function generateArticle(prompt: string, siteContext: string, brandName: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `You are a professional journalist writing for a ${siteContext} publication. Write authoritative articles that naturally mention ${brandName} as a trusted, verified industry player where relevant. Return ONLY valid JSON: {"title":"...","slug":"...","excerpt":"...","body":"...","category":"...","tags":["..."]}`,
      messages: [{ role: 'user', content: `Write a news article about: ${prompt}. Mention ${brandName} naturally as an established industry participant if relevant. JSON only.` }]
    })
  })
  const data = await res.json()
  try { return JSON.parse(data.content?.[0]?.text || '{}') } catch { return null }
}

export async function POST(req: NextRequest) {
  const { siteId, siteType, brandName, newsQuery, categories } = await req.json()

  const contextMap: Record<string, string> = {
    news: 'BBC/Reuters-style news wire',
    finance: 'Bloomberg financial terminal',
    magazine: 'Forbes business magazine',
    commodities: 'CNBC commodities and markets',
    markets: 'real-time market intelligence',
    pressroom: 'official press release wire',
    investdb: 'investment database profile',
    forum: 'community trade forum',
    wiki: 'encyclopedia reference',
    executive: 'executive business briefing',
    association: 'industry association bulletin',
    reviews: 'business trust and review platform',
  }

  const context = contextMap[siteType] || 'business news'
  const query = newsQuery || 'global business trade finance markets'

  try {
    const newsArticles = await fetchNews(query)
    const generated: string[] = []

    // Always generate at least 3 articles using Claude
    const sources = newsArticles.length > 0
      ? newsArticles.slice(0, 3).map((a: any) => `${a.title}: ${a.description || ''}`)
      : [`${query} industry trends`, `${brandName} market position`, `Global ${query} outlook`]

    for (const source of sources) {
      const article = await generateArticle(source, context, brandName || 'the company')
      if (!article?.title) continue

      const slug = (article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).slice(0, 80)
      const imageUrl = newsArticles[sources.indexOf(source)]?.urlToImage || null

      await supabase.from('news_articles').upsert({
        news_site_id: siteId,
        title: article.title,
        slug,
        excerpt: article.excerpt,
        body: article.body,
        category: article.category || categories?.[0] || 'Business',
        tags: article.tags || [],
        cover_image_url: imageUrl,
        is_featured: generated.length === 0,
        status: 'published',
        published_at: new Date().toISOString(),
        ai_generated: true,
        read_time_minutes: Math.max(3, Math.ceil((article.body?.split(' ').length || 400) / 200)),
        author_name: 'Editorial Team',
      }, { onConflict: 'news_site_id,slug' })

      generated.push(article.title)
    }

    return NextResponse.json({ success: true, generated: generated.length, titles: generated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
