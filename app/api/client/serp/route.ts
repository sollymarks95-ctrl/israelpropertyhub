import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const OUR_PORTALS = [
  'nex-wire.com','finvexx.com','bizplezx.com','aurexhq.com','verivex.co',
  'invexhuby.com','signalixx.com','execvex.com','cryptoxos.com',
]

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json()
    if (!keyword?.trim()) return NextResponse.json({ error: 'keyword required' }, { status: 400 })

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Search Google for: "${keyword}"

Return ONLY a JSON array of the top 10 results. No preamble, no explanation, just the array:
[
  {"position":1,"title":"page title","url":"https://full-url.com/path","domain":"example.com","snippet":"brief description"},
  ...
]`,
        }],
      }),
      signal: AbortSignal.timeout(55000),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('SERP API error:', res.status, errText.slice(0, 300))
      return NextResponse.json({ error: `Search API error (${res.status}). Try again.` }, { status: 500 })
    }

    const data = await res.json()

    // Collect all text from content blocks
    const allText = (data.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text as string)
      .join('\n')

    // Extract JSON array
    const jsonMatch = allText.match(/\[\s*\{[\s\S]*?\}\s*\]/)
    if (!jsonMatch) {
      console.error('No JSON array found in SERP response:', allText.slice(0, 400))
      return NextResponse.json({
        results: [],
        keyword,
        error: 'Search returned no structured results. Try a more specific keyword.',
        hint: allText.slice(0, 200),
      })
    }

    let results: any[] = []
    try {
      results = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ results: [], keyword, error: 'Could not parse search results.' })
    }

    const enriched = results.slice(0, 10).map((r: any, i: number) => {
      let domain = (r.domain || '').toLowerCase().replace(/^www\./, '')
      if (!domain && r.url) {
        try { domain = new URL(r.url).hostname.replace(/^www\./, '') } catch {}
      }
      return {
        position: r.position ?? (i + 1),
        title: r.title || '',
        url: r.url || '',
        domain,
        snippet: r.snippet || '',
        isOurs: OUR_PORTALS.some(p => r.url?.includes(p) || domain.includes(p)),
      }
    })

    return NextResponse.json({
      results: enriched,
      keyword,
      ourPortals: enriched.filter(r => r.isOurs),
      competitors: enriched.filter(r => !r.isOurs).slice(0, 5).map(r => ({ position: r.position, domain: r.domain })),
      checkedAt: new Date().toISOString(),
    })
  } catch (e: any) {
    console.error('SERP route error:', e)
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 })
  }
}
