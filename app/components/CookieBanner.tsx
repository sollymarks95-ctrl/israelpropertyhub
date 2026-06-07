'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner({ primaryColor = '#00B67A' }: { primaryColor?: string }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent')
      if (!consent) setShow(true)
    } catch {}
  }, [])

  function accept(type: 'all' | 'essential') {
    try { localStorage.setItem('cookie_consent', type) } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:9999, background:'#191919', color:'#fff', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, borderTop:`3px solid ${primaryColor}`, boxShadow:'0 -4px 24px rgba(0,0,0,0.3)' }}>
      <div style={{ flex:1, minWidth:260 }}>
        <span style={{ fontSize:13, color:'#CBD5E1' }}>
          🍪 We use cookies to enhance your experience and analyse site usage.{' '}
          <a href="/legal/cookies" style={{ color:primaryColor, fontWeight:600 }}>Cookie Policy</a>
          {' · '}
          <a href="/legal/privacy" style={{ color:primaryColor, fontWeight:600 }}>Privacy Policy</a>
        </span>
      </div>
      <div style={{ display:'flex', gap:10, flexShrink:0 }}>
        <button onClick={() => accept('essential')}
          style={{ padding:'9px 18px', background:'transparent', border:'1px solid #475569', borderRadius:8, color:'#94A3B8', cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:600 }}>
          Essential Only
        </button>
        <button onClick={() => accept('all')}
          style={{ padding:'9px 20px', background:primaryColor, border:'none', borderRadius:8, color:'#fff', cursor:'pointer', fontSize:13, fontFamily:'inherit', fontWeight:700 }}>
          Accept All Cookies
        </button>
      </div>
    </div>
  )
}
