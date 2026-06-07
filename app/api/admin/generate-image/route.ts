import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 300

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

function buildPrompt(title: string, category: string): string {
  const styles: Record<string, string> = {
    Markets:     'professional trading floor with Bloomberg terminal screens showing charts, cinematic financial atmosphere',
    Analysis:    'executive boardroom with financial analytics dashboards on large screens, sophisticated business setting',
    Crypto:      'modern technology office with digital screens showing blockchain and cryptocurrency data visualizations',
    Forex:       'foreign exchange dealing room with multiple currency trading screens, professional global finance environment',
    Business:    'modern corporate glass office tower exterior or executive meeting room with city skyline view',
    Commodities: 'gold bullion bars stacked professionally, precious metals vault, commodity trading environment',
    Leadership:  'empty executive boardroom with panoramic city view, curved conference table, premium corporate interior',
    Innovation:  'fintech startup open office with large curved monitors, clean modern tech workspace',
  }
  const style = styles[category] || 'professional financial news environment, modern office with screens and city views'
  return `High-quality editorial photography for a financial news article titled: "${title.slice(0,80)}". Setting: ${style}. Requirements: photorealistic, cinematic natural lighting, professional editorial photography, NO text overlays, NO visible brand logos, NO identifiable human faces, clean uncluttered composition perfect for a news website hero image. Shot on professional camera, sharp focus, high dynamic range.`
}

export async function generateArticleImage(
  title: string, category: string, articleId?: string, articleSlug?: string
): Promise<string | null> {
  const OPENAI_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_KEY) { console.error('No OPENAI_API_KEY'); return null }
  
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: buildPrompt(title, category),
        n: 1, size: '1792x1024', quality: 'standard', style: 'natural',
      }),
      signal: AbortSignal.timeout(270000),
    })

    if (!res.ok) { console.error('DALL-E error:', res.status); return null }
    const data = await res.json()
    const tempUrl = data.data?.[0]?.url
    if (!tempUrl) return null

    // Download and re-host in Supabase (OpenAI URLs expire after 1hr)
    const imgRes = await fetch(tempUrl, { signal: AbortSignal.timeout(30000) })
    if (!imgRes.ok) return null
    const imgBuf = Buffer.from(await imgRes.arrayBuffer())

    const fileName = `img-${articleSlug || articleId || Date.now()}-${Date.now().toString(36)}.jpg`
    const { error } = await getDb().storage.from('article-images')
      .upload(fileName, imgBuf, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: true })
    if (error) { console.error('Storage err:', error.message); return tempUrl } // fallback to temp URL

    const { data: urlData } = getDb().storage.from('article-images').getPublicUrl(fileName)
    const permanentUrl = urlData.publicUrl

    // Update article in DB
    if (articleId) {
      await getDb().from('news_articles').update({ cover_image_url: permanentUrl }).eq('id', articleId)
    }
    return permanentUrl
  } catch (e) {
    console.error('generateArticleImage error:', e)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, category, articleId, articleSlug } = await req.json()
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
    const url = await generateArticleImage(title, category || 'Business', articleId, articleSlug)
    if (!url) return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    return NextResponse.json({ url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
