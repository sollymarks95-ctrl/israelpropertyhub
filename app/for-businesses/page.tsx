'use client'
import { useState } from 'react'

const GREEN = '#00B67A'

const PLANS = [
  { id:'starter', name:'Starter', price:'Free', desc:'For growing businesses', features:['Claim your profile','Verified badge','Reply to reviews','Basic analytics'] },
  { id:'pro', name:'Pro', price:'€299/mo', desc:'For established brands', features:['Everything in Starter','Priority placement','Review alerts (instant)','Competitor tracking','Monthly trust report'] },
  { id:'enterprise', name:'Enterprise', price:'Custom', desc:'For large organizations', features:['Everything in Pro','Dedicated account manager','Custom reporting','API access','Multi-brand management'] },
]

export default function ForBusinessesPage() {
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ company:'', website:'', contact_name:'', email:'', phone:'', message:'' })

  async function submit(e: any) {
    e.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/verivex/business-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan: selectedPlan })
      })
      const d = await res.json()
      if (d.success) setSubmitted(true)
    } catch {}
    setSending(false)
  }

  if (submitted) return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", minHeight:'100vh', background:'#F4F6F8', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:48, maxWidth:500, textAlign:'center' }}>
        <a href="/" style={{ fontWeight:900, fontSize:20, color:'#191919', textDecoration:'none', display:'block', marginBottom:28 }}>VERI<span style={{ color:GREEN }}>VEX</span></a>
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <h1 style={{ fontSize:24, fontWeight:800, color:GREEN, marginBottom:12 }}>Request Received!</h1>
        <p style={{ fontSize:14, color:'#64748B', lineHeight:1.7, marginBottom:24 }}>
          Thank you, <strong>{form.contact_name}</strong>! We'll contact you at <strong>{form.email}</strong> within 24 hours to set up your <strong>{PLANS.find(p=>p.id===selectedPlan)?.name}</strong> account.
        </p>
        <a href="/" style={{ display:'inline-block', background:GREEN, color:'#fff', padding:'12px 24px', borderRadius:8, fontWeight:700, textDecoration:'none' }}>
          Back to Verivex
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", minHeight:'100vh', background:'#F4F6F8', color:'#191919' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}.inp{width:100%;padding:11px 14px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:all .2s;background:#fff}.inp:focus{border-color:${GREEN};box-shadow:0 0 0 3px ${GREEN}18}@media(max-width:768px){.plan-grid{grid-template-columns:1fr!important}.form-grid{grid-template-columns:1fr!important}}`}</style>

      <header style={{ background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <a href="/" style={{ fontWeight:900, fontSize:20, color:'#191919' }}>VERI<span style={{ color:GREEN }}>VEX</span></a>
        <a href="/" style={{ fontSize:13, color:'#64748B' }}>← Back to reviews</a>
      </header>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:700, color:GREEN, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>For Business Owners</div>
          <h1 style={{ fontSize:40, fontWeight:900, lineHeight:1.1, marginBottom:14 }}>Manage Your Brand<br/>Reputation on Verivex</h1>
          <p style={{ fontSize:16, color:'#64748B', maxWidth:520, margin:'0 auto', lineHeight:1.7 }}>Join the trusted platform where traders verify brokers. Claim your profile, respond to reviews, and build trust with tens of thousands of traders.</p>
          {/* Progress */}
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32, alignItems:'center' }}>
            {[1,2].map(s => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:100, background:step>=s?GREEN:'#E2E8F0', color:step>=s?'#fff':'#94A3B8', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, transition:'all .2s' }}>{s}</div>
                <span style={{ fontSize:12, color:step>=s?GREEN:'#94A3B8', fontWeight:600 }}>{s===1?'Choose Plan':'Your Details'}</span>
                {s < 2 && <div style={{ width:40, height:2, background:step>s?GREEN:'#E2E8F0', borderRadius:2 }}/>}
              </div>
            ))}
          </div>
        </div>

        {step === 1 ? (
          <>
            {/* Plan selection */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:32 }} className="plan-grid">
              {PLANS.map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                  style={{ background:'#fff', border:`2px solid ${selectedPlan===plan.id?GREEN:'#E2E8F0'}`, borderRadius:14, padding:28, cursor:'pointer', transition:'all .2s', position:'relative', boxShadow:selectedPlan===plan.id?`0 0 0 4px ${GREEN}18`:'none' }}>
                  {plan.id==='pro' && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:GREEN, color:'#fff', fontSize:10, fontWeight:800, padding:'3px 12px', borderRadius:100, letterSpacing:'.06em', textTransform:'uppercase' }}>Most Popular</div>}
                  <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>{plan.name}</div>
                  <div style={{ fontSize:24, fontWeight:900, color:GREEN, marginBottom:4 }}>{plan.price}</div>
                  <div style={{ fontSize:12, color:'#94A3B8', marginBottom:20 }}>{plan.desc}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#475569' }}>
                        <span style={{ color:GREEN, fontWeight:700 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                  {selectedPlan===plan.id && <div style={{ marginTop:16, fontSize:12, fontWeight:700, color:GREEN, textAlign:'center' }}>✓ Selected</div>}
                </div>
              ))}
            </div>
            <div style={{ textAlign:'center' }}>
              <button onClick={() => setStep(2)} style={{ background:GREEN, color:'#fff', border:'none', borderRadius:10, padding:'14px 40px', fontWeight:700, fontSize:16, cursor:'pointer', fontFamily:'inherit' }}>
                Continue with {PLANS.find(p=>p.id===selectedPlan)?.name} →
              </button>
            </div>
          </>
        ) : (
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:36 }}>
              <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Your Details</h2>
              <p style={{ fontSize:13, color:'#94A3B8', marginBottom:24 }}>
                Plan: <span style={{ color:GREEN, fontWeight:700 }}>{PLANS.find(p=>p.id===selectedPlan)?.name} – {PLANS.find(p=>p.id===selectedPlan)?.price}</span>
                <span onClick={()=>setStep(1)} style={{ marginLeft:12, color:'#94A3B8', cursor:'pointer', textDecoration:'underline', fontSize:12 }}>Change</span>
              </p>
              <form onSubmit={submit}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="form-grid">
                  <div><label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6 }}>Company Name *</label><input className="inp" placeholder="e.g. eToro" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} required/></div>
                  <div><label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6 }}>Company Website *</label><input className="inp" type="url" placeholder="https://yourcompany.com" value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} required/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="form-grid">
                  <div><label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6 }}>Your Name *</label><input className="inp" placeholder="Full name" value={form.contact_name} onChange={e=>setForm(f=>({...f,contact_name:e.target.value}))} required/></div>
                  <div><label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6 }}>Work Email *</label><input className="inp" type="email" placeholder="you@company.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/></div>
                </div>
                <div style={{ marginBottom:14 }}><label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6 }}>Phone (optional)</label><input className="inp" placeholder="+44 7911 123456" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
                <div style={{ marginBottom:24 }}><label style={{ display:'block', fontSize:12, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6 }}>Message (optional)</label><textarea className="inp" rows={3} placeholder="Tell us about your business..." value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} style={{ resize:'vertical' }}/></div>
                <div style={{ display:'flex', gap:12 }}>
                  <button type="button" onClick={()=>setStep(1)} style={{ flex:0, padding:'13px 20px', background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:8, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:'#475569' }}>← Back</button>
                  <button type="submit" disabled={sending} style={{ flex:1, padding:'13px', background:GREEN, color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:15, cursor:sending?'not-allowed':'pointer', opacity:sending?.7:1, fontFamily:'inherit' }}>
                    {sending ? 'Submitting...' : `Submit ${PLANS.find(p=>p.id===selectedPlan)?.name} Request →`}
                  </button>
                </div>
                <p style={{ fontSize:11, color:'#CBD5E1', textAlign:'center', marginTop:12 }}>We'll contact you within 24 hours to verify and activate your account.</p>
              </form>
            </div>
          </div>
        )}

        {/* Trust indicators */}
        <div style={{ display:'flex', justifyContent:'center', gap:48, marginTop:48, flexWrap:'wrap' }}>
          {[['🔒','Enterprise Security','SSL encrypted, GDPR compliant'],['⚡','24h Setup','Account activated within 24 hours'],['📊','10K+ Monthly Views','Real traders reading your profile'],['✅','Verified Badge','Trust signal for your brand']].map(([icon,title,desc])=>(
            <div key={title as string} style={{ textAlign:'center', maxWidth:160 }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{icon as string}</div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{title as string}</div>
              <div style={{ fontSize:12, color:'#94A3B8' }}>{desc as string}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
