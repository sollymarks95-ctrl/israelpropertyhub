import { NextRequest, NextResponse } from 'next/server'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

// Portal niche descriptions for better search context
const NICHE: Record<string, string> = {
  'global-trade-wire':   'global trade finance, commodity markets, cross-border payments, supply chain',
  'finance-terminal':    'forex markets, interest rates, central bank policy, derivatives, equity markets',
  'business-pulse':      'corporate strategy, M&A deals, CEO leadership, private equity, enterprise tech',
  'gold-markets-today':  'gold price, precious metals, commodities, oil, copper, lithium',
  'trust-score':         'broker regulation, trading platform safety, FCA compliance, CFD brokers, forex brokers',
  'invest-data':         'investment strategy, hedge funds, ETFs, portfolio management, private credit',
  'market-radar':        'technical analysis, market signals, options trading, algorithmic trading',
  'executive-network':   'executive leadership, board governance, CEO succession, private equity deals',
  'crypto-hub':          'bitcoin price, ethereum, DeFi, crypto regulation, institutional crypto adoption',
}

export async function OPTIONS() { return new Response(null, { status: 204, headers: CORS }) }

export async function POST(req: NextRequest) {
  try {
    const { siteSlug, clientName } = await req.json()
    const niche = NICHE[siteSlug] || 'financial markets'
    const ANTH = process.env.ANTHROPIC_API_KEY
    if (!ANTH) return NextResponse.json({ error: 'No API key' }, { status: 500, headers: CORS })

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

    const prompt = `You are a podcast producer for a financial media network. Today is ${today}.

Generate 8 trending, specific, timely podcast episode ideas for a show covering: ${niche}
${clientName ? `The show features ${clientName} as a sponsor/guest.` : ''}

For each idea, give:
- A punchy episode TITLE (max 12 words)
- A one-line TOPIC description (what the conversation covers, 15-25 words)
- A suggested GUEST type (e.g. "hedge fund manager", "FCA compliance officer", "crypto VC")

Focus on what's actually happening right now in mid-2026: rate decisions, regulatory changes, market moves, platform launches, industry shifts.

Return ONLY valid JSON array, no markdown:
[
  {"title":"Episode Title Here","topic":"Short description of what will be discussed in the episode","guest":"Guest type suggestion"},
  ...
]`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTH, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) return NextResponse.json({ error: 'AI request failed' }, { status: 500, headers: CORS })
    const data = await res.json()
    const text = data.content?.[0]?.text?.trim() || '[]'
    const clean = text.replace(/```json\s*/g, '').replace(/```/g, '').trim()
    const topics = JSON.parse(clean)

    return NextResponse.json({ topics }, { headers: CORS })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS })
  }
}
