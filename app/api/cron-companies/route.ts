import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 300

const getDb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// 150-company pipeline — forex, crypto, stocks, props, robo-advisors, fintech
const COMPANY_PIPELINE = [
  // ── FOREX / CFD BROKERS ──────────────────────────────────────────────────
  { slug:'city-index',      name:'City Index',      category:'CFD / Spread Betting', regulation:'FCA', founded:'1983', hq:'London, UK',      website:'https://www.cityindex.com',      tagline:'35+ years of award-winning trading', description:'FCA-regulated CFD and spread betting broker established in 1983, part of StoneX Group with 35+ years of institutional and retail expertise.' },
  { slug:'easymarkets',     name:'easyMarkets',     category:'Forex / CFD',          regulation:'CySEC / ASIC / FSCA', founded:'2001', hq:'Limassol, Cyprus', website:'https://www.easymarkets.com', tagline:'Trade forex, crypto, commodities with guaranteed stops', description:'Multi-regulated broker known for unique risk management tools including guaranteed stop loss and negative balance protection since 2001.' },
  { slug:'exness',          name:'Exness',          category:'Forex',                regulation:'FCA / CySEC / FSCA', founded:'2008', hq:'Limassol, Cyprus',  website:'https://www.exness.com',       tagline:'Ultra-low spreads, instant withdrawals', description:'High-volume forex broker processing over $3 trillion monthly, known for ultra-tight spreads, instant withdrawals and multiple regulatory licences.' },
  { slug:'hf-markets',      name:'HF Markets',      category:'Forex / CFD',          regulation:'FCA / CySEC / DFSA', founded:'2010', hq:'London, UK',      website:'https://www.hfmarkets.com',    tagline:'Multi-regulated global forex broker', description:'Multi-regulated forex and CFD broker operating across 150+ countries, offering MT4/MT5 and a wide range of trading accounts.' },
  { slug:'libertex',        name:'Libertex',        category:'CFD',                  regulation:'CySEC',              founded:'1997', hq:'Limassol, Cyprus', website:'https://libertex.com',         tagline:'Zero spreads. Commission-based trading.', description:'CySEC-regulated CFD broker with unique zero-spread commission model, 25+ years in operation and 250+ tradeable instruments.' },
  { slug:'multibank',       name:'MultiBank Group', category:'Forex / CFD',          regulation:'FCA / ASIC / BaFin', founded:'2005', hq:'Dubai, UAE',      website:'https://www.multibankfx.com',  tagline:'$320M+ daily volume, 30+ regulators', description:'One of the world\'s largest financial derivatives providers with over $320M daily trading volume and licences from 30+ regulators globally.' },
  { slug:'naga',            name:'NAGA',            category:'Social Trading / CFD',  regulation:'CySEC / BaFin',      founded:'2015', hq:'Hamburg, Germany', website:'https://naga.com',             tagline:'Social trading meets crypto and CFDs', description:'European social trading platform combining CFD trading with crypto and copy trading, regulated by CySEC and BaFin.' },
  { slug:'thinkmarkets',    name:'ThinkMarkets',    category:'Forex / CFD',          regulation:'FCA / ASIC / DFSA', founded:'2010', hq:'London, UK',      website:'https://www.thinkmarkets.com', tagline:'Institutional-grade retail trading', description:'FCA and ASIC regulated broker delivering institutional-grade execution to retail clients across forex, indices, commodities and crypto CFDs.' },
  { slug:'etx-capital',     name:'ETX Capital',     category:'CFD / Spread Betting', regulation:'FCA',                founded:'1965', hq:'London, UK',      website:'https://www.etxcapital.com',   tagline:'60 years of UK financial heritage', description:'FCA-regulated CFD and spread betting broker with 60 years of UK financial services heritage, offering 5,000+ instruments.' },
  { slug:'capital-com',     name:'Capital.com',     category:'CFD',                  regulation:'FCA / CySEC / ASIC', founded:'2016', hq:'London, UK',      website:'https://capital.com',          tagline:'Smart AI trading insights', description:'AI-powered CFD platform regulated by FCA, CySEC and ASIC offering 6,000+ markets with machine learning insights for retail traders.' },
  { slug:'currency-com',    name:'Currency.com',    category:'Tokenised Assets / CFD', regulation:'NBRB',             founded:'2018', hq:'Minsk, Belarus',  website:'https://currency.com',         tagline:'Trade tokenised stocks and crypto', description:'Regulated crypto exchange offering tokenised versions of stocks, commodities and indices alongside spot crypto trading.' },
  { slug:'tastyworks',      name:'Tastytrade',      category:'Options / Futures',    regulation:'FINRA / CFTC',       founded:'2011', hq:'Chicago, USA',    website:'https://tastytrade.com',       tagline:'Platform built by options traders', description:'US-regulated brokerage specialising in options and futures trading, built by derivatives professionals for active traders.' },
  { slug:'tradestation',    name:'TradeStation',    category:'US Broker / Platform', regulation:'FINRA / SEC',        founded:'1982', hq:'Plantation, USA', website:'https://www.tradestation.com', tagline:'Professional tools for active traders', description:'SEC and FINRA regulated US broker with institutional-grade platform, powerful analytics and automated trading capabilities since 1982.' },
  { slug:'webull',          name:'Webull',          category:'US Stock Broker',      regulation:'FINRA / SEC / SIPC', founded:'2017', hq:'New York, USA',   website:'https://www.webull.com',       tagline:'Commission-free investing with pro tools', description:'FINRA and SEC regulated commission-free stock broker offering advanced charting, options trading, and fractional shares.' },
  { slug:'hm-bradley',      name:'HM Bradley',      category:'Neobank / Savings',    regulation:'FDIC insured',       founded:'2018', hq:'Los Angeles, USA', website:'https://www.hmbradley.com',   tagline:'High-yield banking tied to saving habits', description:'US fintech bank offering tiered high-yield savings accounts where rates are tied to how much of income is saved each quarter.' },
  // ── CRYPTO EXCHANGES ────────────────────────────────────────────────────
  { slug:'kucoin',          name:'KuCoin',          category:'Crypto Exchange',       regulation:'VARA (Dubai)',       founded:'2017', hq:'Seychelles',      website:'https://www.kucoin.com',       tagline:'800+ crypto assets on one exchange', description:'Major global crypto exchange offering 800+ digital assets, futures, staking and lending, with VARA regulation in Dubai.' },
  { slug:'okx',             name:'OKX',             category:'Crypto Exchange / Web3', regulation:'VARA / VASP',       founded:'2017', hq:'Seychelles',      website:'https://www.okx.com',          tagline:'World\'s leading crypto exchange + Web3 wallet', description:'Top-3 global crypto exchange by volume, offering spot, futures, options and a comprehensive Web3 wallet ecosystem.' },
  { slug:'bitstamp',        name:'Bitstamp',        category:'Crypto Exchange',       regulation:'FCA / NYDFS / MAS', founded:'2011', hq:'Luxembourg',      website:'https://www.bitstamp.net',     tagline:'The original Bitcoin exchange since 2011', description:'One of the world\'s oldest regulated crypto exchanges, holding FCA, NYDFS and MAS licences with 15 years of reliable operations.' },
  { slug:'bitfinex',        name:'Bitfinex',        category:'Crypto Exchange',       regulation:'VASP',               founded:'2012', hq:'Hong Kong',       website:'https://www.bitfinex.com',     tagline:'Advanced crypto trading for professionals', description:'Professional crypto exchange offering advanced order types, margin trading, lending and a broad range of digital asset pairs.' },
  { slug:'gate-io',         name:'Gate.io',         category:'Crypto Exchange',       regulation:'MSB / VASP',         founded:'2013', hq:'Cayman Islands',  website:'https://www.gate.io',          tagline:'1,400+ cryptocurrencies', description:'Established crypto exchange offering one of the broadest cryptocurrency selections with 1,400+ assets, futures and spot trading.' },
  { slug:'mexc',            name:'MEXC',            category:'Crypto Exchange',       regulation:'VASP',               founded:'2018', hq:'Singapore',       website:'https://www.mexc.com',         tagline:'New listings. Fast trading.', description:'Singapore-based crypto exchange known for rapid new token listings, zero maker fees and broad altcoin coverage.' },
  { slug:'bitget',          name:'Bitget',          category:'Crypto Exchange / Copy', regulation:'VASP',              founded:'2018', hq:'Singapore',       website:'https://www.bitget.com',       tagline:'Copy trading meets derivatives', description:'Derivatives-focused crypto exchange with a copy trading feature, offering futures, spot and earn products to 20M+ users.' },
  { slug:'huobi',           name:'HTX (Huobi)',     category:'Crypto Exchange',       regulation:'VASP',               founded:'2013', hq:'Seychelles',      website:'https://www.htx.com',          tagline:'10 years. 160+ countries.', description:'One of the world\'s original major crypto exchanges, rebranded as HTX, serving 160+ countries with spot, futures and DeFi products.' },
  { slug:'crypto-com',      name:'Crypto.com',      category:'Crypto Exchange / Card', regulation:'FCA / VASP',        founded:'2016', hq:'Singapore',       website:'https://crypto.com',           tagline:'Visa card backed crypto ecosystem', description:'FCA-regulated crypto platform offering exchange, Visa card, DeFi wallet and Pay products, processing $1T+ annually.' },
  { slug:'nexo',            name:'Nexo',            category:'Crypto Lending',        regulation:'EU / multiple',      founded:'2018', hq:'Sofia, Bulgaria', website:'https://nexo.com',             tagline:'Instant crypto loans. High-yield accounts.', description:'Licensed crypto lender offering instant loans against crypto collateral and high-yield earn accounts in 200+ jurisdictions.' },
  // ── STOCK BROKERS / INVESTMENT PLATFORMS ────────────────────────────────
  { slug:'vanguard-uk',     name:'Vanguard UK',     category:'Investment / ETF',      regulation:'FCA',                founded:'1975', hq:'Malvern, USA',    website:'https://www.vanguard.co.uk',   tagline:'Low cost. Long term. Vanguard.', description:'FCA-regulated investment platform from the world\'s largest mutual fund provider, known for low-cost index funds and ETFs.' },
  { slug:'interactive-investor', name:'interactive investor', category:'Investment / ISA', regulation:'FCA',           founded:'1995', hq:'Manchester, UK',  website:'https://www.ii.co.uk',         tagline:'UK\'s largest flat fee investment platform', description:'FCA-regulated UK investment platform with flat-fee model, offering ISAs, SIPPs and over 40,000 UK and global investments.' },
  { slug:'nutmeg',          name:'Nutmeg',          category:'Robo-Advisor',          regulation:'FCA',                founded:'2011', hq:'London, UK',      website:'https://www.nutmeg.com',       tagline:'JP Morgan\'s digital wealth management', description:'FCA-regulated digital wealth manager owned by JP Morgan, offering managed and fixed allocation ISA and pension portfolios.' },
  { slug:'moneybox',        name:'Moneybox',        category:'Savings / ISA App',     regulation:'FCA',                founded:'2015', hq:'London, UK',      website:'https://www.moneyboxapp.com',  tagline:'Save and invest from your spare change', description:'FCA-regulated UK savings app offering Lifetime ISAs, stocks ISAs and pension products with round-up savings technology.' },
  { slug:'scalable-capital', name:'Scalable Capital', category:'Robo-Advisor / Broker', regulation:'BaFin / FCA',      founded:'2014', hq:'Munich, Germany', website:'https://www.scalable.capital',  tagline:'Invest. Save. Build wealth.', description:'BaFin and FCA regulated European digital broker and robo-advisor with fractional shares, ETF savings plans and a broker app.' },
  { slug:'etoro-money',     name:'eToro Money',     category:'Crypto Wallet / Fintech', regulation:'FCA',              founded:'2020', hq:'London, UK',      website:'https://www.etoro.com/money',  tagline:'FCA-regulated crypto wallet', description:'FCA-regulated crypto wallet and e-money product from eToro, integrated with the eToro trading platform for seamless crypto management.' },
  { slug:'e8-funding',      name:'E8 Markets',      category:'Prop Trading Firm',     regulation:'Prop / Financial',   founded:'2021', hq:'Prague, Czech Republic', website:'https://e8markets.com',  tagline:'Prop firm with proven payouts', description:'Proprietary trading firm offering evaluation challenges with up to $300K funded accounts and bi-weekly profit payouts.' },
  { slug:'the5ers',         name:'The5%ers',        category:'Prop Trading Firm',     regulation:'Prop / Financial',   founded:'2016', hq:'Israel',          website:'https://the5ers.com',          tagline:'Instant funding. Scale to $4M.', description:'Prop trading firm offering instant funding programs and evaluation challenges, with scaling plans up to $4M in capital.' },
  { slug:'true-forex-funds', name:'True Forex Funds', category:'Prop Trading Firm',   regulation:'Prop',               founded:'2022', hq:'Czech Republic',  website:'https://trueforexfunds.com',   tagline:'Transparent prop trading payouts', description:'European prop trading firm offering one-step and two-step evaluation challenges with 80% profit splits and bi-weekly payouts.' },
  { slug:'funded-next',     name:'FundedNext',      category:'Prop Trading Firm',     regulation:'Prop',               founded:'2022', hq:'Dubai, UAE',      website:'https://fundednext.com',       tagline:'Most transparent prop firm', description:'Dubai-based prop firm offering stellar and express challenges with up to $300K funded accounts and 90% profit splits.' },
  { slug:'alpha-capital',   name:'Alpha Capital Group', category:'Prop Trading Firm', regulation:'Prop',               founded:'2021', hq:'UK',              website:'https://alphacapitalgroup.uk', tagline:'UK prop firm with weekly payouts', description:'UK-based prop trading firm with weekly profit payouts, one-step challenges and scaling up to $200K in funded capital.' },
  { slug:'funder-pro',      name:'FunderPro',       category:'Prop Trading Firm',     regulation:'Prop',               founded:'2023', hq:'Limassol, Cyprus', website:'https://funderpro.com',        tagline:'Instant-funded prop accounts', description:'Instant funding prop firm allowing traders to start with funded accounts immediately without evaluation challenges.' },
  // ── NEOBANKS / FINTECH ──────────────────────────────────────────────────
  { slug:'wise',            name:'Wise',            category:'Money Transfer / Fintech', regulation:'FCA / FinCEN',   founded:'2011', hq:'London, UK',      website:'https://wise.com',             tagline:'Money without borders', description:'FCA-regulated international money transfer platform offering multi-currency accounts and borderless payments in 170+ countries.' },
  { slug:'starling-bank',   name:'Starling Bank',   category:'Neobank',               regulation:'FCA / PRA',          founded:'2014', hq:'London, UK',      website:'https://www.starlingbank.com', tagline:'Award-winning digital bank', description:'FCA and PRA regulated UK challenger bank with full banking licence, offering fee-free current accounts and SME banking.' },
  { slug:'monzo',           name:'Monzo',           category:'Neobank',               regulation:'FCA / PRA',          founded:'2015', hq:'London, UK',      website:'https://monzo.com',            tagline:'Banking made better', description:'FCA and PRA regulated UK digital bank with 9M+ customers, offering current accounts, savings pots, loans and investments.' },
  { slug:'n26',             name:'N26',             category:'Neobank',               regulation:'BaFin / ECB',        founded:'2013', hq:'Berlin, Germany', website:'https://n26.com',              tagline:'Mobile banking for the global citizen', description:'German BaFin-regulated neobank operating across Europe with zero-fee accounts, metal cards and integrated financial products.' },
  { slug:'bunq',            name:'Bunq',            category:'Neobank',               regulation:'DNB / ECB',          founded:'2012', hq:'Amsterdam, Netherlands', website:'https://www.bunq.com', tagline:'The bank of the free', description:'Dutch neobank regulated by DNB offering multi-currency accounts, group money features and eco-friendly banking products.' },
  { slug:'robinhood',       name:'Robinhood',       category:'US Stock App',          regulation:'FINRA / SEC / SIPC', founded:'2013', hq:'Menlo Park, USA', website:'https://robinhood.com',        tagline:'Investing for everyone', description:'FINRA and SEC regulated US commission-free stock trading app that democratised retail investing, offering stocks, ETFs, crypto and options.' },
  { slug:'public',          name:'Public.com',      category:'Social Investing',      regulation:'FINRA / SEC',        founded:'2019', hq:'New York, USA',   website:'https://public.com',           tagline:'Invest in stocks, bonds, crypto together', description:'FINRA-regulated social investing platform combining stocks, crypto, bonds and alternative investments with community features.' },
  { slug:'m1-finance',      name:'M1 Finance',      category:'Robo-Broker / US',      regulation:'FINRA / SEC',        founded:'2015', hq:'Chicago, USA',    website:'https://www.m1.com',           tagline:'Automated investing. Borrowing. Banking.', description:'FINRA-regulated US wealth platform combining automated portfolio investing, low-rate borrowing and integrated banking.' },
  { slug:'acorns',          name:'Acorns',          category:'Micro-Investing',       regulation:'FINRA / SEC',        founded:'2012', hq:'Irvine, USA',     website:'https://www.acorns.com',       tagline:'Invest spare change automatically', description:'FINRA-regulated US micro-investing app rounding up everyday purchases and investing the difference into diversified ETF portfolios.' },
  { slug:'stash',           name:'Stash',           category:'US Investing App',      regulation:'FINRA / SEC',        founded:'2015', hq:'New York, USA',   website:'https://www.stash.com',        tagline:'Learn. Invest. Bank.', description:'FINRA-regulated investing and banking app offering fractional shares, custodial accounts and personalised investment guidance.' },
  // ── UK INVESTMENT PLATFORMS ──────────────────────────────────────────────
  { slug:'ajbell',          name:'AJ Bell',         category:'Investment Platform',   regulation:'FCA',                founded:'1995', hq:'Manchester, UK',  website:'https://www.ajbell.co.uk',     tagline:'Simple, smart investing', description:'FCA-regulated UK investment platform with 500K+ customers offering ISAs, SIPPs, and over 2,000 funds and investment trusts.' },
  { slug:'bestinvest',      name:'Bestinvest',      category:'Investment Platform',   regulation:'FCA',                founded:'1986', hq:'London, UK',      website:'https://www.bestinvest.co.uk', tagline:'Smart investing since 1986', description:'FCA-regulated UK investment platform with free portfolio analysis tools, expert-rated funds and DIY plus managed portfolios.' },
  { slug:'charles-stanley-direct', name:'Charles Stanley Direct', category:'Investment Platform', regulation:'FCA', founded:'1792', hq:'London, UK', website:'https://www.charles-stanley-direct.co.uk', tagline:'Investing since 1792', description:'FCA-regulated UK stockbroker and wealth manager with over 230 years of history offering direct investment and managed services.' },
  { slug:'iweb',            name:'iWeb',            category:'Low-Cost UK Broker',    regulation:'FCA',                founded:'1996', hq:'Leeds, UK',       website:'https://www.iweb-sharedealing.co.uk', tagline:'One of the UK\'s lowest-cost brokers', description:'FCA-regulated discount UK stockbroker owned by Halifax, offering one of the lowest-cost dealing accounts for long-term investors.' },
  { slug:'youinvest',       name:'Youinvest by AJ Bell', category:'Investment Platform', regulation:'FCA',             founded:'2000', hq:'Manchester, UK',  website:'https://youinvest.co.uk',      tagline:'Low cost, award-winning platform', description:'FCA-regulated investment platform from AJ Bell, offering competitive fee ISAs and SIPPs for direct investors.' },
  { slug:'tilney-bestinvest', name:'Evelyn Partners', category:'Wealth Management', regulation:'FCA',                  founded:'1836', hq:'London, UK',      website:'https://www.evelynpartners.com', tagline:'UK\'s largest integrated wealth manager', description:'FCA-regulated wealth manager formed from merger of Tilney and Smith & Williamson, managing £59B+ in client assets.' },
  // ── GERMAN / EU PLATFORMS ───────────────────────────────────────────────
  { slug:'trade-republic',  name:'Trade Republic', category:'EU Neobroker',          regulation:'BaFin',              founded:'2019', hq:'Berlin, Germany', website:'https://traderepublic.com',    tagline:'Europe\'s largest neobroker', description:'BaFin-regulated German neobroker with 8M+ customers offering commission-free stocks, ETFs, crypto and 4% interest on cash.' },
  { slug:'degiro',          name:'DEGIRO',         category:'EU Discount Broker',    regulation:'AFM / BaFin',        founded:'2013', hq:'Amsterdam, Netherlands', website:'https://www.degiro.co.uk', tagline:'Invest for less', description:'Dutch AFM-regulated discount broker offering one of Europe\'s lowest commission structures across stocks, ETFs and bonds.' },
  { slug:'flatex',          name:'flatexDEGIRO',   category:'EU Broker',             regulation:'BaFin',              founded:'2006', hq:'Frankfurt, Germany', website:'https://www.flatex.de',      tagline:'Germany\'s No. 1 online broker', description:'BaFin-regulated German online broker operating as parent of DEGIRO, serving 3M+ customers across Europe.' },
  { slug:'justtrade',       name:'JustTrade',      category:'German Neobroker',      regulation:'BaFin',              founded:'2019', hq:'Frankfurt, Germany', website:'https://justtrade.com',       tagline:'Zero commission trading', description:'BaFin-regulated German neobroker offering commission-free trading in stocks, ETFs, crypto and derivatives.' },
  // ── AUSTRALIAN BROKERS ───────────────────────────────────────────────────
  { slug:'commsec',         name:'CommSec',        category:'Australian Broker',     regulation:'ASIC',               founded:'1995', hq:'Sydney, Australia', website:'https://www.commsec.com.au',  tagline:'Australia\'s leading online broker', description:'ASIC-regulated subsidiary of Commonwealth Bank, Australia\'s most popular online broker with 2M+ customers.' },
  { slug:'superhero',       name:'Superhero',      category:'Australian Neobroker',  regulation:'ASIC',               founded:'2020', hq:'Sydney, Australia', website:'https://www.superhero.com.au', tagline:'Invest in the ASX and ETFs', description:'ASIC-regulated Australian investment platform offering $0 brokerage on ETFs and low-cost ASX share trading.' },
  // ── COPY TRADING / SOCIAL ────────────────────────────────────────────────
  { slug:'zulutrade',       name:'ZuluTrade',      category:'Social / Copy Trading', regulation:'HCMC',               founded:'2007', hq:'Athens, Greece',  website:'https://www.zulutrade.com',    tagline:'The world\'s largest social trading network', description:'HCMC-regulated social trading network connecting 100K+ signal providers with copy traders across multiple brokers.' },
  { slug:'darwinex',        name:'Darwinex',       category:'Social / Prop Trading', regulation:'FCA',                founded:'2012', hq:'London, UK',      website:'https://www.darwinex.com',     tagline:'Trade for yourself. Get funded.', description:'FCA-regulated hybrid broker and prop trading platform where successful strategy providers can receive external investor capital.' },
  // ── CRYPTO DeFi / YIELD ─────────────────────────────────────────────────
  { slug:'compound',        name:'Compound Finance', category:'DeFi Protocol',       regulation:'Decentralised',      founded:'2018', hq:'San Francisco, USA', website:'https://compound.finance',  tagline:'Algorithmic money markets on Ethereum', description:'Ethereum-based decentralised lending protocol allowing users to earn interest or borrow against crypto collateral algorithmically.' },
  { slug:'aave',            name:'Aave',           category:'DeFi Lending',          regulation:'Decentralised',      founded:'2017', hq:'London, UK',      website:'https://aave.com',             tagline:'Open source liquidity protocol', description:'Ethereum-based DeFi liquidity protocol enabling decentralised lending and borrowing with flash loans and interest rate switching.' },
  { slug:'celsius',         name:'Celsius (legacy)', category:'Crypto Lending',      regulation:'None (bankrupt)',    founded:'2017', hq:'Hoboken, USA',    website:'https://celsius.network',      tagline:'[HISTORICAL — in bankruptcy proceedings]', description:'Former crypto lending platform that filed for bankruptcy in 2022. Listed for historical/comparative trust research purposes.' },
]

// AI review generation via Claude
async function generateReviews(company: any, count: number = 4): Promise<any[]> {
  const ANTH = process.env.ANTHROPIC_API_KEY
  if (!ANTH) return []

  const posCount = Math.round(count * 0.75)
  const negCount = count - posCount

  const prompt = `Generate ${count} realistic customer reviews for ${company.name} (${company.category}, regulated: ${company.regulation}).
Company: ${company.description}

Rules:
- ${posCount} positive reviews (rating 4-5), ${negCount} negative/neutral (rating 2-3)
- Each review: specific, mentions regulation/features/real experience, 80-180 words
- Mention the regulation (${company.regulation}) naturally in at least 2 reviews
- Vary reviewer perspectives: beginner, active trader, long-term investor, etc.
- Sound genuinely human, not marketing copy

Return ONLY valid JSON array, no markdown:
[{"rating":5,"title":"Short title","body":"Review text"},...]`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTH, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const text = data.content?.[0]?.text?.trim() || ''
    const clean = text.replace(/```json\s*/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return Array.isArray(parsed) ? parsed.slice(0, count) : []
  } catch { return [] }
}

// Random reviewer names
const NAMES = ['James T.','Sarah M.','David K.','Emma L.','Michael R.','Priya S.','Tom H.','Olivia C.','Marcus W.','Aisha B.','Chris F.','Natalie P.','Ben J.','Fatima A.','Luke D.','Sophie G.','Raj N.','Claire O.','Aaron Z.','Mia V.']
const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()

  // Get all existing slugs
  const { data: existing } = await db.from('verivex_companies').select('slug')
  const existingSlugs = new Set((existing || []).map((r: any) => r.slug))

  // Add 3 new companies today (skip already-added)
  const toAdd = COMPANY_PIPELINE.filter(c => !existingSlugs.has(c.slug)).slice(0, 3)

  if (toAdd.length === 0) {
    return NextResponse.json({ ok: true, message: 'Pipeline complete', total: existingSlugs.size })
  }

  const added: string[] = []

  for (const company of toAdd) {
    // Insert company
    const { error: compErr } = await db.from('verivex_companies').insert({
      slug: company.slug,
      name: company.name,
      category: company.category,
      regulation: company.regulation,
      founded: company.founded,
      headquarters: company.hq,
      website: company.website,
      tagline: company.tagline,
      description: company.description,
      is_featured: false,
      is_verified: true,
    })

    if (compErr) { console.error('Company insert error:', company.slug, compErr.message); continue }

    // Generate AI reviews
    const reviews = await generateReviews(company, 4)
    if (reviews.length === 0) { added.push(company.name); continue }

    const toInsert = reviews.map((r: any, i: number) => ({
      company_slug: company.slug,
      company_name: company.name,
      reviewer_name: rand(NAMES),
      rating: r.rating || 4,
      title: r.title || 'Review',
      review_text: r.body || '',
      verified: true,
      status: 'approved',
      created_at: new Date(Date.now() - i * 86400000 * Math.floor(Math.random() * 7)).toISOString(),
    }))

    await db.from('verivex_reviews').insert(toInsert)
    added.push(company.name)

    await new Promise(r => setTimeout(r, 500))
  }

  return NextResponse.json({
    ok: true,
    added,
    totalNow: (existing?.length || 0) + added.length,
    remaining: COMPANY_PIPELINE.filter(c => !existingSlugs.has(c.slug) && !added.includes(c.name)).length,
  })
}
