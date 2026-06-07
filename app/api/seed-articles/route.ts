import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ANTHROPIC = process.env.ANTHROPIC_API_KEY!

async function generateBatch(
  siteId: string, siteName: string, siteType: string,
  categories: string[], topic: string, daysAgo: number, count: number
) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: `You are a professional journalist for ${siteName}, a ${siteType} publication. 
Generate ${count} unique, high-quality news articles. Each must be different topic.
Return ONLY valid JSON array: [{"title":"...","slug":"url-safe-unique-slug","excerpt":"2 sentence summary","body":"full article 400-600 words with \\n\\n between paragraphs","category":"${categories[0]}","tags":["tag1","tag2","tag3"],"read_time_minutes":4}]
No markdown, no backticks, just the JSON array.`,
      messages: [{
        role: 'user',
        content: `Write ${count} diverse articles about ${topic}. Each must cover a DIFFERENT angle, company, or subtopic. Mix categories: ${categories.join(', ')}. Make them feel like real published news from ${daysAgo} days ago. JSON array only.`
      }]
    })
  })
  const data = await res.json()
  const text = data.content?.[0]?.text || '[]'
  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch { return [] }
}

const SITE_TOPICS: Record<string, { topic: string; type: string }> = {
  news: { topic: 'global trade, business news, market developments, international commerce', type: 'BBC/Reuters news wire' },
  finance: { topic: 'financial markets, gold prices, forex, stocks, monetary policy, central banks', type: 'Bloomberg financial terminal' },
  commodities: { topic: 'gold, silver, oil, commodities, precious metals, energy markets', type: 'CNBC commodities portal' },
  magazine: { topic: 'business strategy, executive leadership, corporate innovation, market analysis', type: 'Forbes business magazine' },
  reviews: { topic: 'business trust, verified companies, trade reviews, B2B partnerships', type: 'Trustpilot review platform' },
  wiki: { topic: 'company profiles, industry knowledge, trade regulations, business encyclopedia', type: 'Wikipedia-style business encyclopedia' },
  pressroom: { topic: 'corporate announcements, press releases, regulatory filings, business news', type: 'PR Newswire press room' },
  investdb: { topic: 'investment intelligence, company funding, market valuations, investor analysis', type: 'Crunchbase investment database' },
  forum: { topic: 'trade discussions, market debates, business community Q&A, industry trends', type: 'Reddit-style trade community' },
  association: { topic: 'industry standards, certification news, trade compliance, member updates', type: 'Official trade association' },
  executive: { topic: 'executive profiles, leadership insights, career development, C-suite strategy', type: 'LinkedIn executive network' },
  markets: { topic: 'market signals, trading intelligence, commodity analysis, forex movements', type: 'Dark trading intelligence dashboard' },
}

export async function POST(req: NextRequest) {
  const { siteId, siteType, siteName, categories, targetCount = 15, daysBack = 14 } = await req.json()
  const config = SITE_TOPICS[siteType] || SITE_TOPICS.news
  const batchSize = 5
  const batches = Math.ceil(targetCount / batchSize)
  let totalInserted = 0
  const errors: string[] = []

  for (let b = 0; b < batches; b++) {
    const daysAgo = Math.floor((b / batches) * daysBack) + 1
    const count = Math.min(batchSize, targetCount - b * batchSize)

    try {
      const articles = await generateBatch(siteId, siteName, config.type, categories, config.topic, daysAgo, count)

      for (const article of articles) {
        if (!article.title || !article.slug) continue
        const slug = article.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80)
        const pubDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 6 * 60 * 60 * 1000)

        const images = [
          'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
          'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800',
          'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800',
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800',
          'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
          'https://images.unsplash.com/photo-1610375461369-d613b564f4c4?w=800',
          'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        ]
        const coverImage = images[Math.floor(Math.random() * images.length)]

        const { error } = await supabase.from('news_articles').upsert({
          news_site_id: siteId,
          title: article.title,
          slug,
          excerpt: article.excerpt,
          body: article.body,
          category: article.category || categories[0] || 'Business',
          tags: article.tags || [],
          cover_image_url: coverImage,
          is_featured: totalInserted === 0 && b === 0,
          is_breaking: Math.random() > 0.85,
          status: 'published',
          published_at: pubDate.toISOString(),
          ai_generated: true,
          read_time_minutes: article.read_time_minutes || 4,
          author_name: ['Editorial Team', 'Markets Desk', 'Analysis Desk', 'Research Team', 'Correspondent'][Math.floor(Math.random() * 5)],
        }, { onConflict: 'news_site_id,slug' })

        if (!error) totalInserted++
      }
    } catch (e: any) {
      errors.push(`Batch ${b}: ${e.message}`)
    }

    // Small delay between batches
    await new Promise(r => setTimeout(r, 500))
  }

  return NextResponse.json({ success: true, inserted: totalInserted, errors })
}
