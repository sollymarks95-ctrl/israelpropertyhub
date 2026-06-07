import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getArticleImage } from '@/app/lib/articleImages'


const PORTAL_AUTHORS: Record<string, string[]> = {
  'global-trade-wire': ['James Hart','Sarah Brennan','Michael Osei','Elena Vasquez','Tom Whitfield','Priya Nair','David Kowalski','Amara Okonkwo','Chris Flanagan','Leila Ahmadi'],
  'finance-terminal':  ['Marcus Webb','Julia Hartmann','Ryan Chen','Fatima Al-Rashid','Ben Stafford','Sophie Leclerc','Omar Farouk','Natalie Pearce','Alex Drummond','Ingrid Svensson'],
  'business-pulse':    ['Daniel Sterling','Rachel Kim','Patrick Obrien','Aisha Mensah','Luke Thornton','Chloe Martínez','Sam Okafor','Hannah Fischer','Jack Brennan','Zara Ahmed'],
  'gold-markets-today':['Richard Stone','Victoria Chen','Paul Nakamura','Clara Russo','Oliver Grant','Mei Lin','Stefan Müller','Isabella Rossi','Noah Clarke','Adaora Eze'],
  'trust-score':       ['Nathan Chen','Emma Morrison','David Osei','Layla Hassan','George Patel','Anastasia Volkov','Marcus Johnson','Freya Andersen','Carlos Rivera','Yuki Tanaka'],
  'invest-data':       ['Michael Torres','Sarah Kim','James Blackwood','Priya Sharma','Alex Morgan','Claudia Becker','Ben Adeyemi','Nina Kowalska','Tom Harrington','Sana Sheikh'],
  'market-radar':      ['Jordan Blake','Petra Fischer','Callum MacLeod','Diana Ivanova','Ravi Kumar','Scarlett Thompson','Felix Weber','Amira El-Sayed','Chris Vaughan','Lena Johansson'],
  'executive-network': ['Alexander Ross','Caroline Hughes','William Park','Nadia Osman','Henry Stafford','Isabelle Morel','David Kamau','Emma Lindqvist','Marcus Reid','Jasmine Patel'],
  'crypto-hub':        ['Alex Rivera','Sam Walsh','Mia Nakamura','Ethan Blake','Zoe Patel','Connor Murphy','Ava Chen','Leo Santos','Iris Bergström','Max Okonkwo'],
}
export const runtime = 'nodejs'
export const maxDuration = 300

const ANTHROPIC = process.env.ANTHROPIC_API_KEY!

// Service role key bypasses RLS
function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

// Hardcoded core portals (always run, never removed)
const CORE_SITES = [
  { id:'4d048bde-1dcd-4891-8434-a7960ab9d3ae', name:'Nex-Wire Intelligence', slug:'global-trade-wire', domain:'nex-wire.com', author:'David Hart', topics:[
    'EUR/USD exchange rate today analysis','gold price today market update','Federal Reserve interest rate decision latest','global trade breaking news today','oil price Brent crude today','Bitcoin cryptocurrency market today',
    'GBP USD British pound analysis today','S&P 500 stock market today','China trade economic policy latest','forex market volatility today','emerging markets currency outlook today','US dollar index DXY today',
    'commodity markets overview today','geopolitical risk financial markets today','central bank policy update today','inflation data economic report today','treasury bond yields market today','Asian markets overnight update',
    'European markets open today','Wall Street pre-market analysis today','crude oil OPEC supply news today','natural gas energy market today','copper metals industrial outlook today','cryptocurrency altcoin market today',
    'trade balance economic data today','retail sales consumer data today','manufacturing PMI economic today','jobless claims unemployment today','housing market real estate today','mergers acquisitions deal news today',
  ]},
  { id:'48bed332-6525-4d76-aaa5-6d10a5112d77', name:'Finvexx Markets', slug:'finance-terminal', domain:'finvexx.com', author:'Marcus Webb', topics:[
    'S&P 500 market analysis today','Federal Reserve monetary policy latest','gold investment strategy today','corporate earnings results today','social trading platform regulation today','Bitcoin ETF institutional flows today',
    'hedge fund market positioning latest','EUR USD technical analysis today','crude oil price forecast today','financial sector regulation news today','emerging market currencies today','interest rate impact markets today',
    'equity market outlook today','bond yields treasury today','financial technology news today','IPO stock market listings today','dividend stocks analysis today','options trading market today',
    'short selling hedge funds today','quantitative easing central banks today','banking sector earnings today','insurance financial news today','asset management fund flows today','derivatives futures markets today',
    'currency war dollar policy today','semiconductor tech stocks today','energy stocks oil gas today','healthcare biotech stocks today','consumer spending retail stocks today','transportation logistics stocks today',
  ]},
  { id:'c0f14745-8189-444d-af09-39d7248fa319', name:'Bizplezx Executive', slug:'business-pulse', domain:'bizplezx.com', author:'Claire Sterling', topics:[
    'fintech banking industry news today','AI artificial intelligence financial services','financial sector M&A today','ESG sustainable finance news today','financial regulation compliance today','digital banking transformation today',
    'executive leadership strategy news today','private equity venture capital today','financial technology startup funding today','corporate governance news today','wealth management industry today','payments industry innovation today',
    'open banking news today','financial services consumer trends today','insurtech insurance technology today','blockchain enterprise business today','digital assets institutional adoption today','regtech compliance technology today',
    'neobank challenger bank news today','embedded finance news today','financial inclusion global trends today','cross-border payments news today','buy-now-pay-later industry today','robo-advisor wealth tech today',
    'cryptocurrency exchange regulation today','data privacy financial services today','cybersecurity financial sector today','cloud banking infrastructure today','API economy financial services today','sustainability green bonds today',
  ]},
  { id:'3b440202-e1c3-4f54-8a4e-65cf7e7dbfe1', name:'AurexHQ', slug:'gold-markets-today', domain:'aurexhq.com', author:'James Calloway', topics:[
    'gold price today spot market','silver price today analysis','precious metals market overview today','gold ETF institutional flows today','central bank gold reserves latest','gold vs inflation hedge today',
    'platinum price today analysis','palladium rhodium prices today','gold mining stocks news today','commodity markets gold outlook today','gold technical analysis forecast today','silver industrial demand today',
    'gold futures options market today','physical gold demand today','gold refining industry news today','gold royalty streaming companies today','gold exploration discovery news today','China gold demand imports today',
    'India gold market jewellery today','Middle East gold buying today','gold lease rates LBMA today','gold options volatility today','gold seasonal patterns today','gold currency correlation today',
    'gold geopolitical safe haven today','gold supply mine production today','gold recycling scrap market today','gold standard debate economics today','gold silver ratio today','precious metals ETF flows today',
  ]},
  { id:'6ae7e692-bce9-489d-b835-87dcba9ffc47', name:'Verivex Trust', slug:'trust-score', domain:'verivex.co', author:'Anna Reid', topics:[
    'social trading platform regulation 2026','CySEC FCA regulated brokers today','broker regulation news today','regulated vs unregulated platform','investor protection regulation news','broker withdrawal process today',
    'financial watchdog enforcement today','safe trading platform checklist 2026','trading platform review methodology','financial consumer protection news today','FCA regulated platform news today','ASIC regulated broker update today',
    'broker license verification today','financial ombudsman complaints today','trading platform transparency today','broker segregated funds protection today','financial regulation MiFID II today','investor compensation scheme news today',
    'platform security trading today','KYC AML compliance news today','trading platform fee comparison today','broker execution quality standards today','financial dispute resolution today','trading platform risk warnings today',
    'social trading copy trading regulation','CFD leverage regulation update today','forex regulation global update today','binary options regulation today','trading app regulation news today','financial advisor regulation today',
  ]},,
  { id:'1cd6688f-bec9-4d1b-a024-80952bf31a21', name:'InvexHuby', slug:'invest-data', author:'Michael Torres',
    domain:'invexhuby.com', primary:'#0f766e',
    topics:[
      'investment portfolio strategies 2026','hedge fund performance analysis','ETF market outlook today',
      'stock market valuation metrics','private equity deal flow 2026','venture capital trends 2026',
      'fixed income bond market analysis','alternative investment strategies','quantitative trading signals',
      'asset allocation framework 2026','IPO market outlook today','factor investing analysis',
      'risk-adjusted returns portfolio','emerging market investment opportunities','dividend growth investing',
      'options trading strategies advanced','cryptocurrency institutional adoption','ESG investment performance',
      'macro investment themes 2026','real estate investment trusts REIT analysis',
      'multi-asset portfolio construction','market volatility investment strategy','global fund flows analysis',
      'investment grade credit markets','small cap stock opportunities 2026','thematic investing trends',
      'wealth management strategies 2026','financial markets morning briefing','capital markets intelligence',
      'investment banking deal activity','futures market positioning analysis'
    ]
  },
  { id:'27fdf1e6-8c0c-4591-ae9b-5a2c5cacee22', name:'Signalixx', slug:'market-radar', author:'Jordan Blake',
    domain:'signalixx.com', primary:'#dc2626',
    topics:[
      'technical analysis market signals today','RSI momentum indicators analysis','moving average crossover signals',
      'options market implied volatility','put call ratio market sentiment','chart pattern analysis 2026',
      'algorithmic trading signals today','market breadth indicators analysis','fibonacci retracement levels',
      'volume profile trading analysis','market microstructure analysis','Bollinger bands signal analysis',
      'MACD divergence signals today','support resistance levels forex','trend following signals 2026',
      'derivatives market signals analysis','dark pool trading activity','institutional order flow analysis',
      'price action trading patterns','market correlation analysis 2026','seasonal market patterns analysis',
      'volatility surface analysis options','intermarket analysis signals','commitment of traders analysis',
      'Elliott wave market analysis','Wyckoff method market stages','market regime detection signals',
      'high frequency trading market impact','liquidity analysis market depth','gamma exposure market signals',
      'quantitative signals backtesting results'
    ]
  }
]

// Dynamically load ALL active sites from DB and merge with core portals
async function getAllSites() {
  const db = getDb()
  const { data: dbSites } = await db
    .from('news_sites')
    .select('id,name,slug,domain,topics,template_config')
    .eq('is_active', true)
    .not('topics', 'is', null)
    .limit(200)
  
  if (!dbSites || dbSites.length === 0) return CORE_SITES
  
  const coreSlugSet = new Set(CORE_SITES.map((s: any) => s.slug))
  
  const dynamicSites = dbSites
    .filter((s: any) => !coreSlugSet.has(s.slug) && s.topics && s.topics.length > 0)
    .map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      domain: s.domain,
      author: 'Editorial Team',
      topics: s.topics || [],
    }))
  
  return [...CORE_SITES, ...dynamicSites]
}

const PORTAL_URLS: Record<string,string> = {
  'nex-wire.com':   'https://nex-wire.com',
  'finvexx.com':    'https://finvexx.com',
  'bizplezx.com':   'https://bizplezx.com',
  'aurexhq.com':    'https://aurexhq.com',
  'verivex.co':     'https://verivex.co',
  'signalixx.com':  'https://signalixx.com',
  'tradvex.com':    'https://tradvex.com',
  'invexhuby.com':  'https://invexhuby.com',
  'presxwire.com':  'https://presxwire.com',
  'bizpedia.com':   'https://bizpedia.com',
  'certivade.com':  'https://certivade.com',
  'execvex.com':    'https://execvex.com',
}

function slugify(s: string) {
  const d = new Date()
  const ts = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55)+'-'+ts
}

async function getActiveClients() {
  const { data } = await getDb().from('portal_clients')
    .select('id,company_name,brand_slug,regulation,industry,website_url')
    .eq('is_active', true).limit(20)
  return data || []
}

async function getCrossPortalLinks(clientName: string, excludeSiteId: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await getDb().from('news_articles')
    .select('title,slug,news_site_id')
    .ilike('body', `%${clientName}%`)
    .eq('status','published')
    .gte('published_at', today+'T00:00:00')
    .neq('news_site_id', excludeSiteId)
    .limit(3)
  if (!data || data.length === 0) return []
  return data.map((a:any) => {
    const site = CORE_SITES.find((s:any) => s.id === a.news_site_id)
    if (!site) return null
    const base = PORTAL_URLS[site.domain] || 'https://rephuby.com'
    return { title: a.title, url: `${base}/article/${site.slug}/${a.slug}`, portal: site.name }
  }).filter(Boolean) as any[]
}

async function writeArticle(site: any, topic: string, client: any, crossLinks: any[]): Promise<any> {
  const today = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
  const base = PORTAL_URLS[site.domain] || 'https://rephuby.com'

  const crossLinkBlock = crossLinks.length > 0
    ? `\n\nNaturally reference 1-2 of these related articles from our partner publications:\n${crossLinks.map(l=>`- "${l.title}" (${l.portal}): ${l.url}`).join('\n')}\nWeave in as: "As ${crossLinks[0]?.portal} reported..." or "According to ${crossLinks[0]?.portal}..."`
    : ''

  const brandNote = client
    ? `\n\nEDITORIAL NOTE: Include ONE natural mention of "${client.company_name}" in the body as a real-world example.
- Write it as a journalist would: factual, brief, not promotional
- Include it as an HTML anchor: <a href="https://etoro.com" rel="noopener">${client.company_name}</a>
- Example: "...retail platforms such as <a href="https://etoro.com" rel="noopener">${client.company_name}</a>, which is regulated by the FCA and CySEC..."
- Place it naturally mid-article, not at start or end${crossLinkBlock}`
    : crossLinkBlock

  const prompt = `Write a professional financial news article about: "${topic}"

STRUCTURE (use HTML tags in body):
<h2>Opening section — lead with the key fact/news in first 2 sentences. Include main keyword.</h2>
2-3 paragraphs of context, data, expert analysis.

<h2>Market Impact / What's Happening</h2>
2-3 paragraphs on implications, numbers, who is affected.

<h2>Expert Analysis & Outlook</h2>
1-2 paragraphs on what analysts expect next.

<h2>Frequently Asked Questions</h2>
Include 2 Q&A pairs: <h3>Question?</h3><p>Answer.</p>

SEO & AEO RULES:
- 600-800 words total
- Main keyword in title, first paragraph, and one H2
- Flowing prose — no bullet lists in main body
- Write answers that AI search engines (Perplexity, ChatGPT) would cite directly
- Today is ${today} — use current date context
- Quality: Bloomberg/Reuters standard${brandNote}

Return ONLY valid JSON:
{"title":"...","excerpt":"one sentence summary 150-160 chars...","body":"<full HTML article>","category":"Markets","tags":["tag1","tag2","tag3"]}`

  // Retry up to 3 times with exponential backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json','x-api-key':ANTHROPIC,'anthropic-version':'2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 3000,
          system: `You are a financial news API. Respond with ONLY a raw JSON object, no markdown, no backticks, no explanation. Start your response with { and end with }.`,
          messages: [
          { role:'user', content: prompt },
          { role:'assistant', content: '{' }
        ]
        }),
        signal: AbortSignal.timeout(60000),
      })
      if (!res.ok) {
        const errText = await res.text()
        console.error(`Anthropic error (attempt ${attempt+1}):`, res.status, errText.slice(0,200))
        if (res.status === 429 || res.status >= 500) continue // retry
        return null
      }
      const data = await res.json()
      const text = (data.content||[]).filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('')
      // With prefill, response continues from '{' — prepend it back
      const raw = '{' + text.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim()
      const clean = raw.replace(/^\{\{/, '{') // avoid double { if Claude repeated it
      const start = clean.indexOf('{'); const end = clean.lastIndexOf('}')
      if (start===-1||end===-1) {
        console.error(`No JSON found for ${site.slug}/${topic}: ${text.slice(0,120)}`)
        continue
      }
      try {
        const parsed = JSON.parse(clean.slice(start,end+1))
        if (!parsed.title||!parsed.body) { console.error('Missing title/body'); continue }
        return parsed
      } catch(parseErr) {
        console.error(`JSON parse error for ${site.slug}/${topic}:`, (parseErr as Error).message)
        continue
      }
    } catch(e) {
      console.error(`writeArticle attempt ${attempt+1} error:`, topic, (e as Error).message)
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  }

  // 5 batches per day × 6 articles per portal = 30 articles/portal/day
  const batch = parseInt(req.nextUrl.searchParams.get('batch') || '0')
  const BATCH_SIZE = 6
  const batchStart = batch * BATCH_SIZE
  const batchEnd = batchStart + BATCH_SIZE

  let clients = await getActiveClients()
  // Hardcoded fallback — cron must ALWAYS run regardless of DB client query
  if (clients.length === 0) {
    clients = [{ id:'a1b2c3d4-0000-0000-0000-000000000001', company_name:'eToro', brand_slug:'etoro', regulation:'FCA, CySEC, ASIC', industry:'social trading', website_url:'https://www.etoro.com' }]
  }

  const results: any[] = []
  let totalInserted = 0

  const ALL_SITES = CORE_SITES

  // Write articles SEQUENTIALLY per site per round to avoid Anthropic rate limits
  // Each round: 7 sites × (3s Haiku + 600ms delay) = ~25s per round
  // 6 rounds × (25s + 1s delay) = ~156s total ✅
  const siteCounters: Record<string, number> = {}
  ALL_SITES.forEach((s: any) => { siteCounters[s.slug] = 0 })

  for (let i = 0; i < BATCH_SIZE; i++) {
    const globalIndex = batchStart + i
    const isBrandArticle = (globalIndex % 3 === 0)
    const client = isBrandArticle ? clients[0] : null
    const crossLinks = isBrandArticle ? await getCrossPortalLinks(client, ALL_SITES) : []

    // Write topic i for ALL sites — sequential with 500ms gap to avoid rate limits
    for (const site of ALL_SITES) {
      const topic = (site as any).topics?.[batchStart + i]
      if (!topic) continue
      const siteData = site as any

      const article = await writeArticle(siteData, topic, client, crossLinks)
      if (!article) { console.log(`Skipped: ${siteData.slug} / ${topic}`); await new Promise(r => setTimeout(r, 500)); continue }

      const slug = slugify(article.title)
      const { data: existing } = await getDb().from('news_articles').select('id').eq('slug', slug).single()
      if (existing) { console.log(`Dup slug: ${slug}`); continue }

      const { data: inserted, error } = await getDb().from('news_articles').insert({
        news_site_id: siteData.id,
        title: article.title,
        slug,
        excerpt: article.excerpt || '',
        body: article.body || '',
        category: article.category || 'Markets',
        tags: Array.isArray(article.tags) ? article.tags : [],
        author_name: (() => {
          const pool = PORTAL_AUTHORS[siteData.slug] || [siteData.author || 'Editorial Team']
          return pool[Math.floor(Math.random() * pool.length)]
        })(),
        cover_image_url: getArticleImage(article.category || 'Markets', slug),
        status: 'published',
        published_at: new Date().toISOString(),
        is_featured: i === 0 && batchStart === 0,
        ai_generated: true,
        read_time_minutes: Math.ceil((article.body || '').split(' ').length / 200),
      }).select().single()

      if (error) { console.error('Insert error:', error.message); continue }
      if (!inserted) continue

      totalInserted++
      siteCounters[siteData.slug] = (siteCounters[siteData.slug] || 0) + 1

      // Sync brand articles to portal_content
      if (inserted.id && isBrandArticle && clients[0]) {
        const PMAP: Record<string,{name:string,domain:string}> = {
          'global-trade-wire':  { name:'Nex-Wire',  domain:'nex-wire.com' },
          'finance-terminal':   { name:'Finvexx',   domain:'finvexx.com' },
          'business-pulse':     { name:'Bizplezx',  domain:'bizplezx.com' },
          'gold-markets-today': { name:'AurexHQ',   domain:'aurexhq.com' },
          'trust-score':        { name:'Verivex',   domain:'verivex.co' },
        }
        const pInfo = PMAP[(siteData as any).slug]
        if (pInfo) {
          const articleUrl = `https://${pInfo.domain}/article/${(siteData as any).slug}/${slug}`
          const contentType = article.category?.toLowerCase().includes('review') ? 'review' : 'article'
          await getDb().from('portal_content').insert({
            client_id: clients[0].id,
            portal_name: pInfo.name,
            portal_domain: pInfo.domain,
            news_article_id: inserted.id,
            title: article.title,
            article_url: articleUrl,
            content_type: contentType,
            published_at: new Date().toISOString(),
            views: 0,
            backlink_value: 65,
            status: 'live',
          }).then(() => {}).catch(() => {})
        }
      }
    }

    // Brief pause between rounds to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000)) // gap between rounds
  }

  // Build results from counters
  ALL_SITES.forEach((site: any) => {
    results.push({ site: site.name, inserted: siteCounters[site.slug] || 0 })
  })

  return NextResponse.json({
    message: `Batch ${batch} complete — ${totalInserted} articles across ${ALL_SITES.length} portals`,
    results,
    timestamp: new Date().toISOString(),
  })
}
