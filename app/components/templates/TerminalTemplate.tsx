'use client'
import MobileNav from '@/app/components/MobileNav'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const IMGS = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1526628953301-3cd9e37dc0d7?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1518183214770-9cffbec72538?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=1200&q=80&fm=jpg',
]
// Use slug to generate consistent unique image per article (not position-based)
function slugHash(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) & 0xffffffff
  return Math.abs(h)
}
const getImg = (a: any, i: number) => {
  if (a?.cover_image_url && a.cover_image_url.startsWith('http')) return a.cover_image_url
  const hash = a?.slug ? slugHash(a.slug) : i
  return IMGS[hash % IMGS.length]
}

const TICKERS = [
  { sym:'EUR/USD', price:'1.1124', chg:'+0.18%', up:true },
  { sym:'GBP/USD', price:'1.3482', chg:'+0.09%', up:true },
  { sym:'XAU/USD', price:'4,404', chg:'-0.56%', up:false },
  { sym:'BTC/USD', price:'76,210', chg:'-1.9%', up:false },
  { sym:'S&P 500', price:'5,842.3', chg:'+0.31%', up:true },
  { sym:'WTI OIL', price:'63.18', chg:'-4.8%', up:false },
  { sym:'ETH/USD', price:'2,071', chg:'-1.9%', up:false },
  { sym:'NASDAQ', price:'19,486', chg:'+0.44%', up:true },
]

const SITE_META: Record<string, { name:string; domain:string; accent:string; desc:string }> = {
  'finance-terminal': { name:'Finvexx', domain:'finvexx.com',   accent:'#00C805', desc:'Financial Markets & Investment Intelligence' },
  'market-radar':     { name:'Signalix',domain:'signalix.com',  accent:'#F59E0B', desc:'Market Signals & Technical Analysis'         },
  'invest-data':      { name:'InvexHub',domain:'invexhub.com',  accent:'#0EA5E9', desc:'Investment Intelligence & Fund Data'         },
}

const NAVTABS = ['LIVE','MARKETS','FINANCE','FOREX','COMMODITIES','ANALYSIS','CRYPTO']
const NAV_FILTER: Record<string, string[]> = {
  'LIVE':        [],
  'MARKETS':     ['markets','equities','stocks'],
  'FINANCE':     ['finance','banking','rates','bonds'],
  'FOREX':       ['forex','currency','fx','dollar'],
  'COMMODITIES': ['commodities','gold','oil','silver'],
  'ANALYSIS':    ['analysis','research','report','outlook'],
  'CRYPTO':      ['crypto','bitcoin','ethereum','digital'],
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 3600) return `${Math.floor(s/60)}h`
  if (s < 86400) return `${Math.floor(s/3600)}h`
  return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'})
}

function Newsletter({ siteName, accent }: any) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  async function sub(e: React.FormEvent) {
    e.preventDefault()
    try { await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,siteName})}) } catch {}
    setDone(true)
  }
  if (done) return <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:12,color:accent,padding:'10px 16px',border:`1px solid ${accent}`,borderRadius:2}}>✓ SUBSCRIBED — BRIEFING ACTIVE</div>

  return (
    <form onSubmit={sub} style={{display:'flex',gap:6,flexWrap:'wrap'}}>

            <input value={email} onChange={(e:any)=>setEmail(e.target.value)} type="email" placeholder="your@email.com" required
        style={{flex:1,padding:'8px 14px',background:'#ffffff',border:'1px solid #e5e7eb',color:'#1a1a2e',fontFamily:'IBM Plex Mono,monospace',fontSize:12,outline:'none',minWidth:180}}/>
      <button type="submit" style={{padding:'8px 18px',background:accent,color:'#000',border:'none',fontFamily:'IBM Plex Mono,monospace',fontWeight:700,fontSize:12,cursor:'pointer'}}>SUBSCRIBE</button>
    </form>
  )
}
export default function TerminalTemplate({ articles = [], site, siteSlug, primaryColor }: any) {
  const [activeTab, setActiveTab] = useState('LIVE')
  const [clock, setClock] = useState('')

  const meta = SITE_META[siteSlug] || { name: site?.name || 'FINVEXX', domain:'finvexx.com', accent:'#00C805', desc:'Financial Intelligence' }
  const accent = primaryColor || meta.accent

  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toISOString().slice(0,19).replace('T',' ')+' UTC'), 1000)
    setClock(new Date().toISOString().slice(0,19).replace('T',' ')+' UTC')
    return () => clearInterval(t)
  }, [])

  const [searchQ, setSearchQ] = useState(('' as string))

  // Filter by tab: exact category match first, then keyword match in title
  const keywords = NAV_FILTER[activeTab] || []
  const filtered = keywords.length === 0
    ? articles
    : articles.filter((a: any) => {
        const cat = (a.category || '').toLowerCase().trim()
        const title = (a.title || '').toLowerCase()
        const tab = activeTab.toLowerCase()
        // Exact category match OR keyword in title
        return cat === tab || cat.startsWith(tab) || keywords.some(k => title.includes(k) || cat.includes(k))
      })

  // Search overrides tab filter
  const visible = searchQ.trim()
    ? articles.filter((a: any) => `${a.title} ${a.excerpt||''} ${a.category||''}`.toLowerCase().includes(searchQ.toLowerCase()))
    : filtered

  const hero = visible[0]
  const col1 = visible.slice(1, 7)
  const col2 = visible.slice(7, 13)
  const col3 = visible.slice(13, 19)
  // If not enough for 3 cols, cycle through
  const fill = (arr: any[], start: number, count: number) => {
    if (arr.length >= count) return arr
    const extra = articles.slice(start).filter((a: any) => !arr.find((x: any) => x.id === a.id))
    return [...arr, ...extra].slice(0, count)
  }

  const MobileLayout = () => (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:'#f1f5f9',minHeight:'100vh',paddingTop:88}}>
      <MobileNav siteName={meta.name} domain={meta.domain} accentColor={accent}
        sections={['All','Markets','Forex','Rates','Macro','Analysis']} activeSection="All" onSectionChange={()=>{}}
        logoStyle="serif"/>
      <div style={{padding:'12px 16px 28px'}}>
        {articles[0] && (
          <a href={`/article/${siteSlug}/${articles[0].slug}`} style={{display:'block',textDecoration:'none',background:'#fff',borderRadius:10,overflow:'hidden',marginBottom:16,marginTop:16,boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}}>
            <img referrerPolicy="no-referrer" crossOrigin="anonymous"
              src={articles[0].cover_image_url||`https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=75`}
              alt={articles[0].title} style={{width:'100%',height:200,objectFit:'cover'}}
              onError={(e:any)=>{e.currentTarget.style.display='none'}}/>
            <div style={{padding:'14px'}}>
              <span style={{fontSize:9,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:accent,display:'block',marginBottom:6}}>{articles[0].category||'Markets'}</span>
              <div style={{fontFamily:"'IBM Plex Mono','Courier New',monospace",fontSize:18,fontWeight:700,lineHeight:1.25,color:'#1a1a2e',marginBottom:8}}>{articles[0].title}</div>
              <div style={{fontSize:13,color:'#64748b',lineHeight:1.6}}>{(articles[0].excerpt||'').slice(0,130)}…</div>
              <div style={{fontSize:11,color:'#94a3b8',marginTop:8,fontFamily:'monospace'}}>{new Date(articles[0].published_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} · {articles[0].read_time_minutes||4} min</div>
            </div>
          </a>
        )}
        <div style={{fontSize:9,fontWeight:800,letterSpacing:'.12em',color:'#94a3b8',marginBottom:12,fontFamily:'monospace',textTransform:'uppercase'}}>Latest</div>
        {articles.slice(1,25).map((a:any,i:number)=>(
          <a key={a.id} href={`/article/${siteSlug}/${a.slug}`}
            style={{display:'flex',gap:12,background:'#fff',borderRadius:8,marginBottom:10,overflow:'hidden',textDecoration:'none',boxShadow:'0 1px 6px rgba(0,0,0,0.05)',alignItems:'stretch'}}>
            <img referrerPolicy="no-referrer" crossOrigin="anonymous"
              src={a.cover_image_url||`https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=200&q=60`}
              alt={a.title} style={{width:88,height:72,objectFit:'cover',flexShrink:0}}
              onError={(e:any)=>{e.currentTarget.style.display='none'}}/>
            <div style={{flex:1,padding:'10px 12px 10px 0',minWidth:0}}>
              <span style={{fontSize:9,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:accent,display:'block',marginBottom:3}}>{a.category||'Markets'}</span>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:600,lineHeight:1.3,color:'#1a1a2e',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.title}</div>
              <div style={{fontSize:10,color:'#94a3b8',marginTop:4,fontFamily:'monospace'}}>{new Date(a.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
            </div>
          </a>
        ))}
      </div>
      <div style={{background:'#f8fafc',color:'#64748b',padding:'20px 16px',borderTop:'1px solid #e2e8f0'}}>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:'#fff',marginBottom:4}}>{meta.name}</div>
        <div style={{fontSize:11,marginBottom:12,lineHeight:1.6}}>{meta.desc} · For informational purposes only.</div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:8}}>
          {[['Privacy','/legal/privacy'],['Terms','/legal/terms'],['About','/legal/about']].map(([l,h])=>(<a key={l} href={h} style={{color:'#475569',fontSize:11,textDecoration:'none'}}>{l}</a>))}
        </div>
        <div style={{fontSize:10,color:'#334155',marginTop:8}}>© {new Date().getFullYear()} {meta.domain}</div>
      </div>
    </div>
  )



  return (
    <>
      <div className="tm2-mobile" style={{display:'none'}}><MobileLayout/></div>
      <div className="tm2-desktop" style={{display:'block'}}>
    <div style={{fontFamily:"'IBM Plex Mono','Courier New',monospace",background:'#f8fafc',color:'#1a1a2e',minHeight:'100vh'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} a{text-decoration:none;color:inherit} img{max-width:100%;display:block}
        .trow:hover{background:rgba(255,255,255,0.04)}
        .tick-anim{animation:tscroll 35s linear infinite}
        @keyframes tscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .up{color:#00C805} .dn{color:#FF4B4B}
        .blink{animation:blink 1.2s step-end infinite}
        @keyframes blink{50%{opacity:0}}
        .nav-tab{font-family:IBM Plex Mono,monospace;font-size:12px;font-weight:700;padding:8px 16px;border:1px solid transparent;cursor:pointer;letter-spacing:.06em;color:#555;background:none;transition:all .2s}
        .nav-tab:hover{color:#C9D1D9;border-color:#30363D}
        .nav-tab.on{color:${accent};border-color:${accent}30;background:${accent}10}
        .term-link:hover{color:${accent}}}

        @media(max-width:768px){
          .term-grid{grid-template-columns:1fr!important}
          .term-sidebar{display:none!important}
          .term-list{grid-template-columns:1fr!important}
          .term-nav{flex-wrap:wrap!important;gap:4px!important}
          .term-nav a{font-size:11px!important;padding:4px 8px!important}
        }
        @media(max-width:480px){
          h1,h2{font-size:20px!important;line-height:1.2!important}
          h3{font-size:16px!important}
          .term-hero{padding:20px 14px!important}
          p{font-size:14px!important;line-height:1.6!important}
        }h2{font-size:16px!important}.tabs a{font-size:11px!important;padding:4px 8px!important}}
          .term-sidebar{display:none!important}
          .term-nav{overflow-x:auto;white-space:nowrap}
          h1{font-size:20px!important}
          }
      `}</style>

      {/* Ticker */}
      <div style={{background:'#f8fafc',borderBottom:`1px solid ${accent}20`,overflow:'hidden',height:34,display:'flex',alignItems:'center'}}>
        <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,fontWeight:700,color:accent,padding:'0 16px',borderRight:`1px solid ${accent}20`,flexShrink:0,height:'100%',display:'flex',alignItems:'center',letterSpacing:'.08em'}}>
          {meta.domain.toUpperCase().split('.')[0]}<span className="blink" style={{marginLeft:3}}>▮</span>
        </div>
        <div style={{overflow:'hidden',flex:1}}>
          <div className="tick-anim" style={{display:'flex',whiteSpace:'nowrap'}}>
            {[...TICKERS,...TICKERS].map((t,i) => (
              <span key={i} style={{padding:'0 20px',borderRight:'1px solid #e5e7eb',fontSize:11,display:'inline-flex',gap:10,alignItems:'center'}}>
                <span style={{color:'#6b7280'}}>{t.sym}</span>
                <span className={t.up?'up':'dn'} style={{fontWeight:700}}>{t.price}</span>
                <span className={t.up?'up':'dn'} style={{fontSize:10}}>{t.chg}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{background:'#f8fafc',borderBottom:'1px solid #e5e7eb',padding:'10px 24px'}}>
        <div style={{maxWidth:1400,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            {/* Clickable logo → homepage */}
            <a href="/" style={{display:'flex',flexDirection:'column'}}>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:26,fontWeight:700,letterSpacing:'-0.02em',lineHeight:1}}>
                <span style={{color:'#1a1a2e'}}>{meta.name.slice(0,-2)}</span>
                <span style={{color:accent}}>{meta.name.slice(-2)}</span>
              </div>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#f1f5f9',letterSpacing:'.04em',marginTop:2}}>{meta.domain}</div>
            </a>
            <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:`${accent}80`,borderLeft:'1px solid #e5e7eb',paddingLeft:14,lineHeight:1.6}}>
              <div style={{color:accent}}>{clock}</div>
              <div style={{color:'#f1f5f9'}}>{meta.desc}</div>
            </div>
          </div>
          <nav style={{display:'flex',gap:4}}>
            {NAVTABS.map(tab => (
              <button key={tab} className={`nav-tab${activeTab===tab?' on':''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',padding:'0 8px',gap:6,flexShrink:0}}>
            <input value={searchQ} onChange={(e:any)=>setSearchQ(e.target.value)}
              placeholder="🔍 Search…"
              style={{padding:'4px 10px',background:'#f1f5f9',border:'1px solid #cbd5e1',color:'#1e293b',fontSize:11,fontFamily:'Inter,sans-serif',outline:'none',borderRadius:2,width:140}}
            />
            {searchQ && <button onClick={()=>setSearchQ('')} style={{background:'none',border:'none',cursor:'pointer',color:'#666',fontSize:11,fontWeight:700}}>✕</button>}
          </div>
          <a href="/podcasts" style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,fontWeight:700,color:'#F59E0B',letterSpacing:'.08em',padding:'0 12px',display:'flex',alignItems:'center',gap:4,textDecoration:'none',flexShrink:0,borderBottom:'2px solid transparent',height:'100%'}}>🎙 PODCAST</a>
          </nav>
        </div>
      </div>

      {/* Price board */}
      <div className="term-price" style={{background:'#f8fafc',borderBottom:'1px solid #e5e7eb'}}>
        <div style={{maxWidth:1400,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:0}}>
          {TICKERS.map((t,i) => (
            <div key={i} style={{padding:'10px 16px',borderRight:'1px solid #e5e7eb',textAlign:'center'}}>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:'#f1f5f9',marginBottom:3,letterSpacing:'.08em'}}>{t.sym}</div>
              <div className={t.up?'up':'dn'} style={{fontFamily:'IBM Plex Mono,monospace',fontSize:14,fontWeight:700}}>{t.price}</div>
              <div className={t.up?'up':'dn'} style={{fontSize:10}}>{t.chg}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 24px'}}>
        <div className="term-cols" style={{display:'grid',gridTemplateColumns:'1.6fr 1fr 1fr 1fr',gap:1,background:'#ffffff',marginBottom:20}}>

          
            {/* Hero */}
          {hero && (
            <div style={{background:'#f8fafc',padding:22}}>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,fontWeight:700,color:accent,letterSpacing:'.1em',marginBottom:10,textTransform:'uppercase'}}>{hero.category} · FEATURED</div>
              <a href={`/article/${siteSlug}/${hero.slug}`} className="term-link">
                <img referrerPolicy="no-referrer" crossOrigin="anonymous" src={getImg(hero,0)} alt={hero.title} style={{width:'100%',height:220,objectFit:'cover',marginBottom:14,border:'1px solid #e5e7eb'}} onError={(e:any)=>{const fb=IMGS[Math.floor(Math.random()*IMGS.length)];e.currentTarget.onerror=null;e.currentTarget.src=fb}}/>
                <div style={{fontFamily:'IBM Plex Sans,sans-serif',fontSize:20,fontWeight:700,color:'#111827',lineHeight:1.3,marginBottom:10}}>{hero.title}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:12,color:'#6b7280',lineHeight:1.6}}>{hero.excerpt?.slice(0,180)}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#f1f5f9',marginTop:10}}>{hero.author_name} · {timeAgo(hero.published_at)}</div>
              </a>
            </div>
          )}

          {/* Cols 2–4 */}
          {[
            {label:'LATEST',   items: col1.length ? col1 : articles.slice(1,7)},
            {label:'ANALYSIS', items: col2.length ? col2 : articles.slice(7,13)},
            {label:'SIGNALS',  items: col3.length ? col3 : articles.slice(13,19)},
          ].map((col) => (
            <div key={col.label} style={{background:'#f8fafc'}}>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,fontWeight:700,color:'#f1f5f9',letterSpacing:'.1em',padding:'10px 16px',borderBottom:'1px solid #e5e7eb',textTransform:'uppercase'}}>{col.label}</div>
              {col.items.map((a: any, idx: number) => (
                <a key={a.id} href={`/article/${siteSlug}/${a.slug}`} className="trow term-link" style={{display:'block',padding:'12px 16px',borderBottom:'1px solid #e5e7eb'}}>
                  <img referrerPolicy="no-referrer" crossOrigin="anonymous" src={getImg(a, idx+1)} alt={a.title} style={{width:'100%',height:80,objectFit:'cover',marginBottom:8,border:'1px solid #e5e7eb'}} onError={(e:any)=>{const fb=IMGS[Math.floor(Math.random()*IMGS.length)];e.currentTarget.onerror=null;e.currentTarget.src=fb}}/>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:accent,marginBottom:4,letterSpacing:'.06em',textTransform:'uppercase'}}>{a.category}</div>
                  <div style={{fontFamily:'IBM Plex Sans,sans-serif',fontSize:13,fontWeight:600,color:'#1a1a2e',lineHeight:1.4,marginBottom:4}}>{a.title}</div>
                  <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#f1f5f9'}}>{timeAgo(a.published_at)}</div>
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* More articles grid */}
        {articles.slice(19).length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'#ffffff',marginBottom:20}}>
            {articles.slice(19,27).map((a: any, i: number) => (
              <a key={a.id} href={`/article/${siteSlug}/${a.slug}`} className="trow term-link" style={{display:'block',padding:'14px 16px',background:'#f8fafc'}}>
                <img referrerPolicy="no-referrer" crossOrigin="anonymous" src={getImg(a,i+19)} alt={a.title} style={{width:'100%',height:90,objectFit:'cover',marginBottom:8,border:'1px solid #e5e7eb'}} onError={(e:any)=>{const fb=IMGS[Math.floor(Math.random()*IMGS.length)];e.currentTarget.onerror=null;e.currentTarget.src=fb}}/>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:9,color:accent,marginBottom:4,letterSpacing:'.06em',textTransform:'uppercase'}}>{a.category}</div>
                <div style={{fontFamily:'IBM Plex Sans,sans-serif',fontSize:13,fontWeight:600,color:'#1a1a2e',lineHeight:1.4}}>{a.title}</div>
                <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#f1f5f9',marginTop:4}}>{timeAgo(a.published_at)}</div>
              </a>
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div style={{background:'#f8fafc',border:`1px solid ${accent}25`,padding:'22px 24px',marginBottom:20}}>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:12,fontWeight:700,color:accent,marginBottom:5,letterSpacing:'.08em'}}>▸ DAILY INTELLIGENCE BRIEFING</div>
          <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#6b7280',marginBottom:14}}>Market data, signals and analysis — delivered 07:00 UTC every trading day. Free subscription.</div>
          <Newsletter siteName={meta.name} accent={accent}/>
        </div>
      </div>

      {/* Legal footer */}
      <div style={{background:'#f8fafc',borderTop:'1px solid #e5e7eb',padding:'20px 24px'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:16}}>
            <div>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:16,fontWeight:700,marginBottom:6}}>
                <span style={{color:'#1a1a2e'}}>{meta.name.slice(0,-2)}</span><span style={{color:accent}}>{meta.name.slice(-2)}</span>
              </div>
              <div style={{fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#f1f5f9',lineHeight:1.7,maxWidth:420}}>
                {meta.desc}. Content is provided for informational purposes only and does not constitute financial advice. Past performance is not indicative of future results.
              </div>
            </div>
            <div style={{display:'flex',gap:32,flexWrap:'wrap'}}>
              {[['About',`/legal/about`],['Privacy Policy',`/legal/privacy`],['Terms of Service',`/legal/terms`],['Disclaimer',`/legal/disclaimer`],['Contact',`https://t.me/rephub_intelligence`]].map(([l,h]) => (
                <a key={l} href={h} style={{fontFamily:'IBM Plex Mono,monospace',fontSize:11,color:'#6b7280',letterSpacing:'.04em'}}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{borderTop:'1px solid #e5e7eb',paddingTop:14,fontFamily:'IBM Plex Mono,monospace',fontSize:10,color:'#374151',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>

            {/* Cross-portal intelligence network */}
            
            <span>© {new Date().getFullYear()} {meta.domain.toUpperCase()} · ALL RIGHTS RESERVED</span>
            <span>RISK WARNING: Trading financial instruments involves substantial risk of loss. Ensure you understand the risks involved.</span>
          </div>
        </div>
      </div>
    </div>
      </div>
    </>
  )
}
