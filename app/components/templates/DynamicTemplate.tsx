'use client'
import MobileNav from '@/app/components/MobileNav'
import React, { useState } from 'react'

// ─── Font resolver ─────────────────────────────────────────────────────────
function gf(f: string) {
  const m: Record<string,string> = {
    serif: '"Georgia","Times New Roman",serif',
    mono: '"IBM Plex Mono","Courier New",monospace',
    display: '"Playfair Display",Georgia,serif',
    condensed: '"Arial Narrow",Arial,sans-serif',
    slab: '"Rockwell","Courier Bold",serif',
    humanist: '"Gill Sans","Optima",sans-serif',
    sans: '"Inter","Helvetica Neue",Arial,sans-serif',
  }
  return m[f] || m.sans
}

// ─── Main dispatcher — reads archetype + variant from config ──────────────
// Per-site category config matching actual article categories in DB
const SITE_CATEGORIES: Record<string, string[]> = {
  'invest-data':      ['All','Markets','Finance','Analysis','Investing'],
  'market-radar':     ['All','Markets','Analysis','Signals','Energy','Commodities'],
  'executive-network':['All','Markets','Leadership','Strategy','Business'],
  'crypto-hub':       ['All','Markets','Crypto','Analysis','DeFi'],
}


// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// 6 UNIQUE MOBILE LAYOUTS — driven by template_config.mobile_style
// card_feed | compact_list | hero_stack | grid_2col | magazine_mobile | ticker_mobile
// ═══════════════════════════════════════════════════════════════════════════

// Shared helpers
const IMGS_MOB = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=70&fm=jpg',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=70&fm=jpg',
  'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600&q=70&fm=jpg',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=70&fm=jpg',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=70&fm=jpg',
  'https://images.unsplash.com/photo-1526628953301-3cd9e37dc0d7?w=600&q=70&fm=jpg',
]
const mImg  = (a: any, i: number) => a?.cover_image_url?.startsWith('http') ? a.cover_image_url : IMGS_MOB[i % IMGS_MOB.length]
const mTime = (d: string) => { const s = Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<3600) return `${Math.floor(s/60)}m`; if(s<86400) return `${Math.floor(s/3600)}h`; return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) }

// ── MOBILE 1: card_feed ── Vertical cards, image left 40%, text right
function MobCardFeed({ site, articles, p, isDark, siteName, domain, siteCategories, selectedCat, setSelectedCat }: any) {
  const bg = isDark?'#0d1117':'#f9fafb', card = isDark?'#161b22':'#fff', txt = isDark?'#f0f6fc':'#111827', sub = isDark?'#8b949e':'#6b7280', bdr = isDark?'#21262d':'#e5e7eb'
  return (
    <div style={{background:bg,minHeight:'100vh',paddingTop:76,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <MobileNav siteName={siteName} domain={domain} accentColor={p} sections={siteCategories} activeSection={selectedCat} onSectionChange={setSelectedCat} darkMode={false} />
      <div style={{padding:'12px 16px',borderBottom:`2px solid ${p}`,display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:p,animation:'pulse 2s infinite'}}/>
        <span style={{fontSize:11,fontWeight:800,color:p,letterSpacing:'.1em',textTransform:'uppercase'}}>Live Feed</span>
      </div>
      <div style={{padding:'0 12px 80px'}}>
        {articles.slice(0,20).map((a:any,i:number)=>(
          <a key={a.id} href={`/article/${site.slug}/${a.slug}`} style={{display:'flex',gap:10,padding:'12px 0',borderBottom:`1px solid ${bdr}`,textDecoration:'none'}}>
            <img src={mImg(a,i)} alt="" style={{width:90,height:68,objectFit:'cover',borderRadius:6,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,fontWeight:800,color:p,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>{a.category||'Markets'}</div>
              <div style={{fontSize:13,fontWeight:700,color:txt,lineHeight:1.35,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.title}</div>
              <div style={{fontSize:10,color:sub,marginTop:4}}>{mTime(a.published_at)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── MOBILE 2: compact_list ── Dense text list, no images, headline-focused
function MobCompactList({ site, articles, p, isDark, siteName, domain, siteCategories, selectedCat, setSelectedCat }: any) {
  const bg = isDark?'#0a0a0a':'#ffffff', txt = isDark?'#e2e8f0':'#0f172a', sub = isDark?'#64748b':'#94a3b8', bdr = isDark?'#1e293b':'#f1f5f9'
  const catColors: Record<string,string> = {Markets:'#3b82f6',Crypto:'#f97316',Analysis:'#10b981',Regulation:'#dc2626',Finance:'#7c3aed'}
  return (
    <div style={{background:bg,minHeight:'100vh',paddingTop:76,fontFamily:"'IBM Plex Mono','Courier New',monospace"}}>
      <MobileNav siteName={siteName} domain={domain} accentColor={p} sections={siteCategories} activeSection={selectedCat} onSectionChange={setSelectedCat} darkMode={false} />
      <div style={{padding:'10px 16px',background:isDark?'#111':'#f8fafc',borderBottom:`3px solid ${p}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:10,fontWeight:900,color:p,letterSpacing:'.15em',textTransform:'uppercase'}}>{site.name}</span>
        <span style={{fontSize:9,color:sub}}>{new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</span>
      </div>
      <div style={{padding:'0 0 80px'}}>
        {articles.slice(0,25).map((a:any,i:number)=>(
          <a key={a.id} href={`/article/${site.slug}/${a.slug}`} style={{display:'block',padding:'10px 16px',borderBottom:`1px solid ${bdr}`,textDecoration:'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:txt,lineHeight:1.3,marginBottom:3}}>{a.title}</div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:9,fontWeight:900,color:catColors[a.category]||p,textTransform:'uppercase',letterSpacing:'.08em'}}>{a.category}</span>
                  <span style={{fontSize:9,color:sub}}>{mTime(a.published_at)}</span>
                </div>
              </div>
              <span style={{fontSize:11,color:sub,flexShrink:0}}>›</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── MOBILE 3: hero_stack ── Big full-width hero image, list below
function MobHeroStack({ site, articles, p, isDark, siteName, domain, siteCategories, selectedCat, setSelectedCat }: any) {
  const bg = isDark?'#0d1117':'#f8fafc', card = isDark?'#161b22':'#fff', txt = isDark?'#f0f6fc':'#0f172a', sub = isDark?'#8b949e':'#6b7280', bdr = isDark?'#21262d':'#e5e7eb'
  const hero = articles[0], rest = articles.slice(1,20)
  return (
    <div style={{background:bg,minHeight:'100vh',paddingTop:76,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <MobileNav siteName={siteName} domain={domain} accentColor={p} sections={siteCategories} activeSection={selectedCat} onSectionChange={setSelectedCat} darkMode={false} />
      {hero && (
        <a href={`/article/${site.slug}/${hero.slug}`} style={{display:'block',textDecoration:'none',position:'relative',marginBottom:16}}>
          <img src={mImg(hero,0)} alt="" style={{width:'100%',height:220,objectFit:'cover',display:'block'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,.85) 0%,transparent 50%)',padding:'16px'}}>
            <div style={{position:'absolute',bottom:16,left:16,right:16}}>
              <span style={{display:'inline-block',background:p,color:'#fff',fontSize:9,fontWeight:900,padding:'2px 8px',borderRadius:2,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>{hero.category}</span>
              <div style={{fontSize:16,fontWeight:800,color:'#fff',lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{hero.title}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.7)',marginTop:4}}>{mTime(hero.published_at)}</div>
            </div>
          </div>
        </a>
      )}
      <div style={{padding:'0 16px 80px'}}>
        <div style={{fontSize:10,fontWeight:800,color:p,textTransform:'uppercase',letterSpacing:'.12em',marginBottom:12,paddingBottom:6,borderBottom:`2px solid ${p}`}}>More Stories</div>
        {rest.map((a:any,i:number)=>(
          <a key={a.id} href={`/article/${site.slug}/${a.slug}`} style={{display:'flex',gap:10,marginBottom:14,textDecoration:'none'}}>
            <img src={mImg(a,i+1)} alt="" style={{width:72,height:54,objectFit:'cover',borderRadius:4,flexShrink:0}}/>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:txt,lineHeight:1.35,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.title}</div>
              <div style={{fontSize:10,color:sub,marginTop:3}}>{a.category} · {mTime(a.published_at)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── MOBILE 4: grid_2col ── 2-column card grid
function MobGrid2Col({ site, articles, p, isDark, siteName, domain, siteCategories, selectedCat, setSelectedCat }: any) {
  const bg = isDark?'#0d1117':'#f3f4f6', card = isDark?'#161b22':'#fff', txt = isDark?'#f0f6fc':'#111827', sub = isDark?'#8b949e':'#6b7280'
  return (
    <div style={{background:bg,minHeight:'100vh',paddingTop:76,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <MobileNav siteName={siteName} domain={domain} accentColor={p} sections={siteCategories} activeSection={selectedCat} onSectionChange={setSelectedCat} darkMode={false} />
      <div style={{padding:'12px 10px 80px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {articles.slice(0,20).map((a:any,i:number)=>(
          <a key={a.id} href={`/article/${site.slug}/${a.slug}`} style={{display:'block',background:card,borderRadius:10,overflow:'hidden',textDecoration:'none',boxShadow:isDark?'none':'0 1px 4px rgba(0,0,0,.08)'}}>
            <img src={mImg(a,i)} alt="" style={{width:'100%',height:90,objectFit:'cover',display:'block'}}/>
            <div style={{padding:'8px 8px 10px'}}>
              <div style={{fontSize:8,fontWeight:900,color:p,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:3}}>{a.category}</div>
              <div style={{fontSize:11,fontWeight:700,color:txt,lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.title}</div>
              <div style={{fontSize:9,color:sub,marginTop:4}}>{mTime(a.published_at)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── MOBILE 5: magazine_mobile ── Editorial, big serif headline, reading-focused
function MobMagazine({ site, articles, p, isDark, siteName, domain, siteCategories, selectedCat, setSelectedCat }: any) {
  const bg = isDark?'#0a0a0a':'#fffbf5', txt = isDark?'#e8e0d0':'#1a1000', sub = isDark?'#8b8070':'#8b7355', bdr = isDark?'#2a2520':'#e8dfc8'
  const hero = articles[0], rest = articles.slice(1,15)
  return (
    <div style={{background:bg,minHeight:'100vh',paddingTop:76,fontFamily:"Georgia,'Times New Roman',serif"}}>
      <MobileNav siteName={siteName} domain={domain} accentColor={p} sections={siteCategories} activeSection={selectedCat} onSectionChange={setSelectedCat} darkMode={false} />
      <div style={{padding:'20px 20px 0',borderBottom:`1px solid ${bdr}`,marginBottom:20}}>
        <div style={{textAlign:'center',paddingBottom:12,borderBottom:`3px double ${bdr}`,marginBottom:16}}>
          <div style={{fontSize:22,fontWeight:900,letterSpacing:'-0.02em',color:txt}}>{siteName}</div>
          <div style={{fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:sub,marginTop:4}}>{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
        </div>
        {hero && (
          <a href={`/article/${site.slug}/${hero.slug}`} style={{display:'block',textDecoration:'none',marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:p,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Lead Story</div>
            <div style={{fontSize:20,fontWeight:900,lineHeight:1.2,color:txt,marginBottom:8}}>{hero.title}</div>
            <div style={{fontSize:12,lineHeight:1.6,color:sub}}>{hero.excerpt?.slice(0,120)}{hero.excerpt?.length>120?'…':''}</div>
          </a>
        )}
      </div>
      <div style={{padding:'0 20px 80px'}}>
        <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'.15em',color:sub,marginBottom:12,textAlign:'center'}}>Also In This Edition</div>
        {rest.map((a:any,i:number)=>(
          <a key={a.id} href={`/article/${site.slug}/${a.slug}`} style={{display:'block',paddingBottom:12,marginBottom:12,borderBottom:`1px solid ${bdr}`,textDecoration:'none'}}>
            <div style={{fontSize:14,fontWeight:700,lineHeight:1.35,color:txt,marginBottom:4}}>{a.title}</div>
            <div style={{fontSize:10,color:sub}}>{a.category} · {mTime(a.published_at)}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── MOBILE 6: ticker_mobile ── Breaking news ticker style, timestamp + headline
function MobTicker({ site, articles, p, isDark, siteName, domain, siteCategories, selectedCat, setSelectedCat }: any) {
  const bg = isDark?'#020408':'#0f172a', rowBg = isDark?'#0d1117':'#1e293b', txt = '#f8fafc', sub = '#94a3b8', bdr = isDark?'#1e293b':'#334155'
  return (
    <div style={{background:bg,minHeight:'100vh',paddingTop:76,fontFamily:"'IBM Plex Mono','Courier New',monospace"}}>
      <MobileNav siteName={siteName} domain={domain} accentColor={p} sections={siteCategories} activeSection={selectedCat} onSectionChange={setSelectedCat} darkMode={false} />
      {/* Live ticker bar */}
      <div style={{background:p,padding:'6px 12px',display:'flex',alignItems:'center',gap:8,overflowX:'hidden'}}>
        <span style={{fontSize:9,fontWeight:900,color:'#fff',background:'rgba(0,0,0,.3)',padding:'1px 6px',borderRadius:2,flexShrink:0,textTransform:'uppercase',letterSpacing:'.1em'}}>LIVE</span>
        <div style={{fontSize:10,color:'#fff',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{articles[0]?.title}</div>
      </div>
      {/* Article list */}
      <div style={{padding:'0 0 80px'}}>
        {articles.slice(0,25).map((a:any,i:number)=>(
          <a key={a.id} href={`/article/${site.slug}/${a.slug}`} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderBottom:`1px solid ${bdr}`,textDecoration:'none'}}>
            <div style={{flexShrink:0,textAlign:'right',minWidth:28}}>
              <div style={{fontSize:9,color:p,fontWeight:900}}>{mTime(a.published_at)}</div>
            </div>
            <div style={{width:1,background:i===0?p:bdr,alignSelf:'stretch',flexShrink:0}}/>
            <div style={{flex:1}}>
              <span style={{fontSize:9,color:p,fontWeight:900,textTransform:'uppercase',letterSpacing:'.06em',marginRight:6}}>{a.category}</span>
              <span style={{fontSize:12,fontWeight:600,color:txt,lineHeight:1.4}}>{a.title}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── DISPATCHER — routes to correct mobile layout based on mobile_style
function DynMobileLayout({ site, articles, p, sec, slug, siteCategories, selectedCat, setSelectedCat }: any) {
  const mobile_style = (site?.template_config?.mobile_style || 'card_feed') as string
  const archetype = (site?.template_config?.archetype || 'editorial') as string
  const isDark = false // Always light — consistent with homepage templates
  const siteName = site?.name || 'News'
  const domain = site?.domain || ''
  const base = { site, articles, p, isDark, siteName, domain, siteCategories, selectedCat, setSelectedCat }
  
  if (mobile_style === 'compact_list') return <MobCompactList {...base} />
  if (mobile_style === 'hero_stack')   return <MobHeroStack {...base} />
  if (mobile_style === 'grid_2col')    return <MobGrid2Col {...base} />
  if (mobile_style === 'magazine_mobile') return <MobMagazine {...base} />
  if (mobile_style === 'ticker_mobile') return <MobTicker {...base} />
  // default: card_feed
  return <MobCardFeed {...base} />
}

// ── LEGACY FALLBACK (kept for backward compat — unreachable with new dispatch)
function _DynMobileLayoutLegacy({ site, articles, p, sec, slug, siteCategories, selectedCat, setSelectedCat }: any) {
  const cfg = site?.template_config || {}
  void cfg // suppress unused warning
  const archetype = cfg.archetype || 'editorial'
  const siteName = site?.name || 'News'
  const domain = site?.domain || ''
  const accent = p || '#1a56db'

  // Dark theme for dark archetypes
  const isDark = false // Always light — consistent with homepage templates
  const bg       = isDark ? '#0d1117' : '#f8fafc'
  const cardBg   = isDark ? '#161b22' : '#ffffff'
  const textPri  = isDark ? '#f0f6fc' : '#111827'
  const textSec  = isDark ? '#8b949e' : '#6b7280'
  const divider  = isDark ? '#21262d' : '#f0f4f8'
  const searchBg = isDark ? '#161b22' : '#f8fafc'
  const searchBorder = isDark ? '#30363d' : '#e2e8f0'
  const footerBg = isDark ? '#010409' : '#0f172a'
  const logoStyle = archetype === 'research' ? 'sans' : archetype === 'dark_editorial' ? 'mono' : 'sans'

  const IMGS = [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=700&q=75&fm=jpg',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=700&q=75&fm=jpg',
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=700&q=75&fm=jpg',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=75&fm=jpg',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=75&fm=jpg',
    'https://images.unsplash.com/photo-1526628953301-3cd9e37dc0d7?w=700&q=75&fm=jpg',
    'https://images.unsplash.com/photo-1518183214770-9cffbec72538?w=700&q=75&fm=jpg',
    'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=700&q=75&fm=jpg',
  ]
  const getImg = (a: any, i: number) => {
    if (a?.cover_image_url?.startsWith('http')) return a.cover_image_url
    return IMGS[i % IMGS.length]
  }
  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const hero = articles[0]
  const rest = articles.slice(1, 30)

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: bg, minHeight: '100vh', paddingTop: 88 }}>
      <style>{`
        .dyn-nav-dark nav { background: #0d1117 !important; }
        .dyn-mob-search { background: ${searchBg}; border-color: ${searchBorder}; color: ${textPri}; }
        .dyn-mob-search::placeholder { color: ${textSec}; }
      `}</style>

      <MobileNav
        siteName={siteName} domain={domain} accentColor={accent}
        sections={siteCategories || ['All','Markets','Analysis']}
        activeSection={selectedCat || 'All'}
        onSectionChange={setSelectedCat || (() => {})}
        logoStyle={logoStyle as any} darkMode={false}
      />

      {/* Sticky search */}
      <div style={{ padding: '10px 16px', background: cardBg, borderBottom: `1px solid ${divider}`, position: 'sticky', top: 88, zIndex: 90 }}>
        <input placeholder={`Search ${siteName}...`} className="dyn-mob-search"
          style={{ width: '100%', padding: '9px 14px', border: `1px solid ${searchBorder}`, borderRadius: 10, fontSize: 14, fontFamily: "'Inter',sans-serif", outline: 'none', background: searchBg, color: textPri }} />
      </div>

      {/* Breaking ticker for dark portals */}
      {isDark && articles.length > 0 && (
        <div style={{ background: accent, overflow: 'hidden', height: 28, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 9, fontWeight: 900, padding: '0 10px', background: 'rgba(0,0,0,0.25)', height: '100%', display: 'flex', alignItems: 'center', letterSpacing: '.1em', color: '#fff', flexShrink: 0, whiteSpace: 'nowrap' }}>LIVE</span>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'dtick 30s linear infinite' }}>
              {[...articles.slice(0, 6), ...articles.slice(0, 6)].map((a: any, i: number) => (
                <span key={i} style={{ fontSize: 11, padding: '0 20px', color: 'rgba(255,255,255,0.9)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>▸ {a.title?.slice(0, 60)}</span>
              ))}
            </div>
          </div>
          <style>{`@keyframes dtick{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </div>
      )}

      <div style={{ padding: '0 16px 32px' }}>
        {/* Hero */}
        {hero && (
          <a href={`/article/${slug}/${hero.slug}`}
            style={{ display: 'block', textDecoration: 'none', marginTop: 16, marginBottom: 20, paddingBottom: 20, borderBottom: `2px solid ${accent}` }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <img src={getImg(hero, 0)} alt={hero.title}
                style={{ width: '100%', height: 210, objectFit: 'cover', borderRadius: 8 }}
                onError={(e: any) => { e.currentTarget.src = IMGS[0] }}
                referrerPolicy="no-referrer" crossOrigin="anonymous" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)', borderRadius: 8 }} />
              <span style={{ position: 'absolute', bottom: 10, left: 10, background: accent, color: '#fff', fontSize: 9, fontWeight: 900, padding: '3px 8px', letterSpacing: '.1em', textTransform: 'uppercase', borderRadius: 3 }}>
                {hero.category || 'Latest'}
              </span>
            </div>
            <div style={{ fontFamily: isDark ? "'IBM Plex Mono','Courier New',monospace" : "'Georgia',serif", fontSize: 21, fontWeight: 800, lineHeight: 1.25, color: textPri, marginBottom: 8 }}>{hero.title}</div>
            <div style={{ fontSize: 14, color: textSec, lineHeight: 1.65, marginBottom: 8 }}>{(hero.excerpt || '').slice(0, 150)}…</div>
            <div style={{ fontSize: 11, color: textSec }}>{hero.author_name || 'Editorial'} · {timeAgo(hero.published_at)} · {hero.read_time_minutes || 4} min</div>
          </a>
        )}

        {/* Section label */}
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${accent}30`, fontFamily: 'monospace' }}>
          {selectedCat !== 'All' ? selectedCat : 'Latest Stories'}
        </div>

        {/* Article list */}
        {rest.map((a: any, i: number) => (
          <a key={a.id || i} href={`/article/${slug}/${a.slug}`}
            style={{ display: 'flex', gap: 12, paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${divider}`, textDecoration: 'none', alignItems: 'flex-start' }}>
            <img src={getImg(a, i + 1)} alt={a.title}
              style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
              onError={(e: any) => { e.currentTarget.src = IMGS[(i + 1) % IMGS.length] }}
              referrerPolicy="no-referrer" crossOrigin="anonymous" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, display: 'block', marginBottom: 4 }}>
                {a.category || 'News'}
              </span>
              <div style={{ fontFamily: isDark ? "'IBM Plex Mono',monospace" : "'Georgia',serif", fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: textPri, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {a.title}
              </div>
              <div style={{ fontSize: 11, color: textSec }}>{timeAgo(a.published_at)} · {a.read_time_minutes || 3} min</div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: footerBg, color: '#475569', padding: '20px 16px' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4, fontFamily: isDark ? 'monospace' : 'inherit' }}>{siteName}</div>
        <div style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 12 }}>{cfg.tagline || 'News & Intelligence'} · For informational purposes only.</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
          {[['Privacy','/legal/privacy'],['Terms','/legal/terms'],['About','/legal/about'],['Disclaimer','/legal/disclaimer']].map(([l,h]) => (
            <a key={l} href={h} style={{ color: '#475569', fontSize: 11, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#334155' }}>© {new Date().getFullYear()} {domain}</div>
      </div>
    </div>
  )
}

export default function DynamicTemplate({ site, articles }: { site: any; articles: any[] }) {
  const [selectedCat, setSelectedCat] = useState('All')
  const cfg = site.template_config || {}
  // GEO: per-portal schema built from site data
  const archetype = cfg.archetype || 'editorial'
  const variant   = parseInt(cfg.variant  || '1')
  const p         = cfg.primary    || '#1a56db'
  const sec       = cfg.secondary  || '#f59e0b'
  const font      = gf(cfg.font    || 'sans')
  const slug      = site.slug
  const siteCategories = SITE_CATEGORIES[site.slug] || ['All','Markets','Analysis']
  const filteredArticles = selectedCat === 'All'
    ? articles
    : articles.filter((a:any) => {
        const cat = (a.category||'').toLowerCase().trim()
        const sel = selectedCat.toLowerCase()
        return cat === sel || cat.startsWith(sel)
      })

  const props     = { site, articles: filteredArticles, allArticles: articles, p, sec, font, slug, variant, selectedCat, setSelectedCat, siteCategories }

  const dispatch: Record<string, any> = {
    editorial: Editorial, tech: Tech, wire: Wire, dashboard: Dashboard,
    magazine: Magazine, minimal: Minimal, newspaper: Newspaper,
    research: Research, grid: Grid, brutalist: Brutalist,
    dark_editorial: DarkEditorial, split: Split, feed: Feed,
  }
  const Comp = dispatch[archetype] || Editorial
  return (
    <>
      <div className="dyn-mobile" style={{display:'none'}}>
        <DynMobileLayout {...props} />
      </div>
      <div className="dyn-desktop" style={{display:'block'}}>
        <Comp {...props} />
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 1 — EDITORIAL (3 variants: classic / compact / wide)
// ═══════════════════════════════════════════════════════════════════════════
function Editorial({ site, articles, p, font, slug, variant , selectedCat, setSelectedCat, siteCategories }: any) {
  const hero = articles[0], cols = articles.slice(1,7), sidebar = articles.slice(7,12)
  if (variant === 2) return (
    <div style={{ minHeight:'100vh', background:'#fffef9', fontFamily:font, color:'#1a1a1a' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .ev2-tag{display:inline-block;background:${p};color:#fff;font-size:9px;fontWeight:800;padding:2px 7px;borderRadius:2px;textTransform:uppercase;letterSpacing:.1em;marginBottom:8px}
      .ev2-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:28px}
      @media(max-width:768px){.ev2-grid{grid-template-columns:1fr!important}}@media(max-width:480px){h1,h2{font-size:20px!important;line-height:1.2!important}nav{padding:8px 12px!important}nav a{font-size:11px!important;padding:3px 6px!important}article{padding:12px 14px!important}}`}</style>
      <div style={{ borderBottom:`6px solid ${p}`, padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fffef9' }}>
        <a href="/"><div style={{ fontSize:30, fontWeight:900, letterSpacing:'-1.5px', fontFamily:gf('display') }}>{site.name}</div></a>
        <div style={{ fontSize:11, color:'#888', fontStyle:'italic' }}>{site.tagline}</div>
      </div>
      <div style={{ maxWidth:1100, margin:'32px auto', padding:'0 24px' }}>
        {hero && (
          <div style={{ borderBottom:`2px solid #eee`, paddingBottom:32, marginBottom:32 }}>
            <div className="ev2-tag">{hero.category}</div>
            <a href={`/article/${slug}/${hero.slug}`}><h1 style={{ fontSize:46, fontWeight:900, lineHeight:1.08, marginBottom:16, fontFamily:gf('display') }}>{hero.title}</h1></a>
            <p style={{ fontSize:18, color:'#444', lineHeight:1.75, borderLeft:`4px solid ${p}`, paddingLeft:18, maxWidth:720 }}>{hero.excerpt}</p>
            <div style={{ marginTop:14, fontSize:12, color:'#888' }}>By {hero.author_name} · {new Date(hero.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'long'})}</div>
          </div>
        )}
        <div className="ev2-grid">
          {cols.map((a:any) => (
            <div key={a.id} style={{ paddingBottom:24, borderBottom:'1px solid #f0f0f0' }}>
              <div className="ev2-tag">{a.category}</div>
              <a href={`/article/${slug}/${a.slug}`}><h3 style={{ fontSize:19, fontWeight:800, lineHeight:1.3, fontFamily:gf('display'), marginBottom:8 }}>{a.title}</h3></a>
              <p style={{ fontSize:13, color:'#555', lineHeight:1.65 }}>{a.excerpt?.slice(0,120)}…</p>
              <div style={{ fontSize:11, color:'#aaa', marginTop:8 }}>{a.author_name}</div>
            </div>
          ))}
          <a href="/podcasts" style={{marginLeft:'auto',fontSize:11,fontWeight:700,color:'#F59E0B',letterSpacing:'.06em',display:'flex',alignItems:'center',gap:4,flexShrink:0,textDecoration:'none',padding:'2px 4px'}}>🎙 PODCAST</a>
        </div>
      </div>
      <footer style={{ borderTop:`4px solid ${p}`, padding:'16px 24px', textAlign:'center', fontSize:11, color:'#999', marginTop:40 }}>© {new Date().getFullYear()} {site.name}</footer>
    </div>
  )
  if (variant === 3) return (
    <div style={{ minHeight:'100vh', background:'#fafbfc', fontFamily:font, color:'#0f172a' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .ev3-main{display:grid;grid-template-columns:2fr 1fr;gap:0}
      .ev3-col{padding:24px}
      @media(max-width:768px){.ev3-main{grid-template-columns:1fr!important}}@media(max-width:480px){h1{font-size:20px!important}.ev3-cards{grid-template-columns:1fr!important}}`}</style>
      <header style={{ background:p, color:'#fff', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.5px', color:'#f4f1eb' }}>{site.name}</div></a>
        <div style={{ background:p, color:'#fff', fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:2, textTransform:'uppercase', letterSpacing:'.1em' }}>{site.category}</div>
      </header>
      <div className="ev3-main">
        <div className="ev3-col" style={{ borderRight:'2px solid #ddd6c4' }}>
          {hero && (
            <div style={{ marginBottom:28, paddingBottom:28, borderBottom:'1px solid #ddd6c4' }}>
              <div style={{ fontSize:9, fontWeight:800, color:p, textTransform:'uppercase', letterSpacing:'.15em', marginBottom:8 }}>Lead Story</div>
              <a href={`/article/${slug}/${hero.slug}`}><h1 style={{ fontSize:34, fontWeight:900, lineHeight:1.12, marginBottom:12 }}>{hero.title}</h1></a>
              <p style={{ fontSize:15, lineHeight:1.7, color:'#5a4a32' }}>{hero.excerpt}</p>
            </div>
          )}
          {cols.slice(0,3).map((a:any) => (
            <div key={a.id} style={{ display:'flex', gap:16, paddingBottom:16, marginBottom:16, borderBottom:'1px solid #e8e2d6' }}>
              <div style={{ width:4, background:p, flexShrink:0, borderRadius:2 }}/>
              <div>
                <a href={`/article/${slug}/${a.slug}`}><h3 style={{ fontSize:16, fontWeight:700, lineHeight:1.35, marginBottom:5 }}>{a.title}</h3></a>
                <p style={{ fontSize:12, color:'#5a4a32', lineHeight:1.55 }}>{a.excerpt?.slice(0,90)}…</p>
              </div>
            </div>
          ))}
        </div>
        <div className="ev3-col">
          <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', borderBottom:`2px solid ${p}`, paddingBottom:6, marginBottom:16 }}>More Stories</div>
          {sidebar.map((a:any) => (
            <div key={a.id} style={{ marginBottom:14, paddingBottom:14, borderBottom:'1px solid #e0d8cc' }}>
              <div style={{ fontSize:9, color:p, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>{a.category}</div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:700, lineHeight:1.4 }}>{a.title}</div></a>
              <div style={{ fontSize:10, color:'#888', marginTop:4 }}>{a.author_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  // Variant 1 (default) — NYT masthead style
  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:font, color:'#111' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .e1-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
      @media(max-width:768px){.e1-cols{grid-template-columns:1fr!important}.e1-side{display:none!important}}@media(max-width:480px){h1{font-size:20px!important}.e1-cards{grid-template-columns:1fr!important}}`}</style>
      <div style={{ borderBottom:'1px solid #ddd', padding:'6px 0', textAlign:'center', fontSize:11, color:'#888', letterSpacing:'.15em', textTransform:'uppercase' }}>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      <div style={{ textAlign:'center', padding:'18px 24px 12px', borderBottom:'4px double #111' }}>
        <a href="/"><div style={{ fontSize:52, fontWeight:900, letterSpacing:'-3px', lineHeight:1, fontFamily:gf('display') }}>{site.name}</div></a>
        <div style={{ fontSize:12, color:'#666', marginTop:6, fontStyle:'italic' }}>{site.tagline}</div>
      </div>
      <div style={{ background:'#111', padding:'6px 0', marginBottom:0 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', gap:24, overflowX:'auto' }}>
          <button onClick={()=>setSelectedCat('All')}
            style={{ color:selectedCat==='All'?p:'#ccc', fontSize:12, fontWeight:700, background:'none', border:'none', cursor:'pointer', borderBottom:selectedCat==='All'?`2px solid ${p}`:'2px solid transparent', paddingBottom:4, whiteSpace:'nowrap' }}>
            ALL
          </button>
          {siteCategories.filter((cat:string)=>cat!=='All').map((cat:string)=>(
            <button key={cat} onClick={()=>setSelectedCat(selectedCat===cat?'All':cat)}
              style={{ color: selectedCat===cat ? p : '#ccc', fontSize:12, fontWeight:700, whiteSpace:'nowrap', background:'none', border:'none', cursor:'pointer', borderBottom: selectedCat===cat ? `2px solid ${p}` : '2px solid transparent', paddingBottom:4 }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px' }}>
        <div style={{ display:'flex', gap:32, borderBottom:'1px solid #ddd', paddingBottom:28, marginBottom:28 }}>
          {hero && (
            <div style={{ flex:2 }}>
              <div style={{ fontSize:9, fontWeight:800, color:p, textTransform:'uppercase', letterSpacing:'.15em', marginBottom:10 }}>{hero.category}</div>
              <a href={`/article/${slug}/${hero.slug}`}><h1 style={{ fontSize:38, fontWeight:900, lineHeight:1.1, marginBottom:14, fontFamily:gf('display') }}>{hero.title}</h1></a>
              <p style={{ fontSize:17, lineHeight:1.75, color:'#333', borderLeft:`3px solid ${p}`, paddingLeft:16 }}>{hero.excerpt}</p>
            </div>
          )}
          <div className="e1-side" style={{ flex:1, borderLeft:'1px solid #ddd', paddingLeft:24 }}>
            <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', borderBottom:'2px solid #111', paddingBottom:8, marginBottom:14 }}>Today</div>
            {sidebar.map((a:any) => (
              <div key={a.id} style={{ paddingBottom:12, marginBottom:12, borderBottom:'1px solid #eee' }}>
                <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:700, lineHeight:1.4 }}>{a.title}</div></a>
                <div style={{ fontSize:10, color:'#888', marginTop:3 }}>{a.author_name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="e1-cols">
          {cols.map((a:any) => (
            <div key={a.id} style={{ borderTop:`3px solid ${p}`, paddingTop:14 }}>
              <div style={{ fontSize:9, fontWeight:800, color:p, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:6 }}>{a.category}</div>
              <a href={`/article/${slug}/${a.slug}`}><h3 style={{ fontSize:17, fontWeight:800, lineHeight:1.3, fontFamily:gf('display'), marginBottom:8 }}>{a.title}</h3></a>
              <p style={{ fontSize:13, color:'#555', lineHeight:1.65 }}>{a.excerpt?.slice(0,110)}…</p>
            </div>
          ))}
        </div>
      </div>
      <footer style={{ borderTop:'3px double #111', padding:'14px 24px', textAlign:'center', fontSize:11, color:'#888', marginTop:32 }}>© {new Date().getFullYear()} {site.name}</footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 2 — TECH (3 variants: dark cards / light matrix / neon)
// ═══════════════════════════════════════════════════════════════════════════
function Tech({ site, articles, p, font, slug, variant , selectedCat, setSelectedCat, siteCategories }: any) {
  if (variant === 2) return (
    <div style={{ minHeight:'100vh', background:'#f0f4ff', fontFamily:font }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .tv2-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
      .tv2-c{background:#fff;border-radius:12px;border-top:4px solid ${p};padding:20px;transition:transform .2s}
      .tv2-c:hover{transform:translateY(-3px)}
      @media(max-width:768px){.tv2-g{grid-template-columns:1fr}}@media(max-width:480px){h1{font-size:20px!important}nav a{font-size:11px!important}}`}</style>
      <div style={{ background:'#fff', borderBottom:'1px solid #e0e7ff', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:22, color:p }}>{site.name}</div></a>
        <div style={{ display:'flex', gap:12 }}>{siteCategories.filter((cat:string)=>cat!=='All').map((cat:string)=><button key={cat} onClick={()=>setSelectedCat(selectedCat===cat?'All':cat)} style={{ color:selectedCat===cat?p:'#64748b', fontSize:12, fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>{cat}</button>)}</div>
      </div>
      {articles[0] && (
        <div style={{ background:`linear-gradient(135deg,${p},${p}cc)`, color:'#fff', padding:'48px 24px', margin:'0 0 24px' }}>
          <div style={{ maxWidth:860, margin:'0 auto' }}>
            <span style={{ background:'rgba(255,255,255,.25)', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:12, textTransform:'uppercase', letterSpacing:'.1em' }}>{articles[0].category}</span>
            <a href={`/article/${slug}/${articles[0].slug}`}><h1 style={{ fontSize:40, fontWeight:900, color:'#fff', lineHeight:1.1, margin:'16px 0' }}>{articles[0].title}</h1></a>
            <p style={{ fontSize:16, opacity:.85, lineHeight:1.7 }}>{articles[0].excerpt}</p>
          </div>
        </div>
      )}
      <div className="tv2-g" style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px 40px' }}>
        {articles.slice(1,13).map((a:any) => (
          <div key={a.id} className="tv2-c">
            <div style={{ fontSize:9, color:p, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8 }}>{a.category}</div>
            <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:15, fontWeight:700, color:'#0f172a', lineHeight:1.4, marginBottom:8 }}>{a.title}</div></a>
            <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>{a.excerpt?.slice(0,90)}…</div>
            <div style={{ marginTop:12, fontSize:11, color:'#94a3b8' }}>{a.author_name}</div>
          </div>
        ))}
      </div>
    </div>
  )
  if (variant === 3) return (
    <div style={{ minHeight:'100vh', background:'#000', fontFamily:gf('mono'), color:'#00ff88' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .tv3-row{border-bottom:1px solid #0f2a1a;padding:14px 0;display:grid;grid-template-columns:60px 1fr;gap:16px}
      .tv3-row:hover{background:#050f08}
      @media(max-width:768px){.tv3-row{grid-template-columns:1fr}}@media(max-width:480px){h1{font-size:20px!important}article{padding:12px!important}}`}</style>
      <div style={{ borderBottom:'1px solid #0f2a1a', padding:'12px 24px', display:'flex', justifyContent:'space-between' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:18, color:'#00ff88', letterSpacing:'.1em' }}>{site.name.toUpperCase()}</div></a>
        <div style={{ fontSize:11, color:'#006633' }}>[{new Date().toISOString().slice(0,16)}]</div>
      </div>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'24px' }}>
        <div style={{ marginBottom:24, padding:'16px', border:'1px solid #00ff88', background:'#000d06' }}>
          <div style={{ fontSize:10, color:'#006633', marginBottom:6 }}>// LEAD STORY</div>
          {articles[0] && <><a href={`/article/${slug}/${articles[0].slug}`}><div style={{ fontSize:20, fontWeight:700, lineHeight:1.4, marginBottom:8, color:'#00ff88' }}>{articles[0].title}</div></a>
          <div style={{ fontSize:13, color:'#005522', lineHeight:1.6 }}>{articles[0].excerpt}</div></>}
        </div>
        {articles.slice(1,16).map((a:any,i:number) => (
          <div key={a.id} className="tv3-row">
            <div style={{ fontSize:18, fontWeight:900, color:'#003311', paddingTop:2 }}>{String(i+1).padStart(2,'0')}</div>
            <div>
              <div style={{ fontSize:9, color:'#006633', marginBottom:4, textTransform:'uppercase', letterSpacing:'.1em' }}>[{a.category}]</div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:14, fontWeight:700, lineHeight:1.4 }}>{a.title}</div></a>
              {i<3&&<div style={{ fontSize:12, color:'#005522', marginTop:4, lineHeight:1.5 }}>{a.excerpt?.slice(0,100)}…</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  // Variant 1 — dark cards
  return (
    <div style={{ minHeight:'100vh', background:'#0a0e1a', fontFamily:font, color:'#e2e8f0' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .tv1-c{background:#111827;border:1px solid #1e293b;transition:all .2s;display:block;padding:20px}
      .tv1-c:hover{border-color:${p};transform:translateY(-2px)}
      .tv1-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1px;background:#1e293b}
      @media(max-width:768px){.tv1-g{grid-template-columns:1fr}}`}</style>
      <div style={{ background:'#020617', borderBottom:`2px solid ${p}` }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <a href="/"><span style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'.08em' }}>{site.name.toUpperCase()}</span></a>
          <div style={{ display:'flex', gap:20 }}>{siteCategories.filter((cat:string)=>cat!=='All').map((cat:string)=><button key={cat} onClick={()=>setSelectedCat(selectedCat===cat?'All':cat)} style={{ color:selectedCat===cat?p:'#94a3b8', fontSize:12, fontWeight:600, background:'none', border:'none', cursor:'pointer', borderBottom:selectedCat===cat?`1px solid ${p}`:'none', paddingBottom:2 }}>{cat}</button>)}</div>
        </div>
      </div>
      {articles[0] && (
        <div style={{ background:`linear-gradient(135deg,#020617 60%,${p}18)`, padding:'56px 24px', borderBottom:'1px solid #1e293b' }}>
          <div style={{ maxWidth:860, margin:'0 auto' }}>
            <span style={{ background:p, color:'#fff', fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:2, textTransform:'uppercase', letterSpacing:'.1em' }}>{articles[0].category}</span>
            <a href={`/article/${slug}/${articles[0].slug}`}><h1 style={{ fontSize:44, fontWeight:900, color:'#f8fafc', lineHeight:1.08, margin:'16px 0' }}>{articles[0].title}</h1></a>
            <p style={{ fontSize:16, color:'#94a3b8', lineHeight:1.7 }}>{articles[0].excerpt}</p>
          </div>
        </div>
      )}
      <div className="tv1-g" style={{ maxWidth:1400, margin:'0 auto' }}>
        {articles.slice(1,13).map((a:any) => (
          <a key={a.id} className="tv1-c" href={`/article/${slug}/${a.slug}`}>
            <div style={{ fontSize:9, color:p, fontWeight:800, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:8 }}>{a.category}</div>
            <div style={{ fontSize:15, fontWeight:700, color:'#e2e8f0', lineHeight:1.4, marginBottom:8 }}>{a.title}</div>
            <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>{a.excerpt?.slice(0,90)}…</div>
            <div style={{ fontSize:11, color:'#334155', marginTop:12 }}>{a.author_name}</div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 3 — WIRE (3 variants: ticker / split / agency)
// ═══════════════════════════════════════════════════════════════════════════
function Wire({ site, articles, p, font, slug, variant , selectedCat, setSelectedCat, siteCategories }: any) {
  if (variant === 2) return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', fontFamily:font }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .wv2-grid{display:grid;grid-template-columns:3fr 2fr;gap:2px;background:#e5e7eb}
      @media(max-width:768px){.wv2-grid{grid-template-columns:1fr!important}}`}</style>
      <div style={{ background:'#111', padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:18, color:'#fff', letterSpacing:'.05em' }}>{site.name}</div></a>
        <div style={{ background:p, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:2 }}>LIVE</div>
      </div>
      <div className="wv2-grid">
        <div style={{ background:'#fff', padding:'20px 24px' }}>
          {articles.slice(0,12).map((a:any,i:number) => (
            <div key={a.id} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:'1px solid #f3f4f6', alignItems:'flex-start' }}>
              <div style={{ width:32, height:32, background:i===0?p:'#f1f5f9', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:i===0?'#fff':p, flexShrink:0 }}>{i+1}</div>
              <div>
                <div style={{ display:'flex', gap:6, marginBottom:3 }}>
                  <span style={{ background:p, color:'#fff', fontSize:8, fontWeight:800, padding:'1px 5px', borderRadius:2, textTransform:'uppercase' }}>{a.category}</span>
                  <span style={{ fontSize:10, color:'#9ca3af' }}>{new Date(a.published_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:700, lineHeight:1.4 }}>{a.title}</div></a>
                {i<2&&<div style={{ fontSize:12, color:'#6b7280', marginTop:3, lineHeight:1.5 }}>{a.excerpt?.slice(0,100)}…</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fafafa', padding:'20px' }}>
          <div style={{ fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', borderBottom:`2px solid ${p}`, paddingBottom:8, marginBottom:16 }}>Trending Now</div>
          {articles.slice(0,8).map((a:any,i:number) => (
            <div key={a.id} style={{ display:'flex', gap:8, marginBottom:12, paddingBottom:12, borderBottom:'1px solid #eee' }}>
              <span style={{ fontSize:20, fontWeight:900, color:p, lineHeight:1, minWidth:24 }}>{i+1}</span>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:12, lineHeight:1.4, fontWeight:600 }}>{a.title}</div></a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  if (variant === 3) return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:gf('condensed'), color:'#111' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .wv3-item{padding:10px 0;border-bottom:1px solid #e5e7eb}
      .wv3-item:hover{background:#fafafa}`}</style>
      <div style={{ borderBottom:'4px solid #111' }}>
        <div style={{ maxWidth:960, margin:'0 auto', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
          <a href="/"><div style={{ fontSize:32, fontWeight:900, letterSpacing:'.02em', textTransform:'uppercase' }}>{site.name}</div></a>
          <div style={{ fontSize:11, color:'#888', textTransform:'uppercase', letterSpacing:'.1em' }}>News Wire Service</div>
        </div>
        <div style={{ background:p, padding:'5px 24px', display:'flex', gap:20 }}>
          {['FLASH','MARKETS','ECONOMY','FX','COMMODITIES'].map(c=><a key={c} onClick={()=>setSelectedCat(c==='All'?'All':c)} href='#' style={{ color:'#fff', fontSize:11, fontWeight:800, letterSpacing:'.05em' }}>{c}</a>)}
        </div>
      </div>
      <div style={{ maxWidth:960, margin:'0 auto', padding:'16px 24px' }}>
        {articles.slice(0,20).map((a:any,i:number) => (
          <div key={a.id} className="wv3-item">
            <div style={{ display:'flex', gap:8, alignItems:'baseline' }}>
              <span style={{ fontSize:9, color:'#fff', background:i===0?p:'#9ca3af', fontWeight:800, padding:'1px 5px', borderRadius:2, textTransform:'uppercase', flexShrink:0 }}>{a.category}</span>
              <span style={{ fontSize:10, color:'#9ca3af', flexShrink:0 }}>{new Date(a.published_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
              <a href={`/article/${slug}/${a.slug}`}><span style={{ fontSize:i<3?16:13, fontWeight:i<3?800:600, lineHeight:1.4 }}>{a.title}</span></a>
            </div>
            {i<2&&<p style={{ fontSize:12, color:'#6b7280', lineHeight:1.55, marginTop:4, marginLeft:0 }}>{a.excerpt?.slice(0,140)}…</p>}
          </div>
        ))}
      </div>
    </div>
  )
  // Variant 1 — classic wire
  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:font, color:'#111' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .wv1-i{border-bottom:1px solid #eee;padding:10px 0;display:flex;gap:14px;align-items:flex-start}
      .wv1-i:hover{background:#f9fafb}
      @media(max-width:768px){.wv1-cols{flex-direction:column!important}}`}</style>
      <div style={{ background:p, padding:'8px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><span style={{ color:'#fff', fontWeight:900, fontSize:20, letterSpacing:'.05em' }}>{site.name} WIRE</span></a>
        <span style={{ color:'rgba(255,255,255,.7)', fontSize:11 }}>{new Date().toUTCString()}</span>
      </div>
      <div style={{ background:'#f5f5f5', borderBottom:'1px solid #ddd', padding:'5px 24px', display:'flex', gap:20 }}>
        {['BREAKING','MARKETS','ECONOMY','FX','CRYPTO'].map(c=><a key={c} onClick={()=>setSelectedCat(c==='All'?'All':c)} href='#' style={{ fontSize:11, fontWeight:800, color:'#333', textTransform:'uppercase' }}>{c}</a>)}
      </div>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'16px 24px' }}>
        <div className="wv1-cols" style={{ display:'flex', gap:32 }}>
          <div style={{ flex:2 }}>
            {articles.slice(0,18).map((a:any,i:number) => (
              <div key={a.id} className="wv1-i">
                <div style={{ width:34, height:34, background:i===0?p:'#f1f5f9', borderRadius:4, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:i===0?'#fff':p }}>{i+1}</div>
                <div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                    <span style={{ background:p, color:'#fff', fontSize:8, fontWeight:800, padding:'1px 5px', borderRadius:2, textTransform:'uppercase' }}>{a.category}</span>
                    <span style={{ fontSize:10, color:'#999' }}>{new Date(a.published_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:700, lineHeight:1.4 }}>{a.title}</div></a>
                  {i<3&&<div style={{ fontSize:12, color:'#666', marginTop:3, lineHeight:1.5 }}>{a.excerpt?.slice(0,100)}…</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ border:'1px solid #e5e7eb', padding:14 }}>
              <div style={{ fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', borderBottom:`2px solid ${p}`, paddingBottom:6, marginBottom:12 }}>Top Stories</div>
              {articles.slice(0,5).map((a:any,i:number) => (
                <div key={a.id} style={{ display:'flex', gap:8, marginBottom:10, paddingBottom:10, borderBottom:'1px solid #f0f0f0' }}>
                  <span style={{ fontSize:18, fontWeight:900, color:p, lineHeight:1 }}>{i+1}</span>
                  <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:12, lineHeight:1.4 }}>{a.title}</div></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 4 — DASHBOARD (3 variants: KPI cards / list / heatmap)
// ═══════════════════════════════════════════════════════════════════════════
function Dashboard({ site, articles, p, font, slug, variant , selectedCat, setSelectedCat, siteCategories }: any) {
  if (variant === 2) return (
    <div style={{ minHeight:'100vh', background:'#1e2130', fontFamily:font, color:'#e2e8f0' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .dv2-row{display:grid;grid-template-columns:1fr 3fr 1fr;gap:16px;padding:12px 0;border-bottom:1px solid #2a3147;align-items:start}
      .dv2-row:hover{background:#232840}
      @media(max-width:768px){.dv2-row{grid-template-columns:1fr!important}}`}</style>
      <div style={{ background:'#161929', borderBottom:'1px solid #2a3147', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e' }}/>
          <a href="/"><span style={{ fontWeight:800, fontSize:16, color:'#f1f5f9' }}>{site.name}</span></a>
        </div>
        <div style={{ fontSize:11, color:'#475569', fontFamily:gf('mono') }}>{new Date().toISOString().slice(0,16)} UTC</div>
      </div>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px' }}>
        <div style={{ display:'flex', gap:12, marginBottom:20, overflowX:'auto' }}>
          {[['ARTICLES','24H',String(Math.floor(Math.random()*20+10))],['SOURCES','LIVE','47'],['TOPICS','TRACKED','12'],['SIGNAL','STRENGTH','HIGH']].map(([l,s,v])=>(
            <div key={l} style={{ background:'#161929', border:'1px solid #2a3147', borderRadius:6, padding:'12px 18px', flexShrink:0 }}>
              <div style={{ fontSize:9, color:'#475569', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:2 }}>{l} / {s}</div>
              <div style={{ fontSize:22, fontWeight:800, color:p, fontFamily:gf('mono') }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'#161929', border:'1px solid #2a3147', borderRadius:6, padding:'16px 20px' }}>
          <div style={{ fontSize:10, color:p, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:12 }}>// FEED</div>
          {articles.slice(0,14).map((a:any,i:number) => (
            <div key={a.id} className="dv2-row">
              <div style={{ fontSize:9, color:p, fontFamily:gf('mono'), paddingTop:2 }}>[{a.category?.slice(0,6).toUpperCase()}]</div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', lineHeight:1.4 }}>{a.title}</div></a>
              <div style={{ fontSize:10, color:'#475569', fontFamily:gf('mono'), textAlign:'right' }}>{new Date(a.published_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  if (variant === 3) return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:font, color:'#111' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .dv3-g{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:#e5e7eb}
      .dv3-c{background:#fff;padding:18px;transition:background .15s}
      .dv3-c:hover{background:${p}08}
      @media(max-width:768px){.dv3-g{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      <div style={{ background:p, padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:18, color:'#fff', letterSpacing:'-.5px' }}>{site.name}</div></a>
        <div style={{ background:'rgba(255,255,255,.2)', color:'#fff', fontSize:10, padding:'3px 8px', borderRadius:3, fontWeight:700 }}>{site.category}</div>
      </div>
      <div style={{ maxWidth:1400, margin:'16px auto', padding:'0 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
          {[['Published','274+'],['Topics','48'],['Analysts','12'],['Updated','Just now']].map(([l,v])=>(
            <div key={l} style={{ background:`${p}0d`, border:`1px solid ${p}20`, borderRadius:6, padding:'12px 16px' }}>
              <div style={{ fontSize:10, color:p, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:20, fontWeight:800, color:'#111' }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="dv3-g">
          {articles.slice(0,16).map((a:any,i:number) => (
            <div key={a.id} className="dv3-c">
              <div style={{ fontSize:8, color:p, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6, display:'flex', justifyContent:'space-between' }}>
                <span>{a.category}</span><span style={{ color:'#9ca3af' }}>{new Date(a.published_at).toLocaleDateString()}</span>
              </div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:700, lineHeight:1.4, color:'#0f172a' }}>{a.title}</div></a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
  // Variant 1
  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:font, color:'#1e293b' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .dv1-c{background:#fff;border:1px solid #e2e8f0;borderRadius:8px;padding:20px;transition:box-shadow .15s}
      .dv1-c:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
      .dv1-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:16px}
      @media(max-width:768px){.dv1-g{grid-template-columns:1fr}}`}</style>
      <div style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, background:p, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:14 }}>{site.name[0]}</div>
            <a href="/"><span style={{ fontWeight:800, fontSize:17 }}>{site.name}</span></a>
          </div>
          <div style={{ display:'flex', gap:8, overflowX:'auto' }}>
            {['All','Markets','Economy','AI','Policy'].map(c=><a key={c} href={c==='All'?'/':`/?category=${c}`} style={{ padding:'5px 12px', background:'#f1f5f9', color:'#64748b', borderRadius:6, fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>{c}</a>)}
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'20px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[['Published Today',String(Math.floor(Math.random()*20+10))],['Sources','47'],['Categories','12'],['Updated',new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})]].map(([l,v])=>(
            <div key={l} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'14px 18px' }}>
              <div style={{ fontSize:10, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:22, fontWeight:800, color:p }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="dv1-g">
          {articles.slice(0,12).map((a:any) => (
            <div key={a.id} className="dv1-c">
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ background:`${p}18`, color:p, fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:4, textTransform:'uppercase' }}>{a.category}</span>
                <span style={{ fontSize:10, color:'#94a3b8' }}>{new Date(a.published_at).toLocaleDateString()}</span>
              </div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:14, fontWeight:700, color:'#0f172a', lineHeight:1.4, marginBottom:8 }}>{a.title}</div></a>
              <div style={{ fontSize:12, color:'#64748b', lineHeight:1.6 }}>{a.excerpt?.slice(0,90)}…</div>
              <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid #f1f5f9', fontSize:11, color:'#94a3b8' }}>{a.author_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 5 — MAGAZINE (3 variants: glossy / columns / journal)
// ═══════════════════════════════════════════════════════════════════════════
function Magazine({ site, articles, p, sec, font, slug, variant, selectedCat, setSelectedCat, siteCategories }: any) {
  const hero = articles[0], feat = articles.slice(1,4), rest = articles.slice(4,12)
  if (variant === 2) return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:gf('display'), color:'#1a1a1a' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .mv2-g{display:grid;grid-template-columns:2fr 1fr;gap:32px}
      @media(max-width:768px){.mv2-g{grid-template-columns:1fr!important}}`}</style>
      <header style={{ borderBottom:`3px solid #111`, padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontSize:32, fontWeight:900, letterSpacing:'-2px' }}>{site.name}</div></a>
        <div style={{ fontSize:12, color:'#666', fontStyle:'italic', maxWidth:300, textAlign:'right' }}>{site.tagline}</div>
      </header>
      <div style={{ background:p, color:'#fff', padding:'6px 24px', display:'flex', gap:20 }}>
        {['COVER STORY','MARKETS','OPINION','LIFE','TRAVEL'].map(c=><a key={c} onClick={()=>setSelectedCat(c==='All'?'All':c)} href='#' style={{ color:'rgba(255,255,255,.85)', fontSize:11, fontWeight:700, letterSpacing:'.05em' }}>{c}</a>)}
      </div>
      <div style={{ maxWidth:1200, margin:'32px auto', padding:'0 24px' }}>
        <div className="mv2-g">
          <div>
            {hero && (
              <div style={{ marginBottom:28, paddingBottom:28, borderBottom:'1px solid #e5e7eb' }}>
                <div style={{ background:sec, display:'inline-block', fontSize:10, fontWeight:800, padding:'3px 10px', borderRadius:2, marginBottom:12, textTransform:'uppercase', letterSpacing:'.1em', color:'#111' }}>{hero.category}</div>
                <a href={`/article/${slug}/${hero.slug}`}><h1 style={{ fontSize:42, fontWeight:900, lineHeight:1.05, marginBottom:16 }}>{hero.title}</h1></a>
                <p style={{ fontSize:17, lineHeight:1.75, color:'#444' }}>{hero.excerpt}</p>
                <div style={{ marginTop:14, fontSize:12, color:'#888' }}>By {hero.author_name}</div>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
              {feat.map((a:any,i:number) => (
                <div key={a.id} style={{ borderLeft:`3px solid ${[p,sec,'#111'][i]}`, paddingLeft:14 }}>
                  <div style={{ fontSize:9, color:[p,sec,'#111'][i], fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:5 }}>{a.category}</div>
                  <a href={`/article/${slug}/${a.slug}`}><h3 style={{ fontSize:16, fontWeight:800, lineHeight:1.3, marginBottom:6 }}>{a.title}</h3></a>
                  <p style={{ fontSize:12, color:'#555', lineHeight:1.6 }}>{a.excerpt?.slice(0,90)}…</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ background:'#f9fafb', padding:20, borderRadius:4 }}>
              <div style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', borderBottom:`2px solid ${p}`, paddingBottom:8, marginBottom:16 }}>More Stories</div>
              {rest.slice(0,6).map((a:any) => (
                <div key={a.id} style={{ marginBottom:14, paddingBottom:14, borderBottom:'1px solid #eee' }}>
                  <div style={{ fontSize:9, color:p, fontWeight:700, textTransform:'uppercase', marginBottom:3 }}>{a.category}</div>
                  <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:700, lineHeight:1.4 }}>{a.title}</div></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  if (variant === 3) return (
    <div style={{ minHeight:'100vh', background:'#fdf6e3', fontFamily:gf('serif'), color:'#3a2e1a' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .mv3-art{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:#d4c9a8}
      @media(max-width:768px){.mv3-art{grid-template-columns:1fr!important}}`}</style>
      <header style={{ background:'#3a2e1a', color:'#fdf6e3', textAlign:'center', padding:'24px' }}>
        <a href="/"><div style={{ fontSize:40, fontWeight:900, letterSpacing:'-1px', color:'#fdf6e3', fontFamily:gf('display') }}>{site.name}</div></a>
        <div style={{ width:60, height:2, background:p, margin:'12px auto 8px' }}/>
        <div style={{ fontSize:12, color:'#a89060', fontStyle:'italic' }}>{site.tagline}</div>
      </header>
      {hero && (
        <div style={{ padding:'32px 24px', maxWidth:800, margin:'0 auto', borderBottom:'1px solid #d4c9a8' }}>
          <div style={{ fontSize:9, color:p, fontWeight:800, textTransform:'uppercase', letterSpacing:'.15em', marginBottom:10, textAlign:'center' }}>{hero.category}</div>
          <a href={`/article/${slug}/${hero.slug}`}><h1 style={{ fontSize:44, fontWeight:900, lineHeight:1.08, textAlign:'center', marginBottom:16 }}>{hero.title}</h1></a>
          <p style={{ fontSize:17, lineHeight:1.8, color:'#5a4a30', textAlign:'center' }}>{hero.excerpt}</p>
        </div>
      )}
      <div className="mv3-art" style={{ maxWidth:1200, margin:'24px auto' }}>
        {rest.map((a:any,i:number) => (
          <div key={a.id} style={{ background:'#fdf6e3', padding:20 }}>
            <div style={{ fontSize:9, color:p, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>{a.category}</div>
            <a href={`/article/${slug}/${a.slug}`}><h3 style={{ fontSize:i%3===0?20:15, fontWeight:800, lineHeight:1.3, marginBottom:8 }}>{a.title}</h3></a>
            {i%3===0&&<p style={{ fontSize:12, color:'#5a4a30', lineHeight:1.6 }}>{a.excerpt?.slice(0,110)}…</p>}
            <div style={{ fontSize:10, color:'#a89060', marginTop:8, fontStyle:'italic' }}>by {a.author_name}</div>
          </div>
        ))}
      </div>
    </div>
  )
  // Variant 1 — glossy
  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:font }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .mv1-f{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
      .mv1-r{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
      @media(max-width:768px){.mv1-f,.mv1-r{grid-template-columns:1fr!important}}`}</style>
      <header style={{ padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`3px solid ${p}` }}>
        <a href="/"><div style={{ fontSize:30, fontWeight:900, letterSpacing:'-1px', fontFamily:gf('display') }}>{site.name}</div></a>
        <div style={{ display:'flex', gap:16 }}>{['Features','Finance','Markets','Life'].map(c=><a key={c} onClick={()=>setSelectedCat(c==='All'?'All':c)} href='#' style={{ color:'#555', fontSize:13, fontWeight:600 }}>{c}</a>)}</div>
      </header>
      {hero && (
        <div style={{ background:`linear-gradient(to right, #0f172a 55%, ${p}cc)`, color:'#fff', padding:'72px 24px' }}>
          <div style={{ maxWidth:760 }}>
            <span style={{ background:'rgba(255,255,255,.2)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, textTransform:'uppercase', letterSpacing:'.1em' }}>{hero.category}</span>
            <a href={`/article/${slug}/${hero.slug}`}><h1 style={{ fontSize:54, fontWeight:900, lineHeight:1.04, margin:'16px 0 18px', fontFamily:gf('display') }}>{hero.title}</h1></a>
            <p style={{ fontSize:18, lineHeight:1.7, opacity:.85 }}>{hero.excerpt}</p>
          </div>
        </div>
      )}
      <div style={{ maxWidth:1200, margin:'36px auto', padding:'0 24px' }}>
        <div className="mv1-f" style={{ marginBottom:36 }}>
          {feat.map((a:any,i:number) => (
            <div key={a.id} style={{ borderTop:`4px solid ${[p,sec,'#111'][i]}`, paddingTop:14 }}>
              <div style={{ fontSize:10, color:[p,sec,'#111'][i], fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>{a.category}</div>
              <a href={`/article/${slug}/${a.slug}`}><h3 style={{ fontSize:19, fontWeight:800, lineHeight:1.3, fontFamily:gf('display'), marginBottom:8 }}>{a.title}</h3></a>
              <p style={{ fontSize:13, color:'#555', lineHeight:1.6 }}>{a.excerpt?.slice(0,120)}…</p>
            </div>
          ))}
        </div>
        <div style={{ height:1, background:'#e5e7eb', marginBottom:28 }} />
        <div className="mv1-r">
          {rest.map((a:any) => (
            <div key={a.id}>
              <div style={{ fontSize:9, color:p, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:5 }}>{a.category}</div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:14, fontWeight:700, lineHeight:1.4, color:'#111' }}>{a.title}</div></a>
              <div style={{ fontSize:11, color:'#999', marginTop:5 }}>{a.author_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 6 — MINIMAL (3 variants: blog / newsletter / digest)
// ═══════════════════════════════════════════════════════════════════════════
function Minimal({ site, articles, p, font, slug, variant , selectedCat, setSelectedCat, siteCategories }: any) {
  if (variant === 2) return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:font, color:'#111' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .mv2-item{display:flex;gap:20px;padding:24px 0;border-bottom:1px solid #f3f4f6;align-items:flex-start}
      @media(max-width:768px){.mv2-item{flex-direction:column}}`}</style>
      <div style={{ background:'#111', padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:20, color:'#fff' }}>{site.name}</div></a>
        <div style={{ fontSize:11, color:'#aaa', fontStyle:'italic' }}>{site.tagline}</div>
      </div>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ padding:'20px 0', borderBottom:'2px solid #111', display:'flex', gap:12, flexWrap:'wrap' }}>
          {['All','Markets','Economy','AI','Opinion'].map(c=><a key={c} href={c==='All'?'/':`/?category=${c}`} style={{ fontSize:12, fontWeight:700, color:'#111', padding:'4px 12px', border:'1px solid #111', borderRadius:20 }}>{c}</a>)}
        </div>
        {articles.slice(0,14).map((a:any,i:number) => (
          <div key={a.id} className="mv2-item">
            <div style={{ width:44, height:44, borderRadius:4, background:`${p}18`, display:'flex', alignItems:'center', justifyContent:'center', color:p, fontWeight:900, fontSize:16, flexShrink:0 }}>{String(i+1).padStart(2,'0')}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                <span style={{ background:`${p}15`, color:p, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10 }}>{a.category}</span>
                <span style={{ fontSize:11, color:'#9ca3af' }}>{new Date(a.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
              </div>
              <a href={`/article/${slug}/${a.slug}`}><h3 style={{ fontSize:18, fontWeight:800, lineHeight:1.3, marginBottom:6 }}>{a.title}</h3></a>
              <p style={{ fontSize:13, color:'#555', lineHeight:1.65 }}>{a.excerpt?.slice(0,130)}…</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  if (variant === 3) return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', fontFamily:font, color:'#111' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .mv3-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:12px;transition:box-shadow .15s}
      .mv3-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)}`}</style>
      <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'14px 24px', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <a href="/"><div style={{ fontWeight:800, fontSize:18 }}>{site.name}</div></a>
          <div style={{ width:28, height:28, borderRadius:'50%', background:p, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:12 }}>{site.name[0]}</div>
        </div>
      </div>
      <div style={{ maxWidth:680, margin:'24px auto', padding:'0 24px' }}>
        {articles[0] && (
          <div className="mv3-card" style={{ borderLeft:`4px solid ${p}`, marginBottom:20 }}>
            <div style={{ fontSize:9, color:p, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8 }}>Today's Lead</div>
            <a href={`/article/${slug}/${articles[0].slug}`}><h2 style={{ fontSize:24, fontWeight:900, lineHeight:1.2, marginBottom:10 }}>{articles[0].title}</h2></a>
            <p style={{ fontSize:14, color:'#555', lineHeight:1.7 }}>{articles[0].excerpt}</p>
          </div>
        )}
        {articles.slice(1,14).map((a:any) => (
          <div key={a.id} className="mv3-card">
            <div style={{ display:'flex', gap:8, marginBottom:8 }}>
              <span style={{ background:`${p}12`, color:p, fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:4 }}>{a.category}</span>
              <span style={{ fontSize:11, color:'#9ca3af' }}>{new Date(a.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
            </div>
            <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:16, fontWeight:700, lineHeight:1.35, color:'#111', marginBottom:6 }}>{a.title}</div></a>
            <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.6 }}>{a.excerpt?.slice(0,110)}…</div>
          </div>
        ))}
      </div>
    </div>
  )
  // Variant 1 — Medium/Substack
  return (
    <div style={{ minHeight:'100vh', background:'#fffef9', fontFamily:font, color:'#1a1a1a' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .mv1-i{padding:28px 0;border-bottom:1px solid #f0ede8}`}</style>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'0 24px' }}>
        <header style={{ padding:'30px 0 20px', borderBottom:'1px solid #f0ede8' }}>
          <a href="/"><div style={{ fontSize:22, fontWeight:800, letterSpacing:'-.5px' }}>{site.name}</div></a>
          <div style={{ fontSize:14, color:'#888', marginTop:3 }}>{site.tagline}</div>
        </header>
        {articles.slice(0,14).map((a:any) => (
          <div key={a.id} className="mv1-i">
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:p, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>{(a.author_name||'A').charAt(0)}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:600 }}>{a.author_name}</div>
                <div style={{ fontSize:11, color:'#999' }}>{new Date(a.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
              </div>
            </div>
            <a href={`/article/${slug}/${a.slug}`}><h2 style={{ fontSize:21, fontWeight:800, lineHeight:1.3, marginBottom:8 }}>{a.title}</h2></a>
            <p style={{ fontSize:14, color:'#555', lineHeight:1.7, marginBottom:10 }}>{a.excerpt?.slice(0,150)}…</p>
            <div style={{ display:'flex', gap:10, alignItems:'center', fontSize:11, color:'#999' }}>
              <span style={{ background:`${p}15`, color:p, padding:'2px 8px', borderRadius:10, fontWeight:600 }}>{a.category}</span>
              <span>{a.read_time_minutes||4} min read</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 7 — NEWSPAPER (variants handled inline)
// ═══════════════════════════════════════════════════════════════════════════
function Newspaper({ site, articles, p, font, slug, variant , selectedCat, setSelectedCat, siteCategories }: any) {
  const cols = [articles.slice(0,4), articles.slice(4,7), articles.slice(7,10)]
  return (
    <div style={{ minHeight:'100vh', background: variant===2?'#fff':variant===3?'#1a1410':'#f7f3e9', fontFamily:gf('serif'), color:variant===3?'#e8dcc8':'#1a1a1a' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .np-g{display:grid;grid-template-columns:${variant===2?'1fr 2px 1fr 2px 1fr':'1fr 1px 2fr 1px 1fr'};gap:0}
      .np-d{background:${variant===3?'#3a2e1a':'#bbb'}}
      .np-col{padding:0 20px}
      @media(max-width:768px){.np-g{grid-template-columns:1fr!important}.np-d{display:none!important}}`}</style>
      <header style={{ borderBottom:`3px ${variant===2?'solid':'double'} ${variant===3?'#e8dcc8':'#333'}`, textAlign:'center', padding:`${variant===2?'12px':'18px'} 24px ${variant===2?'8px':'12px'}` }}>
        <a href="/"><div style={{ fontSize:variant===2?36:52, fontWeight:900, fontFamily:gf('display'), letterSpacing:'-2px', lineHeight:1, color:variant===3?'#e8dcc8':'inherit' }}>{site.name}</div></a>
        <div style={{ borderTop:`1px solid ${variant===3?'#3a2e1a':'#999'}`, borderBottom:`1px solid ${variant===3?'#3a2e1a':'#999'}`, padding:'4px 0', margin:'8px 0', fontSize:11, color:variant===3?'#a08060':'#666', display:'flex', justifyContent:'space-between' }}>
          <span>{variant===2?'Independent Journalism':variant===3?'Evening Edition':'Est. '+new Date().getFullYear()}</span>
          <span style={{ fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em' }}>{site.tagline||'Financial Reporting'}</span>
          <span>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</span>
        </div>
      </header>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px' }}>
        <div className="np-g">
          {cols.map((colArts:any[],ci:number) => (
            <React.Fragment key={ci}>
              {ci>0&&<div className="np-d"/>}
              <div className="np-col">
                {colArts.map((a:any,ai:number) => (
                  <div key={a.id} style={{ paddingBottom:16, marginBottom:16, borderBottom:ai<colArts.length-1?`1px solid ${variant===3?'#3a2e1a':'#ccc'}`:'none' }}>
                    {ai===0&&ci===0&&<div style={{ fontSize:10, fontWeight:700, color:p, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>LEAD</div>}
                    <a href={`/article/${slug}/${a.slug}`}><h2 style={{ fontSize:ai===0&&ci===0?22:16, fontWeight:800, lineHeight:1.25, fontFamily:gf('display'), marginBottom:8 }}>{a.title}</h2></a>
                    {(ai===0||ci===1)&&<p style={{ fontSize:12, lineHeight:1.65, color:variant===3?'#c0a878':'#444' }}>{a.excerpt?.slice(0,ai===0?180:110)}…</p>}
                    <div style={{ fontSize:10, color:variant===3?'#806040':'#888', marginTop:6, fontStyle:'italic' }}>By {a.author_name}</div>
                  </div>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 8 — RESEARCH (3 variants)
// ═══════════════════════════════════════════════════════════════════════════
function Research({ site, articles, p, font, slug, variant , selectedCat, setSelectedCat, siteCategories }: any) {
  return (
    <div style={{ minHeight:'100vh', background:variant===2?'#0f172a':variant===3?'#fefefe':'#f8f9fa', fontFamily:font, color:variant===2?'#e2e8f0':variant===3?'#1a1a1a':'#212529' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .ri{display:grid;grid-template-columns:${variant===3?'60px':'72px'} 1fr;gap:18px;padding:18px 0;border-bottom:1px solid ${variant===2?'#1e293b':variant===3?'#f0f0f0':'#dee2e6'};align-items:start}
      @media(max-width:768px){.ri{grid-template-columns:1fr}}`}</style>
      <div style={{ background:variant===2?'#020617':p, borderBottom:`4px solid ${variant===2?p:'#111'}`, boxShadow:'0 2px 8px rgba(0,0,0,.1)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', padding:'18px 24px', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ background:variant===2?p:'#fff', color:variant===2?'#fff':p, fontWeight:900, fontSize:18, padding:'7px 12px', borderRadius:4 }}>{site.name.substring(0,2).toUpperCase()}</div>
          <div>
            <a href="/"><div style={{ fontWeight:800, fontSize:19, color:variant===2?'#f1f5f9':'#fff' }}>{site.name} Research</div></a>
            <div style={{ fontSize:12, color:variant===2?'#475569':'rgba(255,255,255,.7)' }}>{site.description||'Independent Financial Research'}</div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1000, margin:'28px auto', padding:'0 24px' }}>
        <div style={{ background:variant===2?'#1e293b':variant===3?'#f9f9f9':'#fff', border:`1px solid ${variant===2?'#334155':variant===3?'#eee':'#dee2e6'}`, borderLeft:`4px solid ${p}`, padding:'14px 18px', marginBottom:28, borderRadius:'0 4px 4px 0' }}>
          <div style={{ fontSize:10, fontWeight:700, color:p, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:3 }}>Research Brief</div>
          <div style={{ fontSize:14, color:variant===2?'#94a3b8':variant===3?'#333':'#495057', lineHeight:1.6 }}>{articles[0]?.excerpt||'Latest financial research and market analysis.'}</div>
        </div>
        {articles.slice(0,15).map((a:any,i:number) => (
          <div key={a.id} className="ri">
            <div style={{ textAlign:'center', padding:'8px', background:variant===2?`${p}20`:`${p}10`, borderRadius:4 }}>
              <div style={{ fontSize:17, fontWeight:900, color:p }}>{String(i+1).padStart(2,'0')}</div>
              <div style={{ fontSize:9, color:variant===2?'#475569':'#6c757d', textTransform:'uppercase', marginTop:2 }}>{a.category?.slice(0,5)}</div>
            </div>
            <div>
              <a href={`/article/${slug}/${a.slug}`}><h3 style={{ fontSize:15, fontWeight:700, lineHeight:1.4, marginBottom:5 }}>{a.title}</h3></a>
              <p style={{ fontSize:12, color:variant===2?'#64748b':'#6c757d', lineHeight:1.6, marginBottom:6 }}>{a.excerpt?.slice(0,130)}…</p>
              <div style={{ fontSize:10, color:variant===2?'#334155':'#adb5bd' }}>{a.author_name} · {new Date(a.published_at).toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 9 — GRID (3 variants: masonry / square / bento)
// ═══════════════════════════════════════════════════════════════════════════
function Grid({ site, articles, p, font, slug, variant, selectedCat, setSelectedCat, siteCategories }: any) {
  const palette = ['#dbeafe','#dcfce7','#fef3c7','#fce7f3','#ede9fe','#ffedd5','#f0fdf4','#fef9c3']
  if (variant === 2) return (
    <div style={{ minHeight:'100vh', background:'#111', fontFamily:font }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .gv2-g{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:200px;gap:3px}
      .gv2-c{overflow:hidden;position:relative;transition:transform .2s}
      .gv2-c:hover{transform:scale(1.02)}
      .gv2-c:nth-child(1){grid-column:span 2;grid-row:span 2}
      .gv2-c:nth-child(5){grid-column:span 2}
      @media(max-width:768px){.gv2-g{grid-template-columns:1fr;grid-auto-rows:auto!important}.gv2-c{grid-column:span 1!important;grid-row:span 1!important}}`}</style>
      <div style={{ background:'#000', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:20, color:p, letterSpacing:'-.5px' }}>{site.name}</div></a>
        <div style={{ display:'flex', gap:8 }}>
          {['All','Markets','Tech','Economy'].map(c=><a key={c} href={c==='All'?'/':`/?category=${c}`} style={{ color:'#666', fontSize:12, fontWeight:600 }}>{c}</a>)}
        </div>
      </div>
      <div className="gv2-g" style={{ maxWidth:1400, margin:'3px auto' }}>
        {articles.slice(0,12).map((a:any,i:number) => (
          <div key={a.id} className="gv2-c" style={{ background:i===0?p:i===1?'#1e293b':i===4?'#0f172a':`${palette[i%palette.length]}22` }}>
            <a href={`/article/${slug}/${a.slug}`} style={{ display:'flex', height:'100%', padding:20, flexDirection:'column', justifyContent:'flex-end' }}>
              <div style={{ fontSize:9, fontWeight:700, color:i<=1||i===4?'rgba(255,255,255,.6)':'#64748b', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>{a.category}</div>
              <div style={{ fontSize:i===0?22:i<=1?15:13, fontWeight:800, lineHeight:1.35, color:i<=1||i===4?'#fff':'#1e293b' }}>{a.title}</div>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
  if (variant === 3) return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:font }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .gv3-b{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
      .gv3-c{border-radius:16px;padding:24px;transition:transform .15s}
      .gv3-c:hover{transform:translateY(-3px)}
      @media(max-width:768px){.gv3-b{grid-template-columns:1fr!important}}`}</style>
      <header style={{ background:'#fff', padding:'16px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:20, color:p }}>{site.name}</div></a>
        <div style={{ display:'flex', gap:6 }}>
          {['All','Markets','Tech','Economy','Opinion'].map(c=><a key={c} href={c==='All'?'/':`/?category=${c}`} style={{ padding:'5px 14px', borderRadius:20, background:c==='All'?p:'#f1f5f9', color:c==='All'?'#fff':'#64748b', fontSize:12, fontWeight:600 }}>{c}</a>)}
        </div>
      </header>
      <div style={{ maxWidth:1200, margin:'24px auto', padding:'0 24px' }}>
        <div className="gv3-b">
          {articles.slice(0,12).map((a:any,i:number) => {
            const colors = [p,'#0f172a','#1d4ed8','#7c3aed','#b45309','#0e7490']
            const bg = i<6 ? colors[i] : palette[(i-6)%palette.length]
            const light = i<6
            return (
              <div key={a.id} className="gv3-c" style={{ background:bg, gridColumn:i===0?'span 2':'span 1' }}>
                <div style={{ fontSize:9, fontWeight:700, color:light?'rgba(255,255,255,.6)':'#64748b', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8 }}>{a.category}</div>
                <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:i===0?22:15, fontWeight:800, lineHeight:1.35, color:light?'#fff':'#1e293b', marginBottom:8 }}>{a.title}</div></a>
                {(i===0||i===1)&&<div style={{ fontSize:12, color:light?'rgba(255,255,255,.75)':'#475569', lineHeight:1.6 }}>{a.excerpt?.slice(0,100)}…</div>}
                <div style={{ fontSize:11, color:light?'rgba(255,255,255,.5)':'#94a3b8', marginTop:10 }}>{a.author_name}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
  // Variant 1 — masonry
  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:font }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .gv1-m{columns:3 290px;column-gap:14px}
      .gv1-c{break-inside:avoid;margin-bottom:14px;border-radius:12px;overflow:hidden;transition:transform .15s;display:block}
      .gv1-c:hover{transform:translateY(-3px)}
      @media(max-width:768px){.gv1-m{columns:1}}`}</style>
      <header style={{ background:'#fff', padding:'14px 24px', boxShadow:'0 1px 3px rgba(0,0,0,.1)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100 }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:20, color:p }}>{site.name}</div></a>
        <div style={{ display:'flex', gap:6 }}>
          {['All','Markets','Tech','Economy'].map(c=><a key={c} href={c==='All'?'/':`/?category=${c}`} style={{ padding:'5px 12px', borderRadius:20, background:c==='All'?p:'#f1f5f9', color:c==='All'?'#fff':'#64748b', fontSize:12, fontWeight:600 }}>{c}</a>)}
        </div>
      </header>
      <div style={{ maxWidth:1400, margin:'20px auto', padding:'0 20px' }}>
        <div className="gv1-m">
          {articles.slice(0,15).map((a:any,i:number) => (
            <a key={a.id} className="gv1-c" href={`/article/${slug}/${a.slug}`} style={{ background:i===0?p:palette[i%palette.length] }}>
              <div style={{ padding:18 }}>
                <div style={{ fontSize:9, fontWeight:700, color:i===0?'rgba(255,255,255,.7)':'#94a3b8', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>{a.category}</div>
                <div style={{ fontSize:i===0?20:14, fontWeight:800, lineHeight:1.35, color:i===0?'#fff':'#1e293b', marginBottom:6 }}>{a.title}</div>
                {(i===0||i%5===0)&&<div style={{ fontSize:12, lineHeight:1.6, color:i===0?'rgba(255,255,255,.8)':'#475569' }}>{a.excerpt?.slice(0,100)}…</div>}
                <div style={{ fontSize:10, color:i===0?'rgba(255,255,255,.55)':'#94a3b8', marginTop:8 }}>{a.author_name}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 10 — BRUTALIST (bold, raw, high contrast)
// ═══════════════════════════════════════════════════════════════════════════
function Brutalist({ site, articles, p, font, slug, variant, selectedCat, setSelectedCat, siteCategories }: any) {
  return (
    <div style={{ minHeight:'100vh', background: variant===2?'#ffff00':variant===3?'#ff3c00':'#fff', fontFamily:gf('condensed'), color: variant===2||variant===3?'#000':'#000' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .br-item{border-bottom:3px solid #000;padding:14px 0;display:grid;grid-template-columns:80px 1fr;gap:16px}
      .br-item:hover{background:${variant===2?'#000':variant===3?'#000':'#f5f5f5'};color:${variant===2||variant===3?'#fff':'#000'}}
      @media(max-width:768px){.br-item{grid-template-columns:1fr!important}}`}</style>
      <div style={{ background:'#000', borderBottom:'5px solid #000', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:28, color: variant===2?'#ffff00':variant===3?'#ff3c00':'#fff', letterSpacing:'.05em', textTransform:'uppercase' }}>{site.name}</div></a>
        <div style={{ border:`2px solid ${variant===2?'#ffff00':variant===3?'#ff3c00':'#fff'}`, color:variant===2?'#ffff00':variant===3?'#ff3c00':'#fff', fontSize:11, fontWeight:800, padding:'4px 10px', textTransform:'uppercase' }}>{site.category}</div>
      </div>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px 32px' }}>
        {articles[0] && (
          <div style={{ borderBottom:'5px solid #000', padding:'24px 0', marginBottom:0 }}>
            <div style={{ fontSize:9, fontWeight:800, color:'#000', textTransform:'uppercase', letterSpacing:'.15em', marginBottom:8, background: variant===2?'#ffff00':variant===3?'#ff3c00':p, display:'inline-block', padding:'2px 8px' }}>{articles[0].category}</div>
            <a href={`/article/${slug}/${articles[0].slug}`}><h1 style={{ fontSize:48, fontWeight:900, lineHeight:1, textTransform:'uppercase', letterSpacing:'-.5px', marginBottom:12 }}>{articles[0].title}</h1></a>
            <p style={{ fontSize:16, lineHeight:1.6, maxWidth:700 }}>{articles[0].excerpt}</p>
          </div>
        )}
        {articles.slice(1,16).map((a:any,i:number) => (
          <div key={a.id} className="br-item">
            <div style={{ fontWeight:900, fontSize:32, lineHeight:1, paddingTop:4, color: variant===2?'#000':variant===3?'#000':p }}>#{String(i+1).padStart(2,'0')}</div>
            <div>
              <div style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'.15em', marginBottom:4 }}>[{a.category}]</div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:i<3?18:14, fontWeight:700, lineHeight:1.3, textTransform:'uppercase' }}>{a.title}</div></a>
              {i<2&&<div style={{ fontSize:12, lineHeight:1.5, marginTop:4, opacity:.8 }}>{a.excerpt?.slice(0,100)}…</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 11 — DARK EDITORIAL (financial paper, dark premium — 3 distinct variants)
// ═══════════════════════════════════════════════════════════════════════════
function DarkEditorial({ site, articles, p, font, slug, variant, selectedCat, setSelectedCat, siteCategories }: any) {
  const cats = ['Analysis','Markets','Opinion','Global']
  const featured = articles[0]
  const rest = articles.slice(1)

  // VARIANT 1 — Investment terminal: dark + teal sidebar + monospace feel
  if (variant === 1 || variant === '1') {
    return (
      <div style={{ minHeight:'100vh', background:'#060a0a', fontFamily:"'Courier New',monospace", color:'#a8c4b8' }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
        .v1-grid{display:grid;grid-template-columns:2fr 340px;gap:1px;background:#0f2520}
        .v1-main{background:#060a0a;padding:32px}
        .v1-side{background:#070d0c;padding:24px;border-left:1px solid #0f2520}
        .v1-card{padding:20px 0;border-bottom:1px solid #0f2520}
        .v1-card:hover .v1-title{color:${p}!important}
        .v1-tag{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${p};font-weight:700}
        @media(max-width:768px){.v1-grid{grid-template-columns:1fr}}`}</style>
        {/* Header */}
        <div style={{ background:'#000', borderBottom:`2px solid ${p}`, padding:'0 32px' }}>
          <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', height:52 }}>
            <a href="/"><span style={{ color:p, fontWeight:900, fontSize:20, letterSpacing:'.1em' }}>{site.name?.toUpperCase()}</span></a>
            <div style={{ display:'flex', gap:28 }}>
              {cats.map(cat=><a key={cat} href={`/?category=${cat}`} style={{ color:'#4a7a6a', fontSize:11, letterSpacing:'.1em', fontWeight:700 }}>{cat.toUpperCase()}</a>)}
            </div>
          </div>
        </div>
        {/* Featured */}
        {featured && (
          <div style={{ maxWidth:1400, margin:'0 auto', padding:'32px 32px 0' }}>
            <a href={`/article/${slug}/${featured.slug}`}>
              <div style={{ borderLeft:`3px solid ${p}`, paddingLeft:20, marginBottom:32 }}>
                <div className="v1-tag" style={{ marginBottom:10 }}>{featured.category || 'Markets'} — {new Date(featured.published_at).toLocaleDateString()}</div>
                <div style={{ fontSize:28, fontWeight:900, color:'#d4e8e0', lineHeight:1.2, letterSpacing:'-.02em', marginBottom:12, fontFamily:"'Courier New',monospace" }}>{featured.title}</div>
                <div style={{ fontSize:13, color:'#4a7a6a', lineHeight:1.6 }}>{featured.excerpt}</div>
              </div>
            </a>
          </div>
        )}
        {/* Main grid */}
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 32px 32px' }}>
          <div className="v1-grid">
            <div className="v1-main">
              {rest.slice(0,8).map((a:any) => (
                <a key={a.id} href={`/article/${slug}/${a.slug}`} className="v1-card" style={{ display:'block' }}>
                  <div className="v1-tag" style={{ marginBottom:6 }}>{a.category} — {new Date(a.published_at).toLocaleDateString()}</div>
                  <div className="v1-title" style={{ fontSize:17, fontWeight:700, color:'#c0d8ce', lineHeight:1.3, transition:'color .15s' }}>{a.title}</div>
                  <div style={{ fontSize:12, color:'#3a5a4a', marginTop:6, lineHeight:1.5 }}>{a.excerpt?.slice(0,120)}...</div>
                </a>
              ))}
            </div>
            <div className="v1-side">
              <div style={{ fontSize:10, letterSpacing:'.15em', color:p, marginBottom:16, fontWeight:900 }}>LATEST INTELLIGENCE</div>
              {rest.slice(8,18).map((a:any) => (
                <a key={a.id} href={`/article/${slug}/${a.slug}`} style={{ display:'block', padding:'12px 0', borderBottom:'1px solid #0f2520' }}>
                  <div style={{ fontSize:9, color:'#2a5040', letterSpacing:'.1em', marginBottom:4 }}>{a.category?.toUpperCase()}</div>
                  <div style={{ fontSize:13, color:'#8ab0a0', lineHeight:1.3, fontWeight:600 }}>{a.title}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', padding:24, fontSize:11, color:'#1a3a2a', borderTop:'1px solid #0f2520' }}>© {new Date().getFullYear()} {site.name}</div>
      </div>
    )
  }

  // VARIANT 2 — Equal grid
  if (variant === 2 || variant === '2') {
    return (
      <div style={{ minHeight:'100vh', background:'#0d0d0d', fontFamily:"'Inter',sans-serif", color:'#e8e0d0' }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
        .de2-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:#222}
        .de2-c{background:#111;padding:24px}
        @media(max-width:768px){.de2-grid{grid-template-columns:1fr!important}}`}</style>
        <div style={{ background:'#000', borderBottom:`3px solid ${p}`, padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <a href="/"><div style={{ fontWeight:900, fontSize:22, color:'#e8e0d0' }}>{site.name}</div></a>
          <div style={{ display:'flex', gap:20 }}>
            {cats.map(cat=><a key={cat} href={`/?category=${cat}`} style={{ color:'#666', fontSize:12 }}>{cat}</a>)}
          </div>
        </div>
        {featured && (
          <a href={`/article/${slug}/${featured.slug}`} style={{ display:'block', padding:'40px 32px', background:'#111', borderBottom:`1px solid ${p}22` }}>
            <div style={{ fontSize:11, color:p, letterSpacing:'.1em', marginBottom:8 }}>{featured.category?.toUpperCase()}</div>
            <div style={{ fontSize:32, fontWeight:900, color:'#fff', lineHeight:1.2, maxWidth:800, marginBottom:12 }}>{featured.title}</div>
            <div style={{ fontSize:14, color:'#888' }}>{featured.excerpt?.slice(0,160)}...</div>
          </a>
        )}
        <div className="de2-grid" style={{ maxWidth:'100%' }}>
          {rest.slice(0,10).map((a:any) => (
            <a key={a.id} href={`/article/${slug}/${a.slug}`} className="de2-c" style={{ display:'block' }}>
              <div style={{ fontSize:10, color:p, letterSpacing:'.1em', marginBottom:8 }}>{a.category?.toUpperCase()}</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#e8e0d0', lineHeight:1.3, marginBottom:8 }}>{a.title}</div>
              <div style={{ fontSize:13, color:'#666' }}>{a.excerpt?.slice(0,100)}...</div>
            </a>
          ))}
        </div>
        <div style={{ textAlign:'center', padding:24, fontSize:11, color:'#444' }}>© {new Date().getFullYear()} {site.name}</div>
      </div>
    )
  }

  // VARIANT 3 — Signals/Analysis: dark + red, bold signal-style layout
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', fontFamily:"'Inter',sans-serif", color:'#f0f0f0' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .v3-row{display:grid;grid-template-columns:1fr 300px;gap:0;min-height:100vh}
      .v3-main{padding:0;border-right:1px solid #1a1a1a}
      .v3-side{background:#080808;padding:24px}
      .v3-art{padding:20px 28px;border-bottom:1px solid #111;transition:background .15s}
      .v3-art:hover{background:#111}
      .v3-tag{display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid ${p};color:${p};margin-bottom:8px}
      .v3-side-a{display:block;padding:12px 0;border-bottom:1px solid #111}
      @media(max-width:768px){.v3-row{grid-template-columns:1fr}}`}</style>
      {/* Header */}
      <div style={{ background:'#000', borderBottom:`3px solid ${p}`, padding:'14px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10 }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:22, color:'#fff', letterSpacing:'-.5px' }}>{site.name}</div></a>
        <div style={{ display:'flex', gap:24 }}>
          {cats.map(cat=><a key={cat} href={`/?category=${cat}`} style={{ color:'#999', fontSize:13, fontWeight:500 }}>{cat}</a>)}
        </div>
      </div>
      {/* Featured banner */}
      {featured && (
        <a href={`/article/${slug}/${featured.slug}`} style={{ display:'block', background:'linear-gradient(135deg,#111 0%,#1a0505 100%)', padding:'40px 28px', borderBottom:`1px solid ${p}33` }}>
          <span className="v3-tag">{featured.category || 'Analysis'}</span>
          <div style={{ fontSize:30, fontWeight:900, color:'#fff', lineHeight:1.2, maxWidth:720, marginBottom:12 }}>{featured.title}</div>
          <div style={{ fontSize:14, color:'#888', maxWidth:600, lineHeight:1.6 }}>{featured.excerpt?.slice(0,180)}...</div>
          <div style={{ fontSize:11, color:'#555', marginTop:12 }}>By Signal Desk · {new Date(featured.published_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</div>
        </a>
      )}
      {/* Main + Sidebar */}
      <div className="v3-row">
        <div className="v3-main">
          {rest.slice(0,12).map((a:any) => (
            <a key={a.id} href={`/article/${slug}/${a.slug}`} className="v3-art" style={{ display:'block' }}>
              <span className="v3-tag">{a.category}</span>
              <div style={{ fontSize:18, fontWeight:700, color:'#f0f0f0', lineHeight:1.3, marginBottom:8 }}>{a.title}</div>
              <div style={{ fontSize:13, color:'#666', lineHeight:1.5 }}>{a.excerpt?.slice(0,120)}...</div>
              <div style={{ fontSize:11, color:'#444', marginTop:8 }}>By Signal Desk · {new Date(a.published_at).toLocaleDateString()}</div>
            </a>
          ))}
        </div>
        <div className="v3-side">
          <div style={{ fontSize:10, letterSpacing:'.15em', color:p, marginBottom:16, fontWeight:900 }}>LATEST</div>
          {rest.slice(0,10).map((a:any) => (
            <a key={a.id} href={`/article/${slug}/${a.slug}`} className="v3-side-a">
              <div style={{ fontSize:9, color:p, letterSpacing:'.1em', marginBottom:3 }}>{a.category?.toUpperCase()}</div>
              <div style={{ fontSize:12, color:'#ccc', lineHeight:1.35, fontWeight:600 }}>{a.title}</div>
            </a>
          ))}
        </div>
      </div>
      <div style={{ textAlign:'center', padding:20, fontSize:11, color:'#333', borderTop:'1px solid #111' }}>© {new Date().getFullYear()} {site.name}</div>
    </div>
  )
}


// ARCHETYPE 12 — SPLIT (two-column feed, Bloomberg split)
// ═══════════════════════════════════════════════════════════════════════════
function Split({ site, articles, p, font, slug, variant, selectedCat, setSelectedCat, siteCategories }: any) {
  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:font, color:'#111' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .sp-main{display:grid;grid-template-columns:${variant===3?'1fr 1fr 1fr':'1fr 1fr'};height:100vh;overflow:hidden}
      .sp-col{overflow-y:auto;border-right:1px solid #e5e7eb}
      .sp-item{padding:16px;border-bottom:1px solid #f3f4f6;transition:background .15s}
      .sp-item:hover{background:#fafafa}
      @media(max-width:768px){.sp-main{grid-template-columns:1fr!important;height:auto!important;overflow:visible!important}.sp-col{overflow-y:visible!important}}`}</style>
      <div style={{ background:p, padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100 }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:16, color:'#fff', letterSpacing:'.02em' }}>{site.name}</div></a>
        <div style={{ display:'flex', gap:2 }}>
          {['Markets','Tech','FX','Macro'].map(c=><a key={c} onClick={()=>setSelectedCat(c==='All'?'All':c)} href='#' style={{ color:'rgba(255,255,255,.7)', fontSize:11, fontWeight:600, padding:'3px 8px' }}>{c}</a>)}
        </div>
      </div>
      <div className="sp-main">
        <div className="sp-col">
          <div style={{ padding:'12px 16px', borderBottom:`2px solid ${p}`, fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', color:p }}>Top Stories</div>
          {articles.slice(0,10).map((a:any,i:number) => (
            <div key={a.id} className="sp-item">
              <div style={{ fontSize:8, color:p, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>{a.category}</div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:i<2?15:13, fontWeight:700, lineHeight:1.4, marginBottom:i<2?6:0 }}>{a.title}</div></a>
              {i<2&&<div style={{ fontSize:12, color:'#6b7280', lineHeight:1.5, marginTop:4 }}>{a.excerpt?.slice(0,100)}…</div>}
              <div style={{ fontSize:10, color:'#9ca3af', marginTop:4 }}>{a.author_name} · {new Date(a.published_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
          ))}
        </div>
        <div className="sp-col">
          <div style={{ padding:'12px 16px', borderBottom:`2px solid #e5e7eb`, fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', color:'#6b7280' }}>Latest</div>
          {articles.slice(10,20).map((a:any) => (
            <div key={a.id} className="sp-item">
              <div style={{ fontSize:8, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>{a.category}</div>
              <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:600, lineHeight:1.4 }}>{a.title}</div></a>
              <div style={{ fontSize:10, color:'#9ca3af', marginTop:4 }}>{new Date(a.published_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
          ))}
        </div>
        {variant===3&&(
          <div className="sp-col">
            <div style={{ padding:'12px 16px', borderBottom:`2px solid #e5e7eb`, fontWeight:800, fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', color:'#6b7280' }}>Trending</div>
            {articles.slice(0,8).map((a:any,i:number) => (
              <div key={a.id} className="sp-item">
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <div style={{ fontSize:22, fontWeight:900, color:`${p}40`, lineHeight:1, minWidth:28 }}>{i+1}</div>
                  <div>
                    <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:13, fontWeight:700, lineHeight:1.4 }}>{a.title}</div></a>
                    <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>{a.author_name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE 13 — FEED (Reddit/HN community style)
// ═══════════════════════════════════════════════════════════════════════════
function Feed({ site, articles, p, font, slug, variant, selectedCat, setSelectedCat, siteCategories }: any) {
  return (
    <div style={{ minHeight:'100vh', background:variant===2?'#dae0e6':variant===3?'#f6f0e4':'#dae0e6', fontFamily:font }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}
      .fd-card{background:#fff;border-radius:4px;padding:12px 16px;marginBottom:8px;display:flex;gap:12px;align-items:flex-start;transition:border-color .15s;border:1px solid #ccc}
      .fd-card:hover{border-color:${p}}
      @media(max-width:768px){.fd-side{display:none!important}}`}</style>
      <div style={{ background:p, padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <a href="/"><div style={{ fontWeight:900, fontSize:18, color:'#fff' }}>{site.name}</div></a>
        <div style={{ display:'flex', gap:12 }}>{['Hot','New','Top','Rising'].map(c=><a key={c} href={`/?sort=${c}`} style={{ color:'rgba(255,255,255,.8)', fontSize:12, fontWeight:700 }}>{c}</a>)}</div>
      </div>
      <div style={{ maxWidth:1100, margin:'16px auto', padding:'0 24px', display:'flex', gap:24 }}>
        <div style={{ flex:1 }}>
          {articles.slice(0,20).map((a:any,i:number) => (
            <div key={a.id} className="fd-card" style={{ marginBottom:8 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, minWidth:32, color:'#878a8c', paddingTop:4 }}>
                <div style={{ fontSize:16 }}>▲</div>
                <div style={{ fontSize:11, fontWeight:700, color:p }}>{Math.floor(Math.random()*1000)+50}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:p, padding:'1px 6px', borderRadius:2, textTransform:'uppercase' }}>{a.category}</span>
                  <span style={{ fontSize:11, color:'#878a8c' }}>Posted by {a.author_name}</span>
                </div>
                <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:i<3?17:14, fontWeight:700, lineHeight:1.4, color:'#222', marginBottom:4 }}>{a.title}</div></a>
                {i<3&&<div style={{ fontSize:12, color:'#555', lineHeight:1.5 }}>{a.excerpt?.slice(0,120)}…</div>}
                <div style={{ fontSize:11, color:'#878a8c', marginTop:6 }}>💬 {Math.floor(Math.random()*50)+5} comments · {new Date(a.published_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="fd-side" style={{ width:280, flexShrink:0 }}>
          <div style={{ background:'#fff', border:'1px solid #ccc', borderRadius:4, padding:16, marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:8, color:p }}>About {site.name}</div>
            <div style={{ fontSize:13, color:'#555', lineHeight:1.6 }}>{site.description||site.tagline}</div>
          </div>
          <div style={{ background:'#fff', border:'1px solid #ccc', borderRadius:4, padding:16 }}>
            <div style={{ fontWeight:700, fontSize:12, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10, borderBottom:`2px solid ${p}`, paddingBottom:6 }}>Trending</div>
            {articles.slice(0,5).map((a:any,i:number) => (
              <div key={a.id} style={{ display:'flex', gap:8, marginBottom:10 }}>
                <span style={{ fontWeight:900, fontSize:20, color:`${p}50`, lineHeight:1 }}>{i+1}</span>
                <a href={`/article/${slug}/${a.slug}`}><div style={{ fontSize:12, fontWeight:600, lineHeight:1.4 }}>{a.title}</div></a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
