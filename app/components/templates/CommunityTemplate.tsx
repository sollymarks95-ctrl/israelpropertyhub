'use client'
import { useState } from 'react'
import Link from 'next/link'

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s/60)}m`
  if (s < 86400) return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`
}

const FLAIR: Record<string, { bg:string; color:string }> = {
  'Analysis':     { bg:'#FF4500',  color:'#fff' },
  'Signals':      { bg:'#00CC44',  color:'#fff' },
  'Discussion':   { bg:'#0079D3',  color:'#fff' },
  'News':         { bg:'#FF585B',  color:'#fff' },
  'Trade':        { bg:'#7193FF',  color:'#fff' },
  'Research':     { bg:'#FF8717',  color:'#fff' },
}

export default function CommunityTemplate({ articles = [], site, routePrefix, siteSlug }: any) {
  const [hot, setHot] = useState(true)
  const ORANGE = '#FF4500'; const BG = '#DAE0E6'; const CARD = '#fff'

  return (
    <div style={{ fontFamily:"'IBM Plex Sans','Inter',system-ui,sans-serif", background:BG, minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} a{text-decoration:none;color:inherit} img{max-width:100%;display:block}
        .comm-card{background:#fff;border:1px solid #CCC;border-radius:4px;margin-bottom:10px;transition:border-color .1s}
        .comm-card:hover{border-color:#898989}
        .vote-btn{background:none;border:none;cursor:pointer;font-size:18px;padding:4px 6px;border-radius:2px;display:block;width:100%;text-align:center;color:#878A8C}
        .vote-btn:hover{background:#E8E8E8}
        .comm-tag{display:inline-block;font-size:10px;font-weight:700;padding:2px 6px;border-radius:2px;margin-right:4px}
        .comm-btn{font-size:12px;font-weight:700;color:#878A8C;padding:6px 8px;border-radius:2px;cursor:pointer;border:none;background:none;display:inline-flex;align-items:center;gap:4px}
        .comm-btn:hover{background:#E8E8E8}
        .sort-btn{font-size:14px;font-weight:700;padding:8px 16px;border-radius:100px;cursor:pointer;border:none;display:flex;align-items:center;gap:6px}
        .sort-btn.active{background:#E8E8E8;color:#0D0D0D}
        .sort-btn:hover{background:#E8E8E8}
        @media(max-width:768px){.comm-layout{flex-direction:column!important} .comm-sidebar{display:none!important}}
      `}</style>

      {/* Header */}
      <div style={{ background:'#fff', borderBottom:'1px solid #EDEFF1', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 20px', height:48, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em' }}>
              <span style={{ color:ORANGE }}>trad</span><span style={{ color:'#0D0D0D' }}>vex</span>
            </div>
            <div style={{ fontSize:11, color:'#878A8C', borderLeft:'1px solid #EDEFF1', paddingLeft:12 }}>tradvex.com · Trade Community</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ background:ORANGE, color:'#fff', fontWeight:700, fontSize:12, padding:'6px 16px', borderRadius:100 }}>Join Community</div>
          </div>
        </div>
      </div>

      {/* Subreddit header */}
      <div style={{ background:`linear-gradient(to right, ${ORANGE}, #FF6534)`, height:64 }}>
        <div style={{ background:'rgba(0,0,0,0.3)', height:'100%' }} />
      </div>
      <div style={{ background:'#fff', borderBottom:'1px solid #EDEFF1', padding:'0 20px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:16, height:52 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:ORANGE, border:'4px solid #fff', marginTop:-28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:900, color:'#fff', flexShrink:0 }}>T</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>r/Tradvex</div>
            <div style={{ fontSize:11, color:'#878A8C' }}>tradvex.com · 47.2k members · {Math.floor(Math.random()*200+50)} online</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <button style={{ background:ORANGE, color:'#fff', fontWeight:700, fontSize:14, padding:'6px 20px', border:'none', borderRadius:100, cursor:'pointer' }}>+ Create Post</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px', display:'flex', gap:24 }} className="comm-layout">
        {/* Feed */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Sort */}
          <div style={{ background:'#fff', border:'1px solid #CCC', borderRadius:4, padding:'10px 12px', marginBottom:10, display:'flex', gap:8 }}>
            {[['🔥 Hot', true],['⬆ Top', false],['🆕 New', false],['📈 Rising', false]].map(([label, active]: any, i) => (
              <button key={i} className={`sort-btn ${active?'active':''}`}>{label}</button>
            ))}
          </div>

          {articles.map((a: any, i: number) => {
            const votes = Math.floor(Math.random() * 2400 + 50)
            const comments = Math.floor(Math.random() * 180 + 5)
            const flair = FLAIR[a.category] || { bg:'#878A8C', color:'#fff' }
            return (
              <div key={a.id} className="comm-card" style={{ display:'flex' }}>
                {/* Vote column */}
                <div style={{ width:40, background:'#F8F9FA', borderRadius:'4px 0 0 4px', display:'flex', flexDirection:'column', alignItems:'center', padding:'6px 0', gap:2, borderRight:'1px solid #EDEFF1' }}>
                  <button className="vote-btn" style={{ color:ORANGE }}>▲</button>
                  <div style={{ fontSize:12, fontWeight:700, color:'#1C1C1C' }}>{votes > 999 ? `${(votes/1000).toFixed(1)}k` : votes}</div>
                  <button className="vote-btn">▼</button>
                </div>
                {/* Content */}
                <div style={{ flex:1, padding:'8px 12px' }}>
                  <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, color:'#878A8C' }}>Posted by u/{a.author_name?.split(' ')[0]?.toLowerCase() || 'analyst'}</span>
                    <span style={{ fontSize:11, color:'#878A8C' }}>{timeAgo(a.published_at)}</span>
                    {a.category && <span className="comm-tag" style={{ background:flair.bg, color:flair.color }}>{a.category}</span>}
                  </div>
                  <Link href={`/article/${siteSlug}/${a.slug}`}>
                    <div style={{ fontSize:18, fontWeight:700, color:'#1C1C1C', lineHeight:1.3, marginBottom:8 }}>{a.title}</div>
                  </Link>
                  {i === 0 && a.cover_image_url && (
                    <img src={a.cover_image_url} alt={a.title} style={{ width:'100%', maxHeight:320, objectFit:'cover', borderRadius:4, marginBottom:8, border:'1px solid #EDEFF1' }} />
                  )}
                  {i < 3 && <div style={{ fontSize:13, color:'#555', lineHeight:1.5, marginBottom:8 }}>{a.excerpt?.slice(0,150)}</div>}
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="comm-btn">💬 {comments} Comments</button>
                    <button className="comm-btn">🔗 Share</button>
                    <button className="comm-btn">⭐ Save</button>
                    <button className="comm-btn">•••</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sidebar */}
        <div className="comm-sidebar" style={{ width:312, flexShrink:0 }}>
          <div style={{ background:`linear-gradient(to bottom, ${ORANGE}, #FF6534)`, borderRadius:4, overflow:'hidden', marginBottom:12 }}>
            <div style={{ padding:12, color:'#fff' }}>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>r/Tradvex</div>
              <div style={{ fontSize:13, opacity:.9 }}>The premier community for professional traders and market analysts.</div>
            </div>
            <div style={{ background:'rgba(0,0,0,0.15)', padding:12, display:'flex', gap:8 }}>
              <div style={{ flex:1, textAlign:'center', color:'#fff' }}>
                <div style={{ fontWeight:800, fontSize:20 }}>47.2k</div>
                <div style={{ fontSize:11, opacity:.8 }}>Members</div>
              </div>
              <div style={{ width:1, background:'rgba(255,255,255,0.3)' }} />
              <div style={{ flex:1, textAlign:'center', color:'#fff' }}>
                <div style={{ fontWeight:800, fontSize:20, color:'#7FFF7F' }}>● {Math.floor(Math.random()*200+100)}</div>
                <div style={{ fontSize:11, opacity:.8 }}>Online</div>
              </div>
            </div>
          </div>
          <div style={{ background:'#fff', border:'1px solid #CCC', borderRadius:4, padding:12, marginBottom:12 }}>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10, paddingBottom:8, borderBottom:'1px solid #EDEFF1' }}>Community Rules</div>
            {['1. Be respectful','2. No financial advice','3. Source your claims','4. No spam or self-promotion','5. Verified analysis only'].map(r => (
              <div key={r} style={{ fontSize:13, color:'#333', padding:'4px 0', borderBottom:'1px solid #F8F9FA' }}>{r}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
