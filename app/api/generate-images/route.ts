import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 300

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

const IMG_PROMPTS: Record<string, string> = {
  'Trade': 'global shipping port cargo containers cranes maritime industrial',
  'Markets': 'financial trading floor screens stock market charts Wall Street',
  'Finance': 'modern glass bank skyscraper financial district golden hour',
  'Gold': 'gold bullion bars coins polished surface luxury financial',
  'Silver': 'silver precious metals bars coins metallic studio photography',
  'Commodities': 'oil barrels wheat fields copper pipes industrial commodity',
  'Forex': 'currency exchange foreign money notes coins forex trading screens',
  'Strategy': 'executive boardroom meeting modern glass office city skyline',
  'Leadership': 'confident business executive CEO modern corporate headquarters',
  'ESG': 'sustainable green wind turbines solar panels renewable energy',
  'Research': 'data analysis financial charts monitors tech research office',
  'Analysis': 'financial analyst trading screens charts dramatic lighting',
  'Signals': 'candlestick price charts technical analysis trading screens',
  'Industry': 'industrial manufacturing modern facility technical operations',
  'Standards': 'professional certification compliance documents official setting',
  'Technology': 'AI technology servers data center visualization futuristic',
  'Private Equity': 'investment meeting venture capital luxury boardroom documents',
  'Compliance': 'legal compliance lawyer documents professional office',
  'Discussion': 'business professionals strategic discussion conference table',
  'Press Release': 'corporate press conference podium professional media event',
  'Default': 'global business finance modern city skyline financial district dusk',
}

const STYLE = "Professional editorial news photograph, photorealistic, cinematic lighting, high quality, no text, no watermarks, no logos, dramatic composition"

async function generateImage(title: string, category: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  const catPrompt = IMG_PROMPTS[category] || IMG_PROMPTS['Default']
  const prompt = `${STYLE}: ${catPrompt}. ${title.substring(0, 100)}`

  const models = [
    ['gpt-image-1', { quality: 'high', output_format: 'url' }],
    ['dall-e-3', { quality: 'hd', response_format: 'url' }]
  ] as [string, Record<string, string>][]

  for (const [model, extra] of models) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, prompt, n: 1, size: '1024x1024', ...extra }),
        signal: AbortSignal.timeout(50000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const url = data?.data?.[0]?.url
      if (url) return url
      const b64 = data?.data?.[0]?.b64_json
      if (b64) {
        const buf = Buffer.from(b64, 'base64')
        const fname = `ai-${Date.now()}.png`
        const { error } = await getDb().storage.from('article-images').upload(fname, buf, { contentType: 'image/png' })
        if (!error) {
          const { data: ud } = getDb().storage.from('article-images').getPublicUrl(fname)
          return ud.publicUrl
        }
      }
    } catch { continue }
  }
  return null
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  const action = req.nextUrl.searchParams.get('action') || 'status'

  if (action === 'run' && token === 'rephuby-img-2025') {
    const { data: articles } = await getDb()
      .from('news_articles').select('id, title, category, cover_image_url')
      .ilike('cover_image_url', '%unsplash%').eq('status', 'published').limit(5)

    if (!articles?.length) return NextResponse.json({ status: 'complete — all articles have AI images' })

    const results = []
    for (const art of articles) {
      const url = await generateImage(art.title, art.category || 'Default')
      if (url) {
        await getDb().from('news_articles').update({ cover_image_url: url }).eq('id', art.id)
        results.push({ ok: true, title: art.title.slice(0, 45) })
      } else {
        results.push({ ok: false, title: art.title.slice(0, 45) })
      }
    }
    const { count } = await getDb().from('news_articles').select('*', { count: 'exact', head: true }).ilike('cover_image_url', '%unsplash%')
    return NextResponse.json({ processed: results.length, succeeded: results.filter(r => r.ok).length, remaining: count, results })
  }

  const { count: need } = await getDb().from('news_articles').select('*', { count: 'exact', head: true }).ilike('cover_image_url', '%unsplash%')
  const { count: total } = await getDb().from('news_articles').select('*', { count: 'exact', head: true })
  return NextResponse.json({ total, need_ai_images: need, done: (total || 0) - (need || 0) })
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET || process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { data: articles } = await getDb()
    .from('news_articles').select('id, title, category')
    .ilike('cover_image_url', '%unsplash%').eq('status', 'published').limit(body.limit || 5)

  if (!articles?.length) return NextResponse.json({ message: 'All done', updated: 0 })

  const results = []
  for (const art of articles) {
    const url = await generateImage(art.title, art.category || 'Default')
    if (url) { await getDb().from('news_articles').update({ cover_image_url: url }).eq('id', art.id); results.push({ ok: true }) }
    else results.push({ ok: false })
  }
  return NextResponse.json({ processed: results.length, succeeded: results.filter(r => r.ok).length, results })
}
