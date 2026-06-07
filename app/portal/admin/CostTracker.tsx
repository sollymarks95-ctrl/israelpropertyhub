'use client'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  { id:'claude',      label:'Claude AI',    icon:'🤖', color:'#A78BFA' },
  { id:'vercel',      label:'Vercel',       icon:'▲',  color:'#F1F5F9' },
  { id:'domains',     label:'Domains',      icon:'🌐', color:'#38BDF8' },
  { id:'heygen',      label:'HeyGen',       icon:'🎥', color:'#F59E0B' },
  { id:'elevenlabs',  label:'ElevenLabs',   icon:'🎙', color:'#10B981' },
  { id:'shotstack',   label:'Shotstack',    icon:'🎬', color:'#EF4444' },
  { id:'supabase',    label:'Supabase',     icon:'🗄️', color:'#3ECF8E' },
  { id:'anthropic',   label:'API Credits',  icon:'💳', color:'#6366F1' },
  { id:'other',       label:'Other',        icon:'📦', color:'#94A3B8' },
]

const BILLING_TYPES = [
  { id:'one_time', label:'One-time' },
  { id:'monthly',  label:'Monthly'  },
  { id:'annual',   label:'Annual'   },
]

const API_COSTS = {
  heygen_video:     1.20,
  elevenlabs_audio: 0.30,
  shotstack_render: 0.25,
  claude_article:   0.015,
}

const G = '#10B981'
const card = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:20 }

function fmt(n: number) { return '$' + n.toFixed(2) }

export default function CostTracker() {
  const today = new Date().toISOString().split('T')[0]
  const d14ago = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0]

  const [entries, setEntries]     = useState<any[]>([])
  const [usage, setUsage]         = useState<any>({})
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [catFilter, setCatFilter] = useState<string>('all')
  const [dateFrom, setDateFrom]   = useState(d14ago)
  const [dateTo, setDateTo]       = useState(today)
  const [fetchingGmail, setFetchingGmail] = useState(false)
  const [gmailMsg, setGmailMsg]   = useState('')
  const [form, setForm] = useState({
    date: today, category:'claude', description:'', amount_usd:'', billing_type:'one_time', notes:'',
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [cr, ur] = await Promise.all([fetch('/api/admin/costs'), fetch('/api/admin/costs/usage')])
      if (cr.ok) setEntries(await cr.json())
      if (ur.ok) setUsage(await ur.json())
    } catch {}
    setLoading(false)
  }

  async function addEntry() {
    if (!form.description || !form.amount_usd) return
    await fetch('/api/admin/costs', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, amount_usd: parseFloat(form.amount_usd) }),
    })
    setShowForm(false)
    setForm({ date:today, category:'claude', description:'', amount_usd:'', billing_type:'one_time', notes:'' })
    loadData()
  }

  async function deleteEntry(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/admin/costs?id=${id}`, { method:'DELETE' })
    loadData()
  }

  // Fetch invoices from Gmail via Anthropic API + Gmail MCP
  async function fetchGmailInvoices() {
    setFetchingGmail(true)
    setGmailMsg('Searching Gmail for Anthropic invoices…')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1500,
          system:`Search Gmail for emails from Anthropic or billing@anthropic.com or receipts from claude.ai in the last 14 days. 
Look for: invoice emails, receipt emails, credit topup confirmations, billing notifications.
Return ONLY valid JSON — no other text:
{"invoices":[{"date":"YYYY-MM-DD","amount_usd":5.00,"description":"claude.ai credit topup"}],"total":25.00,"error":null}
If none found: {"invoices":[],"total":0,"error":null}
If Gmail inaccessible: {"invoices":[],"total":0,"error":"Gmail not accessible"}`,
          messages:[{role:'user',content:'Search my Gmail for all Anthropic/claude.ai billing emails and receipts from the last 14 days. Return JSON only.'}],
          mcp_servers:[{type:'url',url:'https://gmailmcp.googleapis.com/mcp/v1',name:'gmail'}],
        }),
      })
      const d = await res.json()
      const text = d.content?.find((c:any)=>c.type==='text')?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      const result = match ? JSON.parse(match[0]) : null

      if (!result || result.error) {
        setGmailMsg(result?.error || 'Could not read Gmail. Forward your Anthropic receipts to yourself and try again.')
        setFetchingGmail(false)
        return
      }
      if (result.invoices.length === 0) {
        setGmailMsg('No Anthropic invoices found in the last 14 days.')
        setFetchingGmail(false)
        return
      }

      // Log all found invoices
      for (const inv of result.invoices) {
        await fetch('/api/admin/costs', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            date: inv.date, category:'claude',
            description: inv.description || 'claude.ai invoice',
            amount_usd: inv.amount_usd, billing_type:'one_time',
            notes:'Auto-imported from Gmail',
          }),
        })
      }
      setGmailMsg(`✅ Imported ${result.invoices.length} invoice(s) totalling ${fmt(result.total)}`)
      loadData()
    } catch(e:any) {
      setGmailMsg('Error: ' + e.message)
    }
    setFetchingGmail(false)
  }

  // ── Calculations ─────────────────────────────────────────────────────────
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const monthlyFixed   = entries.filter(e=>e.billing_type==='monthly').reduce((s,e)=>s+parseFloat(e.amount_usd),0)
  const claudeAllTime  = entries.filter(e=>e.category==='claude').reduce((s,e)=>s+parseFloat(e.amount_usd),0)
  const allTimeTotal   = entries.reduce((s,e)=>s+parseFloat(e.amount_usd),0)
  const calcCosts      = (usage.articles_this_month||0)*API_COSTS.claude_article
  const monthlyTotal   = monthlyFixed + calcCosts

  // Filtered entries for the list
  const filtered = entries.filter(e => {
    const inDate = e.date >= dateFrom && e.date <= dateTo
    const inCat  = catFilter === 'all' || e.category === catFilter
    return inDate && inCat
  }).sort((a,b)=>b.date.localeCompare(a.date))

  const filteredTotal = filtered.filter(e=>e.billing_type==='one_time').reduce((s,e)=>s+parseFloat(e.amount_usd),0)

  // Category breakdown for date range
  const byCategory: Record<string,number> = {}
  filtered.forEach(e => {
    if (e.billing_type !== 'monthly')
      byCategory[e.category] = (byCategory[e.category]||0) + parseFloat(e.amount_usd)
  })
  entries.filter(e=>e.billing_type==='monthly').forEach(e => {
    byCategory[e.category] = (byCategory[e.category]||0) + parseFloat(e.amount_usd)
  })

  const catLookup = Object.fromEntries(CATEGORIES.map(c=>[c.id,c]))

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {label:'Monthly Burn',   value:fmt(monthlyTotal),    sub:'subscriptions + API',    color:G},
          {label:'Claude Topups',  value:fmt(claudeAllTime),   sub:`all time · ${entries.filter(e=>e.category==='claude').length} topups`,color:'#A78BFA'},
          {label:'Fixed Monthly',  value:fmt(monthlyFixed),    sub:'subscriptions',           color:'#38BDF8'},
          {label:'All-Time Spend', value:fmt(allTimeTotal),    sub:'total since June 2026',  color:'#F59E0B'},
        ].map(s=>(
          <div key={s.label} style={{...card,textAlign:'center'}}>
            <div style={{fontSize:11,color:'#64748b',marginBottom:6,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase'}}>{s.label}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:'#475569',marginTop:4}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>

        {/* LEFT */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>

          {/* Gmail invoice importer */}
          <div style={{...card, borderColor:'#A78BFA44'}}>
            <div style={{fontSize:13,fontWeight:800,color:'#F1F5F9',marginBottom:4}}>📧 Import from Gmail</div>
            <div style={{fontSize:11,color:'#475569',marginBottom:12}}>Auto-fetch your Anthropic invoice emails from the last 14 days</div>
            <button onClick={fetchGmailInvoices} disabled={fetchingGmail}
              style={{width:'100%',padding:'9px',borderRadius:8,border:'1px solid #A78BFA55',background:'#A78BFA15',color:'#A78BFA',fontWeight:700,fontSize:13,cursor:'pointer'}}>
              {fetchingGmail ? '⏳ Searching Gmail…' : '📧 Fetch Anthropic Invoices from Gmail'}
            </button>
            {gmailMsg && <div style={{fontSize:11,color: gmailMsg.startsWith('✅')?G:'#F59E0B',marginTop:8}}>{gmailMsg}</div>}
          </div>

          {/* Category breakdown */}
          <div style={card}>
            <div style={{fontSize:14,fontWeight:800,color:'#F1F5F9',marginBottom:16}}>📊 Breakdown ({dateFrom} → {dateTo})</div>
            {Object.entries(byCategory).sort(([,a],[,b])=>b-a).map(([cat,amt])=>{
              const c = catLookup[cat]
              const max = Math.max(...Object.values(byCategory))
              const pct = max > 0 ? (amt/max)*100 : 0
              return (
                <div key={cat} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:13,color:'#F1F5F9'}}>{c?.icon||'📦'} {c?.label||cat}</span>
                    <span style={{fontSize:13,fontWeight:700,color:c?.color||'#94A3B8'}}>{fmt(amt)}</span>
                  </div>
                  <div style={{height:5,background:'rgba(255,255,255,0.05)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:c?.color||'#94A3B8',borderRadius:3,opacity:.8}}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* API usage */}
          <div style={card}>
            <div style={{fontSize:13,fontWeight:800,color:'#F1F5F9',marginBottom:4}}>🔢 API Usage (auto-logged)</div>
            <div style={{fontSize:11,color:'#475569',marginBottom:12}}>Each API call auto-creates a cost entry • Prices: ElevenLabs $0.73/ep · HeyGen $0.30/vid · Shotstack $0.45/render · Claude API $0.015/article</div>
            {[
              {label:'Articles (Claude API)',  count:usage.articles_this_month||0,  unit:'$0.015 each',  cost:(usage.articles_this_month||0)*API_COSTS.claude_article, color:'#A78BFA'},
              {label:'Audio episodes (ElevenLabs)', count:usage.audios_this_month||0, unit:'$0.73 each', cost:(usage.audios_this_month||0)*API_COSTS.elevenlabs_audio, color:G},
              {label:'HeyGen avatar videos',   count:usage.videos_this_month||0,    unit:'$0.30 each',   cost:(usage.videos_this_month||0)*API_COSTS.heygen_video,     color:'#F59E0B'},
              {label:'Shotstack HD renders',   count:usage.renders_this_month||0,   unit:'$0.45 each',   cost:(usage.renders_this_month||0)*API_COSTS.shotstack_render, color:'#EF4444'},
            ].map(r=>(
              <div key={r.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div>
                  <div style={{fontSize:12,color:'#F1F5F9'}}>{r.label}</div>
                  <div style={{fontSize:10,color:'#475569'}}>{r.count} × {r.unit}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:r.color}}>{fmt(r.cost)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: entries with date filter */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:800,color:'#F1F5F9'}}>💳 Cost Entries</div>
              <button onClick={()=>setShowForm(f=>!f)}
                style={{fontSize:12,padding:'4px 12px',borderRadius:6,border:'none',cursor:'pointer',fontWeight:700,background:G,color:'#fff'}}>
                + Add
              </button>
            </div>

            {/* Date range filter */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
              <div>
                <div style={{fontSize:10,color:'#64748b',marginBottom:4,fontWeight:700}}>FROM</div>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
                  style={{width:'100%',padding:'6px 8px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.3)',color:'#F1F5F9',fontSize:12,boxSizing:'border-box'}}/>
              </div>
              <div>
                <div style={{fontSize:10,color:'#64748b',marginBottom:4,fontWeight:700}}>TO</div>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
                  style={{width:'100%',padding:'6px 8px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.3)',color:'#F1F5F9',fontSize:12,boxSizing:'border-box'}}/>
              </div>
            </div>

            {/* Quick date presets */}
            <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
              {[
                {l:'Today',   f:today,  t:today},
                {l:'7 days',  f:new Date(Date.now()-7*86400000).toISOString().split('T')[0], t:today},
                {l:'14 days', f:d14ago, t:today},
                {l:'30 days', f:new Date(Date.now()-30*86400000).toISOString().split('T')[0], t:today},
                {l:'All',     f:'2026-01-01', t:today},
              ].map(p=>(
                <button key={p.l} onClick={()=>{setDateFrom(p.f);setDateTo(p.t)}}
                  style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:'1px solid rgba(255,255,255,0.1)',background:dateFrom===p.f&&dateTo===p.t?`${G}22`:'rgba(255,255,255,0.03)',color:dateFrom===p.f&&dateTo===p.t?G:'#64748b',cursor:'pointer',fontWeight:700}}>
                  {p.l}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
              <button onClick={()=>setCatFilter('all')}
                style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',background:catFilter==='all'?G:'rgba(255,255,255,0.05)',color:catFilter==='all'?'#fff':'#64748b',fontWeight:700}}>
                All
              </button>
              {CATEGORIES.map(c=>(
                <button key={c.id} onClick={()=>setCatFilter(c.id)}
                  style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',background:catFilter===c.id?c.color+'33':'rgba(255,255,255,0.05)',color:catFilter===c.id?c.color:'#64748b',fontWeight:700}}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Total for filtered range */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'rgba(255,255,255,0.03)',borderRadius:8,marginBottom:12}}>
              <span style={{fontSize:12,color:'#64748b'}}>{filtered.length} entries in range</span>
              <span style={{fontSize:14,fontWeight:800,color:G}}>{fmt(filteredTotal + monthlyFixed)}</span>
            </div>

            {/* Add form */}
            {showForm && (
              <div style={{background:'rgba(16,185,129,0.06)',borderRadius:8,padding:14,marginBottom:14,border:`1px solid ${G}33`}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}
                    style={{padding:'6px 10px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.4)',color:'#F1F5F9',fontSize:12}}>
                    {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                  <select value={form.billing_type} onChange={e=>setForm(p=>({...p,billing_type:e.target.value}))}
                    style={{padding:'6px 10px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.4)',color:'#F1F5F9',fontSize:12}}>
                    {BILLING_TYPES.map(b=><option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                  <input value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Description"
                    style={{padding:'6px 10px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.4)',color:'#F1F5F9',fontSize:12}}/>
                  <input value={form.amount_usd} onChange={e=>setForm(p=>({...p,amount_usd:e.target.value}))} type="number" step="0.01" placeholder="Amount USD"
                    style={{padding:'6px 10px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.4)',color:'#F1F5F9',fontSize:12}}/>
                  <input value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} type="date"
                    style={{padding:'6px 10px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.4)',color:'#F1F5F9',fontSize:12}}/>
                  <input value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Notes (optional)"
                    style={{padding:'6px 10px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.4)',color:'#F1F5F9',fontSize:12}}/>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={addEntry} style={{flex:1,padding:'8px',borderRadius:6,border:'none',cursor:'pointer',background:G,color:'#fff',fontWeight:700,fontSize:13}}>Save</button>
                  <button onClick={()=>setShowForm(false)} style={{padding:'8px 16px',borderRadius:6,border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer',background:'transparent',color:'#94A3B8',fontSize:13}}>Cancel</button>
                </div>
              </div>
            )}

            {/* Entries */}
            {loading ? <div style={{fontSize:13,color:'#64748b'}}>Loading…</div> : (
              <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:420,overflowY:'auto'}}>
                {filtered.map((e:any)=>{
                  const cat = catLookup[e.category]
                  return (
                    <div key={e.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:8,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
                      <span style={{fontSize:15,flexShrink:0}}>{cat?.icon||'📦'}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:'#F1F5F9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.description}</div>
                        <div style={{fontSize:10,color:'#475569'}}>{e.date} · {BILLING_TYPES.find(b=>b.id===e.billing_type)?.label}</div>
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:cat?.color||'#94A3B8',flexShrink:0}}>{fmt(parseFloat(e.amount_usd))}</div>
                      <button onClick={()=>deleteEntry(e.id)} style={{fontSize:10,color:'#475569',background:'none',border:'none',cursor:'pointer',padding:'2px 6px'}}>✕</button>
                    </div>
                  )
                })}
                {filtered.length===0 && <div style={{fontSize:13,color:'#64748b'}}>No entries for this range.</div>}
              </div>
            )}
          </div>

          {/* Quick topup */}
          <div style={card}>
            <div style={{fontSize:13,fontWeight:800,color:'#F1F5F9',marginBottom:10}}>⚡ Quick Claude Topup</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[5,10,20,50].map(amt=>(
                <button key={amt} onClick={async()=>{
                  await fetch('/api/admin/costs',{method:'POST',headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({date:today,category:'claude',description:`claude.ai topup $${amt}`,amount_usd:amt,billing_type:'one_time',notes:'claude.ai credit topup'})})
                  loadData()
                }} style={{flex:1,padding:'10px',borderRadius:8,border:'1px solid #A78BFA44',background:'#A78BFA15',color:'#A78BFA',fontWeight:800,fontSize:14,cursor:'pointer'}}>
                  +${amt}
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:'#334155',marginTop:8}}>Also use the 💳 floating button (bottom-right) on any admin tab</div>
          </div>
        </div>
      </div>
    </div>
  )
}
