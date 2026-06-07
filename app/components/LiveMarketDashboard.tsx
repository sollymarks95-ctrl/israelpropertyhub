'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ── SITE-TYPE CONFIG ──────────────────────────────────────────────────────────
const SITE_CONFIG: Record<string, { defaultTab: string; defaultChart: string; breakingLabel: string }> = {
  finance:     { defaultTab: 'Currencies', defaultChart: 'SP:SPX',             breakingLabel: 'MARKETS ALERT'   },
  commodities: { defaultTab: 'Commodities',defaultChart: 'CAPITALCOM:GOLD',    breakingLabel: 'COMMODITIES'     },
  markets:     { defaultTab: 'Indices',    defaultChart: 'CAPITALCOM:GOLD',    breakingLabel: 'SIGNAL ALERT'    },
  news:        { defaultTab: 'Indices',    defaultChart: 'CAPITALCOM:BRENT',   breakingLabel: 'BREAKING'        },
  magazine:    { defaultTab: 'Stocks',     defaultChart: 'SP:SPX',             breakingLabel: 'EXCLUSIVE'       },
  reviews:     { defaultTab: 'Stocks',     defaultChart: 'SP:SPX',             breakingLabel: 'VERIFIED INTEL'  },
  wiki:        { defaultTab: 'Indices',    defaultChart: 'SP:SPX',             breakingLabel: 'REFERENCE'       },
  pressroom:   { defaultTab: 'Stocks',     defaultChart: 'SP:SPX',             breakingLabel: 'PRESS RELEASE'   },
  investdb:    { defaultTab: 'Stocks',     defaultChart: 'NASDAQ:NVDA',        breakingLabel: 'DEAL ALERT'      },
  forum:       { defaultTab: 'Commodities',defaultChart: 'CAPITALCOM:BRENT',   breakingLabel: 'COMMUNITY'       },
  association: { defaultTab: 'Indices',    defaultChart: 'FX:EURUSD',          breakingLabel: 'ANNOUNCEMENT'    },
  executive:   { defaultTab: 'Stocks',     defaultChart: 'NASDAQ:AAPL',        breakingLabel: 'APPOINTMENT'     },
}
const QUICK_CHARTS: Record<string, { v: string; l: string }[]> = {
  finance:    [{ v:'SP:SPX',l:'S&P 500' },{ v:'FX:EURUSD',l:'EUR/USD' },{ v:'FX:GBPUSD',l:'GBP/USD' },{ v:'CAPITALCOM:US30',l:'Dow' },{ v:'CAPITALCOM:BITCOIN',l:'BTC' },{ v:'FX:USDJPY',l:'USD/JPY' }],
  commodities:[{ v:'CAPITALCOM:GOLD',l:'Gold' },{ v:'CAPITALCOM:SILVER',l:'Silver' },{ v:'CAPITALCOM:OIL_CRUDE',l:'WTI' },{ v:'CAPITALCOM:BRENT',l:'Brent' },{ v:'CAPITALCOM:COPPER',l:'Copper' },{ v:'CAPITALCOM:NATURAL_GAS',l:'Gas' }],
  markets:    [{ v:'CAPITALCOM:GOLD',l:'Gold' },{ v:'SP:SPX',l:'S&P 500' },{ v:'CAPITALCOM:BITCOIN',l:'BTC' },{ v:'FX:EURUSD',l:'EUR/USD' },{ v:'CAPITALCOM:BRENT',l:'Oil' },{ v:'CAPITALCOM:COPPER',l:'Copper' }],
  investdb:   [{ v:'NASDAQ:NVDA',l:'NVIDIA' },{ v:'NASDAQ:AAPL',l:'Apple' },{ v:'NYSE:TSLA',l:'Tesla' },{ v:'NASDAQ:MSFT',l:'MSFT' },{ v:'SP:SPX',l:'S&P 500' },{ v:'CAPITALCOM:BITCOIN',l:'BTC' }],
  executive:  [{ v:'NASDAQ:AAPL',l:'Apple' },{ v:'NASDAQ:MSFT',l:'MSFT' },{ v:'NASDAQ:NVDA',l:'NVIDIA' },{ v:'NYSE:TSLA',l:'Tesla' },{ v:'SP:SPX',l:'S&P 500' },{ v:'NYSE:JPM',l:'JPMorgan' }],
  default:    [{ v:'CAPITALCOM:GOLD',l:'Gold' },{ v:'SP:SPX',l:'S&P 500' },{ v:'FX:EURUSD',l:'EUR/USD' },{ v:'CAPITALCOM:BRENT',l:'Oil' },{ v:'CAPITALCOM:BITCOIN',l:'BTC' },{ v:'NASDAQ:AAPL',l:'Apple' }],
}

// ── SEED DATA ─────────────────────────────────────────────────────────────────
const INDICES0 = [
  { name:'S&P 500',    price:5248.35, change:15.23,  pct:0.29,  flag:'🇺🇸', hi:5271.20, lo:5224.10 },
  { name:'Dow Jones',  price:39127.80,change:-45.20, pct:-0.12, flag:'🇺🇸', hi:39240.10,lo:38980.50 },
  { name:'Nasdaq',     price:16340.87,change:87.45,  pct:0.54,  flag:'🇺🇸', hi:16420.30,lo:16200.10 },
  { name:'DAX',        price:18482.35,change:132.48, pct:0.72,  flag:'🇩🇪', hi:18540.20,lo:18310.80 },
  { name:'FTSE 100',   price:8205.47, change:-23.12, pct:-0.28, flag:'🇬🇧', hi:8245.30, lo:8180.20  },
  { name:'Nikkei 225', price:38890.32,change:245.67, pct:0.64,  flag:'🇯🇵', hi:39050.00,lo:38620.50 },
  { name:'CAC 40',     price:8087.45, change:43.21,  pct:0.54,  flag:'🇫🇷', hi:8120.30, lo:8040.10  },
  { name:'Hang Seng',  price:18230.52,change:-124.30,pct:-0.68, flag:'🇭🇰', hi:18420.80,lo:18180.40 },
]
const COMMODITIES0 = [
  { name:'Gold',           price:2387.40,change:12.80,  pct:0.54,  flag:'🟡', month:'Aug 26' },
  { name:'Silver',         price:29.45,  change:-0.32,  pct:-1.07, flag:'⚪', month:'Jul 26' },
  { name:'Crude Oil WTI',  price:78.92,  change:0.45,   pct:0.57,  flag:'🛢️', month:'Jul 26' },
  { name:'Brent Oil',      price:81.40,  change:0.62,   pct:0.77,  flag:'⛽', month:'Aug 26' },
  { name:'Natural Gas',    price:2.84,   change:-0.08,  pct:-2.74, flag:'🔥', month:'Jul 26' },
  { name:'Copper',         price:4.67,   change:0.08,   pct:1.74,  flag:'🔶', month:'Jul 26' },
  { name:'US Wheat',       price:626.60, change:-7.25,  pct:-1.17, flag:'🌾', month:'Jul 26' },
  { name:'US Soybeans',    price:1184.75,change:-2.30,  pct:-0.19, flag:'🫘', month:'Jul 26' },
]
const CURRENCIES0 = [
  { pair:'EUR/USD',price:1.0892,change:-0.0023,pct:-0.21 },
  { pair:'GBP/USD',price:1.2735,change:0.0047, pct:0.37  },
  { pair:'USD/JPY',price:156.82,change:0.34,   pct:0.22  },
  { pair:'USD/CHF',price:0.9012,change:-0.0018,pct:-0.20 },
  { pair:'AUD/USD',price:0.6623,change:0.0031, pct:0.47  },
  { pair:'USD/CAD',price:1.3645,change:-0.0024,pct:-0.18 },
  { pair:'NZD/USD',price:0.6124,change:0.0015, pct:0.25  },
  { pair:'USD/CNY',price:7.2450,change:0.0180, pct:0.25  },
]
const STOCKS0 = [
  { name:'Apple Inc.',     symbol:'AAPL', price:189.84,change:2.34,  pct:1.25,  flag:'🇺🇸', cap:'2.97T' },
  { name:'Microsoft',      symbol:'MSFT', price:420.53,change:-1.87, pct:-0.44, flag:'🇺🇸', cap:'3.12T' },
  { name:'NVIDIA',         symbol:'NVDA', price:887.65,change:23.45, pct:2.72,  flag:'🇺🇸', cap:'2.19T' },
  { name:'Tesla Inc.',     symbol:'TSLA', price:182.47,change:4.23,  pct:2.37,  flag:'🇺🇸', cap:'580B'  },
  { name:'Exxon Mobil',    symbol:'XOM',  price:149.81,change:-5.11, pct:-3.30, flag:'🇺🇸', cap:'612B'  },
  { name:'Amazon.com',     symbol:'AMZN', price:185.32,change:-0.89, pct:-0.48, flag:'🇺🇸', cap:'1.96T' },
  { name:'Alphabet',       symbol:'GOOGL',price:171.45,change:1.23,  pct:0.72,  flag:'🇺🇸', cap:'2.14T' },
  { name:'Meta Platforms', symbol:'META', price:494.50,change:3.21,  pct:0.65,  flag:'🇺🇸', cap:'1.26T' },
]
const SCREENER_DATA = ['Most Active','Top Gainers','Top Losers','52-Week High']

type MarketItem = { price: number; change: number; pct: number; [k: string]: any }

function tick<T extends MarketItem>(arr: T[]): T[] {
  return arr.map(item => {
    const d = (Math.random() - 0.49) * item.price * 0.00025
    const p = Math.max(item.price + d, 0.001)
    return { ...item, price: p, change: item.change + d, pct: ((item.change + d) / p) * 100 }
  })
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function NewsletterForm({ siteId, siteName, p, dark }: { siteId?: string; siteName?: string; p: string; dark?: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) { setStatus('err'); setMsg('Enter a valid email.'); return }
    setStatus('loading')
    try {
      const r = await fetch('/api/newsletter', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, siteId, siteName }) })
      const d = await r.json()
      if (r.ok) { setStatus('ok'); setMsg('✅ Subscribed!'); setEmail('') }
      else { setStatus('err'); setMsg(d.error || 'Try again.') }
    } catch { setStatus('err'); setMsg('Connection error.') }
  }

  if (status === 'ok') return (
    <div style={{ background: dark ? 'rgba(255,255,255,0.15)' : '#dcfce7', color: dark ? '#fff' : '#16a34a', padding:'10px 14px', borderRadius:5, fontSize:13, fontWeight:700, textAlign:'center' }}>
      {msg}
    </div>
  )

  return (
    <form onSubmit={submit}>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com"
          style={{ flex:'1 1 180px', padding:'10px 12px', border:'none', borderRadius:5, fontSize:13, fontFamily:'sans-serif', outline:'none', minWidth:0, background: dark ? 'rgba(255,255,255,0.12)' : '#fff', color: dark ? '#fff' : '#111' }} />
        <button type="submit" disabled={status==='loading'}
          style={{ flexShrink:0, background: dark ? '#fff' : p, color: dark ? p : '#fff', border:'none', padding:'10px 16px', fontWeight:800, fontSize:12, borderRadius:5, cursor:'pointer', fontFamily:'sans-serif', whiteSpace:'nowrap' }}>
          {status==='loading' ? '...' : 'Subscribe Free →'}
        </button>
      </div>
      {status==='err' && <p style={{ color: dark ? '#fca5a5' : '#ef4444', fontSize:11, marginTop:4 }}>{msg}</p>}
      {!dark && <p style={{ fontSize:10, color:'#9ca3af', marginTop:5 }}>No spam. Unsubscribe anytime.</p>}
    </form>
  )
}

function SearchBar({ siteSlug }: { siteSlug: string }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`)
        const d = await r.json()
        setResults(d.results || [])
        setOpen(true)
      } catch {}
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  function go(e: React.FormEvent) {
    e.preventDefault()
    if (q.trim()) { router.push(`/search?q=${encodeURIComponent(q.trim())}`); setOpen(false) }
  }

  return (
    <div ref={ref} style={{ position:'relative', flex:'1 1 200px', maxWidth:440, minWidth:0 }}>
      <form onSubmit={go} style={{ display:'flex', gap:0, border:'1px solid #e5e7eb', borderRadius:6, overflow:'hidden', background:'#f9fafb' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search news, markets, companies..."
          style={{ flex:1, padding:'9px 14px', border:'none', fontSize:13, fontFamily:'sans-serif', outline:'none', background:'transparent', minWidth:0, color:'#111' }} />
        <button type="submit" style={{ background:'#374151', color:'#fff', border:'none', padding:'9px 14px', fontSize:13, cursor:'pointer', flexShrink:0 }}>🔍</button>
      </form>
      {open && results.length > 0 && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', zIndex:500, overflow:'hidden', maxHeight:340, overflowY:'auto' }}>
          {results.map((a,i) => (
            <Link key={i} href={`/article/${siteSlug}/${a.slug}`} onClick={() => { setOpen(false); setQ('') }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid #f3f4f6', display:'flex', gap:10, alignItems:'center' }}>
                {a.cover_image_url && <img src={a.cover_image_url} alt="" width={44} height={32} style={{ objectFit:'cover', borderRadius:3, flexShrink:0 }} />}
                <div>
                  <div style={{ fontSize:10, color:'#9ca3af', fontWeight:700 }}>{a.category?.toUpperCase()}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#111', lineHeight:1.3 }}>{a.title?.slice(0,65)}</div>
                </div>
              </div>
            </Link>
          ))}
          <Link href={`/search?q=${encodeURIComponent(q)}`} onClick={() => setOpen(false)}>
            <div style={{ padding:'10px 14px', fontSize:12, color:'#3b82f6', fontWeight:700, textAlign:'center', background:'#f9fafb' }}>View all results for "{q}" →</div>
          </Link>
        </div>
      )}
    </div>
  )
}

// ── CHART SECTION ─────────────────────────────────────────────────────────────
function ChartSection({ p, siteSlug, siteType }: { p: string; siteSlug: string; siteType?: string }) {
  const cfg = SITE_CONFIG[siteType || 'default'] || SITE_CONFIG.news
  const qc  = QUICK_CHARTS[siteType || 'default'] || QUICK_CHARTS.default
  const [symbol, setSymbol] = useState(cfg.defaultChart)
  const [tf, setTf] = useState('D')
  const ALL_SYM = [
    { v:'CAPITALCOM:GOLD',l:'Gold',g:'Metals' },      { v:'CAPITALCOM:SILVER',l:'Silver',g:'Metals' },
    { v:'CAPITALCOM:COPPER',l:'Copper',g:'Metals' },  { v:'CAPITALCOM:PLATINUM',l:'Platinum',g:'Metals' },
    { v:'CAPITALCOM:OIL_CRUDE',l:'WTI',g:'Energy' },  { v:'CAPITALCOM:BRENT',l:'Brent',g:'Energy' },
    { v:'CAPITALCOM:NATURAL_GAS',l:'Gas',g:'Energy' },{ v:'FX:EURUSD',l:'EUR/USD',g:'Forex' },
    { v:'FX:GBPUSD',l:'GBP/USD',g:'Forex' },          { v:'FX:USDJPY',l:'USD/JPY',g:'Forex' },
    { v:'FX:AUDUSD',l:'AUD/USD',g:'Forex' },          { v:'NASDAQ:AAPL',l:'Apple',g:'Stocks' },
    { v:'NASDAQ:NVDA',l:'NVIDIA',g:'Stocks' },         { v:'NYSE:TSLA',l:'Tesla',g:'Stocks' },
    { v:'NASDAQ:MSFT',l:'Microsoft',g:'Stocks' },      { v:'SP:SPX',l:'S&P 500',g:'Indices' },
    { v:'CAPITALCOM:US30',l:'Dow Jones',g:'Indices' }, { v:'CAPITALCOM:DE40',l:'DAX',g:'Indices' },
    { v:'CAPITALCOM:UK100',l:'FTSE 100',g:'Indices' },{ v:'CAPITALCOM:BITCOIN',l:'Bitcoin',g:'Crypto' },
    { v:'CAPITALCOM:ETHEREUM',l:'Ethereum',g:'Crypto' },
  ]
  const groups = [...new Set(ALL_SYM.map(s => s.g))]
  const label = ALL_SYM.find(s => s.v === symbol)?.l || qc.find(q => q.v === symbol)?.l || symbol.split(':')[1]
  const src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_${siteSlug}&symbol=${encodeURIComponent(symbol)}&interval=${tf}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%22RSI%40tv-basicstudies%22%5D&theme=light&style=1&timezone=exchange&withdateranges=1&show_popup_button=1`

  return (
    <div id="chart" className="rh-card" style={{ marginBottom:20 }}>
      <div style={{ padding:'12px 16px', borderBottom:'1px solid #e5e7eb' }}>
        <div className="rh-flex-between" style={{ marginBottom:8, flexWrap:'wrap', gap:8 }}>
          <h2 style={{ fontSize:15, fontWeight:800, color:'#111' }}>📈 Live Chart — <span style={{ color:p }}>{label}</span></h2>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {['1','15','60','D','W'].map(r => (
              <button key={r} onClick={() => setTf(r)} className={`rh-tf-btn${tf===r?' active':''}`} style={{ '--active-bg': '#111' } as any}>
                {r==='1'?'1m':r==='15'?'15m':r==='60'?'1H':r==='D'?'1D':'1W'}
              </button>
            ))}
            <Link href="/charts"><button className="rh-tf-btn" style={{ background: p, color:'#fff' }}>Full ↗</button></Link>
          </div>
        </div>
        {/* Quick picks */}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
          {qc.map(q => (
            <button key={q.v} onClick={() => setSymbol(q.v)} style={{ padding:'3px 10px', background: symbol===q.v ? p : '#f3f4f6', color: symbol===q.v ? '#fff' : '#374151', border:'none', borderRadius:3, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'sans-serif' }}>
              {q.l}
            </button>
          ))}
        </div>
        {/* Full symbol selector */}
        <div style={{ display:'flex', gap:4, overflowX:'auto', paddingBottom:2 }}>
          {groups.map(g => (
            <div key={g} style={{ display:'flex', gap:2, alignItems:'center', flexShrink:0 }}>
              <span style={{ fontSize:9, color:'#9ca3af', fontWeight:700, whiteSpace:'nowrap' }}>{g}:</span>
              {ALL_SYM.filter(s => s.g===g).map(s => (
                <button key={s.v} onClick={() => setSymbol(s.v)} style={{ padding:'2px 8px', background: symbol===s.v ? p : '#f9fafb', color: symbol===s.v ? '#fff' : '#6b7280', border:`1px solid ${symbol===s.v ? p : '#e5e7eb'}`, borderRadius:3, fontSize:10, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'sans-serif' }}>
                  {s.l}
                </button>
              ))}
              <span style={{ color:'#e5e7eb', marginLeft:4 }}>|</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height:460, position:'relative' }}>
        <iframe key={`${symbol}-${tf}`} src={src} style={{ width:'100%', height:'100%', border:'none', display:'block' }} title={`${label} Chart`} allow="fullscreen" loading="lazy" />
      </div>
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LiveMarketDashboard({ articles, site, routePrefix, siteSlug, primaryColor, searchParams }: {
  articles: any[]; site: any; routePrefix: string; siteSlug: string; primaryColor: string; searchParams?: any
}) {
  const p  = primaryColor || '#c0392b'
  const sp = searchParams || {}
  const siteCfg = SITE_CONFIG[site.site_type || 'default'] || SITE_CONFIG.news

  const [indices,     setIndices]     = useState(INDICES0)
  const [commodities, setCommodities] = useState(COMMODITIES0)
  const [currencies,  setCurrencies]  = useState(CURRENCIES0)
  const [stocks,      setStocks]      = useState(STOCKS0)
  const [tab,         setTab]         = useState(siteCfg.defaultTab)
  const [screenerTab, setScreenerTab] = useState('Most Active')
  const [clock,       setClock]       = useState('')
  const [menuOpen,    setMenuOpen]    = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date()
      setClock(n.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    }, 1000)
    setClock(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setIndices(tick); setCommodities(tick); setCurrencies(tick); setStocks(tick)
    }, 2500)
    return () => clearInterval(t)
  }, [])

  const filtered  = sp.category ? articles.filter((a:any) => a.category === sp.category) : articles
  const cats      = [...new Set(articles.map((a:any) => a.category).filter(Boolean))]
  const hero      = filtered[0]
  const secondary = filtered.slice(1, 5)
  const rest      = filtered.slice(5)
  const trending  = articles.slice(0, 6)
  const opinions  = articles.filter((a:any) => ['Analysis','Opinion','Research','Signals'].includes(a.category)).slice(0, 4)

  const tabData: Record<string, any[]> = { Indices:indices, Stocks:stocks, Commodities:commodities, Currencies:currencies, ETFs:stocks, Crypto:commodities.slice(0,4) }
  const TICKER = [...indices, ...commodities, ...currencies].map(i => ({ l: (i as any).name||(i as any).pair, v: i.price, c: i.pct }))

  const NAV_ITEMS = [
    { label:'Markets',   href:`/${routePrefix}/${siteSlug}#markets` },
    { label:'News',      href:`/${routePrefix}/${siteSlug}` },
    { label:'Analysis',  href:`/${routePrefix}/${siteSlug}?category=Analysis` },
    { label:'Charts',    href:`/charts` },
    { label:'Calendar',  href:`/${routePrefix}/${siteSlug}#calendar` },
    { label:'Screener',  href:`/${routePrefix}/${siteSlug}#screener` },
    { label:'Academy',   href:`/academy` },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f3f4f6', fontFamily:'sans-serif' }}>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        img { display: block; }
        .rh-card { background: #fff; border-radius: 6px; border: 1px solid #e5e7eb; overflow: hidden; }
        .rh-flex-between { display: flex; align-items: center; justify-content: space-between; }
        .rh-mrow { display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; border-bottom: 1px solid #f3f4f6; font-size: 13px; cursor: pointer; }
        .rh-mrow:hover { background: #fafafa; }
        .rh-tab { background: none; border: none; cursor: pointer; padding: 8px 14px; font-size: 13px; font-weight: 600; color: #6b7280; border-bottom: 2px solid transparent; white-space: nowrap; font-family: sans-serif; flex-shrink: 0; }
        .rh-tab.on { color: ${p}; border-bottom-color: ${p}; }
        .rh-tab:hover { color: ${p}; }
        .rh-tf-btn { padding: 4px 10px; background: #f3f4f6; color: #374151; border: none; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; font-family: sans-serif; white-space: nowrap; }
        .rh-tf-btn.active { background: #111; color: #fff; }
        .rh-price { font-variant-numeric: tabular-nums; font-weight: 700; font-family: 'Courier New', monospace; }
        .rh-up { color: #16a34a; }
        .rh-dn { color: #dc2626; }
        .rh-badge-h { background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 800; }
        .rh-badge-m { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 800; }
        .rh-badge-l { background: #dcfce7; color: #16a34a; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 800; }
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* ── LAYOUT ── */
        .rh-wrap  { max-width: 1400px; margin: 0 auto; padding: 0 16px; }
        .rh-grid  { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .rh-2col  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rh-hero  { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 20px; }
        .rh-sidebar { /* desktop sidebar */ }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .rh-grid  { grid-template-columns: 1fr; }
          .rh-sidebar { display: none; }
          .rh-hero  { grid-template-columns: 1fr; }
          .rh-2col  { grid-template-columns: 1fr; }
          .rh-desktop-only { display: none !important; }
          .rh-topbar { flex-wrap: wrap; gap: 4px; }
          .rh-searchbar { max-width: 100% !important; }
          .rh-header-inner { flex-wrap: wrap; gap: 8px; height: auto !important; padding: 10px 0; }
        }
        @media (max-width: 600px) {
          .rh-wrap { padding: 0 10px; }
          .rh-hero-title { font-size: 20px !important; }
          .rh-feed-img { width: 90px !important; height: 66px !important; }
          .rh-article-title { font-size: 14px !important; }
          .rh-market-tbl { font-size: 12px !important; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background:'#0f172a', color:'#94a3b8', fontSize:11, padding:'5px 16px' }}>
        <div className="rh-wrap rh-flex-between rh-topbar" style={{ gap:8 }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ color:'#ef4444', fontWeight:800, fontSize:12, animation:'pulse 1.5s infinite' }}>⬤ LIVE</span>
            <span className="rh-desktop-only">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
            <span style={{ color:'#4ade80', fontFamily:'monospace' }}>{clock}</span>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <Link href="/search"><span style={{ cursor:'pointer' }}>🔍 Search</span></Link>
            <Link href={`/${routePrefix}/${siteSlug}?category=Markets`}><span style={{ cursor:'pointer' }} className="rh-desktop-only">Markets</span></Link>
            <Link href="/legal/about"><span style={{ cursor:'pointer' }} className="rh-desktop-only">About</span></Link>
          </div>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header style={{ background:'#fff', borderBottom:`3px solid ${p}`, position:'sticky', top:0, zIndex:200, boxShadow:'0 1px 6px rgba(0,0,0,0.07)' }}>
        <div className="rh-wrap">
          <div className="rh-header-inner" style={{ display:'flex', alignItems:'center', gap:12, height:58, justifyContent:'space-between' }}>
            {/* Logo */}
            <Link href={`/${routePrefix}/${siteSlug}`}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <div style={{ width:32, height:32, borderRadius:7, background:`linear-gradient(135deg,${p},${p}80)`, border:`1.5px solid ${p}60`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:11, color:'#fff', letterSpacing:'-0.02em' }}>
                    {site.name.includes('-') ? site.name.split('-').map((pt: string)=>pt[0]).join('') : site.name.slice(0,2).toUpperCase()}
                  </span>
                </div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:22, letterSpacing:'-0.04em', whiteSpace:'nowrap', color:'#111', lineHeight:1 }}>{site.name}</span>
              </div>
            </Link>

            {/* Search */}
            <div className="rh-searchbar" style={{ flex:'1 1 200px', maxWidth:400, minWidth:0 }}>
              <SearchBar siteSlug={siteSlug} />
            </div>

            {/* CTA */}
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="rh-desktop-only" style={{ display:'none' }}>☰</button>
              <Link href="/legal/contact">
                <button style={{ padding:'7px 12px', background:'#f3f4f6', border:'none', borderRadius:5, fontSize:12, cursor:'pointer', fontFamily:'sans-serif', whiteSpace:'nowrap' }}>Sign In</button>
              </Link>
              <button onClick={() => { const el = document.getElementById('rh-newsletter-modal'); if(el) el.style.display = el.style.display==='none'?'flex':'none' }}
                style={{ background:p, color:'#fff', border:'none', borderRadius:5, padding:'7px 14px', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'sans-serif', whiteSpace:'nowrap' }}>
                Subscribe Free
              </button>
            </div>
          </div>

          {/* ── NAV ── */}
          <nav style={{ borderTop:'1px solid #f3f4f6', display:'flex', overflowX:'auto', height:40, WebkitOverflowScrolling:'touch' }}>
            {NAV_ITEMS.map(n => (
              <Link key={n.label} href={n.href}>
                <span style={{ padding:'0 12px', height:40, display:'flex', alignItems:'center', fontSize:13, fontWeight:500, color:'#374151', whiteSpace:'nowrap', cursor:'pointer', flexShrink:0 }}>{n.label}</span>
              </Link>
            ))}
          </nav>

          {/* ── CATEGORY STRIP ── */}
          <div style={{ background:'#f9fafb', borderTop:'1px solid #f0f0f0', display:'flex', overflowX:'auto', height:34, WebkitOverflowScrolling:'touch' }}>
            <Link href={`/${routePrefix}/${siteSlug}`}>
              <span style={{ padding:'0 12px', height:34, display:'flex', alignItems:'center', fontSize:12, fontWeight:!sp.category?800:400, color:!sp.category?p:'#6b7280', borderBottom:!sp.category?`2px solid ${p}`:'none', whiteSpace:'nowrap', flexShrink:0 }}>All</span>
            </Link>
            {cats.slice(0,10).map((cat:string) => (
              <Link key={cat} href={`/${routePrefix}/${siteSlug}?category=${encodeURIComponent(cat)}`}>
                <span style={{ padding:'0 12px', height:34, display:'flex', alignItems:'center', fontSize:12, fontWeight:sp.category===cat?800:400, color:sp.category===cat?p:'#6b7280', borderBottom:sp.category===cat?`2px solid ${p}`:'none', whiteSpace:'nowrap', flexShrink:0 }}>{cat}</span>
              </Link>
            ))}
            <span style={{ marginLeft:'auto', padding:'0 12px', height:34, display:'flex', alignItems:'center', fontSize:11, color:'#ef4444', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>🔴 LIVE</span>
          </div>
        </div>
      </header>

      {/* ── TICKER TAPE ── */}
      <div style={{ background:'#1e293b', overflow:'hidden', padding:'7px 0', borderBottom:'1px solid #374151' }}>
        <div style={{ display:'flex', animation:'ticker 80s linear infinite', whiteSpace:'nowrap', willChange:'transform' }}>
          {[...TICKER,...TICKER].map((t,i) => (
            <span key={i} style={{ padding:'0 16px', fontSize:12, display:'inline-flex', gap:6, alignItems:'center', flexShrink:0 }}>
              <span style={{ color:'#94a3b8' }}>{t.l}</span>
              <span className="rh-price" style={{ color:'#fff', fontSize:12 }}>{t.v.toFixed(t.v>100?2:4)}</span>
              <span className={t.c>=0?'rh-up':'rh-dn'} style={{ fontSize:11 }}>{t.c>=0?'▲':'▼'}{Math.abs(t.c).toFixed(2)}%</span>
              <span style={{ color:'#334155' }}>│</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── BREAKING BANNER ── */}
      {hero && (
        <div style={{ background:`${p}12`, borderBottom:`1px solid ${p}25`, padding:'8px 16px' }}>
          <div className="rh-wrap" style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ background:'#ef4444', color:'#fff', padding:'2px 8px', borderRadius:3, fontSize:10, fontWeight:900, letterSpacing:'0.06em', flexShrink:0 }}>{siteCfg.breakingLabel}</span>
            <Link href={`/article/${siteSlug}/${hero.slug}`} style={{ fontSize:13, fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{hero.title}</Link>
            <span style={{ fontSize:11, color:'#9ca3af', whiteSpace:'nowrap', marginLeft:'auto' }}>Just now</span>
          </div>
        </div>
      )}

      {/* ── NEWSLETTER MODAL ── */}
      <div id="rh-newsletter-modal" style={{ display:'none', position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, alignItems:'center', justifyContent:'center', padding:16 }}
        onClick={e => { if ((e.target as HTMLDivElement).id==='rh-newsletter-modal') (e.currentTarget as HTMLDivElement).style.display='none' }}>
        <div style={{ background:'#fff', borderRadius:12, padding:28, maxWidth:440, width:'100%', boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
            <div>
              <div style={{ fontWeight:900, fontSize:20, color:'#111', marginBottom:4 }}>📧 Subscribe to {site.name}</div>
              <div style={{ fontSize:13, color:'#6b7280' }}>Top stories every morning. 50,000+ professionals.</div>
            </div>
            <button onClick={() => { const el=document.getElementById('rh-newsletter-modal'); if(el) el.style.display='none' }} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#9ca3af', lineHeight:1 }}>×</button>
          </div>
          <NewsletterForm siteId={site.id} siteName={site.name} p={p} />
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="rh-wrap" style={{ padding:'20px 16px' }}>
        <div className="rh-grid">

          {/* LEFT COLUMN: MAIN CONTENT */}
          <main style={{ minWidth:0 }}>

            {/* HERO + SECONDARY */}
            {hero && (
              <div className="rh-hero">
                <Link href={`/article/${siteSlug}/${hero.slug}`}>
                  <div className="rh-card" style={{ cursor:'pointer', height:'100%' }}>
                    {hero.cover_image_url && <img src={hero.cover_image_url} alt={hero.title} width={800} height={320} style={{ width:'100%', height:300, objectFit:'cover' }} loading="eager" />}
                    <div style={{ padding:18 }}>
                      {hero.category && <span style={{ background:p, color:'#fff', padding:'2px 8px', fontSize:9, fontWeight:900, borderRadius:2, letterSpacing:'0.06em', textTransform:'uppercase' }}>{hero.category}</span>}
                      <h1 className="rh-hero-title" style={{ fontSize:24, fontWeight:900, lineHeight:1.2, margin:'10px 0 8px', color:'#111', fontFamily:'Georgia,serif' }}>{hero.title}</h1>
                      <p style={{ color:'#4b5563', lineHeight:1.6, fontSize:14, marginBottom:10 }}>{hero.excerpt}</p>
                      <div style={{ fontSize:11, color:'#9ca3af', display:'flex', gap:10, flexWrap:'wrap' }}>
                        <span>By <strong style={{color:'#374151'}}>{hero.author_name||'Editorial'}</strong></span>
                        <span>· {hero.published_at ? new Date(hero.published_at).toLocaleDateString('en-GB',{month:'short',day:'numeric',year:'numeric'}) : ''}</span>
                        <span style={{ color:p, fontWeight:600 }}>Read story →</span>
                      </div>
                    </div>
                  </div>
                </Link>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ fontWeight:800, fontSize:12, textTransform:'uppercase', letterSpacing:'0.06em', color:'#374151', paddingBottom:8, borderBottom:`2px solid ${p}` }}>Top Stories</div>
                  {secondary.map((art:any) => (
                    <Link key={art.slug} href={`/article/${siteSlug}/${art.slug}`}>
                      <div className="rh-card" style={{ display:'flex', gap:10, padding:12, cursor:'pointer' }}>
                        {art.cover_image_url && <img src={art.cover_image_url} alt="" width={76} height={54} style={{ width:76, height:54, objectFit:'cover', borderRadius:3, flexShrink:0 }} loading="lazy" />}
                        <div style={{ minWidth:0 }}>
                          {art.category && <span style={{ fontSize:9, fontWeight:800, color:p, letterSpacing:'0.06em', textTransform:'uppercase' }}>{art.category}</span>}
                          <div style={{ fontWeight:700, fontSize:13, lineHeight:1.3, marginTop:3, color:'#111', fontFamily:'Georgia,serif' }}>{art.title}</div>
                          <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>By {art.author_name||'Editorial'}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* LIVE MARKETS TABLE */}
            <div id="markets" className="rh-card" style={{ marginBottom:20 }}>
              <div style={{ padding:'12px 16px 0', borderBottom:'1px solid #e5e7eb' }}>
                <div className="rh-flex-between" style={{ marginBottom:10 }}>
                  <h2 style={{ fontSize:15, fontWeight:800, color:'#111', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:8, height:8, background:'#ef4444', borderRadius:'50%', display:'inline-block', animation:'pulse 1.5s infinite' }}></span>
                    Markets Live
                  </h2>
                  <Link href={`/${routePrefix}/${siteSlug}?category=Markets`}><span style={{ fontSize:12, color:p, fontWeight:600 }}>All markets ›</span></Link>
                </div>
                <div style={{ display:'flex', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
                  {['Indices','Stocks','Commodities','Currencies','ETFs','Crypto'].map(t => (
                    <button key={t} className={`rh-tab${tab===t?' on':''}`} onClick={() => setTab(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
                  <thead><tr style={{ background:'#f9fafb', fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.04em' }}>
                    <th style={{ padding:'7px 14px', textAlign:'left' }}>Name</th>
                    <th style={{ padding:'7px 14px', textAlign:'right' }}>Last</th>
                    <th style={{ padding:'7px 14px', textAlign:'right' }}>High</th>
                    <th style={{ padding:'7px 14px', textAlign:'right' }}>Low</th>
                    <th style={{ padding:'7px 14px', textAlign:'right' }}>Chg%</th>
                  </tr></thead>
                  <tbody>
                    {(tabData[tab]||indices).slice(0,8).map((item:any,i:number) => (
                      <tr key={i} style={{ borderBottom:'1px solid #f3f4f6', fontSize:13 }}>
                        <td style={{ padding:'9px 14px', display:'flex', alignItems:'center', gap:7, fontWeight:600 }}>
                          <span>{item.flag||'🌐'}</span><span style={{ color:'#111' }}>{item.name||item.pair||item.symbol}</span>
                        </td>
                        <td style={{ padding:'9px 14px', textAlign:'right' }}>
                          <span className={`rh-price ${item.pct>=0?'rh-up':'rh-dn'}`}>{item.price.toFixed(item.price>100?2:4)}</span>
                        </td>
                        <td style={{ padding:'9px 14px', textAlign:'right', color:'#9ca3af', fontSize:12 }}>{(item.hi||item.price*1.002).toFixed(2)}</td>
                        <td style={{ padding:'9px 14px', textAlign:'right', color:'#9ca3af', fontSize:12 }}>{(item.lo||item.price*0.998).toFixed(2)}</td>
                        <td style={{ padding:'9px 14px', textAlign:'right' }}>
                          <span style={{ color:item.pct>=0?'#16a34a':'#dc2626', fontWeight:700, fontSize:12 }}>{item.pct>=0?'+':''}{item.pct.toFixed(2)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CHART */}
            <ChartSection p={p} siteSlug={siteSlug} siteType={site.site_type} />

            {/* WORLD INDICES + COMMODITIES */}
            <div className="rh-2col" style={{ marginBottom:20 }}>
              {[{title:'🌍 World Indices',data:indices,href:`/${routePrefix}/${siteSlug}?category=Markets`},{title:'⚡ Commodities',data:commodities,href:`/${routePrefix}/${siteSlug}?category=Commodities`}].map(({title,data,href}) => (
                <div key={title} className="rh-card">
                  <div style={{ padding:'10px 14px', borderBottom:'1px solid #e5e7eb' }} className="rh-flex-between">
                    <span style={{ fontWeight:800, fontSize:14 }}>{title}</span>
                    <Link href={href}><span style={{ fontSize:11, color:p }}>View all ›</span></Link>
                  </div>
                  {data.slice(0,6).map((item:any,i:number) => (
                    <div key={i} className="rh-mrow">
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{item.flag} {item.name||item.pair}</div>
                        {item.month && <div style={{ fontSize:11, color:'#9ca3af' }}>{item.month}</div>}
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div className="rh-price" style={{ fontSize:13, color:'#111' }}>{item.price.toFixed(2)}</div>
                        <div style={{ fontSize:11, fontWeight:700 }} className={item.pct>=0?'rh-up':'rh-dn'}>{item.pct>=0?'+':''}{item.pct.toFixed(2)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* NEWSLETTER INLINE (mobile visible) */}
            <div className="rh-card" style={{ marginBottom:20, background:`linear-gradient(135deg,${p},#1e293b)`, border:'none', padding:20 }}>
              <div style={{ fontWeight:900, fontSize:17, color:'#fff', marginBottom:6 }}>📧 Free Daily Briefing from {site.name}</div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', marginBottom:14, lineHeight:1.6 }}>Top market stories delivered every morning. 50,000+ professionals.</p>
              <NewsletterForm siteId={site.id} siteName={site.name} p={p} dark />
            </div>

            {/* ANALYSIS & OPINION */}
            {opinions.length > 0 && (
              <div className="rh-card" style={{ marginBottom:20 }}>
                <div className="rh-flex-between" style={{ padding:'12px 16px', borderBottom:'1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize:15, fontWeight:800 }}>💡 Analysis & Opinion</h2>
                  <Link href={`/${routePrefix}/${siteSlug}?category=Analysis`}><span style={{ fontSize:12, color:p, fontWeight:600 }}>Show more ›</span></Link>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))' }}>
                  {opinions.map((art:any,i:number) => (
                    <Link key={art.slug} href={`/article/${siteSlug}/${art.slug}`}>
                      <div style={{ padding:'14px 16px', borderBottom:'1px solid #f3f4f6', cursor:'pointer', display:'flex', gap:12 }}>
                        {art.cover_image_url && <img src={art.cover_image_url} alt="" width={60} height={44} style={{ width:60, height:44, objectFit:'cover', borderRadius:4, flexShrink:0 }} loading="lazy" />}
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:13, lineHeight:1.35, color:'#111', fontFamily:'Georgia,serif', marginBottom:4 }}>{art.title}</div>
                          <div style={{ fontSize:11, color:'#6b7280' }}>By <span style={{ color:p, fontWeight:600 }}>{art.author_name||'Editorial'}</span></div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ARTICLE FEED */}
            <div className="rh-card" style={{ marginBottom:20 }}>
              <div className="rh-flex-between" style={{ padding:'12px 16px', borderBottom:'1px solid #e5e7eb', flexWrap:'wrap', gap:8 }}>
                <h2 style={{ fontSize:15, fontWeight:800 }}>{sp.category || 'Latest News'}</h2>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <Link href={`/${routePrefix}/${siteSlug}`}><span style={{ fontSize:11, padding:'3px 10px', background:!sp.category?p:'#f3f4f6', color:!sp.category?'#fff':'#374151', borderRadius:12, fontWeight:600, cursor:'pointer' }}>All</span></Link>
                  {cats.slice(0,5).map((cat:string) => (
                    <Link key={cat} href={`/${routePrefix}/${siteSlug}?category=${encodeURIComponent(cat)}`}>
                      <span style={{ fontSize:11, padding:'3px 10px', background:sp.category===cat?p:'#f3f4f6', color:sp.category===cat?'#fff':'#374151', borderRadius:12, fontWeight:600, cursor:'pointer' }}>{cat}</span>
                    </Link>
                  ))}
                </div>
              </div>
              {rest.map((art:any) => (
                <Link key={art.slug} href={`/article/${siteSlug}/${art.slug}`}>
                  <div style={{ display:'flex', gap:14, padding:'14px 16px', borderBottom:'1px solid #f3f4f6', cursor:'pointer' }}>
                    {art.cover_image_url && <img src={art.cover_image_url} alt="" className="rh-feed-img" width={136} height={92} style={{ width:136, height:92, objectFit:'cover', borderRadius:5, flexShrink:0 }} loading="lazy" />}
                    <div style={{ flex:1, minWidth:0 }}>
                      {art.category && <span style={{ fontSize:9, fontWeight:800, color:p, letterSpacing:'0.06em', textTransform:'uppercase' }}>{art.category}</span>}
                      <h3 className="rh-article-title" style={{ fontWeight:800, fontSize:16, lineHeight:1.3, margin:'4px 0 6px', color:'#111', fontFamily:'Georgia,serif' }}>{art.title}</h3>
                      <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.6, marginBottom:6 }}>{art.excerpt?.slice(0,120)}...</p>
                      <div style={{ fontSize:11, color:'#9ca3af', display:'flex', gap:10, flexWrap:'wrap' }}>
                        <span>By <strong style={{color:'#374151'}}>{art.author_name||'Editorial'}</strong></span>
                        <span>· {art.published_at ? new Date(art.published_at).toLocaleDateString('en-GB',{month:'short',day:'numeric',year:'numeric'}) : ''}</span>
                        <span>· ⏱ {art.read_time_minutes||5} min</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* SCREENER */}
            <div id="screener" className="rh-card" style={{ marginBottom:20 }}>
              <div className="rh-flex-between" style={{ padding:'12px 16px', borderBottom:'1px solid #e5e7eb', flexWrap:'wrap', gap:8 }}>
                <h2 style={{ fontSize:15, fontWeight:800 }}>🔍 Market Screener</h2>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {SCREENER_DATA.map(t => (
                    <button key={t} onClick={() => setScreenerTab(t)} style={{ padding:'3px 10px', background:screenerTab===t?p:'#f3f4f6', color:screenerTab===t?'#fff':'#374151', border:'none', borderRadius:10, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'sans-serif' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
                <table className="rh-market-tbl" style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                  <thead><tr style={{ background:'#f9fafb', fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase' }}>
                    <th style={{ padding:'7px 14px', textAlign:'left' }}>Symbol</th>
                    <th style={{ padding:'7px 14px', textAlign:'right' }}>Price</th>
                    <th style={{ padding:'7px 14px', textAlign:'right' }}>Chg%</th>
                    <th style={{ padding:'7px 14px', textAlign:'right' }}>Volume</th>
                    <th style={{ padding:'7px 14px', textAlign:'right' }}>Rating</th>
                  </tr></thead>
                  <tbody>
                    {stocks.map((s:any,i:number) => (
                      <tr key={i} style={{ borderBottom:'1px solid #f3f4f6', fontSize:13 }}>
                        <td style={{ padding:'9px 14px' }}>
                          <div style={{ fontWeight:700, color:'#111' }}>{s.symbol}</div>
                          <div style={{ fontSize:11, color:'#9ca3af' }}>{s.name}</div>
                        </td>
                        <td style={{ padding:'9px 14px', textAlign:'right' }} className="rh-price">${s.price.toFixed(2)}</td>
                        <td style={{ padding:'9px 14px', textAlign:'right', fontWeight:700 }} className={s.pct>=0?'rh-up':'rh-dn'}>{s.pct>=0?'+':''}{s.pct.toFixed(2)}%</td>
                        <td style={{ padding:'9px 14px', textAlign:'right', color:'#9ca3af', fontSize:12 }}>{(Math.random()*50+10).toFixed(1)}M</td>
                        <td style={{ padding:'9px 14px', textAlign:'right' }}>
                          <span style={{ background:s.pct>=1?'#dcfce7':s.pct>-0.5?'#fef3c7':'#fee2e2', color:s.pct>=1?'#16a34a':s.pct>-0.5?'#92400e':'#dc2626', padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:700 }}>
                            {s.pct>=1?'Buy':s.pct>=-0.5?'Neutral':'Sell'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ECONOMIC CALENDAR */}
            <div id="calendar" className="rh-card" style={{ marginBottom:20, overflow:'hidden' }}>
              <div className="rh-flex-between" style={{ padding:'12px 16px', borderBottom:'1px solid #e5e7eb' }}>
                <h2 style={{ fontSize:15, fontWeight:800 }}>📅 Economic Calendar — Live Events</h2>
                <Link href={`/${routePrefix}/${siteSlug}#calendar`}><span style={{ fontSize:12, color:p, fontWeight:600 }}>Filter ›</span></Link>
              </div>
              <iframe
                src="https://s.tradingview.com/external-embedding/embed-widget-events.html?locale=en&colorTheme=light&isTransparent=false&width=100%25&height=100%25&importanceFilter=-1%2C0%2C1&countryFilter=us%2Ceu%2Cgb%2Cjp%2Ccn%2Cca%2Cau%2Cde%2Cfr%2Cch"
                style={{ width:'100%', height:460, border:'none', display:'block' }}
                title="Economic Calendar"
                loading="lazy"
              />
            </div>
          </main>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="rh-sidebar" style={{ minWidth:0 }}>

            {/* NEWSLETTER */}
            <div style={{ background:`linear-gradient(135deg,${p},#1e293b)`, borderRadius:6, padding:18, marginBottom:14, color:'#fff' }}>
              <div style={{ fontWeight:900, fontSize:16, marginBottom:5 }}>📧 Free Daily Briefing</div>
              <p style={{ fontSize:12, opacity:0.8, lineHeight:1.6, marginBottom:14 }}>Top stories from {site.name} every morning. 50,000+ professionals.</p>
              <NewsletterForm siteId={site.id} siteName={site.name} p={p} dark />
            </div>

            {/* FOREX */}
            <div className="rh-card" style={{ marginBottom:14 }}>
              <div className="rh-flex-between" style={{ padding:'10px 14px', borderBottom:'1px solid #e5e7eb' }}>
                <span style={{ fontWeight:800, fontSize:13 }}>💱 Forex Rates</span>
                <Link href={`/${routePrefix}/${siteSlug}?category=Forex`}><span style={{ fontSize:11, color:p }}>All ›</span></Link>
              </div>
              {currencies.slice(0,6).map((c:any,i:number) => (
                <div key={i} className="rh-mrow">
                  <span style={{ fontWeight:600, fontSize:13 }}>{c.pair}</span>
                  <div style={{ textAlign:'right' }}>
                    <div className="rh-price" style={{ fontSize:12 }}>{c.price.toFixed(4)}</div>
                    <div style={{ fontSize:11, fontWeight:700 }} className={c.pct>=0?'rh-up':'rh-dn'}>{c.pct>=0?'+':''}{c.pct.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* TRENDING */}
            <div className="rh-card" style={{ marginBottom:14 }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid #e5e7eb', fontWeight:800, fontSize:13 }}>🔥 Trending</div>
              {trending.map((art:any,i:number) => (
                <Link key={i} href={`/article/${siteSlug}/${art.slug}`}>
                  <div style={{ display:'flex', gap:10, padding:'10px 14px', borderBottom:'1px solid #f3f4f6', cursor:'pointer', alignItems:'flex-start' }}>
                    <span style={{ fontSize:22, fontWeight:900, color:'#e5e7eb', lineHeight:1, minWidth:26, flexShrink:0 }}>{i+1}</span>
                    <div style={{ minWidth:0 }}>
                      {art.category && <span style={{ fontSize:9, fontWeight:800, color:p, letterSpacing:'0.06em', textTransform:'uppercase' }}>{art.category}</span>}
                      <div style={{ fontWeight:600, fontSize:13, lineHeight:1.4, color:'#111', marginTop:2 }}>{art.title}</div>
                      <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>By {art.author_name||'Editorial'}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* MINI CHART */}
            <div className="rh-card" style={{ marginBottom:14, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid #e5e7eb', fontWeight:800, fontSize:13 }}>Gold Spot (XAU/USD)</div>
              <div style={{ height:200 }}>
                <iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tv_sidebar&symbol=FOREXCOM%3AXAUUSD&interval=60&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&theme=light&style=3&timezone=exchange"
                  style={{ width:'100%', height:'100%', border:'none', display:'block' }} title="Gold Mini" loading="lazy" />
              </div>
            </div>

            {/* TOPICS */}
            <div className="rh-card" style={{ marginBottom:14 }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid #e5e7eb', fontWeight:800, fontSize:13 }}>Browse Topics</div>
              <div style={{ padding:14, display:'flex', flexWrap:'wrap', gap:6 }}>
                {cats.map((cat:string) => (
                  <Link key={cat} href={`/${routePrefix}/${siteSlug}?category=${encodeURIComponent(cat)}`}>
                    <span style={{ fontSize:12, fontWeight:600, color:p, border:`1px solid ${p}30`, background:`${p}08`, padding:'4px 12px', borderRadius:3, cursor:'pointer', display:'block' }}>{cat}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="rh-card" style={{ marginBottom:14 }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid #e5e7eb', fontWeight:800, fontSize:13 }}>Quick Links</div>
              <div style={{ padding:'8px 0' }}>
                {[{l:'📈 Live Charts',h:'/charts'},{l:'🎓 Academy',h:'/academy'},{l:'🔍 Search',h:'/search'},{l:'📋 Sitemap',h:'/sitemap.xml'},{l:'📬 Contact',h:'/legal/contact'},{l:'📣 Advertise',h:'/legal/advertise'}].map(({l,h}) => (
                  <Link key={h} href={h}><div style={{ padding:'8px 14px', fontSize:13, color:'#374151', borderBottom:'1px solid #f9fafb', cursor:'pointer' }}>{l}</div></Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background:'#0f172a', color:'#64748b', marginTop:20 }}>
        <div className="rh-wrap" style={{ padding:'40px 16px 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:28, marginBottom:28 }}>
            <div>
              <Link href={`/${routePrefix}/${siteSlug}`}><div style={{ fontWeight:900, fontSize:20, color:'#fff', marginBottom:10 }}>{site.name}</div></Link>
              <p style={{ fontSize:13, lineHeight:1.7, color:'#475569', marginBottom:16 }}>{site.tagline || 'Professional intelligence for global business.'}</p>
              <NewsletterForm siteId={site.id} siteName={site.name} p={p} dark />
            </div>
            {[
              { title:'Coverage', links: cats.slice(0,5).map((c:string) => ({ label:c, href:`/${routePrefix}/${siteSlug}?category=${encodeURIComponent(c)}` })) },
              { title:'Markets',  links:[{label:'World Indices',href:`/${routePrefix}/${siteSlug}#markets`},{label:'Commodities',href:`/${routePrefix}/${siteSlug}?category=Commodities`},{label:'Forex Rates',href:`/${routePrefix}/${siteSlug}?category=Forex`},{label:'Screener',href:`/${routePrefix}/${siteSlug}#screener`},{label:'Calendar',href:`/${routePrefix}/${siteSlug}#calendar`},{label:'Live Charts',href:'/charts'}] },
              { title:'Company',  links:[{label:'About Us',href:'/legal/about'},{label:'Contact',href:'/legal/contact'},{label:'Advertise',href:'/legal/advertise'},{label:'Academy',href:'/academy'},{label:'Search',href:'/search'}] },
              { title:'Legal',    links:[{label:'Privacy Policy',href:'/legal/privacy'},{label:'Terms of Use',href:'/legal/terms'},{label:'Risk Warning',href:'/legal/risk-warning'},{label:'Cookie Policy',href:'/legal/cookies'},{label:'Sitemap',href:'/sitemap.xml'}] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight:700, fontSize:11, color:'#94a3b8', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.08em' }}>{col.title}</div>
                {col.links.map((l:any) => <Link key={l.label} href={l.href}><div style={{ fontSize:13, color:'#475569', marginBottom:8, cursor:'pointer' }}>{l.label}</div></Link>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid #1e293b', paddingTop:16, fontSize:11, color:'#334155', lineHeight:1.8, marginBottom:12 }}>
            <strong style={{color:'#475569'}}>Risk Disclosure:</strong> Trading in financial instruments involves high risks including the risk of losing some or all of your investment. Prices may not be real-time or accurate. Content is for informational purposes only and does not constitute investment advice. RepHuby Intelligence Ltd is not authorised by the Financial Conduct Authority to provide investment advice.
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:14, borderTop:'1px solid #1e293b', flexWrap:'wrap', gap:10 }}>
            <span style={{ fontSize:12, color:'#334155' }}>© {new Date().getFullYear()} {site.name} · RepHuby Intelligence Ltd · All Rights Reserved</span>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              {[{l:'Privacy',h:'/legal/privacy'},{l:'Terms',h:'/legal/terms'},{l:'Risk Warning',h:'/legal/risk-warning'},{l:'Cookies',h:'/legal/cookies'},{l:'Contact',h:'/legal/contact'}].map(({l,h}) => (
                <Link key={l} href={h}><span style={{ fontSize:11, color:'#334155', cursor:'pointer' }}>{l}</span></Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
