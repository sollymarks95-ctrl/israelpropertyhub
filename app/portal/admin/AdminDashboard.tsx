'use client'
import VideoStudio from './VideoStudio'
import CostTracker from './CostTracker'
import React, { useState, useEffect, useCallback } from 'react'

const PORTAL_COLORS: Record<string,string> = {
  'global-trade-wire':'#E03131','finance-terminal':'#1971C2','business-pulse':'#6741D9',
  'gold-markets-today':'#B08700','trust-score':'#0CA678','invest-data':'#0EA5E9',
  'market-radar':'#A21CAF','executive-network':'#DC2626','crypto-hub':'#F97316',
}
const PORTAL_DOMAIN: Record<string,string> = {
  'global-trade-wire':'nex-wire.com','finance-terminal':'finvexx.com','business-pulse':'bizplezx.com',
  'gold-markets-today':'aurexhq.com','trust-score':'verivex.co','invest-data':'invexhuby.com',
  'market-radar':'signalixx.com','executive-network':'execvex.com','crypto-hub':'cryptoxos.com',
}
const PORTAL_NAMES: Record<string,string> = {
  'global-trade-wire':'Nex-Wire','finance-terminal':'Finvexx','business-pulse':'Bizplezx',
  'gold-markets-today':'AurexHQ','trust-score':'Verivex','invest-data':'InvexHuby',
  'market-radar':'Signalixx','executive-network':'ExecVex','crypto-hub':'CryptoXos',
}
const PODCAST_CFG: Record<string,{show:string;host:string;role:string}> = {
  'global-trade-wire':{show:'Nex-Wire Intelligence',host:'James Hart',role:'Senior Markets Editor'},
  'finance-terminal':{show:'Finvexx Markets',host:'Marcus Webb',role:'Chief Markets Analyst'},
  'business-pulse':{show:'Bizplezx Executive',host:'Daniel Sterling',role:'Editorial Director'},
  'gold-markets-today':{show:'AurexHQ Commodities',host:'Richard Stone',role:'Head of Commodities'},
  'trust-score':{show:'Verivex Verified',host:'Nathan Chen',role:'Head of Research'},
  'invest-data':{show:'InvexHuby Insights',host:'Michael Torres',role:'Chief Investment Strategist'},
  'market-radar':{show:'Signalixx Radar',host:'Jordan Blake',role:'Lead Signals Analyst'},
  'executive-network':{show:'ExecVex Leadership',host:'Alexander Ross',role:'Executive Editor'},
  'crypto-hub':{show:'CryptoXos',host:'Alex Rivera',role:'Crypto Analyst'},
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return `${s}s`; if (s < 3600) return `${Math.floor(s/60)}m`
  if (s < 86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`
}

function Spinner() {
  return <span style={{display:'inline-block',width:13,height:13,border:'2px solid rgba(255,255,255,0.2)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
}

function KPI({icon,value,label,color,sub}:{icon:string;value:any;label:string;color:string;sub?:string}) {
  return (
    <div className="card" style={{padding:'18px 20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <span style={{fontSize:22}}>{icon}</span>
        <div style={{width:7,height:7,borderRadius:'50%',background:color,animation:'pulse 2s ease-in-out infinite',marginTop:5}}/>
      </div>
      <div className="syne" style={{fontSize:30,fontWeight:900,color,lineHeight:1,marginBottom:3}}>{value}</div>
      <div style={{fontSize:12,color:'#94A3B8'}}>{label}</div>
      {sub && <div style={{fontSize:11,color:'#475569',marginTop:3}}>{sub}</div>}
    </div>
  )
}

// Inline editable field — click pencil to edit, enter/blur to save
function EditableField({ clientId, field, value, label, type='text', options=[] }:
  { clientId:string; field:string; value:any; label:string; type?:string; options?:string[] }) {
  const [editing, setEditing] = React.useState(false)
  const [val, setVal] = React.useState(value??'')
  const [saving, setSaving] = React.useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/update-client', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ id: clientId, field, value: type==='number' ? parseFloat(val)||0 : val })
      })
    } finally { setSaving(false); setEditing(false) }
  }

  if (editing) return (
    <div style={{display:'flex',gap:4,alignItems:'center',flex:1}}>
      {options.length>0 ? (
        <select value={val} onChange={(e:any)=>setVal(e.target.value)} onBlur={save} autoFocus
          style={{flex:1,padding:'2px 6px',background:'#1e293b',border:'1px solid #6366f1',color:'#f1f5f9',borderRadius:4,fontSize:12}}>
          {options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={val} autoFocus
          onChange={(e:any)=>setVal(e.target.value)}
          onBlur={save}
          onKeyDown={(e:any)=>{if(e.key==='Enter')save();if(e.key==='Escape')setEditing(false)}}
          style={{flex:1,padding:'2px 8px',background:'#1e293b',border:'1px solid #6366f1',color:'#f1f5f9',borderRadius:4,fontSize:12,outline:'none'}}/>
      )}
      <button onClick={save} disabled={saving} style={{background:'#10b981',border:'none',color:'#fff',padding:'2px 8px',borderRadius:4,fontSize:11,cursor:'pointer',flexShrink:0}}>
        {saving?'…':'✓'}
      </button>
    </div>
  )

  return (
    <span style={{display:'flex',alignItems:'center',gap:4,flex:1,minWidth:0,cursor:'pointer',color:'#cbd5e1'}}
      onClick={()=>setEditing(true)}
      title={`Click to edit ${label}`}>
      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{val||<span style={{color:'#334155',fontStyle:'italic'}}>—</span>}</span>
      <span style={{color:'#334155',fontSize:10,flexShrink:0,opacity:.6,marginLeft:2}}>✏️</span>
    </span>
  )
}

function PodcastLibraryCard({ ep, clients, onStatusChange }: any) {
  const [status, setStatus] = React.useState(ep.status || 'draft')
  const [loading, setLoading] = React.useState(false)
  const [deleted, setDeleted] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [audioUrl, setAudioUrl] = React.useState(ep.audio_url || ep.mp3_url || '')
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const SLUG_DOMAIN: Record<string,string> = {
    'global-trade-wire':'nex-wire.com','finance-terminal':'finvexx.com',
    'business-pulse':'bizplezx.com','gold-markets-today':'aurexhq.com',
    'trust-score':'verivex.co','invest-data':'invexhuby.com',
    'market-radar':'signalixx.com','executive-network':'execvex.com','crypto-hub':'cryptoxos.com',
  }

  const manage = async (action: 'publish'|'unpublish'|'delete') => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/manage-podcast', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id: ep.id, action })
      })
      const d = await r.json()
      if (d.ok) {
        if (action === 'delete') setDeleted(true)
        else setStatus(d.status)
        onStatusChange?.(ep.id, d.status)
      }
    } finally { setLoading(false) }
  }

  const generateAudio = async () => {
    setGenerating(true)
    const cfg = PODCAST_CFG[ep.site_slug] || { show: ep.site_slug, host: ep.host_name || 'Host', role: 'Host' }
    try {
      const r = await fetch('/api/admin/generate-podcast', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          clientId: ep.client_id, siteSlug: ep.site_slug,
          hostName: ep.host_name, guestName: ep.guest_name,
          guestRole: ep.guest_role, topic: ep.topic,
          title: ep.title, episodeNumber: ep.episode_number || 1,
          durationMinutes: ep.duration_minutes || 8,
        })
      })
      const d = await r.json()
      if (d.ok && d.audioUrl) setAudioUrl(d.audioUrl)
    } finally { setGenerating(false) }
  }

  if (deleted) return null

  const cl = clients.find((c:any) => c.id === ep.client_id)
  const domain = SLUG_DOMAIN[ep.site_slug] || ep.site_slug
  const isPublished = status === 'published'

  return (
    <div style={{
      background:'rgba(255,255,255,0.02)',border:'1px solid',
      borderColor:isPublished?'rgba(16,185,129,0.2)':'rgba(255,255,255,0.06)',
      borderLeft:`3px solid ${isPublished?'#10b981':'#475569'}`,
      borderRadius:9,padding:14,
    }}>
      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
        {/* EP number badge */}
        <div style={{background:isPublished?'rgba(16,185,129,0.15)':'rgba(71,85,105,0.2)',border:`1px solid ${isPublished?'rgba(16,185,129,0.3)':'rgba(71,85,105,0.3)'}`,borderRadius:6,padding:'4px 8px',textAlign:'center',flexShrink:0,minWidth:42}}>
          <div style={{fontSize:8,fontWeight:700,color:isPublished?'#10b981':'#475569',letterSpacing:'.08em'}}>EP</div>
          <div style={{fontSize:18,fontWeight:900,color:isPublished?'#10b981':'#64748b',lineHeight:1}}>{ep.episode_number||1}</div>
        </div>

        {/* Main info */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:400}}>{ep.title||'Untitled'}</div>
            <span style={{fontSize:10,padding:'2px 7px',borderRadius:99,fontWeight:700,background:isPublished?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)',color:isPublished?'#10b981':'#f59e0b',flexShrink:0}}>
              {isPublished?'● Published':'○ Draft'}
            </span>
          </div>
          <div style={{display:'flex',gap:12,fontSize:11,color:'#64748b',flexWrap:'wrap',marginBottom:8}}>
            {ep.guest_name&&<span>👤 {ep.guest_name}{ep.guest_role?` — ${ep.guest_role}`:''}</span>}
            <span>🌐 {domain}</span>
            {cl&&<span style={{color:'#6366f1',fontWeight:600}}>🏢 {cl.company_name}</span>}
            <span>⏱ {ep.duration_minutes||8} min</span>
            {ep.word_count&&<span>📝 {ep.word_count} words</span>}
            <span style={{color:'#64748b'}}>📅 Published {ep.created_at ? new Date(ep.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'}</span>
          </div>

          {/* Audio player or generate button */}
          {audioUrl ? (
            <audio controls src={audioUrl} style={{width:'100%',maxWidth:500,height:28}} preload="none"/>
          ) : (
            <button onClick={generateAudio} disabled={generating}
              style={{padding:'6px 14px',background:generating?'#1e293b':'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:6,color:generating?'#475569':'#818cf8',fontWeight:600,fontSize:11,cursor:generating?'default':'pointer',display:'inline-flex',alignItems:'center',gap:6}}>
              {generating?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⏳</span> Generating…</>:<>🎙 Generate Audio</>}
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
          {isPublished ? (
            <button onClick={()=>manage('unpublish')} disabled={loading}
              style={{padding:'5px 12px',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:6,color:'#f59e0b',fontWeight:600,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>
              {loading?'…':'○ Unpublish'}
            </button>
          ) : (
            <button onClick={()=>manage('publish')} disabled={loading}
              style={{padding:'5px 12px',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:6,color:'#10b981',fontWeight:700,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>
              {loading?'…':'● Publish'}
            </button>
          )}
          {isPublished&&domain&&(
            <a href={`https://${domain}/podcasts`} target="_blank" rel="noopener noreferrer">
              <button style={{width:'100%',padding:'5px 12px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:6,color:'#818cf8',fontWeight:600,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>View ↗</button>
            </a>
          )}
          {confirmDelete ? (
            <div style={{display:'flex',gap:4,flexDirection:'column'}}>
              <div style={{fontSize:10,color:'#ef4444',textAlign:'center',fontWeight:600}}>Sure?</div>
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>manage('delete')} disabled={loading}
                  style={{flex:1,padding:'4px 8px',background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:5,color:'#ef4444',fontWeight:700,fontSize:11,cursor:'pointer'}}>
                  {loading?'…':'Yes, delete'}
                </button>
                <button onClick={()=>setConfirmDelete(false)}
                  style={{flex:1,padding:'4px 8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:5,color:'#64748b',fontSize:11,cursor:'pointer'}}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setConfirmDelete(true)} disabled={loading}
              style={{padding:'5px 12px',background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:6,color:'#ef4444',fontWeight:600,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EpisodeCard({ep, cfg}: {ep:any; cfg:{show:string;host:string;role:string}}) {
  const [gen, setGen] = useState(false)
  const [res, setRes] = useState<any>(null)
  const [slug, setSlug] = useState(ep.site_slug || 'trust-score')

  const generate = async () => {
    setGen(true); setRes(null)
    try {
      const r = await fetch('/api/admin/generate-podcast', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          clientId: ep.client_id||'a1b2c3d4-0000-0000-0000-000000000001',
          siteSlug: slug, hostName: cfg.host,
          guestName: ep.guest_name, guestRole: ep.guest_role,
          topic: ep.topic, title: ep.title,
          episodeNumber: ep.episode_number||1,
          durationMinutes: Math.min(ep.duration_minutes||5, 8),
        })
      })
      const d = await r.json()
      setRes(d.ok ? {ok:true,url:d.audioUrl,words:d.words} : {ok:false,err:d.error||'Failed'})
    } catch(e:any){setRes({ok:false,err:e.message})} finally{setGen(false)}
  }

  const audio = res?.url || ep.audio_url || ep.mp3_url
  return (
    <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:9,padding:14}}>
      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <div style={{background:'rgba(99,102,241,.2)',border:'1px solid rgba(99,102,241,.35)',borderRadius:6,padding:'3px 8px',flexShrink:0,textAlign:'center'}}>
          <div style={{fontSize:8,fontWeight:700,color:'#818cf8',letterSpacing:'.08em'}}>EP</div>
          <div style={{fontSize:17,fontWeight:900,color:'#818cf8',lineHeight:1}}>{ep.episode_number||1}</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:'#f1f5f9',lineHeight:1.3,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ep.title||'Episode'}</div>
          <div style={{fontSize:10,color:'#64748b'}}>{ep.guest_name||'Guest'}{ep.guest_role?` · ${ep.guest_role}`:''}</div>
        </div>
      </div>
      {audio ? (
        <div>
          {res?.ok && <div style={{fontSize:10,color:'#10b981',marginBottom:4,fontWeight:700}}>✅ Generated — {res.words} words</div>}
          <audio controls src={audio} style={{width:'100%',height:26}} preload="none"/>
        </div>
      ) : (
        <div>
          {res?.err && <div style={{fontSize:10,color:'#ef4444',marginBottom:4}}>❌ {res.err}</div>}
          <select value={slug} onChange={(e:any)=>setSlug(e.target.value)}
            style={{width:'100%',padding:'4px 8px',background:'#1e293b',border:'1px solid #334155',color:'#94a3b8',borderRadius:5,fontSize:11,marginBottom:6}}>
            {Object.entries(PORTAL_DOMAIN).map(([s,d])=><option key={s} value={s}>{d}</option>)}
          </select>
          <button onClick={generate} disabled={gen}
            style={{width:'100%',padding:'7px',background:gen?'#1e293b':'linear-gradient(135deg,#6366f1,#4f46e5)',border:gen?'1px solid #334155':'none',borderRadius:6,color:gen?'#475569':'#fff',fontWeight:700,fontSize:11,cursor:gen?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            {gen?<><Spinner/> Generating audio…</>:<>🎙 Generate Audio</>}
          </button>
        </div>
      )}
      <div style={{fontSize:9,color:'#334155',display:'flex',justifyContent:'space-between',marginTop:6}}>
        <span>⏱ {ep.duration_minutes||20} min</span>
        <span>{(ep.created_at||'').slice(0,10)}</span>
      </div>
    </div>
  )
}

// Floating topup logger — always visible in admin so you never forget to log
function FloatingTopupButton() {
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState('5')
  const [desc, setDesc] = React.useState('')
  const [saved, setSaved] = React.useState(false)

  async function logTopup(amt: number, label: string) {
    await fetch('/api/admin/costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        category: 'claude',
        description: label || `claude.ai topup $${amt}`,
        amount_usd: amt,
        billing_type: 'one_time',
        notes: 'Logged via floating topup button',
      }),
    })
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false); setDesc('') }, 1500)
  }

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)}
        style={{ position:'fixed', bottom:24, right:24, zIndex:9999,
          width:52, height:52, borderRadius:26, border:'none', cursor:'pointer',
          background:'linear-gradient(135deg,#A78BFA,#7C3AED)',
          boxShadow:'0 4px 20px rgba(167,139,250,0.5)',
          fontSize:22, display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform .2s', transform: open ? 'rotate(45deg)' : 'none' }}>
        💳
      </button>

      {/* Topup modal */}
      {open && (
        <div style={{ position:'fixed', bottom:84, right:24, zIndex:9999,
          background:'#0F172A', border:'1px solid rgba(167,139,250,0.4)',
          borderRadius:16, padding:20, width:280, boxShadow:'0 8px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ fontSize:14, fontWeight:800, color:'#F1F5F9', marginBottom:4 }}>💳 Log Claude Topup</div>
          <div style={{ fontSize:11, color:'#64748b', marginBottom:14 }}>Just topped up claude.ai? Log it now.</div>
          
          {saved ? (
            <div style={{ textAlign:'center', padding:'16px 0', color:'#10B981', fontWeight:800, fontSize:16 }}>✅ Logged!</div>
          ) : (
            <>
              {/* Quick amounts */}
              <div style={{ display:'flex', gap:6, marginBottom:12 }}>
                {['5','10','20','50'].map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    style={{ flex:1, padding:'7px 0', borderRadius:8, border:`1px solid ${amount===a?'#A78BFA':'rgba(255,255,255,0.08)'}`,
                      background: amount===a?'#A78BFA22':'rgba(255,255,255,0.03)',
                      color: amount===a?'#A78BFA':'#94A3B8', fontWeight:800, fontSize:13, cursor:'pointer' }}>
                    ${a}
                  </button>
                ))}
              </div>
              <input value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="What were you building? (optional)"
                style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)',
                  background:'rgba(0,0,0,0.3)', color:'#F1F5F9', fontSize:12, marginBottom:10, boxSizing:'border-box' }} />
              <button onClick={() => logTopup(parseFloat(amount), desc || `claude.ai topup $${amount}`)}
                style={{ width:'100%', padding:'10px', borderRadius:8, border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg,#A78BFA,#7C3AED)', color:'#fff', fontWeight:800, fontSize:14 }}>
                Log ${amount} Topup
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}


function PortalsTab() {
  const [portals, setPortals] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState<'all'|'live'|'building'>('all')

  React.useEffect(() => {
    fetch('/api/admin/portal-stats')
      .then(r => r.json())
      .then(d => { setPortals(d.portals || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = portals.filter(p =>
    filter === 'all' ? true : filter === 'live' ? p.is_live : !p.is_live
  )
  const liveCount    = portals.filter(p => p.is_live).length
  const indexedCount = portals.filter(p => !p.noindex).length
  const buildingCount= portals.filter(p => p.noindex).length
  const totalToday   = portals.reduce((s, p) => s + (p.today||0), 0)
  const totalArticles= portals.reduce((s, p) => s + (p.total||0), 0)

  return (
    <div className="ti">
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div className="syne" style={{fontSize:20,fontWeight:900}}>🌐 Portal Network</div>
        <div style={{fontSize:12,color:'#475569'}}>{indexedCount} indexed · {buildingCount} building · {totalToday} articles today</div>
      </div>

      {/* Summary row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:12}}>
        {[
          {label:'Total Portals',  val:portals.length,        color:'#6366f1'},
          {label:'Publishing Today',val:portals.filter(p=>p.today>0).length, color:'#10b981'},
          {label:'Articles Today', val:totalToday,            color:'#38bdf8'},
          {label:'Total Articles', val:totalArticles.toLocaleString(), color:'#f59e0b'},
        ].map(s=>(
          <div key={s.label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'12px 14px',textAlign:'center'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Network content mix */}
      {(() => {
        const livePorts = portals.filter(p => p.today > 0 && p.content_mix)
        if (!livePorts.length) return null
        const totNews = livePorts.reduce((s,p)=>s+(p.content_mix?.pure_news||0),0)
        const totMent = livePorts.reduce((s,p)=>s+(p.content_mix?.brand_mentions||0),0)
        const totFeat = livePorts.reduce((s,p)=>s+(p.content_mix?.brand_features||0),0)
        const totAll  = totNews + totMent + totFeat || 1
        const brandPct= Math.round((totMent+totFeat)*100/totAll)
        return (
          <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:'12px 16px',marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'.08em'}}>
                Network Content Mix Today
              </span>
              <span style={{fontSize:11,fontWeight:900,color:brandPct<=10?'#10b981':'#ef4444'}}>
                {brandPct}% branded — target ≤7% {brandPct<=10?'✅':'⚠️'}
              </span>
            </div>
            <div style={{height:8,borderRadius:4,overflow:'hidden',display:'flex',marginBottom:8}}>
              <div style={{flex:totNews,background:'#1e293b'}}/>
              <div style={{flex:totMent,background:'#38bdf8'}}/>
              <div style={{flex:totFeat,background:'#f59e0b'}}/>
            </div>
            <div style={{display:'flex',gap:16,fontSize:10}}>
              <span style={{color:'#64748b'}}>📰 <strong style={{color:'#94A3B8'}}>{totNews}</strong> pure news</span>
              <span style={{color:'#38bdf8'}}>🏷 <strong>{totMent}</strong> brand mentions</span>
              <span style={{color:'#f59e0b'}}>⭐ <strong>{totFeat}</strong> brand features</span>
              <span style={{color:'#475569',marginLeft:'auto'}}>{totAll} articles total</span>
            </div>
          </div>
        )
      })()}

      {/* Filter */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {(['all','live','building'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{fontSize:11,padding:'4px 12px',borderRadius:6,border:'none',cursor:'pointer',fontWeight:700,
              background:filter===f?'#10b981':'rgba(255,255,255,0.06)',
              color:filter===f?'#fff':'#64748b',textTransform:'capitalize'}}>
            {f==='all'?`All (${portals.length})`:f==='live'?`Publishing (${liveCount})`:`Building (${buildingCount})`}
          </button>
        ))}
        <button onClick={()=>fetch('/api/admin/portal-stats').then(r=>r.json()).then(d=>setPortals(d.portals||[]))}
          style={{fontSize:11,padding:'4px 12px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',background:'transparent',color:'#64748b',marginLeft:'auto'}}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{color:'#64748b',fontSize:13,padding:20}}>Loading portal stats…</div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {filtered.sort((a,b)=>b.total-a.total).map((p:any)=>{
            const color = p.primary_color || '#6366f1'
            const isIndexed = !p.noindex
            return (
              <div key={p.id} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderLeft:`3px solid ${color}`,borderRadius:10,padding:14}}>
                {/* Header */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:13,color:'#F1F5F9'}}>{p.name}</div>
                    <div style={{fontSize:10,color:'#64748b',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.domain}</div>
                  </div>
                  <span style={{fontSize:9,padding:'2px 7px',borderRadius:99,fontWeight:700,flexShrink:0,marginLeft:6,
                    background:isIndexed?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)',
                    color:isIndexed?'#10b981':'#f59e0b'}}>
                    {isIndexed?'Indexed':'Building'}
                  </span>
                </div>

                {/* Article counts */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4,marginBottom:10}}>
                  {[
                    {label:'Today',    val:p.today||0,       color:p.today>0?color:'#475569'},
                    {label:'This week',val:p.week||0,        color:p.week>0?'#38bdf8':'#475569'},
                    {label:'Total',    val:p.total||0,       color:p.total>0?'#F1F5F9':'#475569'},
                  ].map(stat=>(
                    <div key={stat.label} style={{textAlign:'center',background:'rgba(0,0,0,0.2)',borderRadius:6,padding:'5px 4px'}}>
                      <div style={{fontSize:14,fontWeight:900,color:stat.color}}>{stat.val}</div>
                      <div style={{fontSize:9,color:'#475569'}}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Content mix */}
                {p.content_mix && p.today > 0 && (() => {
                  const cm = p.content_mix
                  const total = p.today || 1
                  const newsPct    = Math.round(cm.pure_news * 100 / total)
                  const mentPct    = Math.round(cm.brand_mentions * 100 / total)
                  const featPct    = Math.round(cm.brand_features * 100 / total)
                  const brandTotal = cm.brand_mentions + cm.brand_features
                  const isOk = cm.brand_pct <= 10
                  return (
                    <div style={{marginBottom:10}}>
                      {/* Bar */}
                      <div style={{height:6,borderRadius:3,overflow:'hidden',display:'flex',marginBottom:5}}>
                        <div style={{flex:newsPct,background:'#334155',minWidth:newsPct>0?2:0}}/>
                        <div style={{flex:mentPct,background:'#38bdf8',minWidth:mentPct>0?2:0}}/>
                        <div style={{flex:featPct,background:'#f59e0b',minWidth:featPct>0?2:0}}/>
                      </div>
                      {/* Legend */}
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        <span style={{fontSize:9,color:'#475569'}}>
                          <span style={{color:'#64748b'}}>■</span> {cm.pure_news} news
                        </span>
                        <span style={{fontSize:9,color:'#38bdf8'}}>
                          ■ {cm.brand_mentions} mentions
                        </span>
                        <span style={{fontSize:9,color:'#f59e0b'}}>
                          ■ {cm.brand_features} features
                        </span>
                        <span style={{fontSize:9,marginLeft:'auto',fontWeight:700,
                          color: isOk ? '#10b981' : '#ef4444'}}>
                          {cm.brand_pct}% branded {isOk ? '✓' : '⚠'}
                        </span>
                      </div>
                    </div>
                  )
                })()}

                {/* Latest article */}
                {p.latest && (
                  <div style={{fontSize:10,color:'#475569',marginBottom:8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',borderLeft:'2px solid rgba(255,255,255,0.06)',paddingLeft:6}}>
                    {p.latest}
                  </div>
                )}

                {/* Actions */}
                <div style={{display:'flex',gap:5}}>
                  <a href={`https://${p.domain}`} target="_blank" rel="noopener noreferrer" style={{flex:1}}>
                    <button className="btn b-ghost" style={{fontSize:9,padding:'4px 0',width:'100%'}}>Visit ↗</button>
                  </a>
                  {p.noindex && (
                    <a href={`/api/admin/flip-live?slug=${p.slug}&secret=REDACTED_CRON_SECRET`} style={{flex:1}}>
                      <button className="btn b-green" style={{fontSize:9,padding:'4px 0',width:'100%'}}>Flip Live ✓</button>
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard({
  clients=[], allContent=[], allRankings=[], allPodcasts=[], allActivity=[], allVideos=[],
  sites=[], totalArticles=0, totalSubscribers=0, allReviews=[], pendingReviews:initialPending=[],
  businessInquiries=[], portalArticlesToday={}, companies=[], invoices=[],
}: any) {
  const [tab, setTab] = useState('overview')
  const [analytics, setAnalytics] = useState<any>(null)
  const [anaLoading, setAnaLoading] = useState(false)
  const [anaDays, setAnaDays] = useState(30)
  const [filterClient, setFilterClient] = useState('')
  const [cronRunning, setCronRunning] = useState(false)
  const [cronMsg, setCronMsg] = useState('')
  const [pendingReviews, setPendingReviews] = useState<any[]>(initialPending)
  const [selectedClient, setSelectedClient] = useState<string|null>(null)
  const [showOnboard, setShowOnboard] = useState(false)
  const [podcastForm, setPodcastForm] = useState(false)
  const [podCreating, setPodCreating] = useState(false)
  const [podCreateResult, setPodCreateResult] = useState<any>(null)
  const [podClientId, setPodClientId] = useState('')
  const [podForm, setPodForm] = useState({
    siteSlug: 'trust-score',
    episodeNumber: 1,
    hostName: '',
    hostRole: '',
    guestName: '',
    guestRole: '',
    title: '',
    topic: '',
    duration: 8,
  })

  useEffect(() => { if (tab==='analytics') loadAnalytics(anaDays) }, [tab, filterClient])

  const loadAnalytics = useCallback(async (days=30) => {
    setAnaLoading(true)
    try {
      const clientParam = filterClient ? `&client=${filterClient}` : ''
    const r = await fetch(`/api/analytics?secret=REDACTED_CRON_SECRET&days=${days}${clientParam}`)
      setAnalytics(await r.json()); setAnaDays(days)
    } finally { setAnaLoading(false) }
  }, [filterClient])

  const createPodcastEpisode = async () => {
    if (!podForm.title || !podForm.guestName) {
      setPodCreateResult({ error: 'Please fill in Title and Guest Name' }); return
    }
    setPodCreating(true); setPodCreateResult(null)
    const cfg = PODCAST_CFG[podForm.siteSlug] || { show: podForm.siteSlug, host: 'Host', role: 'Host' }
    try {
      // Single call: generate-podcast writes script + audio + saves to podcast_scripts
      const r = await fetch('/api/admin/generate-podcast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: podClientId || clients[0]?.id || 'a1b2c3d4-0000-0000-0000-000000000001',
          clientBrand: (() => { const cl = clients.find((x:any)=>x.id===(podClientId||clients[0]?.id)); return cl ? {name:cl.company_name,website:cl.website_url,regulation:cl.regulation} : null })(),
          siteSlug: podForm.siteSlug,
          hostName: podForm.hostName || cfg.host,
          guestName: podForm.guestName,
          guestRole: podForm.guestRole,
          topic: podForm.topic,
          title: podForm.title,
          episodeNumber: podForm.episodeNumber,
          durationMinutes: podForm.duration,
        })
      })
      const data = await r.json()
      if (data.ok) {
        setPodCreateResult({ ok: true, audioUrl: data.audioUrl, words: data.words })
        setPodForm(f => ({ ...f, episodeNumber: f.episodeNumber + 1, title: '', topic: '', guestName: '', guestRole: '' }))
      } else {
        setPodCreateResult({ error: data.error || 'Generation failed' })
      }
    } catch(e:any) { setPodCreateResult({ error: e.message }) }
    finally { setPodCreating(false) }
  }

  const [podTopics, setPodTopics] = useState<any[]>([])
  const [topicsLoading, setTopicsLoading] = useState(false)

  const fetchTopics = async () => {
    setTopicsLoading(true)
    setPodTopics([])
    try {
      const r = await fetch('/api/admin/suggest-topics', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ siteSlug: podForm.siteSlug, clientName: clients[0]?.company_name })
      })
      const d = await r.json()
      if (d.topics) setPodTopics(d.topics)
    } catch(e) { console.error(e) }
    finally { setTopicsLoading(false) }
  }

  const runCron = async () => {
    setCronRunning(true); setCronMsg('')
    try {
      await fetch('/api/cron-sites?secret=REDACTED_CRON_SECRET')
      setCronMsg('✅ Article generation triggered — check portals in 5 min')
    } catch { setCronMsg('❌ Failed to trigger') } finally { setCronRunning(false) }
  }

  const approveReview = async (id:string, status:'approved'|'rejected') => {
    await fetch('/api/admin/moderate-review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})})
    setPendingReviews(prev=>prev.filter(r=>r.id!==id))
  }

  const todayTotal = Object.values(portalArticlesToday as Record<string,number>).reduce((a,b)=>a+b,0)
  const page1 = allRankings.filter((r:any)=>r.current_position<=10).length
  const sortedSites = [...sites].sort((a:any,b:any)=>(!a.noindex&&b.noindex)?-1:(a.noindex&&!b.noindex)?1:0)

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:'#0A0F1C',color:'#F1F5F9',fontFamily:"'Inter','SF Pro Display',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes slideIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
        .syne{font-family:'Syne',sans-serif}
        .card{background:linear-gradient(135deg,#141B2D,#1C2333);border:1px solid rgba(255,255,255,0.08);border-radius:12px}
        .nb{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#64748b;transition:all .2s;border:none;background:none;width:100%;text-align:left;font-family:inherit}
        .nb:hover{background:rgba(255,255,255,0.05);color:#f1f5f9}
        .nb.on{background:rgba(239,68,68,0.12);color:#EF4444;font-weight:700;border:1px solid rgba(239,68,68,0.18)}
        .inp{width:100%;padding:9px 13px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#F1F5F9;font-size:13px;font-family:inherit;outline:none;transition:border .2s}
        .inp:focus{border-color:#0EA5E9}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all .15s;white-space:nowrap}
        .b-blue{background:linear-gradient(135deg,#0EA5E9,#6366f1);color:#fff}
        .b-green{background:linear-gradient(135deg,#10B981,#059669);color:#fff}
        .b-ghost{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#94a3b8}
        .b-ghost:hover{background:rgba(255,255,255,0.1);color:#f1f5f9}
        .b-red{background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444}
        .ti{animation:slideIn .25s ease}
        audio{accent-color:#6366f1}
        select option{background:#1e293b}
      `}</style>

      {/* Sidebar */}
      <aside style={{width:220,flexShrink:0,borderRight:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <div className="syne" style={{fontSize:16,fontWeight:900}}><span style={{color:'#EF4444'}}>REP</span>HUBY</div>
          <div style={{fontSize:10,color:'#475569',marginTop:2,letterSpacing:'.08em'}}>INTELLIGENCE ADMIN</div>
        </div>
        <nav style={{flex:1,overflowY:'auto',padding:'12px 8px'}}>
          {[
            {id:'overview',icon:'🏠',label:'Overview'},
            {id:'clients',icon:'👥',label:'Clients'},
            {id:'analytics',icon:'📈',label:'Analytics'},
            {id:'podcasts',icon:'🎙',label:'Podcasts'},
            {id:'videos',icon:'🎬',label:'Video Studio'},
            {id:'portals',icon:'🌐',label:'Portals'},
            {id:'content',icon:'📰',label:'Content'},
            {id:'reviews',icon:'⭐',label:'Reviews'},
            {id:'rankings',icon:'🎯',label:'Rankings'},
            {id:'settings',icon:'⚙️',label:'Settings'},
            {id:'costs',icon:'💰',label:'Cost Tracker'},
          ].map(n=>(
            <button key={n.id} className={`nb${tab===n.id?' on':''}`} onClick={()=>setTab(n.id)}>
              <span style={{fontSize:15,flexShrink:0}}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id==='reviews'&&pendingReviews.length>0&&<span style={{marginLeft:'auto',background:'#EF4444',color:'#fff',borderRadius:99,fontSize:10,fontWeight:700,padding:'1px 6px'}}>{pendingReviews.length}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.07)',fontSize:10,color:'#334155'}}>
          <div>{totalArticles?.toLocaleString()} articles live</div>
          <div>{clients.length} active client{clients.length!==1?'s':''}</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflowY:'auto',padding:'24px 28px'}}>

        {/* OVERVIEW */}
        {tab==='overview'&&(
          <div className="ti">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
              <div>
                <div className="syne" style={{fontSize:22,fontWeight:900}}>Business Overview</div>
                <div style={{fontSize:12,color:'#475569',marginTop:2}}>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn b-green" onClick={runCron} disabled={cronRunning}>{cronRunning?<><Spinner/> Running…</>:<>🗞️ Generate Articles Now</>}</button>
                <button className="btn b-ghost" onClick={()=>setTab('clients')}>➕ New Client</button>
              </div>
            </div>
            {cronMsg&&<div style={{marginBottom:16,padding:'8px 14px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,fontSize:12,color:'#10b981'}}>{cronMsg}</div>}

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
              <KPI icon="👥" value={clients.filter((c:any)=>c.is_active).length} label="Active Clients" color="#EF4444"/>
              <KPI icon="📰" value={totalArticles?.toLocaleString()} label="Articles Live" color="#0EA5E9" sub={`+${todayTotal} today`}/>
              <KPI icon="🎯" value={page1} label="Page 1 Rankings" color="#F59E0B"/>
              <KPI icon="🎙" value={allPodcasts.filter((p:any)=>p.audio_url||p.mp3_url).length} label="Episodes with Audio" color="#6366f1"/>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
              <div className="card" style={{padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <div className="syne" style={{fontSize:13,fontWeight:800,color:'#94a3b8'}}>🌐 9-PORTAL NETWORK</div>
                  <div style={{fontSize:10,color:'#475569'}}>5 indexed · 4 building authority</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {sortedSites.map((s:any)=>{
                    const color=PORTAL_COLORS[s.slug]||s.primary_color||'#6366f1'
                    const cnt=(portalArticlesToday as any)[s.id]||0
                    return(
                      <a key={s.id} href={`https://${s.domain||PORTAL_DOMAIN[s.slug]}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                        <div style={{padding:'10px 12px',background:'rgba(255,255,255,0.02)',border:`1px solid ${color}25`,borderLeft:`3px solid ${color}`,borderRadius:8}}>
                          <div style={{fontWeight:700,fontSize:12,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
                            <div style={{fontSize:9,color:s.noindex?'#F59E0B':'#10B981',display:'flex',alignItems:'center',gap:3}}>
                              <span style={{width:5,height:5,borderRadius:'50%',background:s.noindex?'#F59E0B':'#10B981',display:'inline-block'}}/>
                              {s.noindex?'Building':'Indexed'}
                            </div>
                            <div style={{fontSize:10,fontWeight:700,color:cnt>0?color:'#334155'}}>+{cnt}</div>
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
              <div className="card" style={{padding:20}}>
                <div className="syne" style={{fontSize:13,fontWeight:800,color:'#94a3b8',marginBottom:14}}>⚡ ACTIVITY</div>
                {allActivity.slice(0,8).map((a:any,i:number)=>(
                  <div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:11}}>
                    <span style={{flexShrink:0,fontSize:14}}>{a.type==='rank_improved'?'🚀':a.type==='article_published'?'📰':'⚡'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,color:'#cbd5e1',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title}</div>
                      <div style={{fontSize:10,color:'#475569',marginTop:1}}>{timeAgo(a.created_at)} ago</div>
                    </div>
                  </div>
                ))}
                {allActivity.length===0&&<div style={{color:'#334155',fontSize:12,textAlign:'center',padding:'20px 0'}}>No activity yet</div>}
              </div>
            </div>

            <div className="card" style={{padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div className="syne" style={{fontSize:13,fontWeight:800,color:'#94a3b8'}}>👥 CLIENTS</div>
                <button className="btn b-green" style={{fontSize:11}} onClick={()=>setTab('clients')}>Manage →</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>
                {clients.map((cl:any)=>{
                  const arts=allContent.filter((c:any)=>c.client_id===cl.id).length
                  return(
                    <div key={cl.id} style={{padding:14,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,cursor:'pointer'}}
                      onClick={()=>{setSelectedClient(cl.id);setTab('clients')}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:14,color:'#f1f5f9'}}>{cl.company_name}</div>
                          <div style={{fontSize:11,color:'#475569',marginTop:1}}>{cl.website_url}</div>
                        </div>
                        <span style={{fontSize:9,padding:'2px 8px',borderRadius:99,background:cl.is_active?'rgba(16,185,129,0.15)':'rgba(100,116,139,0.15)',color:cl.is_active?'#10b981':'#64748b',fontWeight:600}}>{cl.is_active?'Active':'Inactive'}</span>
                      </div>
                      <div style={{display:'flex',gap:14,fontSize:11,color:'#64748b',paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                        <span>📰 {arts} articles</span>
                        <span>🌐 9 portals</span>
                        <span style={{marginLeft:'auto',color:'#6366f1',fontWeight:600}}>View →</span>
                      </div>
                    </div>
                  )
                })}
                {clients.length===0&&<div style={{color:'#334155',fontSize:13,padding:'20px 0',textAlign:'center',gridColumn:'1/-1'}}><button className="btn b-green" style={{fontSize:11}} onClick={()=>setTab('clients')}>Onboard First Client →</button></div>}
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {tab==='clients'&&(
          <div className="ti">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div className="syne" style={{fontSize:20,fontWeight:900}}>👥 Client Management</div>
                <div style={{fontSize:12,color:'#475569',marginTop:2}}>
                  {clients.length} client{clients.length!==1?'s':''} · ${clients.reduce((s:number,cl:any)=>s+(cl.monthly_value||0),0).toLocaleString()} MRR
                </div>
              </div>
              <button className="btn b-green" onClick={()=>setShowOnboard(v=>!v)}>➕ Onboard New Client</button>
            </div>

            {/* MRR summary bar */}
            {clients.length>0&&(
              <div className="card" style={{padding:'14px 20px',marginBottom:16,display:'flex',gap:28,alignItems:'center'}}>
                {[
                  {l:'Monthly Revenue', v:`$${clients.reduce((s:number,cl:any)=>s+(cl.monthly_value||0),0).toLocaleString()}`, c:'#10b981'},
                  {l:'Active Contracts', v:clients.filter((cl:any)=>cl.contract_status==='active').length, c:'#6366f1'},
                  {l:'Invoices Paid', v:(invoices as any[]).filter((iv:any)=>iv.status==='paid').length, c:'#f59e0b'},
                  {l:'Outstanding', v:`$${(invoices as any[]).filter((iv:any)=>iv.status==='pending'||iv.status==='overdue').reduce((s:number,iv:any)=>s+(iv.amount||0),0).toLocaleString()}`, c:'#ef4444'},
                ].map(k=>(
                  <div key={k.l}>
                    <div className="syne" style={{fontSize:22,fontWeight:900,color:k.c as string}}>{k.v}</div>
                    <div style={{fontSize:11,color:'#475569'}}>{k.l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Client cards */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {clients.map((cl:any)=>{
                const arts = allContent.filter((a:any)=>a.client_id===cl.id)
                const byPortal: Record<string,number> = {}
                for(const a of arts) byPortal[a.portal_name]=(byPortal[a.portal_name]||0)+1
                const clInvoices = (invoices as any[]).filter((iv:any)=>iv.client_id===cl.id)
                const paidTotal = clInvoices.filter((iv:any)=>iv.status==='paid').reduce((s:number,iv:any)=>s+iv.amount,0)
                const open = selectedClient===cl.id
                const steps = cl.onboarding_steps||{}
                const stepsTotal = Object.keys(steps).length
                const stepsDone = Object.values(steps).filter(Boolean).length
                const onboardPct = stepsTotal>0?Math.round(stepsDone/stepsTotal*100):0
                const daysLeft = cl.contract_end ? Math.ceil((new Date(cl.contract_end).getTime()-Date.now())/86400000) : null
                const statusColor = cl.contract_status==='active'?'#10b981':cl.contract_status==='paused'?'#f59e0b':'#ef4444'

                return(
                  <div key={cl.id} className="card" style={{overflow:'hidden',borderLeft:`3px solid ${cl.primary_color||'#6366f1'}`}}>
                    {/* Card header — always visible */}
                    <div style={{padding:'18px 22px',display:'flex',alignItems:'center',gap:14,cursor:'pointer',background:open?'rgba(255,255,255,0.03)':'transparent'}}
                      onClick={()=>setSelectedClient(open?null:cl.id)}>
                      {/* Logo / avatar */}
                      <div style={{width:46,height:46,borderRadius:12,background:`linear-gradient(135deg,${cl.primary_color||'#6366f1'},${cl.primary_color||'#4f46e5'}99)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:900,color:'#fff',flexShrink:0}}>
                        {cl.company_name[0]}
                      </div>
                      {/* Name + contact */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                          <div style={{fontWeight:800,fontSize:15,color:'#f1f5f9'}}>{cl.company_name}</div>
                          <span style={{fontSize:10,padding:'2px 8px',borderRadius:99,fontWeight:700,background:`${statusColor}20`,color:statusColor,border:`1px solid ${statusColor}40`}}>
                            {cl.contract_status||'active'}
                          </span>
                          <span style={{fontSize:10,padding:'2px 8px',borderRadius:99,fontWeight:600,background:'rgba(99,102,241,0.12)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.2)'}}>
                            {cl.tier||'pro'}
                          </span>
                        </div>
                        <div style={{fontSize:11,color:'#475569',display:'flex',gap:12,flexWrap:'wrap'}}>
                          {cl.contact_name&&<span>👤 {cl.contact_name}</span>}
                          {cl.contact_email&&<span>✉️ {cl.contact_email}</span>}
                          {cl.account_manager&&<span>🧑‍💼 AM: {cl.account_manager.split('—')[0].trim()}</span>}
                        </div>
                      </div>
                      {/* KPIs */}
                      <div style={{display:'flex',gap:18,flexShrink:0}}>
                        {[
                          {v:`$${(cl.monthly_value||0).toLocaleString()}`,l:'MRR',c:'#10b981'},
                          {v:arts.length,l:'Articles',c:'#6366f1'},
                          {v:`${onboardPct}%`,l:'Onboarded',c:onboardPct===100?'#10b981':'#f59e0b'},
                          {v:`$${paidTotal.toLocaleString()}`,l:'Paid',c:'#f1f5f9'},
                        ].map(k=>(
                          <div key={k.l} style={{textAlign:'center'}}>
                            <div className="syne" style={{fontSize:18,fontWeight:900,color:k.c,lineHeight:1}}>{k.v}</div>
                            <div style={{fontSize:9,color:'#475569',marginTop:2,letterSpacing:'.05em',textTransform:'uppercase'}}>{k.l}</div>
                          </div>
                        ))}
                      </div>
                      <span style={{color:'#334155',fontSize:12,transform:open?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}>▼</span>
                    </div>

                    {/* Expanded full card */}
                    {open&&(
                      <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',padding:'20px 22px'}}>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>

                          {/* ── Col 1: Contract + Contact ── */}
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:'#475569',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:10}}>Contract & Contact</div>
                            <div style={{display:'flex',flexDirection:'column',gap:7}}>
                              {[
                                {l:'Company',    f:'company_name',    v:cl.company_name,      t:'text'},
                                {l:'Contact',    f:'contact_name',    v:cl.contact_name,      t:'text'},
                                {l:'Email',      f:'contact_email',   v:cl.contact_email,     t:'email'},
                                {l:'Phone',      f:'contact_phone',   v:cl.contact_phone,     t:'text'},
                                {l:'Website',    f:'website_url',     v:cl.website_url,       t:'url'},
                                {l:'Regulation', f:'regulation',      v:cl.regulation,        t:'text'},
                                {l:'AM',         f:'account_manager', v:cl.account_manager,   t:'text'},
                                {l:'Started',    f:'contract_start',  v:cl.contract_start,    t:'date'},
                                {l:'Renews',     f:'contract_end',    v:cl.contract_end,      t:'date'},
                                {l:'MRR ($)',    f:'monthly_value',   v:cl.monthly_value,     t:'number'},
                              ].map(row=>(
                                <div key={row.l} style={{display:'flex',gap:8,fontSize:12,alignItems:'center'}}>
                                  <span style={{color:'#475569',flexShrink:0,width:72}}>{row.l}</span>
                                  <EditableField clientId={cl.id} field={row.f} value={row.v} label={row.l} type={row.t}/>
                                </div>
                              ))}
                              {daysLeft!==null&&(
                                <div style={{marginTop:6,padding:'6px 10px',borderRadius:6,background:daysLeft<30?'rgba(239,68,68,0.1)':'rgba(16,185,129,0.08)',border:`1px solid ${daysLeft<30?'rgba(239,68,68,0.25)':'rgba(16,185,129,0.2)'}`}}>
                                  <span style={{fontSize:11,fontWeight:600,color:daysLeft<30?'#ef4444':'#10b981'}}>
                                    {daysLeft<0?`⚠️ Expired ${Math.abs(daysLeft)}d ago`:`📅 ${daysLeft}d until renewal`}
                                  </span>
                                </div>
                              )}
                              {/* Editable status + tier */}
                              <div style={{display:'flex',gap:8,fontSize:12,alignItems:'center',marginTop:4}}>
                                <span style={{color:'#475569',flexShrink:0,width:72}}>Status</span>
                                <EditableField clientId={cl.id} field="contract_status" value={cl.contract_status||'active'} label="Status" options={['active','paused','cancelled']}/>
                              </div>
                              <div style={{display:'flex',gap:8,fontSize:12,alignItems:'center',marginTop:4}}>
                                <span style={{color:'#475569',flexShrink:0,width:72}}>Tier</span>
                                <EditableField clientId={cl.id} field="tier" value={cl.tier||'pro'} label="Tier" options={['starter','pro','enterprise']}/>
                              </div>
                              {/* Notes — editable textarea */}
                              <div style={{marginTop:8}}>
                                <div style={{fontSize:10,color:'#475569',marginBottom:3}}>Notes</div>
                                <EditableField clientId={cl.id} field="notes" value={cl.notes} label="Notes" type="text"/>
                              </div>
                            </div>
                          </div>

                          {/* ── Col 2: Onboarding + Portal coverage ── */}
                          <div>
                            <div style={{fontSize:10,fontWeight:700,color:'#475569',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:10}}>Onboarding Status</div>
                            {/* Progress bar */}
                            <div style={{marginBottom:12}}>
                              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:11}}>
                                <span style={{color:'#94a3b8'}}>Progress</span>
                                <span style={{fontWeight:700,color:onboardPct===100?'#10b981':'#f59e0b'}}>{onboardPct}%</span>
                              </div>
                              <div style={{height:5,background:'#1e293b',borderRadius:3}}>
                                <div style={{height:5,width:`${onboardPct}%`,background:onboardPct===100?'linear-gradient(90deg,#10b981,#059669)':'linear-gradient(90deg,#f59e0b,#d97706)',borderRadius:3,transition:'width .3s'}}/>
                              </div>
                            </div>
                            {/* Step list */}
                            {Object.entries(steps).map(([step, done]:any)=>(
                              <div key={step}
                                onClick={async()=>{const ns={...steps,[step]:!done};await fetch('/api/admin/update-client',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:cl.id,field:'onboarding_steps',value:ns})})}}
                                style={{display:'flex',alignItems:'center',gap:8,padding:'6px 4px',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:12,cursor:'pointer'}}>
                                <span style={{fontSize:14,flexShrink:0}}>{done?'✅':'⬜'}</span>
                                <span style={{color:done?'#f1f5f9':'#475569',flex:1,textTransform:'capitalize'}}>{step.replace(/_/g,' ')}</span>
                              </div>
                            ))}
                            {/* Portal coverage */}
                            <div style={{marginTop:14}}>
                              <div style={{fontSize:10,fontWeight:700,color:'#475569',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>Portal Coverage</div>
                              {Object.entries(byPortal).sort((a:any,b:any)=>b[1]-a[1]).map(([portal,n]:any)=>(
                                <div key={portal} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontSize:11}}>
                                  <span style={{color:'#94a3b8'}}>{portal}</span>
                                  <span style={{fontWeight:700,color:'#6366f1'}}>{n} articles</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ── Col 3: Invoices ── */}
                          <div>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                              <div style={{fontSize:10,fontWeight:700,color:'#475569',letterSpacing:'.08em',textTransform:'uppercase'}}>Invoices</div>
                              <div style={{fontSize:11,color:'#10b981',fontWeight:600}}>${paidTotal.toLocaleString()} paid</div>
                            </div>
                            {clInvoices.length===0?(
                              <div style={{color:'#334155',fontSize:12,textAlign:'center',padding:'20px 0'}}>No invoices yet</div>
                            ):(
                              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                                {clInvoices.map((iv:any)=>{
                                  const sColor = iv.status==='paid'?'#10b981':iv.status==='overdue'?'#ef4444':'#f59e0b'
                                  const sIcon  = iv.status==='paid'?'✅':iv.status==='overdue'?'🔴':'🟡'
                                  return(
                                    <div key={iv.id} style={{padding:'10px 12px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:8}}>
                                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                                        <div>
                                          <div style={{fontSize:12,fontWeight:700,color:'#f1f5f9'}}>{iv.invoice_no}</div>
                                          <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{iv.description}</div>
                                        </div>
                                        <div style={{textAlign:'right'}}>
                                          <div className="syne" style={{fontSize:16,fontWeight:900,color:'#f1f5f9'}}>${(iv.amount||0).toLocaleString()}</div>
                                          <div style={{fontSize:9,color:sColor,fontWeight:700,marginTop:1}}>{sIcon} {iv.status.toUpperCase()}</div>
                                        </div>
                                      </div>
                                      <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#334155',marginTop:4}}>
                                        <span>Issued {iv.issued_at?.slice(0,10)||'—'}</span>
                                        <span>Due {iv.due_date||'—'}</span>
                                        {iv.paid_at&&<span style={{color:'#10b981'}}>Paid {iv.paid_at.slice(0,10)}</span>}
                                      </div>
                                    </div>
                                  )
                                })}
                                {/* Invoice totals */}
                                <div style={{padding:'8px 12px',background:'rgba(99,102,241,0.07)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:8,display:'flex',justifyContent:'space-between',fontSize:12}}>
                                  <span style={{color:'#818cf8',fontWeight:600}}>Total Invoiced</span>
                                  <span className="syne" style={{fontWeight:900,color:'#f1f5f9'}}>${clInvoices.reduce((s:number,iv:any)=>s+iv.amount,0).toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action bar */}
                        <div style={{display:'flex',gap:8,marginTop:18,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                          <a href="/portal/dashboard" target="_blank"><button className="btn b-blue" style={{fontSize:11}}>📊 Client Dashboard ↗</button></a>
                          <a href={cl.website_url} target="_blank" rel="noopener noreferrer"><button className="btn b-ghost" style={{fontSize:11}}>🌐 Website ↗</button></a>
                          {cl.contact_email&&<a href={`mailto:${cl.contact_email}`}><button className="btn b-ghost" style={{fontSize:11}}>✉️ Email Client</button></a>}
                          <button className="btn b-ghost" style={{fontSize:11}} onClick={()=>setTab('analytics')}>📈 View Traffic</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {clients.length===0&&<div className="card" style={{padding:60,textAlign:'center',color:'#334155',fontSize:14}}>No clients yet — onboard your first client to get started</div>}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {tab==='analytics'&&(
          <div className="ti">
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
              <div>
                <div className="syne" style={{fontSize:20,fontWeight:900}}>📊 Business Intelligence</div>
                <div style={{fontSize:12,color:'#475569',marginTop:2}}>
                  {filterClient ? `Filtered: ${clients.find((c:any)=>c.id===filterClient)?.company_name||'Client'}` : 'All Clients · CEO · CMO · CFO'}
                </div>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                {/* Client filter */}
                <select value={filterClient}
                  onChange={(e:any)=>{setFilterClient(e.target.value);setAnalytics(null)}}
                  style={{padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:600,background:filterClient?'rgba(99,102,241,0.2)':'rgba(255,255,255,0.06)',border:'1px solid',borderColor:filterClient?'#6366f1':'rgba(255,255,255,0.1)',color:filterClient?'#818cf8':'#64748b',cursor:'pointer'}}>
                  <option value="">👥 All Clients</option>
                  {clients.map((cl:any)=><option key={cl.id} value={cl.id}>👤 {cl.company_name}</option>)}
                </select>
                {/* Day range */}
                {[7,14,30,90].map(d=>(
                  <button key={d} onClick={()=>loadAnalytics(d)}
                    style={{padding:'5px 12px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',border:'1px solid',borderColor:anaDays===d?'#6366f1':'rgba(255,255,255,0.1)',background:anaDays===d?'rgba(99,102,241,0.2)':'transparent',color:anaDays===d?'#818cf8':'#64748b'}}>
                    {d}d
                  </button>
                ))}
                <button className="btn b-ghost" style={{fontSize:11}} onClick={()=>loadAnalytics(anaDays)}>↻</button>
              </div>
            </div>

            {anaLoading&&<div style={{textAlign:'center',padding:60,color:'#334155',fontSize:13}}>Loading intelligence data…</div>}

            {analytics&&!anaLoading&&(
              <>
                {/* ── CEO ROW: Top-level KPIs ── */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:20}}>
                  {[
                    {icon:'👁',v:(analytics.total||0).toLocaleString(),l:'Total Views',s:`Last ${anaDays}d`,c:'#6366f1'},
                    {icon:'📅',v:(analytics.todayViews||0).toLocaleString(),l:'Today',s:`${analytics.growthPct>=0?'+':''}${analytics.growthPct||0}% vs yesterday`,c:analytics.growthPct>=0?'#10b981':'#ef4444'},
                    {icon:'📆',v:(analytics.weekViews||0).toLocaleString(),l:'This Week',s:'Rolling 7d',c:'#0ea5e9'},
                    {icon:'🌍',v:analytics.uniqueCountries||0,l:'Countries',s:'Geo reach',c:'#f59e0b'},
                    {icon:'🔗',v:analytics.uniquePaths||0,l:'Unique Pages',s:'Tracked URLs',c:'#a855f7'},
                    {icon:'💰',v:`$${(analytics.finance?.mrr||0).toLocaleString()}`,l:'Monthly Revenue',s:`ARR $${((analytics.finance?.mrr||0)*12).toLocaleString()}`,c:'#10b981'},
                  ].map((k:any)=>(
                    <div key={k.l} className="card" style={{padding:'14px 16px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                        <span style={{fontSize:18}}>{k.icon}</span>
                        <div style={{width:6,height:6,borderRadius:'50%',background:k.c,animation:'pulse 2s ease-in-out infinite',marginTop:4}}/>
                      </div>
                      <div className="syne" style={{fontSize:22,fontWeight:900,color:k.c,lineHeight:1,marginBottom:2}}>{k.v}</div>
                      <div style={{fontSize:11,color:'#64748b'}}>{k.l}</div>
                      {k.s&&<div style={{fontSize:10,color:'#334155',marginTop:2}}>{k.s}</div>}
                    </div>
                  ))}
                </div>

                {/* ── PAGEVIEWS CHART + HOURLY HEATMAP ── */}
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
                  <div className="card" style={{padding:20}}>
                    <div className="syne" style={{fontSize:11,fontWeight:800,color:'#475569',marginBottom:12}}>PAGEVIEWS OVER TIME</div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:2,height:120}}>
                      {(()=>{const data=analytics.daily||[];const max=Math.max(...data.map((d:any)=>d.views),1);return data.map((d:any,i:number)=>{const h=Math.max(3,(d.views/max)*108);const isT=d.date===new Date().toISOString().slice(0,10);return(<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}} title={`${d.date}: ${d.views} views`}><div style={{width:'100%',background:isT?'#6366f1':'#1e293b',height:h,borderRadius:'2px 2px 0 0',border:`1px solid ${isT?'#818cf8':'#334155'}`}}/>{data.length<=14&&<div style={{fontSize:7,color:'#334155',transform:'rotate(-45deg)',whiteSpace:'nowrap'}}>{d.date.slice(5)}</div>}</div>)})})()}
                    </div>
                    {(!analytics.daily||analytics.daily.length===0)&&<div style={{textAlign:'center',padding:'20px 0',color:'#334155',fontSize:12}}>No traffic data yet</div>}
                  </div>
                  <div className="card" style={{padding:20}}>
                    <div className="syne" style={{fontSize:11,fontWeight:800,color:'#475569',marginBottom:12}}>TRAFFIC BY HOUR (UTC)</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:2}}>
                      {(analytics.byHour||[]).map((h:any)=>{const max=Math.max(...(analytics.byHour||[]).map((x:any)=>x.views),1);const intensity=h.views/max;return(
                        <div key={h.hour} title={`${String(h.hour).padStart(2,'0')}:00 — ${h.views} views`}
                          style={{aspectRatio:'1',borderRadius:3,background:h.views>0?`rgba(99,102,241,${0.15+intensity*0.85})`:'#1e293b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:intensity>0.5?'#fff':'#334155',cursor:'default'}}>
                          {h.hour}
                        </div>
                      )})}
                    </div>
                    <div style={{fontSize:10,color:'#334155',marginTop:8,textAlign:'center'}}>Darker = more traffic</div>
                  </div>
                </div>

                {/* ── TOP URLS — the most important table ── */}
                <div className="card" style={{padding:20,marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <div className="syne" style={{fontSize:13,fontWeight:800,color:'#94a3b8'}}>🔗 TOP URLS BY TRAFFIC</div>
                    <div style={{fontSize:11,color:'#475569'}}>{analytics.uniquePaths} unique pages tracked</div>
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                      <thead>
                        <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                          <th style={{padding:'8px 10px',textAlign:'left',fontSize:10,color:'#475569',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',width:40}}>#</th>
                          <th style={{padding:'8px 10px',textAlign:'left',fontSize:10,color:'#475569',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>Page / Article</th>
                          <th style={{padding:'8px 10px',textAlign:'left',fontSize:10,color:'#475569',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',width:90}}>Portal</th>
                          <th style={{padding:'8px 10px',textAlign:'left',fontSize:10,color:'#475569',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',width:70}}>Type</th>
                          <th style={{padding:'8px 10px',textAlign:'right',fontSize:10,color:'#475569',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',width:70}}>Views</th>
                          <th style={{padding:'8px 10px',textAlign:'right',fontSize:10,color:'#475569',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',width:70}}>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analytics.topUrls||[]).slice(0,20).map((row:any,i:number)=>{
                          const maxV=(analytics.topUrls||[])[0]?.views||1
                          const pct=Math.round(row.views/Math.max(analytics.total,1)*100)
                          const typeColor=row.type==='article'?'#6366f1':row.type==='podcast'?'#f97316':'#10b981'
                          return(
                            <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}
                              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.02)'}
                              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                              <td style={{padding:'9px 10px',color:'#334155',fontWeight:700}}>{i+1}</td>
                              <td style={{padding:'9px 10px',maxWidth:420}}>
                                <a href={row.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                                  <div style={{fontSize:12,fontWeight:600,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:2}}>{row.title||row.path}</div>
                                  <div style={{fontSize:10,color:'#334155',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.url}</div>
                                </a>
                              </td>
                              <td style={{padding:'9px 10px'}}><span style={{fontSize:10,fontWeight:600,color:'#94a3b8'}}>{row.siteName}</span></td>
                              <td style={{padding:'9px 10px'}}><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,fontWeight:600,background:`${typeColor}18`,color:typeColor}}>{row.type}</span></td>
                              <td style={{padding:'9px 10px',textAlign:'right'}}><span className="syne" style={{fontSize:14,fontWeight:900,color:'#f1f5f9'}}>{row.views}</span></td>
                              <td style={{padding:'9px 10px',textAlign:'right'}}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:6}}>
                                  <div style={{width:40,height:3,background:'#1e293b',borderRadius:2}}><div style={{height:3,width:`${(row.views/maxV)*100}%`,background:'#6366f1',borderRadius:2}}/></div>
                                  <span style={{fontSize:10,color:'#64748b',width:28,textAlign:'right'}}>{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {(!analytics.topUrls||analytics.topUrls.length===0)&&<div style={{textAlign:'center',padding:'30px 0',color:'#334155',fontSize:12}}>No URL data yet — traffic will appear here as visitors arrive</div>}
                  </div>
                </div>

                {/* ── ACQUISITION: Sources + Referrers + Geo ── */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
                  {/* Traffic Sources */}
                  <div className="card" style={{padding:20}}>
                    <div className="syne" style={{fontSize:11,fontWeight:800,color:'#475569',marginBottom:14}}>TRAFFIC SOURCES</div>
                    {(analytics.bySource||[]).map((s:any)=>{
                      const icon=s.source==='Direct'?'🔵':s.source==='Organic Search'?'🟢':s.source==='Social'?'🟣':'🟡'
                      const color=s.source==='Direct'?'#6366f1':s.source==='Organic Search'?'#10b981':s.source==='Social'?'#a855f7':'#f59e0b'
                      return(
                        <div key={s.source} style={{marginBottom:12}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:12,alignItems:'center'}}>
                            <span style={{color:'#cbd5e1',display:'flex',alignItems:'center',gap:6}}><span>{icon}</span>{s.source}</span>
                            <span style={{fontWeight:700,color:'#f1f5f9'}}>{s.views} <span style={{color:'#334155',fontWeight:400}}>({s.pct}%)</span></span>
                          </div>
                          <div style={{height:4,background:'#1e293b',borderRadius:2}}>
                            <div style={{height:4,width:`${s.pct}%`,background:color,borderRadius:2}}/>
                          </div>
                        </div>
                      )
                    })}
                    {(!analytics.bySource||analytics.bySource.length===0)&&<div style={{color:'#334155',fontSize:12,textAlign:'center',padding:'16px 0'}}>No source data</div>}
                  </div>

                  {/* Top Referrers */}
                  <div className="card" style={{padding:20}}>
                    <div className="syne" style={{fontSize:11,fontWeight:800,color:'#475569',marginBottom:14}}>TOP REFERRERS</div>
                    {(analytics.byReferrer||[]).slice(0,10).length>0?(analytics.byReferrer||[]).slice(0,10).map((r:any,i:number)=>{
                      const max=(analytics.byReferrer||[])[0]?.views||1
                      return(
                        <div key={r.referrer} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontSize:12}}>
                          <span style={{color:'#334155',width:14,flexShrink:0,textAlign:'right',fontWeight:700}}>{i+1}</span>
                          <span style={{flex:1,color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.referrer}</span>
                          <div style={{width:50,height:3,background:'#1e293b',borderRadius:2,flexShrink:0}}>
                            <div style={{height:3,width:`${(r.views/max)*100}%`,background:'#f59e0b',borderRadius:2}}/>
                          </div>
                          <span style={{fontSize:11,color:'#64748b',width:24,textAlign:'right',flexShrink:0,fontWeight:700}}>{r.views}</span>
                        </div>
                      )
                    }):(
                      <div style={{color:'#334155',fontSize:12,textAlign:'center',padding:'16px 0'}}>No referral traffic yet<br/><span style={{fontSize:10,marginTop:4,display:'block'}}>All traffic is direct for now</span></div>
                    )}
                  </div>

                  {/* Geo */}
                  <div className="card" style={{padding:20}}>
                    <div className="syne" style={{fontSize:11,fontWeight:800,color:'#475569',marginBottom:14}}>🌍 GEO BREAKDOWN</div>
                    {(analytics.byCountry||[]).slice(0,12).map((item:any)=>{
                      const max=(analytics.byCountry||[])[0]?.views||1
                      return(
                        <div key={item.country} style={{marginBottom:8}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:2,alignItems:'center',fontSize:12}}>
                            <span style={{color:'#cbd5e1',display:'flex',alignItems:'center',gap:5}}>
                              <span style={{fontSize:14}}>{item.flag}</span>
                              <span style={{fontWeight:600}}>{item.country}</span>
                            </span>
                            <span style={{fontSize:11,color:'#64748b'}}>{item.views} ({item.pct}%)</span>
                          </div>
                          <div style={{height:3,background:'#1e293b',borderRadius:2}}>
                            <div style={{height:3,width:`${(item.views/max)*100}%`,background:'linear-gradient(90deg,#6366f1,#818cf8)',borderRadius:2}}/>
                          </div>
                        </div>
                      )
                    })}
                    {(!analytics.byCountry||analytics.byCountry.length===0)&&<div style={{color:'#334155',fontSize:12,textAlign:'center',padding:'16px 0'}}>No geo data</div>}
                  </div>
                </div>

                {/* ── PORTAL BREAKDOWN + DEVICE + CLIENT TRAFFIC ── */}
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:16,marginBottom:16}}>
                  {/* By Portal */}
                  <div className="card" style={{padding:20}}>
                    <div className="syne" style={{fontSize:11,fontWeight:800,color:'#475569',marginBottom:14}}>VIEWS BY PORTAL</div>
                    {(analytics.bySite||[]).map((s:any)=>{
                      const max=(analytics.bySite||[])[0]?.views||1
                      const COLORS:Record<string,string>={'global-trade-wire':'#E03131','finance-terminal':'#1971C2','business-pulse':'#6741D9','gold-markets-today':'#B08700','trust-score':'#0CA678','invest-data':'#0EA5E9','market-radar':'#A21CAF','executive-network':'#DC2626','crypto-hub':'#F97316'}
                      const color=COLORS[s.slug]||'#6366f1'
                      const pct=Math.round(s.views/Math.max(analytics.total,1)*100)
                      return(
                        <div key={s.slug} style={{marginBottom:10}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3,fontSize:12}}>
                            <span style={{color:'#cbd5e1',fontWeight:600,display:'flex',alignItems:'center',gap:6}}><span style={{width:8,height:8,borderRadius:'50%',background:color,display:'inline-block',flexShrink:0}}/>{s.name}</span>
                            <span style={{color:'#64748b'}}>{s.views} <span style={{color:'#334155'}}>({pct}%)</span></span>
                          </div>
                          <div style={{height:4,background:'#1e293b',borderRadius:2}}><div style={{height:4,width:`${(s.views/max)*100}%`,background:color,borderRadius:2}}/></div>
                        </div>
                      )
                    })}
                    {(!analytics.bySite||analytics.bySite.length===0)&&<div style={{color:'#334155',fontSize:12,textAlign:'center',padding:'16px 0'}}>No data</div>}
                  </div>

                  {/* Devices */}
                  <div className="card" style={{padding:20}}>
                    <div className="syne" style={{fontSize:11,fontWeight:800,color:'#475569',marginBottom:14}}>DEVICES</div>
                    {(analytics.byDevice||[]).map((d:any)=>{
                      const tot=(analytics.byDevice||[]).reduce((a:number,x:any)=>a+x.views,0)||1
                      const ic:Record<string,string>={desktop:'🖥️',mobile:'📱',tablet:'📋'}
                      const co:Record<string,string>={desktop:'#6366f1',mobile:'#10b981',tablet:'#f59e0b'}
                      const pct=Math.round(d.views/tot*100)
                      return(
                        <div key={d.device} style={{marginBottom:14}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:12}}>
                            <span style={{color:'#cbd5e1',display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:16}}>{ic[d.device]||'💻'}</span><span style={{textTransform:'capitalize'}}>{d.device}</span></span>
                            <span className="syne" style={{fontWeight:900,color:co[d.device]||'#6366f1',fontSize:16}}>{pct}%</span>
                          </div>
                          <div style={{height:5,background:'#1e293b',borderRadius:2}}><div style={{height:5,width:`${pct}%`,background:co[d.device]||'#6366f1',borderRadius:2}}/></div>
                          <div style={{fontSize:10,color:'#334155',marginTop:3}}>{d.views} views</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Per-Client Traffic */}
                  <div className="card" style={{padding:20}}>
                    <div className="syne" style={{fontSize:11,fontWeight:800,color:'#475569',marginBottom:14}}>TRAFFIC BY CLIENT</div>
                    {(analytics.byClient||[]).length>0?(analytics.byClient||[]).map((item:any)=>{
                      const cl=clients.find((x:any)=>x.id===item.clientId)
                      if(!cl) return null
                      const tot=(analytics.byClient||[]).reduce((s:number,x:any)=>s+x.views,0)||1
                      const pct=Math.round(item.views/tot*100)
                      return(
                        <div key={item.clientId} style={{marginBottom:14}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:12}}>
                            <span style={{color:'#cbd5e1',fontWeight:600}}>{cl.company_name}</span>
                            <span className="syne" style={{fontWeight:900,color:'#6366f1',fontSize:16}}>{item.views}</span>
                          </div>
                          <div style={{height:4,background:'#1e293b',borderRadius:2}}><div style={{height:4,width:`${pct}%`,background:'#6366f1',borderRadius:2}}/></div>
                          <div style={{fontSize:10,color:'#334155',marginTop:2}}>{pct}% of total traffic</div>
                        </div>
                      )
                    }):<div style={{color:'#334155',fontSize:12,textAlign:'center',padding:'16px 0'}}>Client attribution<br/><span style={{fontSize:10}}>grows as traffic increases</span></div>}
                  </div>
                </div>

                {/* ── CFO: FINANCE OVERVIEW ── */}
                <div className="card" style={{padding:20,borderTop:'3px solid #10b981'}}>
                  <div className="syne" style={{fontSize:13,fontWeight:800,color:'#94a3b8',marginBottom:16}}>💰 FINANCIAL OVERVIEW</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
                    {[
                      {l:'Monthly Recurring Revenue',v:`$${(analytics.finance?.mrr||0).toLocaleString()}`,c:'#10b981',icon:'📈'},
                      {l:'Annual Run Rate',v:`$${(analytics.finance?.arr||0).toLocaleString()}`,c:'#6366f1',icon:'🎯'},
                      {l:'Revenue Collected',v:`$${(analytics.finance?.paidRevenue||0).toLocaleString()}`,c:'#f59e0b',icon:'✅'},
                      {l:'Outstanding',v:`$${(analytics.finance?.pendingRevenue||0).toLocaleString()}`,c:analytics.finance?.pendingRevenue>0?'#ef4444':'#334155',icon:'🟡'},
                    ].map(k=>(
                      <div key={k.l} style={{padding:'16px 18px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10}}>
                        <div style={{fontSize:20,marginBottom:6}}>{k.icon}</div>
                        <div className="syne" style={{fontSize:26,fontWeight:900,color:k.c,lineHeight:1,marginBottom:4}}>{k.v}</div>
                        <div style={{fontSize:11,color:'#475569'}}>{k.l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Invoice table */}
                  {(analytics.finance?.invoices||[]).length>0&&(
                    <div>
                      <div style={{fontSize:11,fontWeight:700,color:'#475569',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:10}}>Recent Invoices</div>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                        <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                          {['Invoice','Description','Amount','Status','Issued','Due','Paid'].map(h=><th key={h} style={{padding:'6px 10px',textAlign:'left',fontSize:10,color:'#475569',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {(analytics.finance?.invoices||[]).map((iv:any)=>{
                            const sColor=iv.status==='paid'?'#10b981':iv.status==='overdue'?'#ef4444':'#f59e0b'
                            const cl=clients.find((c:any)=>c.id===iv.client_id)
                            return(
                              <tr key={iv.id} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                                <td style={{padding:'8px 10px',color:'#818cf8',fontWeight:600}}>{iv.invoice_no}</td>
                                <td style={{padding:'8px 10px',color:'#94a3b8'}}>{iv.description} {cl&&<span style={{color:'#475569'}}>· {cl.company_name}</span>}</td>
                                <td style={{padding:'8px 10px'}}><span className="syne" style={{fontWeight:900,color:'#f1f5f9',fontSize:14}}>${(iv.amount||0).toLocaleString()}</span></td>
                                <td style={{padding:'8px 10px'}}><span style={{fontSize:10,padding:'2px 8px',borderRadius:99,fontWeight:700,background:`${sColor}18`,color:sColor,border:`1px solid ${sColor}35`}}>{iv.status}</span></td>
                                <td style={{padding:'8px 10px',color:'#475569',fontSize:11}}>{(iv.issued_at||'').slice(0,10)}</td>
                                <td style={{padding:'8px 10px',color:'#475569',fontSize:11}}>{iv.due_date||'—'}</td>
                                <td style={{padding:'8px 10px',color:'#10b981',fontSize:11}}>{iv.paid_at?(iv.paid_at.slice(0,10)):'—'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {!analytics&&!anaLoading&&(
              <div style={{textAlign:'center',padding:80}}>
                <div style={{fontSize:40,marginBottom:16}}>📊</div>
                <div style={{fontSize:14,color:'#475569',marginBottom:20}}>Load intelligence data to see the full business picture</div>
                <button className="btn b-blue" style={{padding:'12px 28px',fontSize:14}} onClick={()=>loadAnalytics(30)}>Load Intelligence Dashboard</button>
              </div>
            )}
          </div>
        )}

        {/* PODCASTS */}
        {tab==='podcasts'&&(
          <div className="ti">

            {/* ── Header ── */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div className="syne" style={{fontSize:20,fontWeight:900}}>🎙 Podcast Studio</div>
                <div style={{fontSize:12,color:'#475569',marginTop:2}}>
                  {allPodcasts.length} total · {allPodcasts.filter((p:any)=>p.status==='published').length} published · {allPodcasts.filter((p:any)=>p.audio_url||p.mp3_url).length} with audio
                </div>
              </div>
              <button className="btn b-green" onClick={()=>setPodcastForm(v=>!v)}>
                {podcastForm ? '✕ Close' : '➕ New Episode'}
              </button>
            </div>

            {/* ── CREATE FORM ── */}
            {podcastForm&&(
              <div className="card" style={{padding:22,marginBottom:20,borderTop:'3px solid #6366f1'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <div className="syne" style={{fontSize:13,fontWeight:800,color:'#94a3b8'}}>CREATE NEW EPISODE</div>

                </div>


                {/* ═══ SECTION 1: Client ═══ */}
                <div style={{marginBottom:18,background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:10,padding:16}}>
                  <div style={{fontSize:10,fontWeight:800,color:'#6366f1',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10}}>
                    STEP 1 — Which client is this for?
                  </div>
                  <select value={podClientId}
                    onChange={(e:any)=>{
                      const id=e.target.value
                      setPodClientId(id)
                      const cl=clients.find((x:any)=>x.id===id)
                      if(cl) setPodForm(f=>({...f,guestRole:`${cl.company_name}`}))
                      else setPodForm(f=>({...f,guestRole:''}))
                    }}
                    style={{width:'100%',padding:'12px 14px',background:podClientId?'rgba(99,102,241,0.1)':'#1e293b',border:'2px solid',borderColor:podClientId?'#6366f1':'#334155',color:podClientId?'#a5b4fc':'#94a3b8',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',outline:'none'}}>
                    <option value="">🎙 General podcast — no specific client</option>
                    {clients.length===0
                      ? <option disabled>No clients found — add a client first</option>
                      : clients.map((cl:any)=>(
                          <option key={cl.id} value={cl.id}>
                            🏢 {cl.company_name} — {cl.website_url||'no website'}
                          </option>
                        ))
                    }
                  </select>
                  {podClientId && (
                    <div style={{marginTop:8,padding:'8px 12px',background:'rgba(99,102,241,0.08)',borderRadius:6,fontSize:12,color:'#818cf8'}}>
                      ✓ Claude will naturally feature <strong>{clients.find((x:any)=>x.id===podClientId)?.company_name}</strong> in the conversation — regulation, trust, platform strengths woven in naturally (not as an ad)
                    </div>
                  )}
                </div>

                {/* ═══ SECTION 2: Guest ═══ */}
                <div style={{marginBottom:18,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:16}}>
                  <div style={{fontSize:10,fontWeight:800,color:'#94a3b8',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>
                    STEP 2 — Who is the guest?
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div>
                      <label style={{fontSize:11,color:'#64748b',fontWeight:700,display:'block',marginBottom:5}}>Guest Full Name *</label>
                      <input value={podForm.guestName} onChange={(e:any)=>setPodForm(f=>({...f,guestName:e.target.value}))}
                        className="inp" style={{fontSize:13,padding:'10px 12px',width:'100%'}} placeholder="e.g. Sarah Johnson"/>
                    </div>
                    <div>
                      <label style={{fontSize:11,color:'#64748b',fontWeight:700,display:'block',marginBottom:5}}>Guest Title / Role *</label>
                      <input value={podForm.guestRole} onChange={(e:any)=>setPodForm(f=>({...f,guestRole:e.target.value}))}
                        className="inp" style={{fontSize:13,padding:'10px 12px',width:'100%'}} placeholder="e.g. CEO, eToro"/>
                    </div>
                  </div>
                </div>

                {/* ═══ SECTION 3: Portal + Host ═══ */}
                <div style={{marginBottom:18,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:16}}>
                  <div style={{fontSize:10,fontWeight:800,color:'#94a3b8',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:12}}>
                    STEP 3 — Portal & Host
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div>
                      <label style={{fontSize:11,color:'#64748b',fontWeight:700,display:'block',marginBottom:5}}>Portal</label>
                      <select value={podForm.siteSlug}
                        onChange={(e:any)=>{setPodForm(f=>({...f,siteSlug:e.target.value,hostName:'',hostRole:''}));setPodTopics([])}}
                        style={{width:'100%',padding:'10px 12px',background:'#1e293b',border:'1px solid #334155',color:'#e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}>
                        {Object.entries(PORTAL_DOMAIN).map(([s,d])=><option key={s} value={s}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:11,color:'#64748b',fontWeight:700,display:'block',marginBottom:5}}>Episode #</label>
                      <input type="number" min={1} value={podForm.episodeNumber} onChange={(e:any)=>setPodForm(f=>({...f,episodeNumber:parseInt(e.target.value)||1}))}
                        className="inp" style={{fontSize:13,padding:'10px 12px',width:'100%'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:11,color:'#64748b',fontWeight:700,display:'block',marginBottom:5}}>Host Name</label>
                      <input value={podForm.hostName||(PODCAST_CFG[podForm.siteSlug]?.host||'')} onChange={(e:any)=>setPodForm(f=>({...f,hostName:e.target.value}))}
                        className="inp" style={{fontSize:12,padding:'10px 12px',width:'100%'}} placeholder="Auto-fills from portal"/>
                    </div>
                    <div>
                      <label style={{fontSize:11,color:'#64748b',fontWeight:700,display:'block',marginBottom:5}}>Duration</label>
                      <select value={podForm.duration} onChange={(e:any)=>setPodForm(f=>({...f,duration:parseInt(e.target.value)}))}
                        style={{width:'100%',padding:'10px 12px',background:'#1e293b',border:'1px solid #334155',color:'#e2e8f0',borderRadius:8,fontSize:12,outline:'none'}}>
                        {[5,8,10,15,20].map(d=><option key={d} value={d}>{d} minutes</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ═══ SECTION 4: Topic ═══ */}
                <div style={{marginBottom:18,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:800,color:'#94a3b8',letterSpacing:'.1em',textTransform:'uppercase'}}>
                      STEP 4 — What to talk about
                    </div>
                    <button onClick={fetchTopics} disabled={topicsLoading}
                      style={{padding:'5px 12px',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:6,color:'#818cf8',fontWeight:700,fontSize:11,cursor:topicsLoading?'wait':'pointer',display:'flex',alignItems:'center',gap:5}}>
                      {topicsLoading?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⏳</span> Searching…</>:<>🔥 Suggest Trending Topics</>}
                    </button>
                  </div>

                  {/* Topic suggestions */}
                  {podTopics.length>0&&(
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:10,color:'#475569',marginBottom:6}}>Click any to auto-fill ↓</div>
                      <div style={{display:'flex',flexDirection:'column',gap:5,maxHeight:200,overflowY:'auto'}}>
                        {podTopics.map((t:any,i:number)=>(
                          <div key={i}
                            onClick={()=>setPodForm(f=>({...f,title:t.title,topic:t.topic,guestRole:f.guestRole||t.guest||''}))}
                            style={{padding:'8px 12px',background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.12)',borderRadius:6,cursor:'pointer',display:'flex',gap:10,alignItems:'flex-start'}}
                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.14)'}
                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(99,102,241,0.06)'}>
                            <span style={{fontSize:11,fontWeight:700,color:'#475569',flexShrink:0,width:18}}>{i+1}</span>
                            <div style={{flex:1}}>
                              <div style={{fontSize:12,fontWeight:700,color:'#f1f5f9'}}>{t.title}</div>
                              {t.topic&&<div style={{fontSize:11,color:'#64748b',marginTop:2}}>{t.topic}</div>}
                              {t.guest&&<div style={{fontSize:10,color:'#475569',marginTop:2}}>💡 Guest: {t.guest}</div>}
                            </div>
                            <span style={{fontSize:10,color:'#6366f1',flexShrink:0,marginTop:2}}>Use →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    <div>
                      <label style={{fontSize:11,color:'#64748b',fontWeight:700,display:'block',marginBottom:5}}>Episode Title</label>
                      <input value={podForm.title} onChange={(e:any)=>setPodForm(f=>({...f,title:e.target.value}))}
                        className="inp" style={{fontSize:13,padding:'10px 12px',width:'100%'}} placeholder="e.g. The Future of Regulated Trading in 2026"/>
                    </div>
                    <div>
                      <label style={{fontSize:11,color:'#64748b',fontWeight:700,display:'block',marginBottom:5}}>Topic — what the conversation covers</label>
                      <input value={podForm.topic} onChange={(e:any)=>setPodForm(f=>({...f,topic:e.target.value}))}
                        className="inp" style={{fontSize:13,padding:'10px 12px',width:'100%'}} placeholder="e.g. Regulation trust, CopyTrading, retail investor growth in 2026"/>
                    </div>
                  </div>
                </div>
                {podCreateResult?.error&&<div style={{padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:6,fontSize:12,color:'#ef4444',marginBottom:10}}>❌ {podCreateResult.error}</div>}
                {podCreateResult?.ok&&(
                  <div style={{padding:'10px 12px',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:6,marginBottom:10}}>
                    <div style={{fontSize:12,color:'#10b981',fontWeight:700,marginBottom:6}}>✅ Episode created + audio generated — {podCreateResult.words} words</div>
                    {podCreateResult.audioUrl&&<audio controls src={podCreateResult.audioUrl} style={{width:'100%',height:28}} preload="none"/>}
                  </div>
                )}

                <div style={{display:'flex',gap:8}}>
                  <button onClick={createPodcastEpisode} disabled={podCreating}
                    style={{flex:1,padding:'11px',background:podCreating?'#334155':'linear-gradient(135deg,#6366f1,#4f46e5)',border:'none',borderRadius:8,color:podCreating?'#475569':'#fff',fontWeight:700,fontSize:13,cursor:podCreating?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    {podCreating?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⏳</span> Generating script + audio (~2–3 min)…</>:<>🎙 Create Episode + Generate Audio</>}
                  </button>
                  <button onClick={()=>{setPodCreateResult(null);setPodTopics([])}} className="btn b-ghost" style={{fontSize:11}}>Clear</button>
                </div>
              </div>
            )}

            {/* ── EPISODE LIBRARY ── all episodes */}
            <div className="card" style={{marginBottom:16}}>
              <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div className="syne" style={{fontSize:13,fontWeight:800,color:'#94a3b8'}}>📚 EPISODE LIBRARY</div>
                <div style={{display:'flex',gap:8,fontSize:11,color:'#475569'}}>
                  <span style={{color:'#10b981'}}>● {allPodcasts.filter((p:any)=>p.status==='published').length} Published</span>
                  <span>·</span>
                  <span style={{color:'#f59e0b'}}>○ {allPodcasts.filter((p:any)=>p.status!=='published').length} Draft</span>
                </div>
              </div>
              {allPodcasts.length===0 ? (
                <div style={{padding:'48px 20px',textAlign:'center',color:'#334155'}}>
                  <div style={{fontSize:32,marginBottom:12}}>🎙</div>
                  <div style={{fontSize:14,color:'#64748b',marginBottom:16}}>No episodes yet</div>
                  <button className="btn b-green" onClick={()=>setPodcastForm(true)}>➕ Create First Episode</button>
                </div>
              ) : (
                <div style={{padding:16,display:'flex',flexDirection:'column',gap:10}}>
                  {allPodcasts.map((ep:any)=>(
                    <PodcastLibraryCard key={ep.id} ep={ep} clients={clients}
                      onStatusChange={(id:string,status:string)=>{
                        // Local optimistic update — page will refetch on next load
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PORTALS */}
        {tab==='portals'&&<PortalsTab />}

        {/* CONTENT */}
        {tab==='content'&&(
          <div className="ti">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div className="syne" style={{fontSize:20,fontWeight:900}}>📰 Content</div>
              <button className="btn b-green" onClick={runCron} disabled={cronRunning}>{cronRunning?<><Spinner/> Running…</>:<>🗞️ Generate Now</>}</button>
            </div>
            {clients.map((cl:any)=>{
              const arts=allContent.filter((c:any)=>c.client_id===cl.id).slice(0,10)
              if(arts.length===0) return null
              return(
                <div key={cl.id} className="card" style={{marginBottom:14,padding:18}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>{cl.company_name} — Brand Articles</div>
                  {arts.map((a:any,i:number)=>(
                    <div key={i} style={{display:'flex',gap:10,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',alignItems:'center',fontSize:12}}>
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:'rgba(99,102,241,0.1)',color:'#818cf8',flexShrink:0,fontWeight:600}}>{a.portal_name}</span>
                      <a href={a.article_url} target="_blank" rel="noopener noreferrer" style={{flex:1,color:'#94a3b8',textDecoration:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.title||a.article_url}</a>
                      <span style={{flexShrink:0,color:'#334155',fontSize:11}}>{timeAgo(a.published_at)}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* REVIEWS */}
        {tab==='reviews'&&(
          <div className="ti">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div className="syne" style={{fontSize:20,fontWeight:900}}>⭐ Review Management</div>
              <div style={{fontSize:12,color:'#475569'}}>{companies.length} companies · {allReviews.length} reviews</div>
            </div>
            {pendingReviews.length>0&&(
              <div className="card" style={{padding:18,marginBottom:16,borderLeft:'3px solid #f59e0b'}}>
                <div style={{fontWeight:700,fontSize:13,color:'#f59e0b',marginBottom:12}}>⚠️ {pendingReviews.length} Pending Reviews</div>
                {pendingReviews.map((r:any)=>(
                  <div key={r.id} style={{padding:'10px 12px',background:'rgba(255,255,255,0.03)',borderRadius:8,display:'flex',gap:10,alignItems:'flex-start',marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600}}>{r.company_name||r.company_slug} · {'★'.repeat(r.rating||4)}</div>
                      <div style={{fontSize:11,color:'#94a3b8',marginTop:3}}>{(r.review_text||'').slice(0,120)}…</div>
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn b-green" style={{fontSize:11,padding:'5px 12px'}} onClick={()=>approveReview(r.id,'approved')}>✓ Approve</button>
                      <button className="btn b-red" style={{fontSize:11,padding:'5px 12px'}} onClick={()=>approveReview(r.id,'rejected')}>✗ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="card" style={{padding:18}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>Verivex Companies ({companies.length})</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8}}>
                {companies.slice(0,30).map((co:any)=>(
                  <a key={co.id} href={`https://verivex.co/${co.slug}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
                    <div style={{padding:'8px 12px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:7}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{co.name}</div>
                      <div style={{fontSize:10,color:'#475569',marginTop:1}}>{co.category}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RANKINGS */}
        {tab==='rankings'&&(
          <div className="ti">
            <div className="syne" style={{fontSize:20,fontWeight:900,marginBottom:20}}>🎯 SERP Rankings</div>
            {allRankings.length===0?<div className="card" style={{padding:40,textAlign:'center',color:'#334155'}}>No ranking data yet</div>:(
              <div className="card" style={{padding:18}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    {['Keyword','Position','Portal','Change','Updated'].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:10,color:'#475569',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {allRankings.map((r:any,i:number)=>{const pos=r.current_position;const pc=pos<=3?'#10b981':pos<=10?'#f59e0b':pos<=20?'#94a3b8':'#ef4444';return(
                      <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        <td style={{padding:'8px 10px',color:'#cbd5e1',fontWeight:500}}>{r.keyword}</td>
                        <td style={{padding:'8px 10px'}}><span className="syne" style={{fontSize:14,fontWeight:900,color:pc}}>#{pos}</span></td>
                        <td style={{padding:'8px 10px',color:'#64748b'}}>{r.site_slug||'—'}</td>
                        <td style={{padding:'8px 10px',color:r.position_change>0?'#10b981':r.position_change<0?'#ef4444':'#334155'}}>{r.position_change>0?`↑${r.position_change}`:r.position_change<0?`↓${Math.abs(r.position_change)}`:'—'}</td>
                        <td style={{padding:'8px 10px',color:'#334155'}}>{r.updated_at?timeAgo(r.updated_at):'-'}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {tab==='costs'&&(<div style={{padding:'24px'}}><CostTracker /></div>)}

        {/* Floating Claude Topup Logger — always visible */}
        <FloatingTopupButton />
        {tab==='videos'&&(
          <VideoStudio allPodcasts={allPodcasts}/>
        )}
        {tab==='settings'&&(
          <div className="ti">
            <div className="syne" style={{fontSize:20,fontWeight:900,marginBottom:20}}>⚙️ Settings</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div className="card" style={{padding:20}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>Quick Actions</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  <button className="btn b-green" onClick={runCron} disabled={cronRunning} style={{justifyContent:'flex-start'}}>{cronRunning?<><Spinner/> Running…</>:<>🗞️ Generate Articles Now</>}</button>
                  <a href="/api/cron-reviews?secret=REDACTED_CRON_SECRET" target="_blank"><button className="btn b-ghost" style={{width:'100%',justifyContent:'flex-start'}}>⭐ Run Reviews Cron</button></a>
                  <a href="/api/cron-companies?secret=REDACTED_CRON_SECRET" target="_blank"><button className="btn b-ghost" style={{width:'100%',justifyContent:'flex-start'}}>🏢 Run Companies Cron</button></a>
                  <a href="https://supabase.com/dashboard/project/gykxxhxsakxhfuutgobb" target="_blank" rel="noopener noreferrer"><button className="btn b-ghost" style={{width:'100%',justifyContent:'flex-start'}}>🗄 Supabase ↗</button></a>
                  <a href="https://vercel.com/team_i0UdvDcC0rdntVBoxbP7i46X" target="_blank" rel="noopener noreferrer"><button className="btn b-ghost" style={{width:'100%',justifyContent:'flex-start'}}>▲ Vercel ↗</button></a>
                </div>
                {cronMsg&&<div style={{marginTop:12,padding:'8px 12px',background:'rgba(16,185,129,0.1)',borderRadius:7,fontSize:12,color:'#10b981'}}>{cronMsg}</div>}
              </div>
              <div className="card" style={{padding:20}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>Flip Portals to Indexed</div>
                <div style={{fontSize:12,color:'#475569',marginBottom:14}}>These portals are building authority. Flip when ready to index by Google.</div>
                {sortedSites.filter((s:any)=>s.noindex).map((s:any)=>(
                  <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600}}>{s.name}</div>
                      <div style={{fontSize:10,color:'#475569'}}>{s.domain||PORTAL_DOMAIN[s.slug]}</div>
                    </div>
                    <a href={`/api/admin/flip-live?slug=${s.slug}&secret=REDACTED_CRON_SECRET`}><button className="btn b-green" style={{fontSize:10,padding:'5px 12px'}}>Flip Live ✓</button></a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
