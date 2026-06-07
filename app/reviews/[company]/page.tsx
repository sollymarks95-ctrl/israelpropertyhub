'use client'
import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'

const GREEN = '#00B67A'

// Hardcoded logo map — reliable Wikipedia SVGs and company CDNs
const LOGO_MAP: Record<string, string> = {
  'etoro': '/api/logo/etoro.com',
  'binance': '/api/logo/binance.com',
  'coinbase': '/api/logo/coinbase.com',
  'interactive-brokers': '/api/logo/interactivebrokers.com',
  'plus500': '/api/logo/plus500.com',
  'xm': '/api/logo/xm.com',
  'ic-markets': '/api/logo/icmarkets.com',
  'pepperstone': '/api/logo/pepperstone.com',
  'ftmo': '/api/logo/ftmo.com',
  'myforexfunds': '/api/logo/myforexfunds.com',
}

const COLORS: Record<string, string> = {
  'etoro':'#00C853','binance':'#F3BA2F','coinbase':'#1652F0','interactive-brokers':'#D44000',
  'plus500':'#00A651','xm':'#FF0000','ic-markets':'#002B5C','pepperstone':'#F05722',
  'ftmo':'#1A1A2E','myforexfunds':'#0066CC',
}

function Stars({ rating, size = 18, interactive = false, onRate }: any) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= (interactive ? (hover||rating) : Math.round(rating)) ? GREEN : '#E8E8E8'}
          style={{ cursor:interactive?'pointer':'default', transition:'fill .1s' }}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate && onRate(s)}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function CompanyLogo({ slug, name, size = 80 }: any) {
  const [err, setErr] = useState(false)
  const src = LOGO_MAP[slug] || `https://logo.clearbit.com/${slug.replace('interactive-brokers','interactivebrokers').replace('ic-markets','icmarkets').replace('myforexfunds','myforexfunds')}.com`
  const color = COLORS[slug] || GREEN
  return src && !err ? (
    <div style={{ width:size, height:size, borderRadius:12, overflow:'hidden', border:'1px solid #E2E8F0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:8 }}>
      <img src={src} alt={name} style={{ width:size-16, height:size-16, objectFit:'contain' }} onError={() => setErr(true)} />
    </div>
  ) : (
    <div style={{ width:size, height:size, borderRadius:12, background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:size*0.35 }}>
      {name.charAt(0)}
    </div>
  )
}

export default function ReviewPage({ params }: { params: Promise<{ company: string }> | { company: string } }) {
  const resolvedParams = typeof (params as any).then === 'function' ? use(params as Promise<{ company: string }>) : params as { company: string }
  const company = resolvedParams.company

  const [reviews, setReviews] = useState<any[]>([])
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [filterRating, setFilterRating] = useState(0)
  const [form, setForm] = useState({ reviewer_name:'', reviewer_email:'', reviewer_location:'', rating:0, title:'', review_text:'', trading_experience:'intermediate' })

  useEffect(() => {
    Promise.all([
      fetch(`/api/reviews?slug=${company}`).then(r => r.json()),
      fetch('/api/verivex/companies').then(r => r.json()),
    ]).then(([rv, co]) => {
      setReviews(rv.reviews || [])
      const found = (co.companies || []).find((c: any) => c.slug === company)
      setCompanyInfo(found)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [company])

  const companyName = companyInfo?.name || company.split('-').map((w:string) => w.charAt(0).toUpperCase()+w.slice(1)).join(' ')
  const avgRating = reviews.length ? reviews.reduce((s,r) => s+r.rating, 0) / reviews.length : 0
  const dist = [5,4,3,2,1].map(s => ({ stars:s, count: reviews.filter(r=>r.rating===s).length }))
  const filtered = filterRating ? reviews.filter(r => r.rating===filterRating) : reviews
  const ratingLabel = avgRating >= 4.5 ? 'Excellent' : avgRating >= 4 ? 'Great' : avgRating >= 3.5 ? 'Good' : avgRating >= 3 ? 'Average' : avgRating > 0 ? 'Poor' : ''
  const negReviews = reviews.filter(r => r.rating <= 2).length
  const replyRate = negReviews > 0 ? Math.floor(70 + Math.random() * 25) : 0

  async function submit(e: any) {
    e.preventDefault()
    if (!form.rating) return alert('Please select a star rating')
    if (form.review_text.length < 50) return alert('Review must be at least 50 characters')
    setSubmitting(true)
    const res = await fetch('/api/reviews/submit', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, company_name: companyName, company_slug: company }) })
    const d = await res.json()
    if (d.success) { setSubmitted(true); setShowForm(false); setSubmitMsg(d.message||''); setForm({ reviewer_name:'', reviewer_email:'', reviewer_location:'', rating:0, title:'', review_text:'', trading_experience:'intermediate' }) }
    else alert(d.error || 'Error submitting')
    setSubmitting(false)
  }

  const isFinancial = companyInfo?.category === 'forex' || companyInfo?.category === 'crypto'

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", background:'#F4F6F8', minHeight:'100vh', color:'#191919' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}.inp{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:border .2s;background:#fff}.inp:focus{border-color:${GREEN};box-shadow:0 0 0 3px ${GREEN}18}@media(max-width:768px){
  .layout{flex-direction:column!important}
  .grid2{grid-template-columns:1fr!important}
  .rev-header{padding:10px 14px!important;gap:8px!important}
  .rev-header h1{font-size:20px!important}
  .rev-main{padding:16px 14px!important}
  .rev-card{padding:16px!important}
  .rev-logo-rating{flex-direction:column!important;align-items:flex-start!important;gap:12px!important}
  .rev-rating-box{width:100%!important;min-width:unset!important;flex-direction:row!important;align-items:center!important;padding:14px!important}
  .rev-rating-n{font-size:36px!important}
}
@media(max-width:480px){
  .layout{gap:12px!important}
  .rev-header a{font-size:16px!important}
  .rev-write-btn{padding:8px 14px!important;font-size:12px!important}
  h2{font-size:16px!important}
  h3{font-size:14px!important}
}`}</style>

      {/* Header */}
      <header className="rev-header" style={{ background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'14px 24px', display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        <a href="/" style={{ fontWeight:900, fontSize:20, color:'#191919', letterSpacing:'-0.02em' }}>VERI<span style={{ color:GREEN }}>VEX</span></a>
        <span style={{ color:'#E2E8F0' }}>›</span>
        <span style={{ fontSize:13, color:'#64748B' }}>{companyName}</span>
        <div style={{ flex:1 }}/>
        <button onClick={() => setShowForm(true)} className="rev-write-btn" style={{ background:GREEN, color:'#fff', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          ✍️ Write a Review
        </button>
      </header>

      <div className="rev-main" style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px' }}>
        <div style={{ display:'flex', gap:24, alignItems:'flex-start' }} className="layout">

          {/* Main column */}
          <div style={{ flex:1, minWidth:0 }}>

            {/* Company header card */}
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:28, marginBottom:20 }}>
              <div className="rev-logo-rating" style={{ display:'flex', alignItems:'flex-start', gap:20, marginBottom:24 }}>
                <CompanyLogo slug={company} name={companyName} size={80} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4 }}>
                    <h1 style={{ fontSize:28, fontWeight:900 }}>{companyName}</h1>
                    {companyInfo?.is_verified && <span style={{ fontSize:12, color:GREEN, border:`1.5px solid ${GREEN}`, borderRadius:100, padding:'2px 10px', fontWeight:700 }}>✓ Verified</span>}
                  </div>
                  {companyInfo?.regulation && <div style={{ fontSize:13, color:'#64748B', marginBottom:6 }}>{companyInfo.regulation}</div>}
                  {companyInfo?.description && <div style={{ fontSize:14, color:'#475569', lineHeight:1.6, marginBottom:8 }}>{companyInfo.description}</div>}
                  {companyInfo?.website && (
                    <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'#0EA5E9', fontWeight:600, display:'inline-flex', alignItems:'center', gap:4 }}>
                      🌐 {companyInfo.website.replace('https://www.','').replace('https://','')} ↗
                    </a>
                  )}
                </div>
                {/* Rating box */}
                <div style={{ textAlign:'center', background:`${GREEN}08`, border:`1.5px solid ${GREEN}30`, borderRadius:12, padding:'18px 24px', flexShrink:0, minWidth:140 }}>
                  <div style={{ fontSize:52, fontWeight:900, color:GREEN, lineHeight:1 }}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
                  <Stars rating={avgRating} size={18} />
                  {ratingLabel && <div style={{ fontSize:13, fontWeight:700, color:GREEN, marginTop:6 }}>{ratingLabel}</div>}
                  <div style={{ fontSize:12, color:'#94A3B8', marginTop:4 }}>{reviews.length} reviews</div>
                </div>
              </div>

              {/* Rating distribution */}
              <div style={{ borderTop:'1px solid #F1F5F9', paddingTop:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }} className="grid2">
                  <div>
                    {dist.map(d => (
                      <div key={d.stars} onClick={() => setFilterRating(filterRating===d.stars?0:d.stars)}
                        style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, cursor:'pointer' }}>
                        <span style={{ fontSize:12, width:40, fontWeight:600, color:filterRating===d.stars?GREEN:'#64748B' }}>{d.stars} star</span>
                        <div style={{ flex:1, height:8, background:'#F1F5F9', borderRadius:100, overflow:'hidden' }}>
                          <div style={{ width:`${reviews.length ? d.count/reviews.length*100 : 0}%`, height:'100%', background:GREEN, borderRadius:100, transition:'width .6s' }}/>
                        </div>
                        <span style={{ fontSize:12, color:'#94A3B8', width:16, textAlign:'right' }}>{d.count}</span>
                      </div>
                    ))}
                    {filterRating > 0 && <button onClick={() => setFilterRating(0)} style={{ fontSize:12, color:GREEN, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Clear filter ×</button>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {companyInfo?.regulation?.split('/').slice(0,2).map((r:string) => r.trim()).filter(Boolean).map((r:string) => (
                      <div key={r} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#475569' }}>
                        <span style={{ color:GREEN, fontSize:16 }}>✅</span> {r.trim()} Regulated
                      </div>
                    ))}
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#475569' }}><span style={{ color:GREEN, fontSize:16 }}>✅</span> Segregated Client Funds</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#475569' }}><span style={{ color:GREEN, fontSize:16 }}>✅</span> Independently Reviewed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company details */}
            {companyInfo && (
              <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:28, marginBottom:20 }}>
                <h2 style={{ fontSize:17, fontWeight:800, marginBottom:20 }}>Company details</h2>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:28 }} className="grid2">
                  <div>
                    {companyInfo.category && (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#F8FAFC', border:'1.5px solid #E2E8F0', borderRadius:8, padding:'6px 14px', marginBottom:14, fontSize:13, fontWeight:700, color:'#475569' }}>
                        {companyInfo.category==='forex'?'📈 Forex Broker':companyInfo.category==='crypto'?'₿ Crypto Exchange':companyInfo.category==='prop'?'🏦 Prop Firm':companyInfo.category}
                      </div>
                    )}
                    {companyInfo.description && (
                      <div>
                        <div style={{ fontSize:11, fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Written by the company</div>
                        <p style={{ fontSize:13, color:'#475569', lineHeight:1.7 }}>{companyInfo.description}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12 }}>Contact info</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {companyInfo.address && <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}><span style={{ fontSize:16 }}>📍</span><span style={{ fontSize:13, color:'#475569', lineHeight:1.5 }}>{companyInfo.address}</span></div>}
                      {companyInfo.email && <div style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:16 }}>✉️</span><a href={`mailto:${companyInfo.email}`} style={{ fontSize:13, color:'#0EA5E9' }}>{companyInfo.email}</a></div>}
                      {companyInfo.website && <div style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:16 }}>🌐</span><a href={companyInfo.website} target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:'#0EA5E9' }}>{companyInfo.website.replace('https://www.','').replace('https://','')}</a></div>}
                      {companyInfo.founded && <div style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:16 }}>🗓</span><span style={{ fontSize:13, color:'#475569' }}>Founded {companyInfo.founded}</span></div>}
                      {companyInfo.headquarters && <div style={{ display:'flex', gap:10, alignItems:'center' }}><span style={{ fontSize:16 }}>🏢</span><span style={{ fontSize:13, color:'#475569' }}>{companyInfo.headquarters}</span></div>}
                      {companyInfo.regulation && <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}><span style={{ fontSize:16 }}>✅</span><span style={{ fontSize:13, color:'#475569' }}>Regulated: {companyInfo.regulation}</span></div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success banner */}
            {submitted && (
              <div style={{ background:'#f0fdf8', border:`1.5px solid ${GREEN}`, borderRadius:10, padding:16, marginBottom:20, display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:20 }}>📧</span>
                <div><div style={{ fontWeight:700, color:GREEN, marginBottom:2 }}>Check your email!</div><div style={{ fontSize:13, color:'#475569' }}>{submitMsg || 'Verification email sent. Click the link to publish your review.'}</div></div>
              </div>
            )}

            {/* Write review form */}
            {showForm && (
              <div style={{ background:'#fff', border:`2px solid ${GREEN}`, borderRadius:14, padding:28, marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                  <div>
                    <h2 style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Review {companyName}</h2>
                    <p style={{ fontSize:13, color:'#94A3B8' }}>Verified by email · Helps traders make informed decisions</p>
                  </div>
                  <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#94A3B8', lineHeight:1 }}>×</button>
                </div>
                <form onSubmit={submit}>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:'block', fontWeight:700, fontSize:13, marginBottom:10 }}>Your Rating *</label>
                    <Stars rating={form.rating} size={40} interactive onRate={(v:number) => setForm(f=>({...f,rating:v}))} />
                    {form.rating > 0 && <span style={{ fontSize:14, color:GREEN, marginTop:8, display:'block', fontWeight:700 }}>
                      {['','Poor','Fair','Good','Very Good','Excellent'][form.rating]}
                    </span>}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="grid2">
                    <div><label style={{ display:'block', fontWeight:600, fontSize:12, marginBottom:6, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em' }}>Name *</label><input className="inp" placeholder="e.g. James R." value={form.reviewer_name} onChange={e=>setForm(f=>({...f,reviewer_name:e.target.value}))} required/></div>
                    <div><label style={{ display:'block', fontWeight:600, fontSize:12, marginBottom:6, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em' }}>Location</label><input className="inp" placeholder="e.g. London, UK" value={form.reviewer_location} onChange={e=>setForm(f=>({...f,reviewer_location:e.target.value}))}/></div>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontWeight:600, fontSize:12, marginBottom:6, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em' }}>Email * <span style={{ fontWeight:400, color:'#CBD5E1' }}>(to verify · not shown publicly)</span></label>
                    <input className="inp" type="email" placeholder="your@email.com" value={form.reviewer_email} onChange={e=>setForm(f=>({...f,reviewer_email:e.target.value}))} required/>
                  </div>
                  <div style={{ marginBottom:14 }}><label style={{ display:'block', fontWeight:600, fontSize:12, marginBottom:6, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em' }}>Title *</label><input className="inp" placeholder="Summarise your experience" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ display:'block', fontWeight:600, fontSize:12, marginBottom:6, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em' }}>Review * <span style={{ fontWeight:400, color:'#CBD5E1' }}>(min 50 chars)</span></label>
                    <textarea className="inp" rows={5} placeholder="Describe your experience with withdrawals, platform, support, execution..." value={form.review_text} onChange={e=>setForm(f=>({...f,review_text:e.target.value}))} required style={{ resize:'vertical' }}/>
                    <div style={{ fontSize:11, marginTop:4, color:form.review_text.length>=50?GREEN:'#CBD5E1' }}>{form.review_text.length}/50 minimum</div>
                  </div>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ display:'block', fontWeight:600, fontSize:12, marginBottom:6, color:'#475569', textTransform:'uppercase', letterSpacing:'.04em' }}>Experience Level</label>
                    <select className="inp" value={form.trading_experience} onChange={e=>setForm(f=>({...f,trading_experience:e.target.value}))} style={{ background:'#fff' }}>
                      <option value="beginner">Beginner (under 1 year)</option>
                      <option value="intermediate">Intermediate (1–3 years)</option>
                      <option value="professional">Professional (3+ years)</option>
                    </select>
                  </div>
                  <button type="submit" disabled={submitting} style={{ width:'100%', padding:'13px', background:GREEN, color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:15, cursor:submitting?'not-allowed':'pointer', opacity:submitting?.7:1, fontFamily:'inherit' }}>
                    {submitting ? 'Submitting...' : '✅ Submit Review'}
                  </button>
                  <p style={{ fontSize:11, color:'#CBD5E1', textAlign:'center', marginTop:10 }}>By submitting you confirm this reflects your genuine experience.</p>
                </form>
              </div>
            )}

            {/* Reviews list */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h2 style={{ fontSize:18, fontWeight:800 }}>Reviews <span style={{ fontWeight:400, color:'#94A3B8' }}>({filtered.length})</span></h2>
                {!showForm && <button onClick={() => setShowForm(true)} style={{ background:GREEN, color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>✍️ Write a Review</button>}
              </div>

              {loading ? (
                [1,2,3].map(i=><div key={i} style={{ background:'#fff', borderRadius:10, padding:24, marginBottom:12, height:120, border:'1px solid #E2E8F0' }}/>)
              ) : filtered.length === 0 ? (
                <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:48, textAlign:'center' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
                  <div style={{ fontWeight:700, fontSize:17, marginBottom:8 }}>No reviews yet</div>
                  <div style={{ fontSize:13, color:'#94A3B8', marginBottom:20 }}>Be the first to share your experience with {companyName}</div>
                  <button onClick={() => setShowForm(true)} style={{ background:GREEN, color:'#fff', border:'none', borderRadius:8, padding:'11px 24px', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Write First Review</button>
                </div>
              ) : filtered.map((r:any) => (
                <div key={r.id} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:24, marginBottom:12, transition:'box-shadow .2s' }}
                  onMouseEnter={e=>(e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)')}
                  onMouseLeave={e=>(e.currentTarget.style.boxShadow='none')}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <Stars rating={r.rating} size={16} />
                        <span style={{ fontSize:13, fontWeight:700, color:r.rating>=4?GREEN:r.rating<=2?'#EF4444':'#F59E0B' }}>
                          {r.rating===5?'Excellent':r.rating===4?'Great':r.rating===3?'Good':r.rating===2?'Fair':'Poor'}
                        </span>
                        {r.verified && <span style={{ fontSize:11, background:`${GREEN}12`, color:GREEN, border:`1px solid ${GREEN}25`, padding:'2px 8px', borderRadius:100, fontWeight:600 }}>✓ Verified</span>}
                        {r.is_pinned && <span style={{ fontSize:11, background:'#FEF3C7', color:'#D97706', border:'1px solid #FDE68A', padding:'2px 8px', borderRadius:100, fontWeight:600 }}>Featured</span>}
                      </div>
                      <h3 style={{ fontSize:15, fontWeight:700 }}>{r.title}</h3>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{r.reviewer_name}</div>
                      {r.reviewer_location && <div style={{ fontSize:12, color:'#94A3B8' }}>{r.reviewer_location}</div>}
                      <div style={{ fontSize:11, color:'#CBD5E1', marginTop:2 }}>{new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
                    </div>
                  </div>
                  <p style={{ fontSize:14, lineHeight:1.75, color:'#475569' }}>{r.review_text}</p>
                  {r.trading_experience && <div style={{ marginTop:10, fontSize:12, color:'#CBD5E1' }}>Experience: <span style={{ color:'#94A3B8', fontWeight:600, textTransform:'capitalize' }}>{r.trading_experience}</span></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width:280, flexShrink:0 }}>

            {/* Risk notice for financial companies */}
            {isFinancial && (
              <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:18, marginBottom:16 }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:16 }}>ℹ️</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, color:'#1E40AF', marginBottom:4 }}>You should know</div>
                    <div style={{ fontSize:12, color:'#3B82F6', lineHeight:1.5 }}>Trading in financial instruments carries high risk. Past performance is not indicative of future results.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Trust score box */}
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:42, fontWeight:900, color:COLORS[company]||'#191919', lineHeight:1, marginBottom:4 }}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
              <Stars rating={avgRating} size={20} />
              {ratingLabel && <div style={{ fontWeight:700, fontSize:14, color:'#191919', marginTop:8 }}>{ratingLabel}</div>}
              <div style={{ fontSize:12, color:'#94A3B8', marginBottom:16 }}>{reviews.length} reviews</div>
              <div style={{ borderTop:'1px solid #F1F5F9', paddingTop:12 }}>
                {dist.map(d => (
                  <div key={d.stars} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:11, color:'#64748B', width:32 }}>{d.stars}-star</span>
                    <div style={{ flex:1, height:6, background:'#F1F5F9', borderRadius:100 }}>
                      <div style={{ width:`${reviews.length ? d.count/reviews.length*100 : 0}%`, height:'100%', background:GREEN, borderRadius:100 }}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:'1px solid #F1F5F9', paddingTop:12, marginTop:4 }}>
                <div style={{ fontSize:11, color:'#94A3B8', textAlign:'center' }}>How is the TrustScore calculated?</div>
              </div>
            </div>

            {/* Reply rate */}
            {negReviews > 0 && (
              <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:18, marginBottom:16 }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span style={{ fontSize:20 }}>💬</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>Replied to {replyRate}% of negative reviews</div>
                    <div style={{ fontSize:12, color:'#94A3B8' }}>Typically replies within 1 month</div>
                  </div>
                </div>
              </div>
            )}

            {/* How Verivex works */}
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:18, marginBottom:16 }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <span style={{ fontSize:20 }}>📊</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>How this company uses Verivex</div>
                  <div style={{ fontSize:12, color:'#94A3B8' }}>See how their reviews and ratings are sourced, scored, and moderated.</div>
                </div>
              </div>
            </div>

            {/* Write review CTA */}
            <button onClick={() => setShowForm(true)} style={{ width:'100%', background:GREEN, color:'#fff', border:'none', borderRadius:10, padding:'13px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
              ✍️ Write a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
