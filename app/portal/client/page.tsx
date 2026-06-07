'use client'
import { useState, useEffect } from 'react'

const GREEN = '#00B67A'
const PORTALS = [
  { name:'Nex-Wire', domain:'nex-wire.com', slug:'global-trade-wire', color:'#E03131' },
  { name:'Finvexx', domain:'finvexx.com', slug:'finance-terminal', color:'#1971C2' },
  { name:'Bizplexz', domain:'bizplexz.com', slug:'business-pulse', color:'#7C3AED' },
  { name:'AurexHQ', domain:'aurexhq.com', slug:'gold-markets-today', color:'#B08700' },
  { name:'Verivex', domain:'verivex.co', slug:'trust-score', color:GREEN },
]

export default function ClientDashboard() {
  const [reviews, setReviews] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'reviews'|'articles'>('overview')

  useEffect(() => {
    Promise.all([
      fetch('/api/reviews?slug=etoro').then(r=>r.json()),
      fetch('/api/client/articles?client=etoro').then(r=>r.json()),
    ]).then(([rv, art]) => {
      setReviews(rv.reviews || [])
      setArticles(art.articles || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length) : 0
  const positive = reviews.filter(r=>r.rating>=4).length
  const negative = reviews.filter(r=>r.rating<=2).length
  const dist = [5,4,3,2,1].map(s => ({ stars:s, count: reviews.filter(r=>r.rating===s).length }))

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", minHeight:'100vh', background:'#0F172A', color:'#F1F5F9' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}.tab{padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;border:none;font-family:inherit;transition:all .15s}`}</style>

      {/* Header */}
      <header style={{ background:'#1E293B', borderBottom:'1px solid #334155', padding:'14px 28px', display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ fontWeight:900, fontSize:18, color:'#F1F5F9' }}>VERI<span style={{ color:GREEN }}>VEX</span> <span style={{ fontSize:12, fontWeight:400, color:'#64748B' }}>Client Portal</span></div>
        <div style={{ flex:1 }}/>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Etoro_logo.svg/120px-Etoro_logo.svg.png" alt="eToro" style={{ height:24, objectFit:'contain', filter:'brightness(10)' }} />
          <div style={{ width:8, height:8, borderRadius:100, background:GREEN }}/>
          <span style={{ fontSize:12, color:'#94A3B8' }}>Live</span>
        </div>
      </header>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px' }}>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:28 }}>
          {([['overview','📊 Overview'],['reviews','⭐ Reviews'],['articles','📰 Articles']] as const).map(([t,label]) => (
            <button key={t} className="tab" onClick={() => setTab(t as any)}
              style={{ background:tab===t?GREEN:'rgba(255,255,255,0.05)', color:tab===t?'#fff':'#94A3B8' }}>
              {label}
            </button>
          ))}
        </div>

        {loading && <div style={{ textAlign:'center', padding:60, color:'#64748B' }}>Loading your data...</div>}

        {!loading && tab === 'overview' && (
          <div>
            {/* Stat cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
              {[
                ['TrustScore', avgRating.toFixed(1)+'★', GREEN, 'Average rating across all reviews'],
                ['Total Reviews', reviews.length, '#F59E0B', 'Approved reviews on Verivex'],
                ['Positive (4-5★)', positive, '#10B981', `${reviews.length?Math.round(positive/reviews.length*100):0}% of all reviews`],
                ['Articles Mentioning eToro', articles.length, '#6366F1', 'Across all 5 portals'],
              ].map(([label, val, color, sub]) => (
                <div key={label as string} style={{ background:'#1E293B', border:`1px solid ${color as string}30`, borderRadius:12, padding:20 }}>
                  <div style={{ fontSize:28, fontWeight:900, color:color as string, marginBottom:4 }}>{val}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#F1F5F9', marginBottom:4 }}>{label as string}</div>
                  <div style={{ fontSize:11, color:'#64748B' }}>{sub as string}</div>
                </div>
              ))}
            </div>

            {/* Rating distribution */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:28 }}>
              <div style={{ background:'#1E293B', border:'1px solid #334155', borderRadius:12, padding:24 }}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16, color:'#F1F5F9' }}>Rating Breakdown</h3>
                {dist.map(d => (
                  <div key={d.stars} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                    <span style={{ fontSize:12, color:'#94A3B8', width:36 }}>{d.stars}★</span>
                    <div style={{ flex:1, height:8, background:'#334155', borderRadius:100 }}>
                      <div style={{ width:`${reviews.length?d.count/reviews.length*100:0}%`, height:'100%', background:d.stars>=4?GREEN:d.stars<=2?'#EF4444':'#F59E0B', borderRadius:100, transition:'width .5s' }}/>
                    </div>
                    <span style={{ fontSize:12, color:'#64748B', width:20, textAlign:'right' }}>{d.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:'#1E293B', border:'1px solid #334155', borderRadius:12, padding:24 }}>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Portal Coverage</h3>
                {PORTALS.map(p => (
                  <div key={p.slug} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:8, height:8, borderRadius:100, background:p.color }}/>
                      <span style={{ fontSize:13, color:'#CBD5E1' }}>{p.name}</span>
                    </div>
                    <div style={{ display:'flex', gap:12 }}>
                      <span style={{ fontSize:12, color:'#64748B' }}>{articles.filter((a:any)=>a.portal===p.slug).length} articles</span>
                      <a href={`https://${p.domain}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:GREEN }}>Visit →</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent reviews */}
            <div style={{ background:'#1E293B', border:'1px solid #334155', borderRadius:12, padding:24 }}>
              <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>Recent Reviews</h3>
              {reviews.slice(0,5).map(r => (
                <div key={r.id} style={{ borderBottom:'1px solid #1E293B', paddingBottom:14, marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14, fontWeight:700 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:r.rating>=4?GREEN:r.rating<=2?'#EF4444':'#F59E0B' }}>{r.title}</span>
                    </div>
                    <span style={{ fontSize:11, color:'#475569' }}>{new Date(r.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <p style={{ fontSize:13, color:'#94A3B8', lineHeight:1.6 }}>{r.review_text?.substring(0,150)}...</p>
                  <div style={{ fontSize:11, color:'#475569', marginTop:4 }}>{r.reviewer_name} · {r.reviewer_location}</div>
                </div>
              ))}
              <button onClick={() => setTab('reviews')} style={{ fontSize:13, color:GREEN, background:'none', border:'none', cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>
                See all {reviews.length} reviews →
              </button>
            </div>
          </div>
        )}

        {!loading && tab === 'reviews' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:20 }}>All Reviews ({reviews.length})</h2>
            {reviews.map(r => (
              <div key={r.id} style={{ background:'#1E293B', border:'1px solid #334155', borderRadius:10, padding:20, marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:r.rating>=4?GREEN:r.rating<=2?'#EF4444':'#F59E0B' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                      {r.verified && <span style={{ fontSize:10, background:`${GREEN}20`, color:GREEN, padding:'2px 6px', borderRadius:4 }}>✓ Verified</span>}
                      {r.is_pinned && <span style={{ fontSize:10, background:'#F59E0B20', color:'#F59E0B', padding:'2px 6px', borderRadius:4 }}>Featured</span>}
                    </div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{r.title}</div>
                    <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{r.reviewer_name} · {r.reviewer_location} · {r.trading_experience}</div>
                  </div>
                  <span style={{ fontSize:11, color:'#475569' }}>{new Date(r.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                </div>
                <p style={{ fontSize:13, color:'#94A3B8', lineHeight:1.7 }}>{r.review_text}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && tab === 'articles' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:20 }}>Articles Mentioning eToro ({articles.length})</h2>
            {articles.length === 0 ? (
              <div style={{ textAlign:'center', padding:60, color:'#475569', border:'1px dashed #334155', borderRadius:12 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>📰</div>
                <div>No articles fetched yet. Check back after the next cron run.</div>
              </div>
            ) : articles.map((a:any) => (
              <div key={a.id} style={{ background:'#1E293B', border:'1px solid #334155', borderRadius:10, padding:20, marginBottom:12, display:'flex', gap:16, alignItems:'flex-start' }}>
                {a.cover_image_url && <img src={a.cover_image_url} alt="" style={{ width:80, height:60, objectFit:'cover', borderRadius:8, flexShrink:0 }} />}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    {PORTALS.find(p=>p.slug===a.portal) && (
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, background:PORTALS.find(p=>p.slug===a.portal)!.color+'20', color:PORTALS.find(p=>p.slug===a.portal)!.color }}>
                        {PORTALS.find(p=>p.slug===a.portal)!.name.toUpperCase()}
                      </span>
                    )}
                    <span style={{ fontSize:11, color:'#475569' }}>{new Date(a.published_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>{a.title}</div>
                  <p style={{ fontSize:12, color:'#64748B', lineHeight:1.5 }}>{a.excerpt?.substring(0,120)}...</p>
                  {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:GREEN, marginTop:6, display:'inline-block' }}>Read article →</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
