'use client'
import { useState } from 'react'
import Link from 'next/link'

// Admin credentials — hardcoded, simple, reliable
const ADMINS = ['sollymarks95@gmail.com']
const ADMIN_PASS = 'REDACTED_ADMIN_PASS'

export default function PortalLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPass, setShowPass] = useState(false)
  const router_unused = null // not using router - using window.location directly

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    
    const cleanEmail = email.toLowerCase().trim()
    const cleanPass  = password.trim()
    
    const isAdmin = ADMINS.includes(cleanEmail) && cleanPass === ADMIN_PASS

    // small delay for UX
    await new Promise(r => setTimeout(r, 600))

    if (!cleanEmail || !cleanPass) {
      setError('Enter your email and password.'); setLoading(false); return
    }

    // Store session
    const session = {
      email: cleanEmail,
      role: isAdmin ? 'superadmin' : 'client',
      name: isAdmin ? 'Solly' : cleanEmail.split('@')[0],
      ts: Date.now()
    }
    try {
      // Write to ALL possible keys so every component can read it
      const val = JSON.stringify(session)
      localStorage.setItem('rh_admin', val)
      localStorage.setItem('rephuby_session', val)
      localStorage.setItem('portal_demo', val)
      document.cookie = `rh_role=${isAdmin ? 'superadmin' : 'client'}; path=/; max-age=86400`
    } catch {}

    // Hard navigate — always works
    if (isAdmin) {
      window.location.replace('/portal/admin')
    } else {
      window.location.replace('/portal/dashboard')
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0B0F19', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} a{text-decoration:none;color:inherit} input,button{font-family:inherit}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .inp{width:100%;padding:12px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#F1F5F9;font-size:14px;outline:none;transition:all .2s}
        .inp:focus{border-color:#0EA5E9;box-shadow:0 0 0 3px rgba(14,165,233,0.12)}
      `}</style>

      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 50% 0%,#0EA5E918,transparent)' }} />

      <div style={{ width:'100%', maxWidth:400, padding:'0 20px', position:'relative', animation:'up .4s ease' }}>
        <div style={{ background:'linear-gradient(145deg,#141B2D,#1C2333)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, overflow:'hidden', boxShadow:'0 40px 120px rgba(0,0,0,0.7)' }}>
          <div style={{ height:2, background:'linear-gradient(90deg,#0EA5E9,#10B981)' }} />
          <div style={{ padding:'36px 32px 32px' }}>

            {/* Logo */}
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <Link href="/">
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:900, letterSpacing:'-0.03em' }}>
                  Rep<span style={{ background:'linear-gradient(135deg,#0EA5E9,#10B981)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Huby</span>
                </div>
              </Link>
              <div style={{ fontSize:11, color:'#475569', marginTop:3, letterSpacing:'.07em', textTransform:'uppercase' }}>Intelligence Portal</div>
            </div>

            {error && (
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'9px 14px', fontSize:13, color:'#EF4444', marginBottom:16 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:5 }}>Email</label>
                <input
                  className="inp"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div style={{ marginBottom:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <label style={{ fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:'.06em', textTransform:'uppercase' }}>Password</label>
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ fontSize:11, color:'#0EA5E9', background:'none', border:'none', cursor:'pointer' }}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  className="inp"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width:'100%', padding:'13px', background: loading ? '#1e293b' : 'linear-gradient(135deg,#0EA5E9,#818CF8)', border:'none', borderRadius:8, color:'#fff', fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              >
                {loading
                  ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }} /> Signing in...</>
                  : '→ Sign In'
                }
              </button>
            </form>

            <div style={{ marginTop:20, textAlign:'center', fontSize:13, color:'#475569' }}>
              Not a client?{' '}
              <a href="https://t.me/rephub_intelligence" target="_blank" rel="noopener noreferrer" style={{ color:'#0EA5E9', fontWeight:600 }}>Telegram →</a>
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', marginTop:14, fontSize:12, color:'#334155' }}>
          <Link href="/" style={{ color:'#475569' }}>← rephuby.com</Link>
        </div>
      </div>
    </div>
  )
}
