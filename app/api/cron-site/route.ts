import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getArticleImage } from '@/app/lib/articleImages'

export const runtime = 'nodejs'
export const maxDuration = 300

const CORE_SITES: Record<string, any> = {
  'global-trade-wire':  { id:'4d048bde-1dcd-4891-8434-a7960ab9d3ae', name:'Nex-Wire Intelligence', shortName:'Nex-Wire', author:'James Hart', domain:'nex-wire.com', topics:['global trade finance markets today','commodity trade flows analysis 2026','export credit agency deal activity','trade finance digitization trends 2026','supply chain finance innovation today','cross-border payment solutions emerging','letter of credit modernization 2026','shipping finance market outlook today','trade war tariff impact analysis 2026','commodity price volatility trade 2026','emerging market trade corridors 2026','global port congestion impact trade','green trade finance sustainability 2026','fintech trade finance disruption today','SWIFT gpi cross-border payments 2026','African Continental Free Trade Area update','Asia Pacific trade deal analysis 2026','US China trade relationship 2026','European trade policy changes 2026','Middle East trade finance hub growth','commodity supercycle analysis 2026','working capital optimization strategies','receivables finance market 2026 update','blockchain trade finance adoption 2026','trade credit insurance market 2026','factoring and invoice finance growth','structured trade commodity finance','forfaiting market analysis 2026','Islamic trade finance sukuk growth','trade finance ESG integration today'] },
  'finance-terminal':   { id:'48bed332-6525-4d76-aaa5-6d10a5112d77', name:'Finvexx Markets', shortName:'Finvexx', author:'Marcus Webb', domain:'finvexx.com', topics:['forex market analysis today 2026','interest rate decision impact markets','central bank policy meeting outcomes','currency pair technical analysis 2026','bond market yield curve analysis','equity market morning briefing today','derivatives market activity analysis','options market implied volatility today','commodities market daily update 2026','eurodollar futures market analysis 2026','hedge fund positioning analysis 2026','institutional trading flows today','foreign exchange market microstructure 2026','quantitative easing impact markets','inflation data market reaction today','employment data market reaction 2026','GDP growth market implications today','financial stability report analysis','banking sector stress test results','fintech IPO market analysis 2026','CFO strategic succession framework 2026','private credit market growth 2026','CLO market issuance analysis today','credit spread widening analysis','sovereign debt market analysis 2026','emerging market currency crisis 2026','dollar index DXY analysis today','gold silver ratio analysis 2026','oil price geopolitical impact today','financial sector earnings analysis'] },
  'business-pulse':     { id:'c0f14745-8189-444d-af09-39d7248fa319', name:'Bizplezx Executive', shortName:'Bizplezx', author:'Daniel Sterling', domain:'bizplezx.com', topics:['executive leadership strategy 2026','corporate earnings season analysis 2026','consumer spending retail outlook 2026','healthcare pharma business strategy 2026','startup ecosystem funding analysis 2026','corporate governance ESG update 2026','supply chain resilience strategy 2026','digital transformation business 2026','workforce productivity AI automation','remote hybrid work policy 2026','corporate restructuring trends today','real estate commercial market 2026','retail sector disruption analysis 2026','hospitality travel recovery 2026','manufacturing reshoring trends 2026','energy transition business impact 2026','healthcare sector consolidation 2026','media entertainment streaming wars','technology sector layoffs hiring 2026','e-commerce marketplace competition 2026','B2B SaaS market analysis 2026','subscription economy business model','platform economy competition 2026','circular economy business opportunity','sustainability reporting requirements 2026','tax strategy multinational 2026','anti-trust regulation technology 2026','data privacy compliance business 2026','cybersecurity business investment 2026','AI enterprise adoption strategy'] },
  'gold-markets-today': { id:'3b440202-e1c3-4f54-8a4e-65cf7e7dbfe1', name:'AurexHQ', shortName:'AurexHQ', author:'Richard Stone', domain:'aurexhq.com', topics:['gold price analysis today 2026','silver market outlook today 2026','platinum palladium spread analysis','copper price supply demand 2026','oil crude WTI Brent analysis today','natural gas market winter outlook','agricultural commodity grain prices','lithium battery metals demand 2026','rare earth metals supply crisis 2026','iron ore steel market analysis 2026','aluminum market production outlook 2026','nickel market electric vehicle demand','uranium nuclear energy renaissance 2026','gold ETF flows investment demand','central bank gold reserves 2026','gold mining production costs 2026','precious metals inflation hedge 2026','commodity futures positioning CFTC','energy commodity geopolitical risk','food security commodity markets 2026','water scarcity commodity investment','carbon credit market price 2026','shipping rates Baltic Dry Index','freight container market analysis 2026','commodity supercycle thesis 2026','OPEC production cut impact oil','LNG market global trade flows','base metals China demand 2026','gold silver ratio tactical trade','commodity dollar correlation 2026'] },
  'trust-score':        { id:'6ae7e692-bce9-489d-b835-87dcba9ffc47', name:'Verivex Trust', shortName:'Verivex', author:'Nathan Chen', domain:'verivex.co', topics:['broker regulation compliance update 2026','FCA regulatory action broker 2026','SEC enforcement action broker 2026','ASIC regulated broker review 2026','CySEC offshore broker warning 2026','broker withdrawal problem complaint','trading platform security review 2026','CFD broker leverage regulation 2026','forex broker spread comparison 2026','binary options scam warning 2026','clone firm fraud alert 2026','broker insolvency client money 2026','negative balance protection review','trading platform downtime issues 2026','broker customer service review 2026','prop trading firm review 2026','social trading platform safety 2026','copy trading risk analysis 2026','ESMA product intervention update 2026','MiFID II compliance broker 2026','CFTC NFA regulated broker USA','FINRA broker dealer review 2026','offshore broker jurisdiction risks','broker financial statements review','segregated client funds safety 2026','trading app mobile security 2026','robo-advisor regulation review 2026','cryptocurrency exchange safety 2026','DeFi protocol risk assessment 2026','broker acquisition merger impact 2026'] },
  'invest-data':        { id:'1cd6688f-bec9-4d1b-a024-80952bf31a21', name:'InvexHuby', shortName:'InvexHuby', author:'Michael Torres', domain:'invexhuby.com', topics:['investment portfolio strategies 2026','hedge fund performance analysis today','ETF market outlook today 2026','stock market valuation metrics 2026','private equity deal flow 2026','venture capital trends analysis 2026','fixed income bond market analysis','alternative investment strategies 2026','quantitative trading signals today','asset allocation framework 2026','IPO market outlook today 2026','factor investing analysis 2026','risk-adjusted returns portfolio 2026','emerging market investment 2026','dividend growth investing today','options trading strategies advanced 2026','convertible bond arbitrage strategy 2026','ESG investment performance 2026','macro investment themes 2026','real estate investment trusts REIT 2026','multi-asset portfolio construction','market volatility investment strategy','global fund flows analysis 2026','investment grade credit markets 2026','small cap stock opportunities 2026','thematic investing trends 2026','wealth management strategies 2026','financial markets morning briefing','capital markets intelligence today','investment banking deal activity 2026'] },
  'market-radar':       { id:'27fdf1e6-8c0c-4591-ae9b-5a2c5cacee22', name:'Signalixx', shortName:'Signalixx', author:'Jordan Blake', domain:'signalixx.com', topics:['technical analysis market signals today','RSI momentum indicators analysis 2026','moving average crossover signals today','options market implied volatility 2026','put call ratio sentiment analysis','chart pattern analysis 2026 today','algorithmic trading signals today','market breadth indicators analysis','fibonacci retracement levels 2026','volume profile trading analysis 2026','market microstructure analysis 2026','Bollinger bands signal analysis today','MACD divergence signals today 2026','support resistance levels forex 2026','trend following signals 2026 today','derivatives market signals analysis','dark pool trading activity 2026','institutional order flow analysis','price action trading patterns 2026','market correlation analysis 2026','seasonal market patterns analysis 2026','volatility surface analysis options','intermarket analysis signals 2026','commitment of traders analysis 2026','Elliott wave market analysis today','Wyckoff method market stages 2026','market regime detection signals','high frequency trading market impact','liquidity analysis market depth 2026','gamma exposure market signals 2026'] },
  'executive-network':  { id:'64a6087d-480f-4040-9df1-ad020faf5796', name:'ExecVex', shortName:'ExecVex', author:'Alexander Ross', domain:'execvex.com', topics:['CEO succession planning strategy 2026','private equity buyout market deals 2026','mergers acquisitions deal analysis today','venture capital funding series A B 2026','board governance best practices 2026','CFO chief financial officer strategy 2026','IPO market outlook timing 2026','corporate restructuring turnaround 2026','executive compensation benchmarks 2026','activist investor campaign analysis 2026','ESG board accountability 2026','digital transformation CEO agenda 2026','supply chain resilience C-suite 2026','talent retention executive leadership 2026','AI strategy boardroom agenda 2026','cross-border M&A regulatory scrutiny 2026','CEO board succession planning 2026','private credit direct lending 2026','family office investment strategy 2026','hedge fund manager profile 2026','real estate private equity 2026','sovereign wealth fund allocation 2026','infrastructure investment deal flow 2026','secondary market private equity 2026','growth equity investment thesis 2026','management buyout financing structure 2026','due diligence best practices M&A','post-merger integration success 2026','deal sourcing network strategy 2026','exit strategy PE portfolio 2026'] },
  'crypto-hub':         { id:'f54ac054-3574-482c-a3f3-97037b45c759', name:'CryptoXos', shortName:'CryptoXos', author:'Alex Rivera', domain:'cryptoxos.com', topics:['bitcoin price analysis today 2026','ethereum network upgrade analysis 2026','DeFi protocol total value locked 2026','cryptocurrency institutional adoption 2026','bitcoin ETF flows analysis today','altcoin season market analysis 2026','stablecoin market cap analysis 2026','crypto regulation SEC CFTC 2026','blockchain technology enterprise adoption','NFT market recovery 2026 analysis','crypto exchange volume analysis today','Layer 2 scaling solution comparison 2026','Web3 gaming metaverse tokens 2026','crypto venture capital funding 2026','bitcoin mining hashrate profitability','ethereum staking yield analysis 2026','cross-chain bridge security 2026','crypto derivatives options market 2026','CBDC central bank digital currency 2026','tokenization real world assets 2026','crypto market sentiment analysis today','Solana ecosystem development 2026','Avalanche Polygon network growth 2026','decentralized exchange DEX volume 2026','crypto tax regulation compliance 2026','AI crypto token market analysis 2026','meme coin speculation analysis 2026','crypto whale wallet movement 2026','bitcoin halving aftermath analysis 2026','crypto portfolio strategy 2026'] },
}

// Author pools per portal — rotated randomly so each article has a different byline
const PORTAL_AUTHORS: Record<string, string[]> = {
  'global-trade-wire': [
    'James Hart', 'Sarah Brennan', 'Michael Osei', 'Elena Vasquez', 'Tom Whitfield',
    'Priya Nair', 'David Kowalski', 'Amara Okonkwo', 'Chris Flanagan', 'Leila Ahmadi',
  ],
  'finance-terminal': [
    'Marcus Webb', 'Julia Hartmann', 'Ryan Chen', 'Fatima Al-Rashid', 'Ben Stafford',
    'Sophie Leclerc', 'Omar Farouk', 'Natalie Pearce', 'Alex Drummond', 'Ingrid Svensson',
  ],
  'business-pulse': [
    'Daniel Sterling', 'Rachel Kim', 'Patrick Obrien', 'Aisha Mensah', 'Luke Thornton',
    'Chloe Martínez', 'Sam Okafor', 'Hannah Fischer', 'Jack Brennan', 'Zara Ahmed',
  ],
  'gold-markets-today': [
    'Richard Stone', 'Victoria Chen', 'Paul Nakamura', 'Clara Russo', 'Oliver Grant',
    'Mei Lin', 'Stefan Müller', 'Isabella Rossi', 'Noah Clarke', 'Adaora Eze',
  ],
  'trust-score': [
    'Nathan Chen', 'Emma Morrison', 'David Osei', 'Layla Hassan', 'George Patel',
    'Anastasia Volkov', 'Marcus Johnson', 'Freya Andersen', 'Carlos Rivera', 'Yuki Tanaka',
  ],
  'invest-data': [
    'Michael Torres', 'Sarah Kim', 'James Blackwood', 'Priya Sharma', 'Alex Morgan',
    'Claudia Becker', 'Ben Adeyemi', 'Nina Kowalska', 'Tom Harrington', 'Sana Sheikh',
  ],
  'market-radar': [
    'Jordan Blake', 'Petra Fischer', 'Callum MacLeod', 'Diana Ivanova', 'Ravi Kumar',
    'Scarlett Thompson', 'Felix Weber', 'Amira El-Sayed', 'Chris Vaughan', 'Lena Johansson',
  ],
  'executive-network': [
    'Alexander Ross', 'Caroline Hughes', 'William Park', 'Nadia Osman', 'Henry Stafford',
    'Isabelle Morel', 'David Kamau', 'Emma Lindqvist', 'Marcus Reid', 'Jasmine Patel',
  ],
  'crypto-hub': [
    'Alex Rivera', 'Sam Walsh', 'Mia Nakamura', 'Ethan Blake', 'Zoe Patel',
    'Connor Murphy', 'Ava Chen', 'Leo Santos', 'Iris Bergström', 'Max Okonkwo',
  ],
}

function getAuthor(siteSlug: string): string {
  const pool = PORTAL_AUTHORS[siteSlug] || ['Editorial Team']
  return pool[Math.floor(Math.random() * pool.length)]
}

function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

// ─── Natural cross-portal linking (editorial, not PBN) ─────────────────────
// Rules: max 1 link per article, topically related, ~35% of articles,
// contextual anchor text, never all-to-one, never footer/sidebar injection

// ─── Unique editorial voice per portal ─────────────────────────────────────
const SITE_PERSONA: Record<string, string> = {
  'global-trade-wire':  'Wire-style Reuters/AP brevity. Facts first. Short punchy sentences. Focus on data, volumes, deal flows, shipping tonnage, regulatory filings.',
  'finance-terminal':   'Bloomberg Terminal style. Data-heavy with exact figures upfront. Rate differentials, yield spreads, basis points, DXY readings.',
  'business-pulse':     'Forbes editorial voice. CEO-perspective. Strategy implications for corporate leaders. Focus on earnings impact and sector positioning.',
  'gold-markets-today': 'Commodity desk style. Price drivers, supply/demand fundamentals, futures positioning. CFTC data references. Physical vs paper markets.',
  'trust-score':        'Consumer-protection watchdog tone. Sceptical of industry claims. Regulatory action focus. Practical investor safety implications.',
  'invest-data':        'Institutional buy-side perspective. Portfolio construction angle. Factor analysis, risk-adjusted returns, Sharpe ratios, allocation implications.',
  'market-radar':       'Quantitative trader voice. Technical signals, indicator readings, specific price levels, pattern names, RSI/MACD readings.',
  'executive-network':  'Headhunter/boardroom insider perspective. Leadership implications, succession dynamics, deal motivations from CEO viewpoint.',
  'crypto-hub':         'On-chain analyst voice. Wallet data, protocol metrics, TVL figures, developer activity. Specific token economics and DeFi yields.',
}

// Journalistic angles — rotated per article to prevent structural repetition
const ANGLES = [
  'Lead with a specific data point or statistic that challenges conventional wisdom.',
  'Frame through the lens of risk — what could go wrong and who is exposed.',
  'Take a historical comparison angle — how does this compare to 5 or 10 years ago.',
  'Focus on winners and losers — who benefits, who loses from this development.',
  'Lead with the regulatory or policy implication of this trend.',
  'Investor action angle — what does this mean for portfolio allocation decisions.',
  'Geographic lens — how this plays out differently across regions.',
  'Structural shift angle — is this a temporary blip or a long-term inflection point.',
]

const PORTAL_LINKS: Record<string, { domain: string; name: string; topics: string[] }[]> = {
  'global-trade-wire': [
    { domain: 'finvexx.com', name: 'Finvexx Markets', topics: ['currency', 'forex', 'rate', 'bank', 'credit'] },
    { domain: 'aurexhq.com', name: 'AurexHQ', topics: ['commodity', 'gold', 'oil', 'copper', 'freight'] },
  ],
  'finance-terminal': [
    { domain: 'nex-wire.com', name: 'Nex-Wire', topics: ['trade', 'supply chain', 'export', 'import'] },
    { domain: 'invexhuby.com', name: 'InvexHuby', topics: ['invest', 'portfolio', 'equity', 'etf'] },
    { domain: 'signalixx.com', name: 'Signalixx', topics: ['signal', 'technical', 'chart', 'indicator'] },
  ],
  'business-pulse': [
    { domain: 'execvex.com', name: 'ExecVex', topics: ['executive', 'ceo', 'board', 'M&A', 'deal'] },
    { domain: 'invexhuby.com', name: 'InvexHuby', topics: ['invest', 'private equity', 'venture'] },
  ],
  'gold-markets-today': [
    { domain: 'finvexx.com', name: 'Finvexx Markets', topics: ['rate', 'inflation', 'dollar', 'fed'] },
    { domain: 'nex-wire.com', name: 'Nex-Wire', topics: ['shipping', 'freight', 'trade'] },
  ],
  'trust-score': [
    { domain: 'finvexx.com', name: 'Finvexx Markets', topics: ['broker', 'trading', 'platform', 'forex'] },
    { domain: 'signalixx.com', name: 'Signalixx', topics: ['signal', 'technical', 'analysis'] },
  ],
  'invest-data': [
    { domain: 'finvexx.com', name: 'Finvexx Markets', topics: ['market', 'equity', 'bond', 'rate'] },
    { domain: 'bizplezx.com', name: 'Bizplezx Executive', topics: ['business', 'corporate', 'strategy'] },
    { domain: 'cryptoxos.com', name: 'CryptoXos', topics: ['crypto', 'bitcoin', 'digital asset', 'blockchain'] },
  ],
  'market-radar': [
    { domain: 'finvexx.com', name: 'Finvexx Markets', topics: ['market', 'equity', 'index', 'forex'] },
    { domain: 'invexhuby.com', name: 'InvexHuby', topics: ['portfolio', 'invest', 'fund'] },
  ],
  'executive-network': [
    { domain: 'bizplezx.com', name: 'Bizplezx Executive', topics: ['business', 'corporate', 'strategy'] },
    { domain: 'invexhuby.com', name: 'InvexHuby', topics: ['private equity', 'venture', 'fund'] },
    { domain: 'nex-wire.com', name: 'Nex-Wire', topics: ['trade', 'supply chain', 'cross-border'] },
  ],
  'crypto-hub': [
    { domain: 'finvexx.com', name: 'Finvexx Markets', topics: ['market', 'rate', 'regulation', 'etf'] },
    { domain: 'invexhuby.com', name: 'InvexHuby', topics: ['invest', 'portfolio', 'institutional'] },
    { domain: 'signalixx.com', name: 'Signalixx', topics: ['signal', 'technical', 'chart'] },
  ],
}

// Contextual link templates — inserted naturally in article body
const LINK_TEMPLATES = [
  (domain: string, name: string) => `<a href="https://${domain}" rel="noopener" target="_blank">${name}</a> analysts have noted similar trends in recent coverage`,
  (domain: string, name: string) => `data tracked by <a href="https://${domain}" rel="noopener" target="_blank">${name}</a> corroborates this outlook`,
  (domain: string, name: string) => `according to analysis published on <a href="https://${domain}" rel="noopener" target="_blank">${name}</a>`,
  (domain: string, name: string) => `as reported by <a href="https://${domain}" rel="noopener" target="_blank">${name}</a>`,
  (domain: string, name: string) => `consistent with findings from <a href="https://${domain}" rel="noopener" target="_blank">${name}</a>`,
]

function getCrossLink(siteSlug: string, topic: string, articleIndex: number): string {
  // Only ~35% of articles get a cross-link (not every article — avoids pattern detection)
  if (articleIndex % 3 !== 1) return ''
  
  const portals = PORTAL_LINKS[siteSlug]
  if (!portals) return ''
  
  // Find topically relevant portal
  const relevant = portals.find(p =>
    p.topics.some(t => topic.toLowerCase().includes(t.toLowerCase()))
  )
  if (!relevant) return ''
  
  // Pick a random template
  const template = LINK_TEMPLATES[articleIndex % LINK_TEMPLATES.length]
  return template(relevant.domain, relevant.name)
}


async function writeArticle(site: any, topic: string, brandNote: string) {
  const ANTHROPIC = process.env.ANTHROPIC_API_KEY!
  const today = new Date().toISOString().split('T')[0]
  const isBrandArticle = brandNote.trim().length > 0
  const persona = SITE_PERSONA[site.slug] || 'Authoritative financial journalist. Factual, data-driven.'
  const angle   = ANGLES[Math.floor(Math.random() * ANGLES.length)]
  const uniqueId = Date.now().toString(36) // prevents cached/repeated outputs

  const prompt = `You are a senior financial journalist at ${site.name}. Write a news article. Today: ${today}. ID:${uniqueId}

EDITORIAL VOICE FOR ${site.name}: ${persona}
ANGLE FOR THIS ARTICLE: ${angle}
CRITICAL: This article MUST be written from the specific perspective and angle above. Do not use generic financial news language.

TOPIC: ${topic}
${brandNote}
${!isBrandArticle ? 'IMPORTANT: Write purely editorial financial news. Do NOT name any specific broker, trading platform or financial services firm. Write about market dynamics, policy, trends only.' : ''}

SEO + AI ENGINE REQUIREMENTS (critical — follow exactly):
- Title: 6-12 words, front-load primary keyword, avoid clickbait
- Excerpt: one factual sentence under 155 chars with primary keyword early
- Length: 700-900 words
- Structure: H2 every 150-200 words, use H3 for sub-points
- MOBILE-FIRST PARAGRAPHS: max 3-4 sentences per <p> tag — short paragraphs are essential for mobile readability
- MOBILE HEADINGS: H2 every 150-200 words acts as a visual anchor on small screens — make them descriptive
- Include at least 2 specific data points, percentages or figures (can be realistic estimates)
- Include a "Key Takeaways" section with 3 bullet points (use <ul><li> tags)
- Include a "Frequently Asked Questions" section at end with 2-3 Q&A pairs using <h3>Q: ...</h3><p>A: ...</p>
- Write declarative, factual statements — avoid "may", "might", "could" where possible
- Name specific entities: countries, organisations, institutions (not made-up, real ones)
- First paragraph: answer WHO WHAT WHEN WHERE directly (inverted pyramid style) — max 3 sentences for mobile scanning

Body HTML format:
<p>Lead paragraph — inverted pyramid, key facts first.</p>
<h2>Section Title</h2>
<p>Body paragraph with specific data point.</p>
<p>Body paragraph with expert context.</p>
<h2>Section Title</h2>
<p>Body paragraph.</p>
<h2>Key Takeaways</h2>
<ul><li>First key fact or implication</li><li>Second key fact</li><li>Third actionable insight</li></ul>
<h2>Frequently Asked Questions</h2>
<h3>Q: [Common question about this topic]</h3>
<p>A: [Direct, factual answer in 2-3 sentences]</p>
<h3>Q: [Second common question]</h3>
<p>A: [Direct, factual answer]</p>

Return ONLY valid JSON, no markdown fences:
{"title":"Headline here","excerpt":"One factual sentence under 155 chars","body":"<p>...</p>...","category":"Markets","tags":["tag1","tag2","tag3","tag4","tag5"]}`

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          messages: [
            { role: 'user', content: prompt },
            { role: 'assistant', content: '{"title":"' }
          ]
        }),
        signal: AbortSignal.timeout(60000),
      })
      if (!res.ok) { console.error(`Attempt ${attempt+1}: ${res.status}`); if (res.status===429||res.status>=500) continue; return null }
      const data = await res.json()
      const text = (data.content||[]).filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('')
      const clean = text.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim()
      // Try direct JSON parse first
      let parsed: any = null
      try {
        const raw = '{"title":"' + clean
        const end = raw.lastIndexOf('}')
        if (end !== -1) parsed = JSON.parse(raw.slice(0, end+1))
      } catch(_) {
        // Fallback: extract title and body via regex
        try {
          const fullText = '{"title":"' + clean
          const titleM = fullText.match(/"title"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/)
          const bodyM = fullText.match(/"body"\s*:\s*"((?:[^"\\]|\\.)*)"/)
          const catM = fullText.match(/"category"\s*:\s*"([^"]+)"/)
          const excM = fullText.match(/"excerpt"\s*:\s*"([^"]+)"/)
          if (titleM && bodyM) parsed = {
            title: titleM[1].replace(/\\"/g,'"').replace(/\\n/g,'\n').slice(0,200),
            body: bodyM[1].replace(/\\"/g,'"').replace(/\\n/g,'\n'),
            category: catM?.[1] || 'Markets',
            excerpt: excM?.[1] || titleM[1].slice(0,120),
          }
        } catch(_) {}
      }
      if (!parsed?.title || !parsed?.body) { console.error(`Parse fail attempt ${attempt+1}: ${clean.slice(0,60)}`); continue }
      // Convert plain text to HTML
      const rawBody = parsed.body as string
      const htmlBody = '<p>' + rawBody
        .replace(/\n\n(Market Impact|Expert Analysis|FAQ|Key Analysis|Analysis|Impact|Outlook|Background)\n\n?/gi, '</p><h2>$1</h2><p>')
        .replace(/\n\nQ: ([^\n]+?)\s+A: /g, '</p><h3>$1</h3><p>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, ' ')
        + '</p>'
        .replace(/<p><\/p>/g, '')
      return { ...parsed, body: htmlBody }
    } catch(e) { console.error(`Attempt ${attempt+1} error:`, (e as Error).message) }
  }
  return null
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteSlug = req.nextUrl.searchParams.get('site')
  const batch = parseInt(req.nextUrl.searchParams.get('batch') || '0')
  const site = CORE_SITES[siteSlug || '']
  if (!site) return NextResponse.json({ error: `Unknown site: ${siteSlug}` }, { status: 400 })

  const BATCH_SIZE = 10
  const batchStart = batch * BATCH_SIZE

  // TRUE 7% globalIndex — uses total historical count so brand spacing
  // is maintained across all batches and all days, not just within one batch
  const { count: historicalCount } = await getDb()
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('news_site_id', site.id)
    .eq('status', 'published')
  const today = new Date().toISOString().split('T')[0]
  let inserted = 0
  const skipped: string[] = []

  // Load all active clients from DB — multi-client support
  // Adding a new client to portal_clients = auto-included on next cron run
  const { data: activeClients } = await getDb()
    .from('portal_clients')
    .select('id, company_name, website_url, brand_slug')
    .eq('is_active', true)
  const clients = activeClients || []

  for (let i = 0; i < BATCH_SIZE; i++) {
    const topic = site.topics[batchStart + i]
    if (!topic) break
    const globalIndex = (historicalCount || 0) + i  // true rolling index across all history

    // Content mix: ~93% general news · ~5% brand mention · ~2% full client feature
    // Ultra-natural editorial rate — indistinguishable from organic coverage
    const isBrand        = globalIndex % 14 === 0 && clients.length > 0  // every 14th: client mention (~7%)
    const isClientFeature = globalIndex % 42 === 0 && clients.length > 0  // every 42nd: full feature (~2%)
    const crossLink = getCrossLink(site.slug, topic, i)

    let brandNote = ''
    let featuredClient: any = null

    if (isClientFeature) {
      // Full dedicated feature article about the client — 800-1000 words
      featuredClient = clients[Math.floor(globalIndex / 9) % clients.length]
      const clientName = featuredClient.company_name
      const clientUrl  = (featuredClient.website_url || `https://${featuredClient.brand_slug}.com`).replace(/\/$/, '')
      brandNote = `

FULL CLIENT FEATURE (this is a dedicated sponsored feature article — mandatory):
Write a full editorial profile/review of ${clientName} as the PRIMARY subject of the entire article.
This is NOT a mention — ${clientName} is the MAIN topic from headline to conclusion.

Required structure:
- Title: Must include "${clientName}" prominently (e.g. "${clientName} Review 2026: ...", "Inside ${clientName}: ...", "How ${clientName} Is ...")
- Lead paragraph: Introduce ${clientName}, what they do, who they serve
- Section 1: Their core offering and value proposition
- Section 2: Key features, tools, or services they provide to clients
- Section 3: Market position, who they compete with, why traders/investors choose them
- Section 4: Regulatory standing, security, trust factors
- Conclusion: Forward-looking statement about their trajectory
- Throughout: Use this EXACT HTML link wherever name appears: <a href="${clientUrl}" rel="noopener noreferrer">${clientName}</a>
- Minimum 3 links to their site, all with rel="noopener noreferrer"
- Tone: authoritative editorial, not promotional — write like a journalist profiling a company`
    } else if (isBrand) {
      // Standard brand mention — one natural link mid-article
      featuredClient = clients[Math.floor(globalIndex / 3) % clients.length]
      const clientName = featuredClient.company_name
      const clientUrl  = (featuredClient.website_url || `https://${featuredClient.brand_slug}.com`).replace(/\/$/, '')
      brandNote = `

BRAND INTEGRATION (mandatory): Include exactly one natural editorial reference to ${clientName} using this EXACT HTML link: <a href="${clientUrl}" rel="noopener noreferrer">${clientName}</a>

Place naturally mid-paragraph. Examples:
- "platforms like <a href="${clientUrl}" rel="noopener noreferrer">${clientName}</a> have seen rising activity"
- "as tracked by <a href="${clientUrl}" rel="noopener noreferrer">${clientName}</a>'s data"
- "retail investors on <a href="${clientUrl}" rel="noopener noreferrer">${clientName}</a> have responded"
Never at article end. Never in FAQ section.`
    }

    if (crossLink) brandNote += `\n\nEDITORIAL CROSS-REFERENCE (natural, mid-paragraph): ${crossLink}`

    // Small random delay (0.5-2s) staggers publish timestamps without risking timeout
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1500))
    const article = await writeArticle(site, topic, brandNote)
    if (!article) { skipped.push(topic); await new Promise(r => setTimeout(r, 500)); continue }

    const slug = `${today}-${slugify(article.title)}`
    const { data: existing } = await getDb().from('news_articles').select('id').eq('slug', slug).single()
    if (existing) { skipped.push(`dup:${slug}`); continue }

    const { error } = await getDb().from('news_articles').insert({
      news_site_id: site.id,
      title: article.title,
      slug,
      excerpt: article.excerpt || '',
      body: article.body || '',
      category: article.category || 'Markets',
      tags: Array.isArray(article.tags) ? article.tags : [],
      author_name: getAuthor(siteSlug || ''),
      cover_image_url: getArticleImage(article.category || 'Markets', slug),
      status: 'published',
      published_at: new Date().toISOString(),
      is_featured: i === 0 && batch === 0,
      article_type: isClientFeature ? 'brand_feature' : isBrand ? 'brand_mention' : 'news',
      ai_generated: true,
      read_time_minutes: Math.ceil((article.body || '').split(' ').length / 200),
    })
    if (error) { console.error('Insert error:', error.message); continue }
    inserted++

    // portal_content only for brand articles (client-specific tracking)
    if (isBrand && featuredClient) {
      await getDb().from('portal_content').insert({
        client_id: featuredClient.id,
        portal_name: site.shortName || site.name,
        site_slug: siteSlug,
        title: article.title,
        article_url: `https://${site.domain}/article/${siteSlug}/${slug}`,
        content_type: 'article',
        status: 'live',
        backlink_value: 80,
        published_at: new Date().toISOString(),
      }).then(() => {}).catch(() => {})
    }

    await new Promise(r => setTimeout(r, 400))
  }

  return NextResponse.json({ site: siteSlug, batch, inserted, skipped: skipped.length })
}
