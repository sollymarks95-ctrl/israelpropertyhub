'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const PORTALS = [
  { slug:'global-trade-wire', name:'Nex-Wire', domain:'nex-wire.com', color:'#0ea5e9' },
  { slug:'finance-terminal', name:'Finvexx', domain:'finvexx.com', color:'#10b981' },
  { slug:'business-pulse', name:'Bizplezx', domain:'bizplezx.com', color:'#8b5cf6' },
  { slug:'gold-markets-today', name:'AurexHQ', domain:'aurexhq.com', color:'#f59e0b' },
  { slug:'trust-score', name:'Verivex', domain:'verivex.co', color:'#ef4444' },
  { slug:'invest-data', name:'InvexHuby', domain:'invexhuby.com', color:'#14b8a6' },
  { slug:'market-radar', name:'Signalixx', domain:'signalixx.com', color:'#f43f5e' },
  { slug:'executive-network', name:'ExecVex', domain:'execvex.com', color:'#1d4ed8' },
  { slug:'crypto-hub', name:'CryptoXos', domain:'cryptoxos.com', color:'#f97316' },
]

const NAV = [
  { icon:'⚡', label:'Overview', id:'overview' },
  { icon:'📰', label:'Articles', id:'articles' },
  { icon:'📊', label:'Analytics', id:'analytics' },
  { icon:'🎙', label:'Podcasts', id:'podcasts' },
  { icon:'🔍', label:'Rankings', id:'rankings' },
  { icon:'🔗', label:'Backlinks', id:'backlinks' },
  { icon:'🌐', label:'Coverage', id:'coverage' },
  { icon:'⭐', label:'Reviews', id:'reviews' },
]

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}
function fmtNum(n: number) {
  if (n >= 1000) return (n/1000).toFixed(1) + 'k'
  return String(n)
}

export default function PortalDashboard({ client, content = [], podcasts = [], reviews = [], coverage = [] }: any) {
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [generatingPodcast, setGeneratingPodcast] = useState<string|null>(null)
  const [podcastResult, setPodcastResult] = useState<Record<string,any>>({})
  const [podcastTarget, setPodcastTarget] = useState<Record<string,string>>({})
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [analytics, setAnalytics] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  
  // Rankings state
  const [keyword, setKeyword] = useState('')
  const [serpResults, setSerpResults] = useState<any>(null)
  const [serpLoading, setSerpLoading] = useState(false)
  const [serpError, setSerpError] = useState('')
  const [savedKeywords] = useState(['eToro review', 'eToro broker', 'eToro trading platform', 'eToro fees', 'is eToro safe'])
  // AI Review state
  const [rankingMode, setRankingMode] = useState<'serp'|'ai'>('serp')
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResults, setAiResults] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [savedQuestions] = useState(['Is eToro safe?', 'What is eToro?', 'Best trading platforms 2025', 'eToro vs competitors', 'Is eToro regulated?'])
  
  // Podcast player
  const [playingPod, setPlayingPod] = useState<string | null>(null)
  // Backlinks
  const [backlinksData, setBacklinksData] = useState<any>(null)
  const [loadingBacklinks, setLoadingBacklinks] = useState(false)
  const [blFilter, setBlFilter] = useState<'all'|'dofollow'|'mention'>('all')

  const p = client?.primary_color || '#0ea5e9'

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true)
    try {
      const r = await fetch('/api/client/analytics?days=30')
      const d = await r.json()
      setAnalytics(d)
    } catch {}
    setLoadingAnalytics(false)
  }, [])

  useEffect(() => { loadAnalytics() }, [loadAnalytics])

  const generatePodcastAudio = async (pod: any) => {
    const key = pod.id
    const targetSlug = podcastTarget[key] || pod.site_slug
    setGeneratingPodcast(key)
    try {
      const r = await fetch('/api/admin/generate-podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: 'a1b2c3d4-0000-0000-0000-000000000001',
          siteSlug: targetSlug,
          hostName: pod.host_name,
          guestName: pod.guest_name,
          guestRole: pod.guest_role,
          topic: pod.topic,
          title: pod.title,
          episodeNumber: pod.episode_number || 1,
          durationMinutes: Math.min(pod.duration_minutes || 5, 8),
        })
      })
      const data = await r.json()
      if (data.ok && data.audioUrl) {
        setPodcastResult(prev => ({ ...prev, [key]: { audioUrl: data.audioUrl, words: data.words } }))
      } else {
        setPodcastResult(prev => ({ ...prev, [key]: { error: data.error || 'Generation failed' } }))
      }
    } catch(e: any) {
      setPodcastResult(prev => ({ ...prev, [key]: { error: e.message } }))
    } finally {
      setGeneratingPodcast(null)
    }
  }

  const loadBacklinks = useCallback(async () => {
    setLoadingBacklinks(true)
    try {
      const r = await fetch('/api/client/backlinks?days=90')
      const d = await r.json()
      setBacklinksData(d)
    } catch {}
    setLoadingBacklinks(false)
  }, [])

  useEffect(() => {
    if (tab === 'backlinks' && !backlinksData) loadBacklinks()
  }, [tab, backlinksData, loadBacklinks])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadAnalytics(), loadBacklinks()])
    router.refresh()
    setLastRefresh(new Date())
    setTimeout(() => setRefreshing(false), 1000)
  }

  const checkRankings = async (kw: string) => {
    if (!kw.trim()) return
    setSerpLoading(true)
    setSerpError('')
    setSerpResults(null)
    try {
      const r = await fetch('/api/client/serp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw }),
      })
      const d = await r.json()
      if (d.error) setSerpError(d.error)
      else setSerpResults(d)
    } catch (e: any) {
      setSerpError(e.message)
    }
    setSerpLoading(false)
  }

  const checkAiReview = async (q: string) => {
    if (!q.trim()) return
    setAiLoading(true); setAiError(''); setAiResults(null)
    try {
      const r = await fetch('/api/client/ai-review', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ question: q }),
      })
      const data = await r.json()
      if (!r.ok || data.error) throw new Error(data.error || 'AI review failed')
      setAiResults(data)
    } catch (e: any) {
      setAiError(e.message)
    } finally {
      setAiLoading(false)
    }
  }


  const totalArticles = content.length
  const totalViews = 0 // legacy — not shown to client
  const totalPageViews = 0 // legacy — not shown to client
  const portalsActive = new Set(content.map((c: any) => c.portal_name)).size
  const podcastCount = podcasts.length
  const avgRating = reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'

  const BG = '#070d1a'
  const CARD = '#0e1628'
  const BORDER = 'rgba(255,255,255,0.08)'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:BG, fontFamily:"'Inter',sans-serif", color:'#f1f5f9' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
        .nav-b{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#64748b;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:inherit}
        .nav-b:hover{background:rgba(255,255,255,0.05);color:#94a3b8}
        .nav-b.on{background:rgba(14,165,233,0.12);color:#38bdf8;font-weight:600}
        .kpi{background:${CARD};border:1px solid ${BORDER};border-radius:16px;padding:20px 24px;transition:transform .2s}
        .kpi:hover{transform:translateY(-2px)}
        .card{background:${CARD};border:1px solid ${BORDER};border-radius:12px;padding:20px}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all .15s}
        .btn-primary{background:${p};color:#fff}
        .btn-ghost{background:rgba(255,255,255,0.06);color:#94a3b8;border:1px solid rgba(255,255,255,0.1)}
        .btn-ghost:hover{border-color:${p};color:${p}}
        .inp{width:100%;padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#f1f5f9;font-size:13px;font-family:inherit;outline:none;transition:border .15s}
        .inp:focus{border-color:${p}}
        .tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade{animation:fadeIn .3s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .portal-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:rgba(14,165,233,0.15);color:#38bdf8}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;font-size:11px;font-weight:600;color:#475569;padding:8px 12px;border-bottom:1px solid ${BORDER};text-transform:uppercase;letter-spacing:.05em}
        td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px}
        tr:hover td{background:rgba(255,255,255,0.02)}
        .bar{height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden}
        .bar-fill{height:100%;border-radius:2px;transition:width .5s ease}
        audio{width:100%;height:32px}
        audio::-webkit-media-controls-panel{background:rgba(255,255,255,0.05)}
      `}</style>

      {/* Sidebar */}
      <div style={{ width:220, background:'#080f1e', borderRight:`1px solid ${BORDER}`, display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', flexShrink:0 }}>
        <div style={{ padding:'20px 16px 16px', borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${p},${p}80)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
              {client?.logo_emoji || '🌐'}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:14, color:'#f1f5f9' }}>{client?.company_name || 'eToro'}</div>
              <div style={{ fontSize:11, color:'#475569' }}>Intelligence Portal</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'12px 8px', overflowY:'auto' }}>
          {NAV.map(n => (
            <button key={n.id} className={`nav-b${tab===n.id?' on':''}`} onClick={() => setTab(n.id)}>
              <span style={{ fontSize:15 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:'12px 16px', borderTop:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:10, color:'#334155', marginBottom:4 }}>
            Last sync: {lastRefresh.toLocaleTimeString()}
          </div>
          <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', fontSize:12, padding:'7px 12px' }} onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <span className="spin">⟳</span> : '⟳'} {refreshing ? 'Refreshing…' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:'auto' }}>
        {/* Header */}
        <div style={{ padding:'20px 32px', borderBottom:`1px solid ${BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(8,15,30,0.8)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:10 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:800, color:'#f1f5f9' }}>
              {NAV.find(n=>n.id===tab)?.icon} {NAV.find(n=>n.id===tab)?.label}
            </h1>
            <div style={{ fontSize:12, color:'#475569', marginTop:2 }}>
              {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#10b981', background:'rgba(16,185,129,0.12)', padding:'4px 10px', borderRadius:6 }}>● Live</span>
            <button className="btn btn-primary" onClick={handleRefresh} disabled={refreshing} style={{ fontSize:12, padding:'7px 14px' }}>
              {refreshing ? <span className="spin">⟳</span> : '⟳'} {refreshing ? 'Syncing…' : 'Refresh All'}
            </button>
          </div>
        </div>

        <div style={{ padding:'28px 32px' }} className="fade">

          {/* ═══ OVERVIEW ═══ */}
          {tab === 'overview' && (
            <div>
              {/* KPI Grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
                {[
                  { label:'Brand Mentions (30d)', value: analytics ? fmtNum(analytics.brandMentions || 0) : '—', sub:'articles mentioning eToro', icon:'🎯', color:'#0ea5e9' },
                  { label:'Dofollow Backlinks', value: analytics ? fmtNum(analytics.dofollowLinks || 0) : '—', sub:'live links to etoro.com', icon:'🔗', color:'#10b981' },
                  { label:'Articles Published', value: analytics ? fmtNum(analytics.brandArticles || totalArticles) : totalArticles, sub:`across ${analytics?.portalsActive || portalsActive} portals`, icon:'📰', color:'#8b5cf6' },
                  { label:'Podcasts Created', value: podcastCount, sub:'branded episodes', icon:'🎙', color:'#f59e0b' },
                ].map(k => (
                  <div key={k.label} className="kpi">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em' }}>{k.label}</div>
                      <span style={{ fontSize:18 }}>{k.icon}</span>
                    </div>
                    <div style={{ fontSize:32, fontWeight:900, color:'#f1f5f9', lineHeight:1 }}>{k.value}</div>
                    <div style={{ fontSize:11, color:'#475569', marginTop:6 }}>{k.sub}</div>
                    <div style={{ height:2, background:`${k.color}30`, borderRadius:1, marginTop:12 }}>
                      <div style={{ width:'65%', height:'100%', background:k.color, borderRadius:1 }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Two column: Recent Articles + Portal Status */}
              <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:20 }}>
                <div className="card">
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:16, display:'flex', justifyContent:'space-between' }}>
                    Latest Coverage
                    <button className="btn btn-ghost" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>setTab('articles')}>View all →</button>
                  </div>
                  {content.slice(0,6).map((c: any, i: number) => {
                    const port = PORTALS.find(p => p.name === c.portal_name)
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:`${port?.color || '#475569'}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:port?.color || '#475569', flexShrink:0 }}>
                          {(port?.name || 'P').slice(0,2).toUpperCase()}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <a href={c.article_url} target="_blank" rel="noopener" style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {c.title}
                          </a>
                          <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>
                            {c.portal_name} · {timeAgo(c.published_at)}
                          </div>
                        </div>
                        <a href={c.article_url} target="_blank" rel="noopener" style={{ fontSize:11, color:p, flexShrink:0 }}>↗</a>
                      </div>
                    )
                  })}
                </div>

                <div className="card">
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Portal Coverage</div>
                  {PORTALS.map(port => {
                    const count = content.filter((c: any) => c.portal_name === port.name).length
                    const maxCount = Math.max(...PORTALS.map(p2 => content.filter((c: any) => c.portal_name === p2.name).length), 1)
                    return (
                      <div key={port.slug} style={{ marginBottom:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:12, color:'#94a3b8' }}>{port.name}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:port.color }}>{count}</span>
                        </div>
                        <div className="bar">
                          <div className="bar-fill" style={{ width:`${(count/maxCount)*100}%`, background:port.color }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ ARTICLES ═══ */}
          {tab === 'articles' && (
            <div className="fade">
              <div className="card" style={{ marginBottom:16 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>
                  All Brand Articles — {totalArticles} published
                </div>
                <div style={{ fontSize:12, color:'#475569' }}>Every article mentioning your brand across all 9 portals. Sorted by most recent.</div>
              </div>
              <div className="card" style={{ overflowX:'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Portal</th>
                      <th>Published</th>
                      <th style={{textAlign:'right'}}>Views</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.map((c: any, i: number) => {
                      const port = PORTALS.find(p => p.name === c.portal_name)
                      return (
                        <tr key={i}>
                          <td style={{ maxWidth:320 }}>
                            <div style={{ fontSize:13, fontWeight:500, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {c.title}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background:`${port?.color || '#475569'}20`, color:port?.color || '#94a3b8' }}>
                              {c.portal_name}
                            </span>
                          </td>
                          <td style={{ color:'#64748b', fontSize:12 }}>{fmtDate(c.published_at)}</td>
                          <td style={{ textAlign:'right', fontWeight:700, color:'#38bdf8' }}>
                            {c.news_articles?.views || 0}
                          </td>
                          <td>
                            <a href={c.article_url} target="_blank" rel="noopener" style={{ fontSize:11, color:p, fontWeight:600 }}>
                              View ↗
                            </a>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {tab === 'analytics' && (
            <div className="fade">
              {loadingAnalytics && (
                <div style={{ textAlign:'center', padding:40, color:'#475569' }}>
                  <span className="spin" style={{ display:'inline-block', fontSize:24 }}>⟳</span>
                  <div style={{ marginTop:8 }}>Loading analytics…</div>
                </div>
              )}
              {analytics && (
                <div>
                  {/* KPIs */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                    {[
                      { label:'Brand Mentions (30d)', value: fmtNum(analytics.brandMentions || 0) },
                      { label:'Dofollow Links', value: fmtNum(analytics.dofollowLinks || 0) },
                      { label:'Top Country', value: analytics.countries?.[0]?.country || '—' },
                    ].map(k => (
                      <div key={k.label} className="kpi" style={{ padding:'16px 20px' }}>
                        <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>{k.label}</div>
                        <div style={{ fontSize:28, fontWeight:900, color:p }}>{k.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                    {/* Top articles by views */}
                    <div className="card">
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Top Articles by Views</div>
                      {(analytics.topArticles || []).slice(0,8).map((a: any, i: number) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <a href={a.url} target="_blank" rel="noopener" style={{ fontSize:12, fontWeight:500, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                              {a.title}
                            </a>
                            <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>{a.portal}</div>
                          </div>
                          <span style={{ fontSize:13, fontWeight:700, color:'#38bdf8', marginLeft:12, flexShrink:0 }}>{fmtNum(a.views)}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      {/* By portal */}
                      <div className="card" style={{ marginBottom:20 }}>
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Views by Portal</div>
                        {(analytics.byPortal || []).slice(0,6).map((b: any, i: number) => {
                          const port = PORTALS.find(p2 => p2.slug === b.slug)
                          const max = analytics.byPortal?.[0]?.views || 1
                          return (
                            <div key={i} style={{ marginBottom:10 }}>
                              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                                <span style={{ fontSize:12, color:'#94a3b8' }}>{port?.name || b.slug}</span>
                                <span style={{ fontSize:12, fontWeight:700, color:port?.color || '#94a3b8' }}>{b.views}</span>
                              </div>
                              <div className="bar">
                                <div className="bar-fill" style={{ width:`${(b.views/max)*100}%`, background:port?.color || p }}/>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Devices */}
                      <div className="card">
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>Device Split</div>
                        <div style={{ display:'flex', gap:16 }}>
                          {Object.entries(analytics.devices || {}).map(([d, v]: [string, any]) => (
                            <div key={d} style={{ flex:1, textAlign:'center' }}>
                              <div style={{ fontSize:22 }}>{d==='mobile'?'📱':d==='tablet'?'📟':'🖥'}</div>
                              <div style={{ fontSize:20, fontWeight:800, color:p, marginTop:4 }}>{v}</div>
                              <div style={{ fontSize:10, color:'#475569', textTransform:'capitalize' }}>{d}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily chart */}
                  {analytics.daily?.length > 0 && (
                    <div className="card" style={{ marginTop:20 }}>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Daily Brand Mentions (30 days)</div>
                      <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:80 }}>
                        {(analytics.dailyMentions || []).slice(-30).map((d: any) => {
                          const max = Math.max(...(analytics.dailyMentions || []).map((x: any) => x.count || 0), 1)
                          return (
                            <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                              <div title={`${d.date}: ${d.count} mentions`} style={{ width:'100%', height:`${Math.max(4,(d.count/max)*72)}px`, background:p, borderRadius:'2px 2px 0 0', opacity:.8, cursor:'default' }}/>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ PODCASTS ═══ */}
          {tab === 'podcasts' && (
            <div className="fade">
              <div className="card" style={{ marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>🎙 {podcastCount} Episode{podcastCount !== 1 ? 's' : ''} Across {new Set(podcasts.map((p:any)=>p.site_slug)).size} Portals</div>
                  <div style={{ fontSize:12, color:'#475569', marginTop:4 }}>Each portal hosts its own branded podcast series. Episodes link to the portal's /podcasts page.</div>
                </div>
              </div>
              {podcasts.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:40, color:'#475569' }}>
                  No episodes yet. Episodes are added via the podcast generation tool.
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  {podcasts.map((pod: any, i: number) => {
                    const portal = PORTALS.find(p => p.slug === pod.site_slug)
                    const portalDomain = portal?.domain || `${pod.site_slug}.com`
                    const portalColor = portal?.color || '#0ea5e9'
                    return (
                    <div key={pod.id} className="card" style={{ border:`1px solid ${portalColor}22` }}>
                      {/* Portal badge */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:4, background:portalColor+'22', color:portalColor, letterSpacing:'.06em', textTransform:'uppercase' }}>
                          {pod.show_name || portal?.name || pod.site_slug}
                        </span>
                        <span style={{ fontSize:10, padding:'2px 7px', borderRadius:4, background:'rgba(16,185,129,0.15)', color:'#10b981', fontWeight:600 }}>
                          EP {pod.episode_number || i+1}
                        </span>
                      </div>

                      <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9', marginBottom:6, lineHeight:1.3 }}>
                        {pod.title?.length > 70 ? pod.title.slice(0, 70) + '…' : pod.title || `Episode ${i+1}`}
                      </div>

                      {pod.guest_name && (
                        <div style={{ fontSize:12, color:'#94a3b8', marginBottom:8 }}>
                          👤 {pod.guest_name} <span style={{ color:'#475569' }}>· {pod.guest_role}</span>
                          {pod.duration_minutes ? <span style={{ color:'#475569' }}> · {pod.duration_minutes} min</span> : ''}
                        </div>
                      )}

                      {pod.topic && (
                        <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5, marginBottom:12 }}>
                          {pod.topic.length > 100 ? pod.topic.slice(0, 100) + '…' : pod.topic}
                        </div>
                      )}

                      {/* Audio player */}
                      {(pod.audio_url || pod.mp3_url) && (
                        <div style={{ marginBottom:12 }}>
                          <audio controls src={pod.audio_url || pod.mp3_url} style={{ width:'100%', height:32 }} preload="none" />
                        </div>
                      )}
                      {!(pod.audio_url || pod.mp3_url) && !podcastResult[pod.id]?.audioUrl && (
                        <div style={{ marginBottom:12 }}>
                          {podcastResult[pod.id]?.error && (
                            <div style={{ fontSize:11, color:'#ef4444', marginBottom:6, padding:'4px 8px', background:'rgba(239,68,68,0.1)', borderRadius:4 }}>
                              ❌ {podcastResult[pod.id].error}
                            </div>
                          )}
                          {/* Portal selector + generate button */}
                          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:10, fontWeight:600, color:'#475569', marginBottom:4, letterSpacing:'.06em', textTransform:'uppercase' }}>Publish to portal</div>
                              <select
                                value={podcastTarget[pod.id] || pod.site_slug}
                                onChange={e => setPodcastTarget(prev => ({ ...prev, [pod.id]: e.target.value }))}
                                disabled={generatingPodcast === pod.id}
                                style={{ width:'100%', padding:'6px 10px', background:'#1e293b', border:'1px solid #334155', color:'#e2e8f0', borderRadius:5, fontSize:12, cursor:'pointer' }}
                              >
                                {PORTALS.map(port => (
                                  <option key={port.slug} value={port.slug}>{port.name}</option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flexShrink:0, paddingTop:18 }}>
                              <button
                                onClick={() => generatePodcastAudio(pod)}
                                disabled={generatingPodcast === pod.id}
                                className="btn"
                                style={{ fontSize:12, padding:'7px 16px', background: generatingPodcast===pod.id ? '#334155' : '#0ea5e9', color:'#fff', border:'none', cursor: generatingPodcast===pod.id ? 'wait' : 'pointer', borderRadius:6, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}
                              >
                                {generatingPodcast === pod.id
                                  ? <><span>⏳</span> Generating…</>
                                  : <>🎙 Generate &amp; Publish</>}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {podcastResult[pod.id]?.audioUrl && (
                        <div style={{ marginBottom:12 }}>
                          <div style={{ fontSize:11, color:'#10b981', marginBottom:6, fontWeight:600 }}>✅ Audio generated! {podcastResult[pod.id].words} words</div>
                          <audio controls src={podcastResult[pod.id].audioUrl} style={{ width:'100%', height:32 }} />
                        </div>
                      )}

                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
                        <a href={`https://${portalDomain}/podcasts`} target="_blank" rel="noopener" style={{ textDecoration:'none' }}>
                          <button className="btn btn-ghost" style={{ fontSize:11, padding:'5px 12px', borderColor: portalColor+'44', color: portalColor }}>
                            🌐 View on {portal?.name || 'Portal'}
                          </button>
                        </a>
                        {(pod.audio_url || pod.mp3_url) && (
                          <a href={pod.audio_url || pod.mp3_url} download target="_blank" rel="noopener" style={{ textDecoration:'none' }}>
                            <button className="btn btn-ghost" style={{ fontSize:11, padding:'5px 12px' }}>⬇ Download</button>
                          </a>
                        )}
                        <div style={{ fontSize:10, color:'#475569', display:'flex', alignItems:'center', marginLeft:'auto' }}>
                          {fmtDate(pod.created_at)}
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ RANKINGS / LIVE SEARCH + AI REVIEW ═══ */}
          {tab === 'rankings' && (
            <div className="fade">
              {/* Mode toggle */}
              <div style={{ display:'flex', gap:0, marginBottom:20, background:'#0f172a', borderRadius:8, padding:4, border:'1px solid #1e293b', width:'fit-content' }}>
                <button
                  onClick={() => setRankingMode('serp')}
                  style={{ padding:'8px 20px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, transition:'all 0.2s',
                    background: rankingMode === 'serp' ? p : 'transparent',
                    color: rankingMode === 'serp' ? '#fff' : '#475569' }}>
                  🔍 SERP Rankings
                </button>
                <button
                  onClick={() => setRankingMode('ai')}
                  style={{ padding:'8px 20px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, transition:'all 0.2s',
                    background: rankingMode === 'ai' ? p : 'transparent',
                    color: rankingMode === 'ai' ? '#fff' : '#475569' }}>
                  🤖 AI Engine Review
                </button>
              </div>

              {/* ── SERP MODE ── */}
              {rankingMode === 'serp' && (
              <div>
              <div className="card" style={{ marginBottom:20 }}>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>🔍 Live Google Rankings</div>
                <div style={{ fontSize:12, color:'#475569', marginBottom:16 }}>
                  Check real-time Google results for any keyword. See where your brand ranks and what competitors we're displacing.
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <input
                    className="inp"
                    placeholder='Enter keyword e.g. "eToro review 2026"'
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkRankings(keyword)}
                  />
                  <button className="btn btn-primary" onClick={() => checkRankings(keyword)} disabled={serpLoading || !keyword.trim()} style={{ whiteSpace:'nowrap' }}>
                    {serpLoading ? <span className="spin">⟳</span> : '🔍'} {serpLoading ? 'Checking…' : 'Check Now'}
                  </button>
                </div>
                <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:11, color:'#475569' }}>Quick check:</span>
                  {savedKeywords.map(kw => (
                    <button key={kw} className="btn btn-ghost" style={{ fontSize:11, padding:'4px 10px' }}
                      onClick={() => { setKeyword(kw); checkRankings(kw) }}>
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              {serpLoading && (
                <div className="card" style={{ textAlign:'center', padding:40 }}>
                  <span className="spin" style={{ display:'inline-block', fontSize:28, color:p }}>⟳</span>
                  <div style={{ marginTop:12, color:'#64748b' }}>Searching Google for <strong style={{color:'#f1f5f9'}}>"{keyword}"</strong>…</div>
                  <div style={{ fontSize:11, color:'#334155', marginTop:4 }}>Live search takes 5–15 seconds</div>
                </div>
              )}

              {serpError && (
                <div className="card" style={{ background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.2)', color:'#fca5a5' }}>
                  Error: {serpError}
                </div>
              )}

              {serpResults && (
                <div className="fade">
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
                    <div className="kpi">
                      <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Your Portals Found</div>
                      <div style={{ fontSize:36, fontWeight:900, color:'#10b981' }}>{serpResults.results?.filter((r: any) => r.isOurs).length || 0}</div>
                      <div style={{ fontSize:11, color:'#475569' }}>in top 10 results</div>
                    </div>
                    <div className="kpi">
                      <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Competitors Found</div>
                      <div style={{ fontSize:36, fontWeight:900, color:'#f59e0b' }}>{serpResults.results?.filter((r: any) => !r.isOurs).length || 0}</div>
                      <div style={{ fontSize:11, color:'#475569' }}>other domains</div>
                    </div>
                    <div className="kpi">
                      <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Checked At</div>
                      <div style={{ fontSize:16, fontWeight:700, color:'#f1f5f9', marginTop:4 }}>{new Date(serpResults.checkedAt).toLocaleTimeString()}</div>
                      <div style={{ fontSize:11, color:'#475569' }}>live result</div>
                    </div>
                  </div>
                  <div className="card">
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      Results for &quot;{serpResults.keyword}&quot;
                      <button className="btn btn-ghost" style={{fontSize:11,padding:'5px 10px'}} onClick={() => checkRankings(serpResults.keyword)}>⟳ Re-check</button>
                    </div>
                    <table>
                      <thead><tr><th style={{width:40}}>#</th><th>Title</th><th>Domain</th><th>Status</th></tr></thead>
                      <tbody>
                        {(serpResults.results || []).map((r: any, i: number) => (
                          <tr key={i} style={{ background: r.isOurs ? 'rgba(16,185,129,0.05)' : 'transparent' }}>
                            <td style={{ fontWeight:700, color: r.isOurs ? '#10b981' : '#475569' }}>{r.position || i+1}</td>
                            <td>
                              <a href={r.url} target="_blank" rel="noopener" style={{ color: r.isOurs ? '#6ee7b7' : '#e2e8f0', fontWeight: r.isOurs ? 600 : 400, fontSize:13 }}>{r.title}</a>
                              {r.snippet && <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>{r.snippet?.slice(0,100)}…</div>}
                            </td>
                            <td style={{ fontSize:12, color:'#64748b' }}>{r.domain || '—'}</td>
                            <td>
                              {r.isOurs
                                ? <span className="tag" style={{ background:'rgba(16,185,129,0.15)', color:'#10b981' }}>✓ Our Portal</span>
                                : <span className="tag" style={{ background:'rgba(100,116,139,0.15)', color:'#64748b' }}>Competitor</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </div>
              )}

              {/* ── AI REVIEW MODE ── */}
              {rankingMode === 'ai' && (
              <div>
                <div className="card" style={{ marginBottom:20 }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>🤖 AI Engine Review</div>
                  <div style={{ fontSize:12, color:'#475569', marginBottom:16 }}>
                    Ask how AI engines (Claude, ChatGPT, Perplexity, Gemini) answer questions about your brand. Simulates GEO — Generative Engine Optimization.
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <input
                      className="inp"
                      placeholder='e.g. "What is eToro?" or "Best trading platforms 2025"'
                      value={aiQuestion}
                      onChange={e => setAiQuestion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkAiReview(aiQuestion)}
                    />
                    <button className="btn btn-primary" onClick={() => checkAiReview(aiQuestion)} disabled={aiLoading || !aiQuestion.trim()} style={{ whiteSpace:'nowrap' }}>
                      {aiLoading ? <span className="spin">⟳</span> : '🤖'} {aiLoading ? 'Asking AI…' : 'Ask AI'}
                    </button>
                  </div>
                  <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, color:'#475569' }}>Quick questions:</span>
                    {savedQuestions.map(q => (
                      <button key={q} className="btn btn-ghost" style={{ fontSize:11, padding:'4px 10px' }}
                        onClick={() => { setAiQuestion(q); checkAiReview(q) }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {aiLoading && (
                  <div className="card" style={{ textAlign:'center', padding:40 }}>
                    <span className="spin" style={{ display:'inline-block', fontSize:28, color:p }}>⟳</span>
                    <div style={{ marginTop:12, color:'#64748b' }}>Asking 4 AI engines: <strong style={{color:'#f1f5f9'}}>"{aiQuestion}"</strong></div>
                    <div style={{ fontSize:11, color:'#334155', marginTop:4 }}>Querying Claude, ChatGPT, Perplexity, Gemini…</div>
                  </div>
                )}

                {aiError && (
                  <div className="card" style={{ background:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.2)', color:'#fca5a5' }}>
                    Error: {aiError}
                  </div>
                )}

                {aiResults && (
                  <div className="fade">
                    {/* Summary KPIs */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
                      <div className="kpi">
                        <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Brand Mentioned</div>
                        <div style={{ fontSize:36, fontWeight:900, color: aiResults.summary.mentionRate >= 50 ? '#10b981' : '#f59e0b' }}>
                          {aiResults.summary.mentionClient}/{aiResults.summary.enginesChecked}
                        </div>
                        <div style={{ fontSize:11, color:'#475569' }}>engines mention eToro</div>
                      </div>
                      <div className="kpi" style={{ borderColor: aiResults.summary.ourPortalsCited > 0 ? 'rgba(16,185,129,0.4)' : undefined }}>
                        <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Our Portals Cited</div>
                        <div style={{ fontSize:36, fontWeight:900, color: aiResults.summary.ourPortalsCited > 0 ? '#10b981' : '#f59e0b' }}>
                          {aiResults.summary.ourPortalsCited}
                        </div>
                        <div style={{ fontSize:11, color:'#475569' }}>links to our sites found</div>
                      </div>
                      <div className="kpi">
                        <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Total Sources</div>
                        <div style={{ fontSize:36, fontWeight:900, color:'#f1f5f9' }}>
                          {aiResults.summary.totalCitations}
                        </div>
                        <div style={{ fontSize:11, color:'#475569' }}>URLs cited across engines</div>
                      </div>
                      <div className="kpi">
                        <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Checked At</div>
                        <div style={{ fontSize:16, fontWeight:700, color:'#f1f5f9', marginTop:4 }}>{new Date(aiResults.checkedAt).toLocaleTimeString()}</div>
                        <div style={{ fontSize:11, color:'#475569' }}>live query</div>
                      </div>
                    </div>

                    {/* AI Engine Cards */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      {aiResults.results.map((r: any) => (
                        <div key={r.engine} className="card" style={{
                          borderColor: r.mentionsOurPortals ? 'rgba(16,185,129,0.5)' : r.mentionsClient ? 'rgba(14,165,233,0.3)' : r.needsKey ? '#1e293b' : '#1e293b',
                          opacity: r.needsKey ? 0.6 : 1
                        }}>
                          {/* Card header */}
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <span style={{ fontSize:18 }}>{r.icon}</span>
                              <div>
                                <div style={{ fontWeight:700, fontSize:13 }}>{r.name}</div>
                                {r.real && <div style={{ fontSize:10, color:'#10b981' }}>● Live data</div>}
                                {r.needsKey && <div style={{ fontSize:10, color:'#f59e0b' }}>⚠ API key needed</div>}
                              </div>
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
                              {r.mentionsOurPortals && (
                                <span className="tag" style={{ background:'rgba(16,185,129,0.2)', color:'#10b981', fontWeight:700 }}>✓ Cites our portal</span>
                              )}
                              {r.mentionsClient && !r.mentionsOurPortals && (
                                <span className="tag" style={{ background:'rgba(14,165,233,0.15)', color:'#38bdf8' }}>✓ Mentions eToro</span>
                              )}
                              {r.answer && !r.mentionsClient && (
                                <span className="tag" style={{ background:'rgba(100,116,139,0.15)', color:'#64748b' }}>No mention</span>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          {r.needsKey ? (
                            <div style={{ fontSize:12, color:'#475569', lineHeight:1.6, padding:'8px 0' }}>
                              Connect {r.name.split(' ')[0]} API key in environment variables to see real answers from this engine.
                            </div>
                          ) : r.error ? (
                            <div style={{ fontSize:12, color:'#ef4444' }}>Error: {r.error}</div>
                          ) : (
                            <>
                              <div style={{ fontSize:13, color:'#cbd5e1', lineHeight:1.7, marginBottom:12, maxHeight:200, overflowY:'auto' }}>
                                {r.answer}
                              </div>

                              {/* Citations / Sources */}
                              {r.citations && r.citations.length > 0 && (
                                <div style={{ borderTop:'1px solid #1e293b', paddingTop:10 }}>
                                  <div style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>
                                    Sources ({r.citations.length})
                                  </div>
                                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                                    {r.citations.slice(0, 6).map((url: string, i: number) => {
                                      const isOurs = r.ourCitations?.includes(url)
                                      let domain = url
                                      try { domain = new URL(url).hostname.replace('www.','') } catch {}
                                      return (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                          style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color: isOurs ? '#10b981' : '#64748b',
                                            background: isOurs ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                                            padding:'4px 8px', borderRadius:4, border: isOurs ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                                            textDecoration:'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                          {isOurs ? '✓ ' : '↗ '}{domain}
                                        </a>
                                      )
                                    })}
                                    {r.citations.length > 6 && (
                                      <div style={{ fontSize:10, color:'#334155' }}>+{r.citations.length - 6} more sources</div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* No citations found */}
                              {(!r.citations || r.citations.length === 0) && r.answer && (
                                <div style={{ borderTop:'1px solid #1e293b', paddingTop:8, fontSize:11, color:'#334155' }}>
                                  No source links found in this response
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop:12, display:'flex', justifyContent:'flex-end' }}>
                      <button className="btn btn-ghost" style={{fontSize:11,padding:'5px 10px'}} onClick={() => checkAiReview(aiResults.question)}>
                        ⟳ Re-ask
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )}

            </div>
          )}

          {/* ═══ BACKLINKS ═══ */}
          {tab === 'backlinks' && (
            <div className="fade">
              {loadingBacklinks && (
                <div style={{ textAlign:'center', padding:40, color:'#475569' }}>
                  <span className="spin" style={{ display:'inline-block', fontSize:24 }}>⟳</span>
                  <div style={{ marginTop:8 }}>Loading backlink data…</div>
                </div>
              )}
              {backlinksData && (
                <div>
                  {/* KPIs */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
                    {[
                      { label:'Total Backlinks', value: backlinksData.total, icon:'🔗', color:'#0ea5e9', sub:'mentions + links' },
                      { label:'Dofollow Links', value: backlinksData.dofollow, icon:'✅', color:'#10b981', sub:'direct href links' },
                      { label:'Brand Mentions', value: backlinksData.mentions, icon:'💬', color:'#8b5cf6', sub:'text references' },
                      { label:'Portals Linking', value: backlinksData.portals, icon:'🌐', color:'#f59e0b', sub:'active portals' },
                    ].map(k => (
                      <div key={k.label} className="kpi">
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                          <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em' }}>{k.label}</div>
                          <span style={{ fontSize:16 }}>{k.icon}</span>
                        </div>
                        <div style={{ fontSize:36, fontWeight:900, color:k.color, lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:11, color:'#475569', marginTop:6 }}>{k.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* By portal + daily trend */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:20, marginBottom:20 }}>
                    <div className="card">
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Links by Portal</div>
                      {backlinksData.byPortal?.map((b: any) => {
                        const port = PORTALS.find(p2 => p2.name === b.portal)
                        const max = backlinksData.byPortal?.[0]?.count || 1
                        return (
                          <div key={b.portal} style={{ marginBottom:10 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                              <span style={{ fontSize:12, color:'#94a3b8' }}>{b.portal}</span>
                              <span style={{ fontSize:12, fontWeight:700, color:port?.color || p }}>{b.count}</span>
                            </div>
                            <div className="bar">
                              <div className="bar-fill" style={{ width:`${(b.count/max)*100}%`, background:port?.color || p }}/>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Daily trend */}
                    <div className="card">
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Backlink Velocity (90 days)</div>
                      {backlinksData.daily?.length > 0 ? (
                        <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:80 }}>
                          {backlinksData.daily.slice(-45).map((d: any) => {
                            const max = Math.max(...backlinksData.daily.map((x: any) => x.count), 1)
                            return (
                              <div key={d.date} style={{ flex:1 }}>
                                <div title={`${d.date}: ${d.count} links`}
                                  style={{ width:'100%', height:`${Math.max(4,(d.count/max)*72)}px`, background:p, borderRadius:'2px 2px 0 0', opacity:.8 }}/>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={{ color:'#334155', fontSize:12 }}>No data yet — backlinks will appear as articles are published</div>
                      )}
                    </div>
                  </div>

                  {/* Filter + table */}
                  <div className="card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                      <div style={{ fontWeight:700, fontSize:14 }}>All Brand Backlinks</div>
                      <div style={{ display:'flex', gap:8 }}>
                        {(['all','dofollow','mention'] as const).map(f => (
                          <button key={f} className={`btn ${blFilter===f?'btn-primary':'btn-ghost'}`}
                            style={{ fontSize:11, padding:'5px 12px', textTransform:'capitalize' }}
                            onClick={() => setBlFilter(f)}>
                            {f === 'all' ? `All (${backlinksData.total})` : f === 'dofollow' ? `✅ Dofollow (${backlinksData.dofollow})` : `💬 Mentions (${backlinksData.mentions})`}
                          </button>
                        ))}
                        <button className="btn btn-ghost" style={{fontSize:11,padding:'5px 10px'}} onClick={loadBacklinks}>⟳</button>
                      </div>
                    </div>
                    <div style={{ overflowX:'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Article</th>
                            <th>Portal</th>
                            <th>Type</th>
                            <th>Context / Anchor</th>
                            <th>Published</th>
                            <th style={{textAlign:'right'}}>Views</th>
                            <th>Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(backlinksData.backlinks || [])
                            .filter((b: any) => blFilter === 'all' || b.linkType === blFilter)
                            .slice(0, 50)
                            .map((b: any, i: number) => {
                              const port = PORTALS.find(p2 => p2.name === b.portal)
                              return (
                                <tr key={i} style={{ background: b.linkType === 'dofollow' ? 'rgba(16,185,129,0.04)' : 'transparent' }}>
                                  <td style={{ maxWidth:240 }}>
                                    <div style={{ fontSize:12, fontWeight:500, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                      {b.title}
                                    </div>
                                  </td>
                                  <td>
                                    <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, background:`${port?.color || '#475569'}20`, color:port?.color || '#94a3b8' }}>
                                      {b.portal}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="tag" style={{
                                      background: b.linkType === 'dofollow' ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)',
                                      color: b.linkType === 'dofollow' ? '#10b981' : '#a78bfa'
                                    }}>
                                      {b.linkType === 'dofollow' ? '🔗 Dofollow' : '💬 Mention'}
                                    </span>
                                  </td>
                                  <td style={{ maxWidth:180 }}>
                                    <div style={{ fontSize:11, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                      …{b.anchorText}…
                                    </div>
                                  </td>
                                  <td style={{ color:'#64748b', fontSize:12, whiteSpace:'nowrap' }}>
                                    {new Date(b.publishedAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
                                  </td>
                                  <td style={{ textAlign:'right', fontWeight:700, color:'#38bdf8' }}>{b.views}</td>
                                  <td>
                                    <a href={b.articleUrl} target="_blank" rel="noopener" style={{ fontSize:11, color:p, fontWeight:600 }}>↗</a>
                                  </td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ COVERAGE ═══ */}
          {tab === 'coverage' && (
            <div className="fade">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {PORTALS.map(port => {
                  const articles = content.filter((c: any) => c.portal_name === port.name)
                  const latest = articles[0]
                  return (
                    <div key={port.slug} className="card" style={{ border:`1px solid ${port.color}20`, position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, background:`${port.color}08`, borderRadius:'50%', filter:'blur(20px)' }}/>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                        <div style={{ width:36, height:36, borderRadius:8, background:`${port.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:port.color }}>
                          {port.name.slice(0,2).toUpperCase()}
                        </div>
                        <span className="tag" style={{ background: articles.length > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.1)', color: articles.length > 0 ? '#10b981' : '#475569' }}>
                          {articles.length > 0 ? '✓ Active' : 'Pending'}
                        </span>
                      </div>
                      <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9', marginBottom:2 }}>{port.name}</div>
                      <div style={{ fontSize:11, color:'#475569', marginBottom:12 }}>{port.domain}</div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:10 }}>
                        <span style={{ color:'#64748b' }}>Articles published</span>
                        <span style={{ fontWeight:700, color:port.color }}>{articles.length}</span>
                      </div>
                      {latest && (
                        <div style={{ fontSize:11, color:'#475569', marginBottom:12 }}>
                          Last: {timeAgo(latest.published_at)}
                        </div>
                      )}
                      <a href={`https://${port.domain}`} target="_blank" rel="noopener">
                        <button className="btn btn-ghost" style={{ fontSize:11, padding:'6px 12px', width:'100%', justifyContent:'center' }}>
                          🌐 Visit Portal ↗
                        </button>
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ REVIEWS ═══ */}
          {tab === 'reviews' && (
            <div className="fade">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                {[
                  { label:'Avg Rating', value: avgRating, icon:'⭐' },
                  { label:'Total Reviews', value: reviews.length, icon:'💬' },
                  { label:'Positive (4★+)', value: reviews.filter((r: any) => r.rating >= 4).length, icon:'✅' },
                ].map(k => (
                  <div key={k.label} className="kpi">
                    <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>{k.label}</div>
                    <div style={{ fontSize:36, fontWeight:900, color:p }}>{k.icon} {k.value}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Verivex Trust Reviews</div>
                {reviews.slice(0,20).map((r: any, i: number) => (
                  <div key={i} style={{ padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontWeight:600, fontSize:13 }}>{r.reviewer_name || 'Anonymous'}</span>
                      <div style={{ display:'flex', gap:2 }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : '#1e293b', fontSize:14 }}>★</span>)}
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:'#94a3b8', lineHeight:1.6 }}>{r.review_text}</div>
                    <div style={{ fontSize:10, color:'#334155', marginTop:4 }}>{timeAgo(r.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
