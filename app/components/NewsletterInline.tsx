'use client'
import { useState, useEffect } from 'react'

// VAPID public key for push notifications
const VAPID_PUBLIC = 'BO0ldzM66XEgnaTVDyYolTS_yMKnYt1jPvaes9HNbgbBAD5qkzkR2gyOkYwtTq_vIo_cjVALcZBD9fqw-iVl3h0'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export default function NewsletterInline({ siteId, siteName, primaryColor, dark, siteSlug }: {
  siteId: string; siteName: string; primaryColor: string; dark?: boolean; siteSlug?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'err'>('idle')
  const [msg, setMsg] = useState('')
  const [pushState, setPushState] = useState<'unknown'|'supported'|'denied'|'granted'>('unknown')
  const p = primaryColor
  const slug = siteSlug || siteId

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    // Register service worker
    navigator.serviceWorker.register('/sw.js').catch(() => {})
    // Check current permission state
    if (Notification.permission === 'granted') setPushState('granted')
    else if (Notification.permission === 'denied') setPushState('denied')
    else setPushState('supported')
  }, [])

  async function getPushSubscription(): Promise<PushSubscription | null> {
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) return existing
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })
      return sub
    } catch { return null }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) { setStatus('err'); setMsg('Enter a valid email address.'); return }
    setStatus('loading')
    
    try {
      // 1. Request push permission & get subscription
      let pushSubscription = null
      if (pushState === 'supported' || pushState === 'unknown') {
        try {
          const permission = await Notification.requestPermission()
          if (permission === 'granted') {
            setPushState('granted')
            pushSubscription = await getPushSubscription()
          } else {
            setPushState(permission as 'denied')
          }
        } catch {}
      } else if (pushState === 'granted') {
        pushSubscription = await getPushSubscription()
      }

      // 2. Send both email + push subscription to API
      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          subscription: pushSubscription ? pushSubscription.toJSON() : null,
          siteSlug: slug,
          siteName,
        })
      })

      // 3. Also send to original newsletter API for backward compat
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, siteId, siteName })
      }).catch(() => {})

      if (res.ok) {
        const hasPush = pushSubscription !== null
        setStatus('ok')
        setMsg(hasPush
          ? `✅ Subscribed! You'll get email + push alerts for new ${siteName} articles.`
          : `✅ You're subscribed to ${siteName} daily briefing!`)
        setEmail('')
      } else {
        setStatus('err')
        setMsg('Something went wrong — please try again.')
      }
    } catch {
      setStatus('err')
      setMsg('Connection error — please try again.')
    }
  }

  const pushBadge = pushState === 'granted'
    ? <span style={{ fontSize:10, background:'#dcfce7', color:'#16a34a', padding:'2px 6px', borderRadius:10, fontWeight:700, marginLeft:6, verticalAlign:'middle' }}>🔔 Push ON</span>
    : pushState === 'supported'
    ? <span style={{ fontSize:10, background:'#fef3c7', color:'#92400e', padding:'2px 6px', borderRadius:10, fontWeight:700, marginLeft:6, verticalAlign:'middle' }}>+Push alerts</span>
    : null

  if (dark) return (
    <form onSubmit={submit}>
      {status === 'ok' ? (
        <div style={{ background:'rgba(255,255,255,0.15)', color:'#fff', padding:'10px 14px', borderRadius:4, fontSize:13, fontWeight:700, textAlign:'center' }}>{msg}</div>
      ) : (
        <>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com"
            style={{ width:'100%', padding:'9px 12px', border:'none', borderRadius:4, fontSize:13, marginBottom:6, fontFamily:'sans-serif', outline:'none', boxSizing:'border-box' }} />
          {status==='err' && <p style={{ color:'#fca5a5', fontSize:11, marginBottom:4 }}>{msg}</p>}
          <button type="submit" disabled={status==='loading'}
            style={{ width:'100%', background:'#111', color:'#fff', border:'none', padding:'9px', fontWeight:800, fontSize:12, borderRadius:4, cursor:'pointer', letterSpacing:'0.05em', fontFamily:'sans-serif' }}>
            {status==='loading' ? 'SUBSCRIBING...' : <>GET FREE ACCESS →{pushBadge}</>}
          </button>
          {pushState === 'supported' && <p style={{ fontSize:10, color:'rgba(255,255,255,0.5)', textAlign:'center', marginTop:4 }}>Also enables push notifications for breaking news</p>}
        </>
      )}
    </form>
  )

  return (
    <div style={{ background:`linear-gradient(135deg,${p}12,${p}06)`, border:`1px solid ${p}25`, borderRadius:6, padding:'22px 24px', margin:'28px 0', fontFamily:'sans-serif' }}>
      <div style={{ fontWeight:900, fontSize:17, color:'#111', marginBottom:5 }}>
        📧 Get the Daily Briefing from {siteName} {pushBadge}
      </div>
      <p style={{ fontSize:13, color:'#6b7280', marginBottom:14, lineHeight:1.6 }}>
        Our editors curate the most important stories every morning. Join 50,000+ professionals who start their day with {siteName}.
        {pushState === 'supported' && ' Enable push alerts to get breaking news instantly.'}
      </p>
      <form onSubmit={submit} style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {status === 'ok' ? (
          <div style={{ width:'100%', background:'#dcfce7', color:'#16a34a', padding:'10px 14px', borderRadius:4, fontSize:13, fontWeight:700 }}>{msg}</div>
        ) : (
          <>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com"
              style={{ flex:1, minWidth:200, padding:'10px 13px', border:`1px solid ${p}30`, borderRadius:4, fontSize:13, fontFamily:'sans-serif', outline:'none', boxSizing:'border-box' }} />
            <button type="submit" disabled={status==='loading'}
              style={{ background:p, color:'#fff', border:'none', padding:'10px 18px', fontWeight:800, fontSize:13, borderRadius:4, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'sans-serif' }}>
              {status==='loading' ? 'Subscribing...' : 'Subscribe Free →'}
            </button>
            {status==='err' && <p style={{ width:'100%', color:'#dc2626', fontSize:11, margin:0 }}>{msg}</p>}
            <p style={{ width:'100%', fontSize:11, color:'#9ca3af', margin:0 }}>
              No spam. Unsubscribe any time.
              {pushState === 'supported' && ' Browser will request notification permission.'}
            </p>
          </>
        )}
      </form>
    </div>
  )
}
