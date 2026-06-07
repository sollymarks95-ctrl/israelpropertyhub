import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

const getDb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// ─── 138-site pipeline (5/day → 150 sites in ~4 weeks) ─────────────────────
// Each entry: unique domain + slug + archetype + color palette + topics
const SITE_PIPELINE = [
  // BATCH 1 — Day 1
  { domain:'signalboard.io',  slug:'signal-board',   name:'SignalBoard',     archetype:'editorial', variant:'1', primary:'#7c3aed', font:'sans',  category:'Trading Signals', tagline:'Real-time market intelligence dashboard',
    topics:['algorithmic trading signals today','market sentiment indicator analysis','options flow unusual activity','institutional buying selling today','technical analysis breakout stocks','smart money tracking today'] },
  { domain:'alphastream.co',  slug:'alpha-stream',   name:'AlphaStream',    archetype:'tech', variant:'1',   primary:'#059669', font:'sans',  category:'Investment Alpha', tagline:'Alpha-generating ideas for serious investors',
    topics:['alpha generation strategy today','factor investing returns analysis','quantitative investing model today','value momentum growth factor today','systematic trading strategy update','hedge fund strategy analysis today'] },
  { domain:'capitalink.net',  slug:'capital-ink',    name:'CapitalInk',     archetype:'wire', variant:'1', primary:'#0f172a', font:'serif', category:'Capital Markets', tagline:'The Capital Markets Journal',
    topics:['capital markets news today','IPO listing analysis today','bond market yield curve today','equity issuance deal news today','private equity fundraising news','capital allocation corporate strategy today'] },
  { domain:'fintelbyte.com',  slug:'fintel-byte',    name:'FintëlByte',     archetype:'dashboard', variant:'1',      primary:'#2563eb', font:'sans',  category:'Fintech & Data', tagline:'Where finance meets technology',
    topics:['fintech startup funding news today','open banking API technology','embedded finance payments today','AI machine learning finance today','blockchain DeFi enterprise today','regtech compliance automation today'] },
  { domain:'wealthpulse.io',  slug:'wealth-pulse',   name:'WealthPulse',    archetype:'magazine', variant:'1',  primary:'#dc2626', font:'sans',  category:'Wealth Management', tagline:'Premium intelligence for wealth builders',
    topics:['wealth management strategy today','high net worth investing trends','family office allocation today','alternative investments update today','private wealth technology news','estate planning inheritance strategy today'] },

  // BATCH 2 — Day 2
  { domain:'tradegrid.co',    slug:'trade-grid',     name:'TradeGrid',      archetype:'minimal', variant:'1',      primary:'#0891b2', font:'sans',  category:'Global Trade', tagline:'Global trade intelligence in one grid',
    topics:['global trade data today','supply chain disruption news today','shipping freight rates today','import export statistics today','trade war tariff news today','logistics ports container news today'] },
  { domain:'marketrack.io',   slug:'marke-track',    name:'MarkeTrack',     archetype:'newspaper', variant:'1',      primary:'#7c2d12', font:'mono',  category:'Market Tracking', tagline:'Every move. Every market. Live.',
    topics:['stock market movers today','biggest gainers losers today','market breadth advance decline','52 week high low breakout today','volume surge unusual trading today','sector rotation market today'] },
  { domain:'policyflow.co',   slug:'policy-flow',    name:'PolicyFlow',     archetype:'research', variant:'1', primary:'#1e3a5f', font:'serif', category:'Policy & Regulation', tagline:'Financial policy that moves markets',
    topics:['central bank policy statement today','financial regulation announcement today','SEC CFTC enforcement action today','Basel III bank regulation news','monetary policy interest rate outlook','fiscal policy budget impact today'] },
  { domain:'realdataiq.com',  slug:'real-data-iq',   name:'RealDataIQ',     archetype:'grid', variant:'1',  primary:'#166534', font:'sans',  category:'Data Analysis', tagline:'Data-driven financial intelligence',
    topics:['economic data release analysis today','GDP growth report interpretation','inflation CPI PPI data today','unemployment jobs data analysis','housing market data statistics today','consumer confidence survey today'] },
  { domain:'vaultpress.io',   slug:'vault-press',    name:'VaultPress',     archetype:'brutalist', variant:'1', primary:'#4c1d95', font:'display',category:'Financial Media', tagline:'Journalism that holds finance accountable',
    topics:['financial scandal investigation today','banking fraud enforcement news','corporate governance failure today','executive pay controversy today','financial misconduct whistleblower','accounting irregularity audit news'] },

  // BATCH 3 — Day 3
  { domain:'fundwatch.co',    slug:'fund-watch',     name:'FundWatch',      archetype:'dark_editorial', variant:'1', primary:'#b45309', font:'sans',  category:'Fund Industry', tagline:'The fund industry intelligence platform',
    topics:['mutual fund performance today','ETF flows inflows outflows today','hedge fund returns latest','active vs passive fund debate today','fund manager change announcement','top performing fund sector today'] },
  { domain:'quotelens.io',    slug:'quote-lens',     name:'QuoteLens',      archetype:'split', variant:'1',   primary:'#0e7490', font:'sans',  category:'Market Data', tagline:'Every price has a story',
    topics:['stock quote analysis today','price earnings ratio market today','earnings per share growth today','dividend yield comparison today','stock valuation metrics today','share price catalyst news today'] },
  { domain:'debtwatch.co',    slug:'debt-watch',     name:'DebtWatch',      archetype:'feed', variant:'1',  primary:'#991b1b', font:'sans',  category:'Fixed Income', tagline:'The fixed income intelligence hub',
    topics:['bond market news today','yield curve inversion update','corporate bond spread today','sovereign debt credit rating news','high yield junk bond market today','duration risk interest rate bonds today'] },
  { domain:'mergermap.io',    slug:'merger-map',     name:'MergerMap',      archetype:'editorial', variant:'2',      primary:'#1d4ed8', font:'sans',  category:'M&A Intelligence', tagline:'Every deal. Every detail. First.',
    topics:['merger acquisition announcement today','M&A deal value analysis today','private equity buyout news today','hostile takeover bid news today','antitrust regulatory M&A review','strategic acquisition rationale today'] },
  { domain:'streetsense.co',  slug:'street-sense',   name:'StreetSense',    archetype:'tech', variant:'2',      primary:'#065f46', font:'sans',  category:'Wall Street Intel', tagline:'Street-level financial intelligence',
    topics:['Wall Street analyst rating today','investment bank research note today','price target upgrade downgrade today','earnings estimate revision today','short interest short squeeze today','block trade institutional today'] },

  // BATCH 4 — Day 4
  { domain:'globalfin.io',    slug:'global-fin',     name:'GlobalFin',      archetype:'wire', variant:'2',  primary:'#7c3aed', font:'sans',  category:'Global Finance', tagline:'One world. One financial intelligence hub.',
    topics:['global finance news today','emerging market economy update','cross border capital flows today','G7 G20 financial summit news','international monetary system today','foreign direct investment news today'] },
  { domain:'riskpulse.co',    slug:'risk-pulse',     name:'RiskPulse',      archetype:'dashboard', variant:'2', primary:'#c2410c', font:'mono',  category:'Risk Management', tagline:'Quantify every risk before it finds you',
    topics:['market risk volatility VIX today','credit risk spread widening today','systemic financial risk indicator','geopolitical risk financial markets','liquidity risk funding crisis news','operational risk bank incident today'] },
  { domain:'quarterlyiq.com', slug:'quarterly-iq',   name:'QuarterlyIQ',    archetype:'magazine', variant:'2', primary:'#0f4c81', font:'display',category:'Earnings Intelligence', tagline:'Earnings season intelligence',
    topics:['quarterly earnings report analysis','earnings beat miss surprise today','revenue guidance earnings outlook','management commentary earnings call','sector earnings comparison today','forward PE guidance earnings today'] },
  { domain:'creditdesk.io',   slug:'credit-desk',    name:'CreditDesk',     archetype:'minimal', variant:'2', primary:'#374151', font:'serif', category:'Credit Markets', tagline:'Credit where credit is due',
    topics:['credit rating agency downgrade upgrade','corporate credit default swap today','leveraged loan market news today','CLO CDO structured finance today','credit card delinquency rate news','auto loan student debt credit news'] },
  { domain:'fxreport.co',     slug:'fx-report',      name:'FX Report',      archetype:'newspaper', variant:'2',      primary:'#0369a1', font:'mono',  category:'Foreign Exchange', tagline:'FX intelligence from the desk',
    topics:['EUR USD exchange rate analysis today','GBP USD British pound today','USD JPY dollar yen analysis','emerging market currency today','central bank FX intervention news','carry trade currency strategy today'] },

  // BATCH 5 — Day 5
  { domain:'commodcore.io',   slug:'commod-core',    name:'CommodCore',     archetype:'research', variant:'2',      primary:'#92400e', font:'sans',  category:'Commodities', tagline:'Raw commodity intelligence',
    topics:['crude oil price WTI Brent today','natural gas price market today','gold silver metal price today','copper industrial metal today','agricultural commodity grain today','energy commodity OPEC news today'] },
  { domain:'microwatch.co',   slug:'micro-watch',    name:'MicroWatch',     archetype:'grid', variant:'2',   primary:'#4338ca', font:'sans',  category:'Micro-Cap Research', tagline:'Small cap. Big opportunity.',
    topics:['small cap micro cap stock today','penny stock under $5 today','micro cap earnings report today','small cap sector rotation today','micro cap momentum breakout today','small company M&A target today'] },
  { domain:'techfloat.io',    slug:'tech-float',     name:'TechFloat',      archetype:'brutalist', variant:'2',      primary:'#0c4a6e', font:'sans',  category:'Tech Investing', tagline:'Technology sector investment intelligence',
    topics:['semiconductor chip stock today','software SaaS revenue growth today','cloud computing AWS Azure today','AI artificial intelligence stock today','cybersecurity company news today','tech IPO listing analysis today'] },
  { domain:'pensioniq.co',    slug:'pension-iq',     name:'PensionIQ',      archetype:'dark_editorial', variant:'2',  primary:'#134e4a', font:'serif', category:'Retirement Investing', tagline:'Intelligent retirement planning',
    topics:['pension fund investment strategy','401k retirement planning today','defined benefit pension news today','SIPP ISA retirement UK today','social security medicare news','retirement age saving rate today'] },
  { domain:'infrawatch.io',   slug:'infra-watch',    name:'InfraWatch',     archetype:'split', variant:'2', primary:'#1c1917', font:'sans',  category:'Infrastructure', tagline:'Infrastructure investment intelligence',
    topics:['infrastructure investment deal today','real estate investment trust REIT','airport port road PPP project','renewable energy infrastructure today','data centre infrastructure news','infrastructure fund raising today'] },

  // BATCH 6 — Day 6
  { domain:'earnbeat.co',     slug:'earn-beat',      name:'EarnBeat',       archetype:'feed', variant:'2',      primary:'#6d28d9', font:'sans',  category:'Earnings Beat', tagline:'Beat estimates. Beat the market.',
    topics:['earnings beat surprise today','analyst consensus estimate vs actual','revenue earnings growth acceleration','non-GAAP adjusted earnings today','gross margin expansion today','free cash flow earnings today'] },
  { domain:'insideralpha.io', slug:'insider-alpha',  name:'InsiderAlpha',   archetype:'editorial', variant:'3',   primary:'#1d4ed8', font:'sans',  category:'Insider Intelligence', tagline:'Follow the smart money inside',
    topics:['insider trading filing SEC today','director CEO share purchase today','insider buying pattern analysis','10b5-1 plan insider selling news','Form 4 insider transaction today','institutional 13F filing analysis'] },
  { domain:'dividendco.net',  slug:'dividend-co',    name:'DividendCo',     archetype:'tech', variant:'3', primary:'#166534', font:'sans',  category:'Dividend Investing', tagline:'Build income. Build wealth.',
    topics:['dividend increase announcement today','dividend aristocrat kings list','high yield dividend stock today','dividend cut risk warning today','dividend payout ratio analysis','DRIP dividend reinvestment strategy today'] },
  { domain:'etfhub.co',       slug:'etf-hub',        name:'ETF Hub',        archetype:'wire', variant:'3',      primary:'#0891b2', font:'sans',  category:'ETF Intelligence', tagline:'Every ETF. Every flow. Every day.',
    topics:['ETF fund flow inflows today','top ETF performance ranking today','thematic ETF sector launch today','ETF expense ratio comparison today','actively managed ETF today','leveraged inverse ETF news today'] },
  { domain:'banknews.io',     slug:'bank-news',      name:'BankNews',       archetype:'dashboard', variant:'3', primary:'#1e3a8a', font:'serif', category:'Banking', tagline:'The banking industry newspaper',
    topics:['bank earnings results today','interest rate margin banking today','bank credit lending standards','digital banking neobank news today','bank M&A acquisition today','bank capital ratio stress test today'] },

  // BATCH 7 — Day 7
  { domain:'reitscore.co',    slug:'reit-score',     name:'REITScore',      archetype:'magazine', variant:'3',  primary:'#7e3af2', font:'sans',  category:'Real Estate', tagline:'REITs ranked. Real estate scored.',
    topics:['REIT real estate trust today','commercial real estate office news','residential housing market today','industrial logistics REIT news','hotel hospitality REIT today','REIT dividend FFO analysis today'] },
  { domain:'biofinance.io',   slug:'bio-finance',    name:'BioFinance',     archetype:'minimal', variant:'3',      primary:'#0f766e', font:'sans',  category:'Biotech Finance', tagline:'Where biotech meets capital',
    topics:['biotech pharma stock catalyst today','FDA approval rejection news today','clinical trial results finance today','biotech M&A licensing deal today','pharma earnings drug revenue today','biotech IPO SPAC today'] },
  { domain:'climateiq.co',    slug:'climate-iq',     name:'ClimateIQ',      archetype:'newspaper', variant:'3', primary:'#15803d', font:'display',category:'ESG & Climate', tagline:'Financial intelligence for a changing climate',
    topics:['ESG fund performance today','climate finance green bond today','carbon credit market price today','renewable energy investment today','ESG rating methodology news','net zero corporate announcement today'] },
  { domain:'defiwatch.io',    slug:'defi-watch',     name:'DeFiWatch',      archetype:'research', variant:'3', primary:'#6d28d9', font:'mono',  category:'DeFi & Web3', tagline:'Decentralized finance intelligence',
    topics:['DeFi total value locked today','liquidity pool yield farming today','DEX decentralized exchange volume','stablecoin market news today','NFT market analysis today','Layer 2 blockchain scaling today'] },
  { domain:'leverbyte.co',    slug:'lever-byte',     name:'LeverByte',      archetype:'grid', variant:'3',  primary:'#b91c1c', font:'sans',  category:'Leveraged Finance', tagline:'Leveraged intelligence for leveraged positions',
    topics:['leveraged buyout LBO news today','high yield bond covenant analysis','PIK toggle financing news today','leverage ratio debt EBITDA today','covenant lite loan market today','distressed debt default news today'] },

  // BATCH 8 — Day 8  
  { domain:'yieldzone.io',    slug:'yield-zone',     name:'YieldZone',      archetype:'brutalist', variant:'3',      primary:'#0369a1', font:'mono',  category:'Yield Intelligence', tagline:'Find yield in any market',
    topics:['Treasury yield 10 year today','investment grade credit yield today','high yield spread today','dividend yield equity comparison','rental yield real estate today','savings account yield best rate today'] },
  { domain:'spotdata.co',     slug:'spot-data',      name:'SpotData',       archetype:'dark_editorial', variant:'3',   primary:'#334155', font:'sans',  category:'Spot Markets', tagline:'Real-time spot market intelligence',
    topics:['spot gold price today','spot oil WTI crude today','spot FX currency rate today','spot Bitcoin crypto today','spot commodity wheat corn today','spot freight shipping today'] },
  { domain:'regwatch.io',     slug:'reg-watch',      name:'RegWatch',       archetype:'split', variant:'3',  primary:'#1e3a8a', font:'sans',  category:'Regulation', tagline:'Regulatory intelligence before the market moves',
    topics:['financial regulator FCA SEC today','MiFID regulation Europe today','Dodd Frank US regulation news','Basel capital requirement today','GDPR data finance regulation','crypto regulation legislation today'] },
  { domain:'futurefund.co',   slug:'future-fund',    name:'FutureFund',     archetype:'feed', variant:'3', primary:'#0f172a', font:'display',category:'Future of Finance', tagline:'Financing the future, today',
    topics:['fintech future banking today','CBDC central bank digital currency','AI automation finance jobs today','embedded finance banking future','Web3 future financial system','quantum computing finance today'] },
  { domain:'stratblock.io',   slug:'strat-block',    name:'StratBlock',     archetype:'editorial', variant:'1',      primary:'#7c3aed', font:'sans',  category:'Strategies', tagline:'Every strategy. Ranked. Analyzed.',
    topics:['investment strategy comparison today','value investing growth today','momentum factor strategy','quantitative systematic fund today','macro global strategy today','sector rotation strategy best today'] },

  // BATCH 9 — Day 9
  { domain:'tradenest.co',    slug:'trade-nest',     name:'TradeNest',      archetype:'tech', variant:'1',  primary:'#b45309', font:'sans',  category:'Trading Ideas', tagline:'Your nest for trading ideas',
    topics:['stock trading idea today','options strategy setup today','swing trade setup technical','long short equity idea today','catalyst event trade today','earnings play options strategy'] },
  { domain:'execsignal.io',   slug:'exec-signal',    name:'ExecSignal',     archetype:'wire', variant:'1', primary:'#1e40af', font:'display',category:'Executive Intelligence', tagline:'What executives are signaling',
    topics:['CEO executive interview today','management guidance change news','executive departure appointment today','C-suite strategy announcement','CEO letter shareholder today','executive compensation incentive news'] },
  { domain:'corpwatch.co',    slug:'corp-watch',     name:'CorpWatch',      archetype:'dashboard', variant:'1', primary:'#374151', font:'serif', category:'Corporate Intelligence', tagline:'Watching corporations so you can invest wisely',
    topics:['corporate earnings surprise today','company buyback repurchase today','corporate debt refinancing today','quarterly guidance raise lower today','corporate strategy pivot today','company spin-off demerger news'] },
  { domain:'macropulse.io',   slug:'macro-pulse',    name:'MacroPulse',     archetype:'magazine', variant:'1', primary:'#0c4a6e', font:'sans',  category:'Macro Economics', tagline:'The macroeconomic intelligence dashboard',
    topics:['global macro economic update','monetary fiscal policy today','inflation deflation outlook today','recession probability indicator','global growth forecast IMF World Bank','central bank meeting outcome today'] },
  { domain:'shortsell.co',    slug:'short-sell',     name:'ShortSell',      archetype:'minimal', variant:'1',      primary:'#991b1b', font:'mono',  category:'Short Selling', tagline:'Borrowing conviction. Selling risk.',
    topics:['short interest stock today','short squeeze potential today','bearish thesis investment today','most shorted stock market today','short seller report fraud today','put option volume unusual today'] },

  // BATCH 10 — Day 10
  { domain:'smallbizfin.io',  slug:'small-biz-fin',  name:'SmallBizFin',    archetype:'newspaper', variant:'1',   primary:'#0891b2', font:'sans',  category:'SME Finance', tagline:'Financial intelligence for the small business owner',
    topics:['small business loan rate today','SME finance alternative lending','invoice financing factoring news','SBA loan government support news','small business revenue trend today','startup funding angel seed today'] },
  { domain:'cryptodesk.co',   slug:'crypto-desk',    name:'CryptoDesk',     archetype:'research', variant:'1',      primary:'#f59e0b', font:'sans',  category:'Cryptocurrency', tagline:'The institutional crypto desk',
    topics:['Bitcoin price analysis today','Ethereum network update today','altcoin market performance today','crypto ETF approval news today','on-chain data analysis today','crypto regulation news today'] },
  { domain:'luxeinvest.io',   slug:'luxe-invest',    name:'LuxeInvest',     archetype:'grid', variant:'1', primary:'#7c3aed', font:'display',category:'Luxury Assets', tagline:'Ultra-premium asset intelligence',
    topics:['luxury real estate market today','art investment auction today','classic car watch investment today','wine whisky collectible today','private jet yacht asset news today','ultra high net worth wealth today'] },
  { domain:'insurtech.co',    slug:'insur-tech',     name:'InsurTech',      archetype:'brutalist', variant:'1',  primary:'#065f46', font:'sans',  category:'Insurance Technology', tagline:'Where insurance meets innovation',
    topics:['insurtech company funding today','insurance technology news today','parametric insurance innovation','embedded insurance fintech today','actuarial data insurance pricing','cyber insurance market today'] },
  { domain:'ipo-board.io',    slug:'ipo-board',      name:'IPO Board',      archetype:'dark_editorial', variant:'1',      primary:'#1d4ed8', font:'sans',  category:'IPO Intelligence', tagline:'Every listing. Every valuation.',
    topics:['IPO listing roadshow today','SPAC blank check merger today','direct listing stock market today','IPO valuation pricing analysis','post IPO performance lockup today','IPO pipeline upcoming listing'] },

  // BATCH 11 — Day 11
  { domain:'fixedinc.co',     slug:'fixed-inc',      name:'FixedInc',       archetype:'split', variant:'1',      primary:'#374151', font:'mono',  category:'Fixed Income', tagline:'The fixed income wire service',
    topics:['US Treasury auction today','corporate bond issuance news today','municipal bond muni news today','inflation linked bond TIPS today','convertible bond market today','sovereign bond market news today'] },
  { domain:'asiamarket.io',   slug:'asia-market',    name:'AsiaMarket',     archetype:'feed', variant:'1', primary:'#be123c', font:'sans',  category:'Asia Pacific', tagline:'Asia Pacific financial intelligence',
    topics:['China stock market today','Japan Nikkei market today','Hong Kong Hang Seng today','India Sensex NIFTY today','South Korea KOSPI today','Asian currency FX today'] },
  { domain:'eurofin.co',      slug:'euro-fin',       name:'EuroFin',        archetype:'editorial', variant:'2', primary:'#1e3a8a', font:'serif', category:'European Finance', tagline:'European financial journalism',
    topics:['European stock market today','ECB European Central Bank news','Euro zone economic data today','DAX FTSE CAC market today','European bond spread today','EU regulation financial today'] },
  { domain:'latamfin.io',     slug:'latam-fin',      name:'LatAmFin',       archetype:'tech', variant:'2',  primary:'#92400e', font:'sans',  category:'Latin America', tagline:'Latin America financial intelligence',
    topics:['Brazil market Bovespa today','Mexico peso currency today','Latin America economy news','Argentina debt crisis today','Chile copper mining today','Colombia oil energy today'] },
  { domain:'menafinance.co',  slug:'mena-finance',   name:'MENAFinance',    archetype:'wire', variant:'2', primary:'#0c4a6e', font:'display',category:'MENA Finance', tagline:'Middle East & North Africa financial intelligence',
    topics:['Saudi Arabia Vision 2030 finance','UAE Dubai investment news today','Qatar sovereign wealth today','oil producer GCC economy today','Middle East IPO market today','MENA fintech startup news'] },

  // BATCH 12 — Day 12  
  { domain:'hedgereport.io',  slug:'hedge-report',   name:'HedgeReport',    archetype:'dashboard', variant:'2',  primary:'#4c1d95', font:'sans',  category:'Hedge Funds', tagline:'Inside the world of hedge funds',
    topics:['hedge fund performance returns today','13F filing hedge fund position','activist investor campaign today','long short equity fund today','global macro fund strategy today','hedge fund launch close news today'] },
  { domain:'optionflow.co',   slug:'option-flow',    name:'OptionFlow',     archetype:'magazine', variant:'2',      primary:'#0f766e', font:'mono',  category:'Options Market', tagline:'See the flow. Trade with conviction.',
    topics:['unusual options activity today','put call ratio market today','options volume spike today','implied volatility skew today','large block option trade today','earnings options strategy today'] },
  { domain:'spotgold.io',     slug:'spot-gold',      name:'SpotGold',       archetype:'minimal', variant:'2',   primary:'#d97706', font:'sans',  category:'Precious Metals', tagline:'Gold intelligence. Pure and simple.',
    topics:['gold price today spot','gold ETF GLD flow today','central bank gold buying today','gold mine production today','gold jewellery demand today','gold standard debate economics'] },
  { domain:'techstox.co',     slug:'tech-stox',      name:'TechStox',       archetype:'newspaper', variant:'2',      primary:'#2563eb', font:'sans',  category:'Tech Stocks', tagline:'Tracking technology investments',
    topics:['FAANG MAMAA tech stock today','semiconductor equipment today','software valuation SaaS today','tech sector earning revenue','AI chip GPU demand today','tech layoff hiring news today'] },
  { domain:'energyiq.io',     slug:'energy-iq',      name:'EnergyIQ',       archetype:'research', variant:'2',      primary:'#15803d', font:'sans',  category:'Energy Finance', tagline:'Energy investment intelligence',
    topics:['oil gas energy stock today','renewable solar wind stock today','energy transition investment today','nuclear power finance today','LNG liquefied gas market today','energy company earnings today'] },
]

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const db = getDb()

  // Get existing slugs
  const { data: existing } = await db.from('news_sites').select('slug,domain')
  const existingSlugs = new Set((existing||[]).map((r:any) => r.slug))

  // Pick next 5 not yet created
  const toCreate = SITE_PIPELINE.filter(s => !existingSlugs.has(s.slug)).slice(0, 5)

  if (toCreate.length === 0) {
    return NextResponse.json({ ok:true, message:'All sites created', total: existingSlugs.size })
  }

  const created: string[] = []

  for (const site of toCreate) {
    const { error } = await db.from('news_sites').upsert({
      name: site.name,
      slug: site.slug,
      domain: site.domain,
      noindex: true,
      is_active: true,
      category: site.category,
      tagline: site.tagline,
      description: `${site.name} — ${site.tagline}`,
      topics: site.topics,
      template_config: {
        archetype: site.archetype,
        primary: site.primary,
        font: site.font,
        secondary: '#f1f5f9',
        background: '#ffffff',
        layout: 'standard',
      }
    }, { onConflict: 'slug' })

    if (!error) created.push(`${site.name} (${site.domain})`)
    else console.error('Site create error:', site.slug, error.message)
  }

  return NextResponse.json({
    ok: true,
    created,
    totalSites: (existing?.length||0) + created.length,
    remaining: SITE_PIPELINE.filter(s => !existingSlugs.has(s.slug) && !created.some(c=>c.includes(s.name))).length,
  })
}
