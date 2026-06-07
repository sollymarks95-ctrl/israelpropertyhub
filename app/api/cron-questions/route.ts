import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic    = 'force-dynamic'
export const maxDuration = 300

const CORS = { 'Access-Control-Allow-Origin': '*' }

// Site niches for real-time question discovery
const SITE_NICHES: Record<string, { niche: string; keywords: string[]; persona: string }> = {
  'trust-score': {
    niche: 'forex broker safety and regulation',
    keywords: ['forex broker regulated','broker scam','FCA CySEC ASIC','broker review','prop firm safe'],
    persona: 'A compliance officer and broker regulation expert who has reviewed 200+ brokers and spotted numerous scams'
  },
  'finance-terminal': {
    niche: 'forex and currency markets',
    keywords: ['forex trading','currency pairs','central bank interest rates','exchange rate','spread leverage'],
    persona: 'A former institutional FX trader with 12 years on a bank trading desk who now teaches retail traders'
  },
  'crypto-hub': {
    niche: 'cryptocurrency and blockchain investing',
    keywords: ['bitcoin ethereum','crypto investing','DeFi staking','crypto scam','blockchain technology'],
    persona: 'A crypto investor who has been in the market since 2013, survived multiple bear markets and made every mistake worth making'
  },
  'market-radar': {
    niche: 'technical analysis and trading signals',
    keywords: ['RSI MACD technical analysis','chart patterns','trading signals','support resistance','options flow'],
    persona: 'A quantitative analyst who has built and backtested 300+ trading strategies and manages a systematic fund'
  },
  'invest-data': {
    niche: 'investment strategy and portfolio management',
    keywords: ['ETF index fund','portfolio allocation','hedge fund','dividend investing','factor investing'],
    persona: 'A CFA charterholder who left an investment bank to teach evidence-based investing after watching clients lose money chasing returns'
  },
  'gold-markets-today': {
    niche: 'commodities gold silver oil markets',
    keywords: ['gold price silver','oil OPEC','commodity futures','inflation gold','COMEX precious metals'],
    persona: 'A commodity desk analyst who has covered gold, oil and agricultural markets for 15 years across multiple commodity supercycles'
  },
  'global-trade-wire': {
    niche: 'trade finance and international commerce',
    keywords: ['letter of credit trade finance','supply chain','SWIFT payment','export import finance','shipping tariffs'],
    persona: 'A trade finance banker who has structured $2 billion in cross-border transactions across 40 countries'
  },
  'executive-network': {
    niche: 'corporate strategy M&A and leadership',
    keywords: ['CEO board directors','mergers acquisitions','private equity','corporate governance','activist investors'],
    persona: 'A former M&A advisor who has closed 50+ transactions and now advises boards on governance and strategy'
  },
  'business-pulse': {
    niche: 'business finance and corporate earnings',
    keywords: ['EBITDA earnings','company valuation','stock market business','revenue profit','recession economy'],
    persona: 'A corporate finance director who spent 20 years reading earnings reports and valuations at a large institutional investor'
  },
}

// Google Trends RSS for real-time trending searches
const TRENDS_FEEDS: Record<string, string> = {
  finance: 'https://trends.google.com/trending/rss?geo=US&category=7',  // Finance category
  tech: 'https://trends.google.com/trending/rss?geo=US&category=5',
}

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,80)
}

async function callClaude(prompt: string, useWebSearch = false): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const body: any = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  }
  if (useWebSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }]
    body.model = 'claude-sonnet-4-6' // Web search needs Sonnet+
    body.max_tokens = 3000
  }

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  })

  if (!r.ok) throw new Error(`Claude API ${r.status}: ${await r.text().then(t=>t.slice(0,200))}`)
  const d = await r.json()
  // Extract text from content blocks
  const text = (d.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('')
  return text
}

async function discoverTrendingQuestions(siteSlug: string): Promise<string[]> {
  const config = SITE_NICHES[siteSlug]
  if (!config) return []

  const keywordStr = config.keywords.join(', ')

  // Use Claude with web search to find what's trending RIGHT NOW
  const prompt = `Search the web and find the top 5 questions that people are searching for RIGHT NOW in ${config.niche}.

Focus on:
- Questions with "what is", "how does", "why does", "is X safe/legit/worth it", "how to"
- Topics trending on Reddit, forums, and finance news today
- Questions beginners AND intermediate-level people ask about: ${keywordStr}
- Questions that have a clear answer that can be explained in a blog post

Return ONLY a JSON array of 5 question strings, nothing else:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`

  try {
    const raw = await callClaude(prompt, true) // Use web search
    const s = raw.indexOf('['), e = raw.lastIndexOf(']')
    if (s === -1 || e === -1) throw new Error('No array found')
    const questions: string[] = JSON.parse(raw.slice(s, e + 1))
    return questions.filter((q: any) => typeof q === 'string' && q.length > 10).slice(0, 5)
  } catch (err: any) {
    console.error(`[questions] trend discovery failed for ${siteSlug}:`, err.message)
    // Fallback: use keyword-based questions
    return getFallbackQuestions(siteSlug)
  }
}

function getFallbackQuestions(siteSlug: string): string[] {
  const fallbacks: Record<string, string[]> = {
    'trust-score': ['Is eToro safe to use in 2026?','How to check if a forex broker is regulated?','What is the safest way to trade forex?','How to spot a forex scam?','What is FCA regulated broker?','Is Pepperstone a legitimate broker?','What is negative balance protection?','How to verify a broker licence?','What is CySEC regulation?','What is ASIC regulation?','Is IC Markets regulated?','What is segregated client funds?','How to get money back from forex scam?','What is a prop trading firm?','Is XM broker safe?'],
    'finance-terminal': ['How does forex trading work?','What is leverage in forex?','What moves currency prices?','What is a pip in forex?','How does the Fed affect forex?','What is a currency carry trade?','What is hedging in forex?','What is the spread in forex?','How to read an economic calendar?','What is a forex swap?','What currency pairs are best for beginners?','How does central bank policy affect forex?','What is the dollar index?','What is quantitative easing?','How do interest rates affect currencies?'],
    'crypto-hub': ['Is Bitcoin worth buying now?','How does DeFi actually work?','How to avoid crypto scams?','What is Ethereum staking?','How does Bitcoin halving work?','What is a crypto wallet?','What is a Layer 2 solution?','What causes crypto prices to rise?','What is a stablecoin?','How to buy Bitcoin safely?','What is the difference between Bitcoin and Ethereum?','What is a rug pull?','Is crypto legal?','What is Web3?','What are NFTs worth in 2026?'],
    'market-radar': ['What is RSI in trading?','How to use MACD?','What is support and resistance?','How to read candlestick charts?','What is Bollinger Bands?','What is volume in trading?','How to use Fibonacci retracement?','What is a head and shoulders pattern?','What is options flow?','What is the VIX index?','What is a moving average crossover?','What is a double top pattern?','How to identify trend reversal?','What is dark pool trading?','What is gamma exposure?'],
    'invest-data': ['What is an ETF?','How to start investing?','What is dollar cost averaging?','What is a hedge fund?','How does compound interest work?','What is a dividend stock?','What is private equity?','What is factor investing?','How to invest in index funds?','What is the Sharpe ratio?','What is risk-adjusted return?','What is a REIT?','How to build a portfolio?','What is rebalancing?','What is an ISA?'],
    'gold-markets-today': ['Why is gold price rising?','How to invest in gold?','What affects oil prices?','What is the relationship between gold and inflation?','How is silver price determined?','What is OPEC?','What is contango in futures?','Why is copper important for the economy?','What is lithium used for?','How to trade gold futures?','What affects platinum price?','What is the Baltic Dry Index?','How do commodity ETFs work?','What is a commodity supercycle?','How does the dollar affect gold?'],
    'global-trade-wire': ['What is a letter of credit?','How does trade finance work?','What is supply chain finance?','What is a bill of lading?','How does SWIFT work?','What is forfaiting?','How do tariffs affect trade?','What is documentary collection?','What is export credit insurance?','What is the Belt and Road Initiative?','What is a trade deficit?','How does cross-border payment work?','What is incoterms?','What is a standby letter of credit?','How does factoring work?'],
    'executive-network': ['How does M&A work?','What does a CEO do?','What is private equity?','What is a board of directors?','How is executive pay structured?','What is activist investing?','What is a corporate spin-off?','What is a leveraged buyout?','How does a company go public?','What is corporate governance?','What does a CFO do?','What is ESG for companies?','What is a management buyout?','How do PE firms make money?','What is due diligence?'],
    'business-pulse': ['What is EBITDA?','How to read an earnings report?','What is market cap?','What is revenue vs profit?','How do interest rates affect stocks?','What is a stock buyback?','What is working capital?','How to value a company?','What is a profit margin?','What is a recession?','How does inflation affect business?','What is a dividend payout ratio?','What is free cash flow?','What is EV to EBITDA?','What is a P/E ratio?'],
  }
  return fallbacks[siteSlug] || []
}

async function generateAnsweringPromptArticle(
  question: string,
  site: any,
  siteConfig: { niche: string; persona: string }
): Promise<any> {
  const today = new Date().toISOString().split('T')[0]

  // The answering prompt method: write as if you interviewed the expert
  const prompt = `You are ${siteConfig.persona} writing for ${site.name}.

Answer this question as the definitive expert resource: "${question}"

Write in FIRST PERSON as the persona above. Include:
- Your personal experience with this topic (real or plausible case studies)
- A counterintuitive insight most people get wrong
- A specific example or data point that proves your point
- Your genuine opinion on what matters and what doesn't
- Practical takeaways someone can use immediately

This must feel like a REAL expert answered 10 questions about their experience — not a Wikipedia article.

Today's date: ${today}

Respond ONLY with valid JSON:
{"title":"Compelling headline with keyword, 60 chars max","excerpt":"Meta description 150 chars with keyword","category":"Education","tags":["tag1","tag2","tag3","tag4"],"body":"<p>...</p><h2>...</h2><p>...</p><h2>...</h2><p>...</p><h2>Key Takeaways</h2><ul><li>...</li></ul>","faq":[{"q":"Related question people search?","a":"Direct 2-sentence answer."},{"q":"Another related question?","a":"Direct 2-sentence answer."}]}`

  const raw = await callClaude(prompt, false)
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error(`No JSON in response: ${raw.slice(0,100)}`)
  return JSON.parse(raw.slice(s, e + 1))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })
  }

  const targetSite = searchParams.get('site')
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]

  const { data: sites } = await db
    .from('news_sites')
    .select('id, slug, name, tagline, domain')
    .eq('is_active', true)
    .eq('is_live', true)
    .in('slug', targetSite ? [targetSite] : Object.keys(SITE_NICHES))

  if (!sites?.length) return NextResponse.json({ error: 'No sites found', hint: `Looking for site: ${targetSite}` }, { headers: CORS })

  const results: any[] = []

  for (const site of sites) {
    const siteConfig = SITE_NICHES[site.slug]
    if (!siteConfig) continue

    let inserted = 0, skipped = 0, errors: string[] = []

    // Step 1: Discover trending questions for this niche TODAY
    console.log(`[questions] discovering trending questions for ${site.slug}...`)
    const questions = await discoverTrendingQuestions(site.slug)
    console.log(`[questions] found ${questions.length} questions: ${questions.slice(0,2).join(', ')}`)

    // Step 2: Generate expert articles for each question
    for (const question of questions) {
      const slug = `${slugify(question)}-${today}`

      const { data: exists } = await db
        .from('news_articles')
        .select('id')
        .eq('news_site_id', site.id)
        .eq('slug', slug)
        .maybeSingle()

      if (exists) { skipped++; continue }

      try {
        const art = await generateAnsweringPromptArticle(question, site, siteConfig)

        const faqSchema = {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: (art.faq || []).map((f: any) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }

        const { error: insertErr } = await db.from('news_articles').insert({
          news_site_id:    site.id,
          title:           art.title,
          slug,
          excerpt:         art.excerpt,
          body:            art.body,
          category:        art.category || 'Education',
          tags:            art.tags || [],
          status:          'published',
          article_type:    'news',
          author_name:     `${site.name} Editorial`,
          published_at:    new Date().toISOString(),
          read_time_minutes: 6,
          faq_schema:      faqSchema,
          source_question: question,
          is_featured:     false,
          ai_generated:    true,
        })

        if (insertErr) {
          errors.push(`INSERT failed: ${insertErr.message}`)
          continue
        }

        inserted++
        console.log(`[questions] ✅ ${site.slug}: "${art.title}"`)
        await new Promise(r => setTimeout(r, 1000))

      } catch (err: any) {
        errors.push(`${question.slice(0,40)}: ${err.message.slice(0,80)}`)
        console.error(`[questions] error:`, err.message)
      }
    }

    results.push({ site: site.slug, questions_found: questions.length, inserted, skipped, errors })
  }

  return NextResponse.json({
    ok: true,
    date: today,
    results,
    total_inserted: results.reduce((s, r) => s + r.inserted, 0),
  }, { headers: CORS })
}
