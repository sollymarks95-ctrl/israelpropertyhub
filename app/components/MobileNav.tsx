'use client'
import React from 'react'
import { useState } from 'react'

interface MobileNavProps {
  siteName: string
  domain: string
  accentColor: string
  sections: string[]
  activeSection: string
  onSectionChange: (s: string) => void
  podcastHref?: string
  logoStyle?: 'serif' | 'mono' | 'sans'
  darkMode?: boolean
}

export default function MobileNav({
  siteName, domain, accentColor, sections, activeSection, onSectionChange, podcastHref = '/podcasts', logoStyle = 'serif', darkMode = false
}: MobileNavProps) {
  const navBg    = darkMode ? '#0d1117' : '#fff'
  const navBorder = darkMode ? '#21262d' : '#f0f0f0'
  const textColor = darkMode ? '#f0f6fc' : '#111'
  const subText   = darkMode ? '#8b949e' : '#94a3b8'
  const drawerBg  = darkMode ? '#161b22' : '#fff'
  const itemColor = darkMode ? '#c9d1d9' : '#374151'
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // All portals use Georgia serif for brand consistency
  const fontFam = "'Georgia','Times New Roman',serif"

  return (
    <>
      {/* Fixed nav bar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, background:navBg, borderBottom:`3px solid ${accentColor}`, boxShadow:darkMode?'0 1px 8px rgba(0,0,0,0.3)':'0 1px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px' }}>

          {/* Hamburger */}
          <button onClick={() => setOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', padding:'4px 6px', display:'flex', flexDirection:'column', gap:4 }} aria-label="Menu">
            <span style={{ display:'block', width:22, height:2, background:textColor, borderRadius:2 }}/>
            <span style={{ display:'block', width:16, height:2, background:textColor, borderRadius:2 }}/>
            <span style={{ display:'block', width:22, height:2, background:textColor, borderRadius:2 }}/>
          </button>

          {/* Logo center */}
          <a href="/" style={{ textDecoration:'none', position:'absolute', left:'50%', transform:'translateX(-50%)' }}>
            <div style={{ fontFamily:fontFam, fontSize:20, fontWeight:900, letterSpacing:'-0.03em', color:textColor, textAlign:'center' }}>
              {siteName.includes('-')
                ? <>{siteName.split('-')[0]}<span style={{ color:accentColor }}>-</span>{siteName.split('-').slice(1).join('-')}</>
                : <>{siteName.slice(0,-2)}<span style={{ color:accentColor }}>{siteName.slice(-2)}</span></>}
            </div>
          </a>

          {/* Right: podcast + live */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <a href={podcastHref} style={{ fontSize:16, textDecoration:'none' }} title="Podcast">🎙</a>
            <span style={{ background:accentColor, color:'#fff', fontSize:8, fontWeight:900, padding:'3px 7px', borderRadius:3, letterSpacing:'.08em' }}>LIVE</span>
          </div>
        </div>

        {/* Section pills */}
        <div style={{ display:'flex', overflowX:'auto', scrollbarWidth:'none', borderTop:`1px solid ${navBorder}`, WebkitOverflowScrolling:'touch', background:navBg }}>
          {sections.map(s => (
            <button key={s} onClick={() => onSectionChange(s)}
              style={{ padding:'8px 14px', border:'none', background:'none', fontFamily:"'Inter',system-ui,sans-serif", fontSize:11, fontWeight:700, letterSpacing:'.04em', textTransform:'uppercase', cursor:'pointer', whiteSpace:'nowrap', color:activeSection===s?accentColor:subText, borderBottom:`2px solid ${activeSection===s?accentColor:'transparent'}`, flexShrink:0, transition:'color .15s' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Full-screen drawer overlay */}
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:999, background:'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ position:'absolute', top:0, left:0, bottom:0, width:'82%', maxWidth:320, background:drawerBg, boxShadow:'4px 0 24px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column', overflowY:'auto' }}>

            {/* Drawer header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', borderBottom:`3px solid ${accentColor}` }}>
              <div style={{ fontFamily:fontFam, fontSize:16, fontWeight:900, color:textColor }}>{siteName}</div>
              <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#666', lineHeight:1 }}>✕</button>
            </div>

            {/* Search */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #f0f0f0' }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search stories..."
                style={{ width:'100%', padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, fontFamily:"'Inter',system-ui,sans-serif", outline:'none', background:'#f8fafc' }}/>
            </div>

            {/* Nav sections */}
            <div style={{ padding:'8px 0' }}>
              <div style={{ padding:'8px 16px', fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'#94a3b8', textTransform:'uppercase' }}>Sections</div>
              {sections.map(s => (
                <button key={s} onClick={() => { onSectionChange(s); setOpen(false) }}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'13px 16px', border:'none', background:activeSection===s?`${accentColor}10`:'none', cursor:'pointer', textAlign:'left', borderLeft:activeSection===s?`3px solid ${accentColor}`:'3px solid transparent' }}>
                  <span style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, fontWeight:600, color:activeSection===s?accentColor:itemColor }}>{s}</span>
                </button>
              ))}
            </div>

            <div style={{ borderTop:'1px solid #f0f0f0', padding:'8px 0' }}>
              <div style={{ padding:'8px 16px', fontSize:10, fontWeight:800, letterSpacing:'.1em', color:'#94a3b8', textTransform:'uppercase' }}>More</div>
              {[['🎙 Podcast', podcastHref], ['📋 About', '/legal/about'], ['🔒 Privacy', '/legal/privacy'], ['📄 Terms', '/legal/terms']].map(([label, href]) => (
                <a key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', textDecoration:'none', borderLeft:'3px solid transparent' }}>
                  <span style={{ fontFamily:"'Inter',system-ui,sans-serif", fontSize:14, color:'#374151' }}>{label}</span>
                </a>
              ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop:'auto', padding:'16px', background:'#f8fafc', borderTop:'1px solid #e2e8f0' }}>
              <div style={{ fontSize:11, color:'#94a3b8', lineHeight:1.5 }}>{domain} · Content for informational purposes only.</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
