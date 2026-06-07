'use client'
import MobileNav from '@/app/components/MobileNav'
import CookieBanner from '@/app/components/CookieBanner'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const GREEN = '#00B67A'
const DARK = '#191919'

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5

  return (
    <div style={{ display:'flex', gap:1 }}>

            {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= full ? GREEN : (s === full+1 && half) ? 'url(#half)' : '#E8E8E8'}>
          <defs><linearGradient id="half"><stop offset="50%" stopColor={GREEN}/><stop offset="50%" stopColor="#E8E8E8"/></linearGradient></defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function TrustBadge({ rating }: { rating: number }) {
  const cfg = rating >= 4.5 ? { label:'Excellent', bg:'#00B67A' }
    : rating >= 4 ? { label:'Great', bg:'#73CF11' }
    : rating >= 3.5 ? { label:'Good', bg:'#FFCE00', color:'#333' }
    : rating >= 3 ? { label:'Average', bg:'#FF8622' }
    : rating > 0 ? { label:'Poor', bg:'#FF3722' }
    : { label:'New', bg:'#aaa' }
  return <div style={{ background:cfg.bg, color:(cfg as any).color||'#fff', fontWeight:800, fontSize:12, padding:'4px 10px', borderRadius:4 }}>{cfg.label}</div>
}

function CompanyCard({ company, reviewCount, avgRating }: any) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <a href={`/reviews/${company.slug}`} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
      <div style={{ border:'1px solid #E2E8F0', borderRadius:12, padding:0, background:'#fff', transition:'all .2s', overflow:'hidden', height:'100%' }}
        onMouseEnter={(e:any)=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 30px rgba(0,0,0,0.12)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
        onMouseLeave={(e:any)=>{(e.currentTarget as HTMLElement).style.boxShadow='none';(e.currentTarget as HTMLElement).style.transform='none'}}>

        {/* Card header */}
        <div style={{ padding:'20px 20px 0' }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
            {/* Logo — served via our proxy for reliability */}
            <div style={{ width:56, height:56, borderRadius:10, overflow:'hidden', border:'1px solid #E2E8F0', flexShrink:0, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:4 }}>
              {company.logo_url && !imgErr ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  width={48} height={48}
                  style={{ width:48, height:48, objectFit:'contain', display:'block', maxWidth:'100%' }}
                  onError={(e:any) => {
                    const t = e.currentTarget
                    // Try DuckDuckGo favicon as fallback
                    if (!t.dataset.tried2) {
                      t.dataset.tried2 = '1'
                      t.src = `https://icons.duckduckgo.com/ip3/${company.slug === 'etoro' ? 'etoro.com' : company.slug === 'ic-markets' ? 'icmarkets.com' : company.slug === 'interactive-brokers' ? 'interactivebrokers.com' : company.slug + '.com'}.ico`
                    } else {
                      setImgErr(true)
                    }
                  }}
                />
              ) : (
                <div style={{ width:48, height:48, borderRadius:8, background:company.logo_color||GREEN, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:18 }}>
                  {company.logo_letter||company.name.charAt(0)}
                </div>
              )}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                <span style={{ fontWeight:800, fontSize:16, color:DARK }}>{company.name}</span>
                {company.is_verified && <svg width={16} height={16} viewBox="0 0 24 24" fill={GREEN}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
              </div>
              {company.tagline && <div style={{ fontSize:12, color:'#64748B', marginTop:2, lineHeight:1.4 }}>{company.tagline}</div>}
            </div>
            <TrustBadge rating={avgRating} />
          </div>

          {/* Rating row */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <Stars rating={avgRating} size={15} />
            <span style={{ fontSize:14, fontWeight:800, color:DARK }}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
            <span style={{ fontSize:12, color:'#94A3B8' }}>· {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
          </div>

          {/* Meta info */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:12 }}>
            {company.regulation && (
              <span style={{ fontSize:11, fontWeight:600, color:GREEN, background:'#f0fdf8', border:'1px solid #bbf7d0', padding:'2px 8px', borderRadius:100 }}>
                ✓ {company.regulation.split('/')[0].trim()}
              </span>
            )}
            {company.headquarters && (
              <span style={{ fontSize:11, color:'#64748B' }}>📍 {company.headquarters}</span>
            )}
            {company.founded && (
              <span style={{ fontSize:11, color:'#64748B' }}>🗓 Since {company.founded}</span>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize:13, color:'#475569', lineHeight:1.6, marginBottom:16, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {company.description}
          </p>
        </div>

        {/* Card footer */}
        <div style={{ borderTop:'1px solid #F1F5F9', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#FAFBFC' }}>
          <span style={{ fontSize:13, fontWeight:700, color:GREEN }}>Read {reviewCount} reviews →</span>
          {company.website && (
            <span onClick={(e:any)=>{e.preventDefault();e.stopPropagation();window.open(company.website,'_blank')}}
              style={{ fontSize:12, color:'#64748B', padding:'4px 10px', border:'1px solid #E2E8F0', borderRadius:6, cursor:'pointer', background:'#fff', display:'flex', alignItems:'center', gap:4 }}>
              🌐 Visit site
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

export default function TrustTemplate({ articles = [], site, siteSlug, searchParams }: any) {
  const [companies, setCompanies] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState<Record<string,{count:number,avg:number}>>({})
  const [activeCategory, setActiveCategory] = useState((searchParams?.category as string) || 'all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/verivex/companies').then(r=>r.json()),
      fetch('/api/verivex/stats').then(r=>r.json()),
    ]).then(([co,stats])=>{
      setCompanies(co.companies||[])
      setReviewStats(stats.stats||{})
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[])

  const CATS = [
    {id:'all',       label:'All',          icon:'⭐'},
    {id:'forex',     label:'Forex / CFD',  icon:'📈'},
    {id:'crypto',    label:'Crypto',       icon:'₿'},
    {id:'stocks',    label:'Stocks',       icon:'📊'},
    {id:'investment',label:'Investing',    icon:'🏦'},
    {id:'fintech',   label:'Fintech',      icon:'📱'},
    {id:'prop',      label:'Prop Firms',   icon:'🎯'},
    {id:'social',    label:'Copy Trading', icon:'👥'},
  ]

  // Use normalised .group field from API (added by verivex/companies route)
  const filtered = companies.filter((co:any) => {
    if (activeCategory !== 'all' && co.group !== activeCategory) return false
    if (search && !co.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Grouped view for "All" tab
  const GROUP_LABELS: Record<string,{label:string;icon:string}> = {
    forex:     {label:'Top Forex & CFD Brokers', icon:'📈'},
    crypto:    {label:'Top Crypto Exchanges',     icon:'₿'},
    stocks:    {label:'Stock Brokers & Apps',     icon:'📊'},
    investment:{label:'Investment Platforms',     icon:'🏦'},
    fintech:   {label:'Fintech & Neobanks',       icon:'📱'},
    prop:      {label:'Prop Trading Firms',       icon:'🎯'},
    social:    {label:'Copy & Social Trading',    icon:'👥'},
    other:     {label:'Other Platforms',          icon:'⭐'},
  }
  const grouped: Record<string, any[]> = {}
  for (const co of companies) {
    const g = co.group || 'other'
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(co)
  }

  // SEO: structured data
  const aggregateRating = {
    '@type':'WebSite',
    name: site?.name || 'Verivex',
    url: 'https://verivex.co',
    description: 'Independent verified broker reviews and trust scores',
    potentialAction: { '@type':'SearchAction', target:'https://verivex.co/reviews/{search_term_string}', 'query-input':'required name=search_term_string' }
  }

  // ── MOBILE LAYOUT ──
  const MobileLayout = () => {
    const filteredMobile = companies.filter((co:any) => {
      if (search && !`${co.name} ${co.description||''}`.toLowerCase().includes(search.toLowerCase())) return false
      if (activeCategory !== 'all' && co.group !== activeCategory) return false
      return true
    })
    const cats = [['all','All'],['forex','Forex/CFD'],['crypto','Crypto'],['stocks','Stocks'],['fintech','Fintech'],['prop','Prop'],['social','Social']]
    return (
      <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:'#f4f6f8',minHeight:'100vh',paddingTop:88}}>

        {/* Hamburger nav */}
        <MobileNav siteName="Verivex" domain="verivex.co" accentColor="#00B67A"
          sections={cats.map(([,l])=>l)} activeSection={cats.find(([v])=>v===activeCategory)?.[1]||'All'}
          onSectionChange={(s)=>setActiveCategory(cats.find(([,l])=>l===s)?.[0]||'all')}
          logoStyle="serif"/>

        {/* Search + filter bar */}
        <div style={{position:'sticky',top:88,zIndex:90,background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'10px 16px'}}>
          <input value={search} onChange={(e:any)=>setSearch(e.target.value)} placeholder="🔍 Search brokers & platforms..."
            style={{width:'100%',padding:'10px 14px',border:'1px solid #e2e8f0',borderRadius:10,fontSize:14,fontFamily:"'Inter',sans-serif",outline:'none',background:'#f8fafc'}}/>
        </div>

        {/* Independence notice */}
        <div style={{background:'#F0FDF4',borderBottom:'1px solid #BBF7D0',padding:'8px 16px',fontSize:11,color:'#166534',textAlign:'center'}}>
          Verivex is fully independent — not affiliated with, paid by, or endorsed by any broker.
        </div>

        {/* Broker cards */}
        <div style={{padding:'12px 16px'}}>
          {loading ? (
            <div style={{textAlign:'center',padding:'48px 0',color:'#94a3b8'}}>
              <div style={{fontSize:24,marginBottom:8}}>⏳</div>
              <div style={{fontSize:14}}>Loading brokers...</div>
            </div>
          ) : filteredMobile.length === 0 ? (
            <div style={{textAlign:'center',padding:'48px 0',color:'#94a3b8'}}>
              <div style={{fontSize:24,marginBottom:8}}>🔍</div>
              <div style={{fontSize:14}}>No brokers found</div>
            </div>
          ) : filteredMobile.map((co:any)=>{
            const stats = reviewStats[co.slug]||{count:0,avg:0}
            const rating = parseFloat(stats.avg||co.trust_score||4.2)||4.2
            return (
              <a key={co.id} href={`/reviews/${co.slug}`}
                style={{display:'block',background:'#fff',borderRadius:12,padding:'16px',marginBottom:12,textDecoration:'none',boxShadow:'0 1px 8px rgba(0,0,0,0.06)',border:'1px solid #f0f4f8'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:8}}>
                  {co.logo_url
                    ? <img src={co.logo_url} alt={co.name} style={{width:44,height:44,objectFit:'contain',borderRadius:8,border:'1px solid #e2e8f0',flexShrink:0,background:'#fff'}} onError={(e:any)=>{e.currentTarget.style.display='none'}}/>
                    : <div style={{width:44,height:44,borderRadius:8,background:`#00B67A15`,border:`1px solid #00B67A30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:'#00B67A',flexShrink:0}}>{co.name[0]}</div>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:800,color:'#1E293B',marginBottom:2}}>{co.name}</div>
                    <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>{[co.regulation,co.headquarters].filter(Boolean).join(' · ')}</div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{color:'#F59E0B',fontSize:14,letterSpacing:'1px'}}>{'★'.repeat(Math.round(rating))}<span style={{color:'#e2e8f0'}}>{'★'.repeat(5-Math.round(rating))}</span></span>
                      <span style={{fontSize:14,fontWeight:800,color:'#1E293B'}}>{rating.toFixed(1)}</span>
                      {stats.count>0 && <span style={{fontSize:11,color:'#94a3b8'}}>{stats.count} reviews</span>}
                    </div>
                  </div>
                  <div style={{fontSize:20,color:'#e2e8f0'}}>›</div>
                </div>
                {co.description && (
                  <div style={{fontSize:12,color:'#64748b',lineHeight:1.55,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}> {co.description}</div>
                )}
                <div style={{marginTop:10,padding:'6px 10px',background:`#00B67A08`,borderRadius:6,fontSize:11,color:'#00B67A',fontWeight:700,display:'inline-block'}}>Read Review →</div>
              </a>
            )
          })}
        </div>

        {/* Articles */}
        {articles.length>0 && (
          <div style={{padding:'0 16px 16px'}}>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:'.12em',color:'#94a3b8',marginBottom:10,paddingTop:8,borderTop:'1px solid #e2e8f0',textTransform:'uppercase'}}>Analysis & Reviews</div>
            {articles.slice(0,8).map((a:any)=>(
              <a key={a.id} href={`/article/${siteSlug}/${a.slug}`} style={{display:'flex',gap:10,marginBottom:12,paddingBottom:12,borderBottom:'1px solid #f0f4f8',textDecoration:'none'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:9,fontWeight:800,letterSpacing:'.08em',color:'#00B67A',marginBottom:3,textTransform:'uppercase'}}>{a.category||'Review'}</div>
                  <div style={{fontSize:14,fontWeight:700,color:'#1E293B',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.title}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div style={{background:'#1e293b',color:'#475569',padding:'20px 16px'}}>
          <div style={{fontSize:16,fontWeight:900,color:'#fff',marginBottom:4}}>Verivex</div>
          <div style={{fontSize:11,lineHeight:1.6,marginBottom:12}}>Independent broker reviews. Not financial advice.</div>
          <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:8}}>
            {[['Privacy','/legal/privacy'],['Terms','/legal/terms'],['About','/legal/about']].map(([l,h])=>(<a key={l} href={h} style={{color:'#475569',fontSize:11,textDecoration:'none'}}> {l}</a>))}
          </div>
          <div style={{fontSize:10,color:'#334155'}}>© {new Date().getFullYear()} verivex.co</div>
        </div>
      </div>
    )
  }


  return (
    <>
      <div className="vx-mobile" style={{display:'none'}}><MobileLayout/></div>
      <div className="vx-desktop" style={{display:'block'}}>
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:'#F4F6F8', color:DARK, minHeight:'100vh' }}>
      {/* GEO schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRating) }} />

      {/* Editorial independence — one line */}
      <div style={{ background:'#F0FDF4', borderBottom:'1px solid #BBF7D0', padding:'8px 20px', textAlign:'center', fontSize:12, color:'#166534' }}>
        Verivex is fully independent — we are not affiliated with, paid by, or endorsed by any broker listed on this site.
      </div>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0} a{text-decoration:none;color:inherit}
        .srch{padding:10px 16px 10px 40px;border:1px solid #E2E8F0;border-radius:10px;font-size:14px;font-family:inherit;outline:none;width:100%;background:#fff;transition:all .2s}
        .srch:focus{border-color:${GREEN};box-shadow:0 0 0 3px ${GREEN}20}
        .cat-btn{padding:7px 18px;border-radius:100px;border:1.5px solid #E2E8F0;cursor:pointer;font-weight:600;font-size:13px;font-family:inherit;white-space:nowrap;transition:all .15s;background:#fff;color:#475569}
        .cat-btn.active{background:${DARK};color:#fff;border-color:${DARK}}
        .cat-btn:hover:not(.active){border-color:${GREEN};color:${GREEN}}
        @media(max-width:768px){
          .trust-hero-grid{grid-template-columns:1fr!important;gap:12px!important}
          .trust-company-grid{grid-template-columns:1fr!important}
          .grid4{grid-template-columns:1fr 1fr!important}
          .trust-sections{grid-template-columns:1fr!important}
          .trust-filters{flex-wrap:wrap!important;gap:6px!important}@media(min-width:768px){}
          .cat-btn{font-size:11px!important;padding:5px 12px!important}
        }
        @media(max-width:480px){
          .trust-hero-grid h1{font-size:20px!important}
          .cat-btn{font-size:10px!important;padding:4px 10px!important}
          .company-card{padding:14px!important}
          p{font-size:14px!important}
        }.cat-btn{font-size:10px!important;padding:4px 10px!important}}
          .trust-company-grid{grid-template-columns:1fr!important} .grid4{grid-template-columns:1fr 1fr!important}
          .trust-sections{grid-template-columns:1fr!important}
          .trust-stats{flex-direction:column!important;gap:8px!important}
          .trust-nav{overflow-x:auto;white-space:nowrap}
          }
      `}</style>

      {/* eToro top banner */}
      <div style={{ background:'linear-gradient(135deg,#004f35,#00B67A)', padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
        <span style={{ fontSize:13, color:'#fff' }}>📊 <strong>eToro</strong> — 4.5★ · FCA / CySEC / ASIC Regulated · 284,000+ verified reviews</span>
        <a href="/reviews" style={{ background:'#fff', color:GREEN, padding:'6px 16px', borderRadius:6, fontSize:12, fontWeight:800 }}>Read Reviews →</a>
        <a href="/podcasts" style={{ background:'transparent', color:'#fff', padding:'6px 16px', borderRadius:6, fontSize:12, fontWeight:700, border:'1px solid rgba(255,255,255,0.3)' }}>🎙 Podcast</a>
      </div>

      {/* Header */}
      <header style={{ background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'14px 0', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', gap:16 }}>
          <a href="/" style={{ fontWeight:900, fontSize:22, color:DARK, flexShrink:0, letterSpacing:'-0.02em' }}>
            VERI<span style={{ color:GREEN }}>VEX</span>
            <span style={{ fontSize:10, fontWeight:600, color:'#94A3B8', marginLeft:6, letterSpacing:0 }}>Trust Intelligence</span>
          </a>
          <div style={{ flex:1, maxWidth:480, position:'relative' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15 }}>🔍</span>
            <input className="srch" placeholder="Search broker or platform..." value={search} onChange={(e:any)=>setSearch(e.target.value)} />
          </div>
          <div className="hide-m" style={{ display:'flex', gap:8, alignItems:'center' }}>
            <a href="/for-businesses" style={{ fontSize:13, color:'#475569', padding:'8px 14px', border:'1px solid #E2E8F0', borderRadius:8 }}>For Businesses</a>
            <a href="/reviews" style={{ fontSize:13, fontWeight:700, color:'#fff', padding:'9px 18px', borderRadius:8, background:GREEN }}>✍️ Write a Review</a>
          </div>
        </div>
        {/* Category tabs */}
        <div style={{ maxWidth:1200, margin:'12px auto 0', padding:'0 24px', display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
          {CATS.map(cat => (
            <button key={cat.id} onClick={()=>setActiveCategory(cat.id)}
              className={`cat-btn${activeCategory===cat.id?' active':''}`}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>
      {/* Hero */}
        {!search && activeCategory === 'all' && (
          <div style={{ background:`linear-gradient(135deg,${DARK} 60%,#1e3a2f)`, borderRadius:16, padding:'40px 48px', marginBottom:32, color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:24 }} className="hero-flex">
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:GREEN, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>Independent · Verified · Trusted</div>
              <h1 style={{ fontSize:36, fontWeight:900, lineHeight:1.1, marginBottom:12 }}>Find a Broker<br/>You Can Trust</h1>
              <p style={{ fontSize:15, color:'#94A3B8', maxWidth:420, lineHeight:1.7 }}>Real reviews from real traders. Every platform independently verified against FCA, CySEC and ASIC regulatory registers.</p>
              <a href="/reviews" style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:20, background:GREEN, color:'#fff', padding:'12px 24px', borderRadius:8, fontWeight:700, fontSize:14 }}>
                Browse All Reviews
              </a>
            </div>
            <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
              {[['284K+','Verified Reviews'],['1,200+','Brokers Profiled'],['4.2★','Avg Trust Score'],['63','Countries']].map(([v,l])=>(
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:32, fontWeight:900, color:GREEN }}>{v}</div>
                  <div style={{ fontSize:12, color:'#64748B', marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company grid */}
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ fontSize:20, fontWeight:800, color:DARK }}>
              {search 
                ? `Results for "${search}"` 
                : activeCategory !== 'all'
                  ? <span style={{display:'flex',alignItems:'center',gap:10}}>
                      <a href="/" style={{fontSize:13,color:'#00B67A',fontWeight:600,textDecoration:'none'}}>← All Reviews</a>
                      <span style={{color:'#E2E8F0'}}>|</span>
                      {CATS.find(c=>c.id===activeCategory)?.icon} {CATS.find(c=>c.id===activeCategory)?.label || 'Reviews'}
                    </span>
                  : 'All Reviews'}
              <span style={{ fontSize:14, fontWeight:400, color:'#94A3B8', marginLeft:8 }}>({filtered.length} platforms)</span>
            </h2>
            {search && <button onClick={()=>setSearch('')} style={{ fontSize:12, color:GREEN, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Clear ×</button>}
          </div>

          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }} className="grid3">
              {[1,2,3,4,5,6].map(i=>(
                <div key={i} style={{ border:'1px solid #E2E8F0', borderRadius:12, padding:20, background:'#fff', height:200 }}>
                  <div style={{ width:52, height:52, borderRadius:10, background:'#F1F5F9', marginBottom:12 }}/>
                  <div style={{ height:14, background:'#F1F5F9', borderRadius:4, marginBottom:8, width:'70%' }}/>
                  <div style={{ height:10, background:'#F1F5F9', borderRadius:4, width:'50%' }}/>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'#94A3B8' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
              <div style={{ fontWeight:600 }}>No results found for "{search}"</div>
            </div>
          ) : activeCategory === 'all' && !search ? (
            /* Grouped view — one section per category */
            <div>
              {Object.entries(GROUP_LABELS).map(([groupId, meta]) => {
                const allInGroup = grouped[groupId] || []
                const groupCos = allInGroup.slice(0, 4)
                if (groupCos.length === 0) return null
                return (
                  <div key={groupId} style={{ marginBottom:44 }}>
                    {/* Section header */}
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16, paddingBottom:12, borderBottom:'2px solid #F1F5F9' }}>
                      <span style={{ fontSize:22 }}>{(meta as any).icon}</span>
                      <h2 style={{ fontSize:17, fontWeight:800, color:'#0F172A', letterSpacing:'.01em' }}>{(meta as any).label}</h2>
                      <span style={{ fontSize:12, color:'#94A3B8', marginLeft:4 }}>({allInGroup.length})</span>
                      <a href={`/?category=${groupId}`}
                        style={{ marginLeft:'auto', fontSize:12, fontWeight:700, color:'#00B67A', textDecoration:'none',
                          padding:'5px 12px', border:'1px solid #00B67A33', borderRadius:6,
                          background:'#00B67A0A', display:'flex', alignItems:'center', gap:4 }}>
                        See all {allInGroup.length} <span>→</span>
                      </a>
                    </div>
                    {/* 4-column grid on desktop */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }} className="grid4">
                      {groupCos.map((co:any) => (
                        <CompanyCard key={co.id} company={co}
                          reviewCount={co.review_count||reviewStats[co.slug]?.count||0}
                          avgRating={co.avg_rating||reviewStats[co.slug]?.avg||0} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Filtered / search view */
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, alignItems:'start' }} className="grid3">
              {filtered.map((co:any)=>(
                <CompanyCard key={co.id} company={co}
                  reviewCount={co.review_count||reviewStats[co.slug]?.count||0}
                  avgRating={co.avg_rating||reviewStats[co.slug]?.avg||0} />
              ))}
            </div>
          )}
        </div>

        {/* Articles section */}
        {articles.length > 0 && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:DARK }}>📰 Regulation & Market Reports</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }} className="grid3">
              {articles.slice(0,4).map((a:any)=>(
                <a key={a.slug} href={`/article/${siteSlug}/${a.slug}`}
                  style={{ border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden', background:'#fff', display:'block', transition:'all .2s' }}
                  onMouseEnter={(e:any)=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(0,0,0,0.1)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)'}}
                  onMouseLeave={(e:any)=>{(e.currentTarget as HTMLElement).style.boxShadow='none';(e.currentTarget as HTMLElement).style.transform='none'}}>
                  {a.cover_image_url && <img src={a.cover_image_url} alt={a.title} style={{ width:'100%', height:150, objectFit:'cover' }}/>}
                  <div style={{ padding:18 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:GREEN, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>{a.category||'Analysis'}</div>
                    <div style={{ fontSize:15, fontWeight:700, lineHeight:1.4, marginBottom:8, color:DARK }}>{a.title}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ fontSize:12, color:'#94A3B8' }}>{a.author_name}</div>
                      <div style={{ fontSize:12, color:'#94A3B8' }}>{new Date(a.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── We're Verivex ── */}
      <section style={{ background:'#D4F5E3', padding:'56px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#166534', marginBottom:12 }}>ABOUT VERIVEX</div>
            <h2 style={{ fontSize:36, fontWeight:900, color:'#0F172A', lineHeight:1.1, marginBottom:16, letterSpacing:'-0.02em' }}>We're Verivex</h2>
            <p style={{ fontSize:16, color:'#374151', lineHeight:1.75, marginBottom:28, maxWidth:420 }}>
              We're a review platform that's open to everyone. Our vision is to become the universal symbol of trust in trading — empowering people to invest with confidence, and helping companies improve.
            </p>
            <a href="/for-businesses" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#0F172A', color:'#fff', padding:'13px 28px', borderRadius:100, fontWeight:700, fontSize:14, textDecoration:'none', letterSpacing:'-0.01em' }}>
              What we do →
            </a>
          </div>
          <div style={{ background:'#166534', borderRadius:20, padding:'36px 32px', color:'#fff', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, background:'rgba(255,255,255,0.06)', borderRadius:'50%' }}/>
            <div style={{ position:'absolute', bottom:-20, left:-20, width:80, height:80, background:'rgba(255,255,255,0.04)', borderRadius:'50%' }}/>
            <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#86efac', marginBottom:12 }}>TRUST REPORT 2025</div>
            <h3 style={{ fontSize:20, fontWeight:800, marginBottom:10, lineHeight:1.3 }}>Our new Trust Report has landed!</h3>
            <p style={{ fontSize:14, color:'#bbf7d0', lineHeight:1.6, marginBottom:24 }}>Find out which actions we've taken to protect traders and promote trust on our platform.</p>
            <a href="/for-businesses" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.12)', backdropFilter:'blur(4px)', border:'1.5px solid rgba(255,255,255,0.3)', color:'#fff', padding:'10px 22px', borderRadius:100, fontWeight:700, fontSize:13, textDecoration:'none', transition:'background .2s' }}>
              Take a look
            </a>
          </div>
        </div>
      </section>

      {/* ── Help millions section ── */}
      <section style={{ background:'#F5EDE0', padding:'56px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'auto 1fr', gap:64, alignItems:'center' }}>
          <div style={{ maxWidth:480 }}>
            <h2 style={{ fontSize:32, fontWeight:900, color:'#0F172A', lineHeight:1.15, marginBottom:14, letterSpacing:'-0.02em' }}>Help millions make the right choice</h2>
            <p style={{ fontSize:15, color:'#6B7280', lineHeight:1.7, marginBottom:28 }}>Share your experience on Verivex, where reviews make a real difference for traders worldwide.</p>
            <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
              <a href="/reviews" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#0F172A', color:'#fff', padding:'13px 28px', borderRadius:100, fontWeight:700, fontSize:14, textDecoration:'none' }}>
                Write a review
              </a>
              <div style={{ width:1, height:28, background:'#D1D5DB' }}/>
              <div style={{ display:'flex', gap:10 }}>
                <a href="/reviews/etoro#write-review" title="Sign in with Google" style={{ width:40, height:40, borderRadius:'50%', background:'#fff', border:'1.5px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:15, fontWeight:900, color:'#4285F4', textDecoration:'none' }}>G</a>
                <a href="/reviews/etoro#write-review" title="Sign in with Facebook" style={{ width:40, height:40, borderRadius:'50%', background:'#1877F2', border:'1.5px solid #1877F2', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:15, fontWeight:900, color:'#fff', textDecoration:'none' }}>f</a>
                <a href="/reviews/etoro#write-review" title="Sign in with Apple" style={{ width:40, height:40, borderRadius:'50%', background:'#fff', border:'1.5px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:18, textDecoration:'none' }}>🍎</a>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:16, justifyContent:'flex-end' }}>
            {[
              { num:'284k+', label:'Verified reviews', color:'#059669' },
              { num:'63+', label:'Countries', color:'#2563EB' },
              { num:'10', label:'Platforms reviewed', color:'#7C3AED' },
            ].map(stat => (
              <div key={stat.label} style={{ background:'#fff', borderRadius:16, padding:'28px 24px', textAlign:'center', minWidth:130, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize:28, fontWeight:900, color:stat.color, marginBottom:6, letterSpacing:'-0.02em' }}>{stat.num}</div>
                <div style={{ fontSize:12, color:'#6B7280', fontWeight:600, lineHeight:1.4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:DARK, color:'#64748B', padding:'40px 24px', marginTop:48 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:32 }} className="grid3">
          <div>
            <div style={{ fontWeight:900, fontSize:22, color:'#fff', marginBottom:8 }}>VERI<span style={{ color:GREEN }}>VEX</span></div>
            <p style={{ fontSize:13, lineHeight:1.7 }}>Independent broker reviews and trust intelligence. All reviews moderated for authenticity.</p>
          </div>
          <div>
            <div style={{ fontWeight:700, color:'#94A3B8', fontSize:12, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Top Reviewed</div>
            {['etoro','ic-markets','pepperstone','ftmo','binance'].map(s=>(
              <a key={s} href={`/reviews/${s}`} style={{ display:'block', fontSize:13, color:'#64748B', marginBottom:6, textTransform:'capitalize' }}>
                {s.replace(/-/g,' ')}
              </a>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:700, color:'#94A3B8', fontSize:12, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Categories</div>
            {[['forex','Forex Brokers'],['crypto','Crypto Exchanges'],['prop','Prop Firms'],['regulated','Regulated Brokers']].map(([id,label])=>(
              <div key={id} style={{ fontSize:13, color:'#64748B', marginBottom:6, cursor:'pointer' }}>{label}</div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth:1200, margin:'24px auto 0', paddingTop:20, borderTop:'1px solid #1e293b', textAlign:'center', fontSize:12 }}>
          © 2025 Verivex Trust Intelligence · verivex.co · Reviews moderated for authenticity
        </div>
        <div style={{ maxWidth:1200, margin:'12px auto 0', paddingTop:12, borderTop:'1px solid #1e293b', display:'flex', justifyContent:'center', gap:24 }}>
          {/* Cross-portal intelligence network */}
          
                    {[['Privacy Policy','/legal/privacy'],['Terms of Service','/legal/terms'],['Cookie Policy','/legal/cookies'],['For Businesses','/for-businesses']].map(([l,h])=>(
            <a key={l} href={h} style={{ fontSize:11, color:'#475569' }}>{l}</a>
          ))}
        </div>
      </footer>

      <CookieBanner primaryColor='#00B67A' />
    </div>
      </div>
    </>
  )
}
