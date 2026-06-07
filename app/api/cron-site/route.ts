import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

// Real estate categories per portal niche
const PORTAL_TOPICS: Record<string, string[]> = {
  'israel-property-iq': [
    'Israel real estate market update', 'Tel Aviv property prices', 'Jerusalem housing market',
    'Israel mortgage rates', 'property tax in Israel', 'Israel construction starts',
    'foreign buyers Israel property', 'Israel real estate investment', 'rental yields Israel',
    'Israel housing shortage'
  ],
  'israel-luxury-homes': [
    'luxury penthouse Tel Aviv', 'Herzliya Pituah villas', 'luxury apartments Jerusalem',
    'Israel prime property', 'Neve Tzedek luxury homes', 'Caesarea luxury real estate',
    'Rothschild Boulevard apartments', 'Israel ultra luxury market', 'luxury property investment Israel',
    'Israeli celebrity homes'
  ],
  'israel-prop-invest': [
    'Israel property investment ROI', 'rental yield Tel Aviv', 'buy-to-let Israel',
    'Israel real estate fund', 'property returns Israel 2026', 'Israel REIT market',
    'commercial property Israel', 'Israel property taxes for foreigners', 'exit tax Israel property',
    'best neighborhoods to invest Israel'
  ],
  'tel-aviv-property': [
    'Tel Aviv property prices 2026', 'Gush Dan real estate', 'Tel Aviv neighborhood guide',
    'Florentin property market', 'Jaffa real estate', 'Ramat Aviv apartments',
    'Tel Aviv new construction', 'Old North Tel Aviv', 'south Tel Aviv gentrification',
    'Tel Aviv beachfront property'
  ],
  'israel-estate-iq': [
    'Israel new development launch', 'off-plan property Israel', 'Israeli developer news',
    'tama 38 projects', 'urban renewal Israel', 'new residential towers Israel',
    'Israel green building', 'smart homes Israel', 'construction costs Israel',
    'Israel planning committee decisions'
  ],
  'prop-vexx': [
    'how to buy property in Israel as foreigner', 'Israel property purchase process',
    'Israeli real estate lawyer', 'purchase tax Israel foreigners', 'American Jews buying Israel property',
    'French buyers Israel apartments', 'mortgage for non-residents Israel',
    'Israel property escrow', 'best cities buy property Israel', 'Israel immigration real estate'
  ],
}

const CATEGORIES = ['Market News', 'Investment', 'Neighborhoods', 'Luxury', 'New Developments', 'Buyers Guide', 'Legal & Tax', 'Market Data']

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const siteSlug = searchParams.get('site')
  const batch = parseInt(searchParams.get('batch') || '0')

  // Get site(s)
  const query = supabase.from('news_sites').select('*').eq('is_live', true)
  if (siteSlug) query.eq('slug', siteSlug)
  const { data: sites } = await query

  if (!sites?.length) return NextResponse.json({ error: 'No sites found' })

  const results = []

  for (const site of sites) {
    const topics = PORTAL_TOPICS[site.slug] || PORTAL_TOPICS['israel-property-iq']
    const batchTopics = topics.slice(batch * 3, batch * 3 + 3)

    for (const topic of batchTopics) {
      try {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          messages: [{
            role: 'user',
            content: `Write a professional real estate news article for "${site.name}" about: ${topic}

Portal focus: ${site.tagline}
Category: ${category}
Target audience: English-speaking foreign buyers and investors interested in Israeli real estate

Format as JSON:
{
  "title": "compelling headline (60-70 chars)",
  "excerpt": "2-sentence summary for SEO (150 chars)",
  "content": "full article in markdown (600-800 words). Include specific data points, neighborhoods, prices in USD and ILS. Professional tone.",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "author": "expert name like 'David Cohen, Property Analyst' or 'Sarah Levy, Real Estate Correspondent'"
}

Return ONLY valid JSON, no markdown backticks.`
          }]
        })

        const text = response.content[0].type === 'text' ? response.content[0].text : ''
        const clean = text.replace(/```json|```/g, '').trim()
        const article = JSON.parse(clean)

        const datePrefix = new Date().toISOString().split('T')[0]
        const slug = `${datePrefix}-${slugify(article.title)}`

        const { error } = await supabase.from('news_articles').upsert({
          news_site_id: site.id,
          title: article.title,
          slug,
          content: article.content,
          excerpt: article.excerpt,
          category,
          tags: article.tags,
          author: article.author,
          status: 'published',
          published_at: new Date().toISOString(),
        }, { onConflict: 'news_site_id,slug' })

        if (!error) results.push({ site: site.name, title: article.title })
      } catch (e: unknown) {
        results.push({ site: site.name, error: String(e) })
      }
    }
  }

  return NextResponse.json({ success: true, published: results.length, results })
}
