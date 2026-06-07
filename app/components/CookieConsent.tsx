'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem('rephuby-cookie-consent')
      if (!consent) setVisible(true)
    } catch {}
  }, [])

  function accept(all: boolean) {
    try {
      localStorage.setItem('rephuby-cookie-consent', all ? 'all' : 'essential')
      localStorage.setItem('rephuby-cookie-date', new Date().toISOString())
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: '#0f172a', color: '#e2e8f0', padding: '18px 24px',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
        borderTop: '2px solid #3b82f6',
        fontFamily: 'sans-serif', fontSize: 13,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {!showDetail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280, lineHeight: 1.6 }}>
                <strong style={{ color: '#fff' }}>🍪 We use cookies</strong> to enhance your browsing experience, serve personalised content, and analyse our traffic.
                By clicking <strong>"Accept All"</strong>, you consent to our use of cookies.
                <button onClick={() => setShowDetail(true)} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', padding: '0 4px', textDecoration: 'underline', fontSize: 13, fontFamily: 'sans-serif' }}>
                  Manage preferences
                </button>
                <Link href="/legal/cookies"><span style={{ color: '#93c5fd', marginLeft: 4 }}>Cookie Policy</span></Link>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => accept(false)} style={{ padding: '9px 18px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 5, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
                  Essential Only
                </button>
                <button onClick={() => accept(true)} style={{ padding: '9px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 800, fontSize: 13, fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
                  Accept All Cookies
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <strong style={{ color: '#fff', fontSize: 15 }}>Cookie Preferences</strong>
                <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { title: 'Essential Cookies', desc: 'Required for the website to function. Cannot be disabled.', required: true },
                  { title: 'Analytics Cookies', desc: 'Help us understand how visitors use our site. All data is anonymised.', required: false },
                  { title: 'Functional Cookies', desc: 'Remember your preferences and improve your experience.', required: false },
                  { title: 'Third-Party Widgets', desc: 'TradingView charts and market data widgets.', required: false },
                ].map(cat => (
                  <div key={cat.title} style={{ background: '#1e293b', borderRadius: 5, padding: '12px 14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13, marginBottom: 3 }}>{cat.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{cat.desc}</div>
                    </div>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {cat.required
                        ? <span style={{ fontSize: 10, background: '#334155', color: '#94a3b8', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>ALWAYS ON</span>
                        : <div style={{ width: 40, height: 22, background: '#3b82f6', borderRadius: 11, cursor: 'pointer', position: 'relative' }}>
                            <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', right: 3, top: 3 }}></div>
                          </div>
                      }
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => accept(false)} style={{ padding: '9px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 5, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'sans-serif' }}>Save Preferences</button>
                <button onClick={() => accept(true)} style={{ padding: '9px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 800, fontSize: 13, fontFamily: 'sans-serif' }}>Accept All</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
