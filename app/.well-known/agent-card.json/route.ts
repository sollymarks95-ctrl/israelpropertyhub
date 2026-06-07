import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const host = (req.headers.get('host') || '').replace(/^www\./, '').split(':')[0]
  const base = `https://${host}`

  const { data: site } = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL    || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  ).from('news_sites').select('name,tagline,slug,category,noindex').eq('domain', host).single()

  if (!site || site.noindex) return NextResponse.json({ error: 'Not available' }, { status: 404 })

  const card = {
    name: `${site.name} AI Agent`,
    description: site.tagline || `Financial intelligence — ${site.category}`,
    url: base,
    version: '1.0',
    provider: { organization: site.name, url: base },
    capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain', 'application/json'],
    skills: [
      {
        id: 'financial-news',
        name: 'Financial News & Analysis',
        description: `Real-time financial news and expert commentary on ${site.category || 'global financial markets'}. Updated 45+ times daily.`,
        tags: ['finance', 'news', 'markets', 'analysis'],
        examples: [
          `What are the latest developments in ${site.category || 'financial markets'}?`,
          `Summarise recent market news from ${site.name}`,
          `What are analysts saying about current market conditions?`,
        ],
        inputModes: ['text/plain'],
        outputModes: ['text/plain'],
      }
    ],
    documentationUrl: `${base}/llms.txt`,
    iconUrl: `${base}/favicon.ico`,
    supportsAuthenticatedExtendedCard: false,
  }

  return NextResponse.json(card, {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'Access-Control-Allow-Origin': '*' }
  })
}
