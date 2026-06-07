'use client'
import Link from 'next/link'

function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}) }

export default function WikiTemplate({ articles = [], site, routePrefix, siteSlug }: any) {
  const BLUE = '#1864AB'; const BG = '#F8F9FA'
  const siteName = site?.name || 'BIZPEDIA'

  const hero = articles[0]
  const cats: Record<string, any[]> = {}
  articles.slice(1).forEach((a: any) => { const c = a.category || 'General'; if (!cats[c]) cats[c] = []; cats[c].push(a) })

  return (
    <div style={{ fontFamily:"'Linux Libertine','Georgia',serif", background:'#fff', color:'#202122', minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Linux+Libertine:wght@400;700&family=Source+Sans+3:wght@300;400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} a{text-decoration:none;color:inherit} img{max-width:100%;display:block}
        .wiki-link{color:${BLUE};font-family:'Source Sans 3',sans-serif}
        .wiki-link:hover{text-decoration:underline}
        .wiki-toc{background:#F8F9FA;border:1px solid #A2A9B1;padding:14px 18px;display:inline-block;margin-bottom:20px;min-width:200px}
        .wiki-section{border-top:1px solid #A2A9B1;padding-top:12px;margin-top:20px}
        .wiki-article:hover{background:#F8F9FA}
        @media(max-width:768px){.wiki-layout{flex-direction:column!important}}
      `}</style>

      {/* Header */}
      <div style={{ background:BLUE, padding:'0 24px', borderBottom:'4px solid #1456A8' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:22, fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>
              BIZ<span style={{ color:'#A5D8FF' }}>PEDIA</span>
            </div>
            <div style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:11, color:'rgba(255,255,255,0.6)', borderLeft:'1px solid rgba(255,255,255,0.2)', paddingLeft:14 }}>
              bizpedia.com · The Financial Company Encyclopedia
            </div>
          </div>
          <div style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:12, color:'rgba(255,255,255,0.8)' }}>
            {articles.length.toLocaleString()} articles · Free knowledge
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background:'#F8F9FA', borderBottom:'1px solid #A2A9B1', padding:'12px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:8 }}>
          <input placeholder="Search company profiles, broker intelligence, industry profiles..." style={{ flex:1, border:'1px solid #A2A9B1', padding:'8px 14px', fontFamily:'Source Sans 3,sans-serif', fontSize:14, outline:'none', color:'#202122' }} />
          <button style={{ background:BLUE, color:'#fff', fontFamily:'Source Sans 3,sans-serif', fontWeight:600, fontSize:14, padding:'8px 20px', border:'none', cursor:'pointer' }}>Search</button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px', display:'flex', gap:32 }} className="wiki-layout">
        {/* Main */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Featured article */}
          {hero && (
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'#555', marginBottom:12, padding:'4px 10px', background:'#F0F3FA', borderLeft:`3px solid ${BLUE}`, display:'inline-block' }}>
                Featured Article
              </div>
              <div style={{ display:'flex', gap:24 }}>
                <div style={{ flex:1 }}>
                  <Link href={`/article/${siteSlug}/${hero.slug}`}>
                    <h1 style={{ fontFamily:'Linux Libertine,Georgia,serif', fontSize:28, fontWeight:700, color:'#202122', marginBottom:10, lineHeight:1.3 }}>{hero.title}</h1>
                  </Link>
                  <div className="wiki-toc">
                    <div style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:13, fontWeight:700, marginBottom:8, borderBottom:'1px solid #A2A9B1', paddingBottom:6 }}>Contents</div>
                    {['1. Overview', '2. Background', '3. Key Data', '4. Analysis', '5. Sources'].map((item, i) => (
                      <div key={i} style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:13, color:BLUE, padding:'2px 0', cursor:'pointer' }}>{item}</div>
                    ))}
                  </div>
                  <div style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:15, color:'#202122', lineHeight:1.7 }}>
                    {hero.excerpt?.slice(0,400)}
                    <Link href={`/article/${siteSlug}/${hero.slug}`} className="wiki-link" style={{ fontSize:13, marginLeft:8 }}>[Read more →]</Link>
                  </div>
                </div>
                {hero.cover_image_url && (
                  <div style={{ width:220, flexShrink:0 }}>
                    <div style={{ border:'1px solid #A2A9B1', padding:6, background:'#F8F9FA' }}>
                      <img src={hero.cover_image_url} alt={hero.title} style={{ width:'100%', height:160, objectFit:'cover' }} />
                      <div style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:11, color:'#555', padding:'6px 4px', textAlign:'center', lineHeight:1.4 }}>{hero.category} · {fmtDate(hero.published_at)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category sections */}
          {Object.entries(cats).map(([cat, arts]) => (
            <div key={cat} className="wiki-section">
              <h2 style={{ fontFamily:'Linux Libertine,Georgia,serif', fontSize:20, fontWeight:700, color:'#202122', marginBottom:12 }}>{cat}</h2>
              {arts.slice(0, 6).map((a: any) => (
                <div key={a.id} className="wiki-article" style={{ display:'flex', gap:16, padding:'8px 6px', borderBottom:'1px solid #F0F0F0' }}>
                  {a.cover_image_url && <img src={a.cover_image_url} alt={a.title} style={{ width:60, height:44, objectFit:'cover', border:'1px solid #A2A9B1', flexShrink:0 }} />}
                  <div>
                    <Link href={`/article/${siteSlug}/${a.slug}`} className="wiki-link" style={{ fontWeight:600, fontSize:15 }}>{a.title}</Link>
                    <div style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:12, color:'#555', marginTop:2 }}>
                      {a.author_name} · {fmtDate(a.published_at)} · {a.read_time_minutes || 4} min read
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ width:220, flexShrink:0 }}>
          <div style={{ border:'1px solid #A2A9B1', marginBottom:16 }}>
            <div style={{ background:BLUE, color:'#fff', fontFamily:'Source Sans 3,sans-serif', fontSize:13, fontWeight:700, padding:'6px 12px' }}>Statistics</div>
            {[['Articles',articles.length.toLocaleString()],['Categories',Object.keys(cats).length],['Last Updated','Today']].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontFamily:'Source Sans 3,sans-serif', fontSize:13, padding:'6px 12px', borderBottom:'1px solid #F0F0F0' }}>
                <span style={{ color:'#555' }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ border:'1px solid #A2A9B1', marginBottom:16 }}>
            <div style={{ background:'#F8F9FA', fontFamily:'Source Sans 3,sans-serif', fontSize:13, fontWeight:700, padding:'6px 12px', borderBottom:'1px solid #A2A9B1' }}>Categories</div>
            {Object.keys(cats).map(c => (
              <div key={c} style={{ fontFamily:'Source Sans 3,sans-serif', fontSize:13, padding:'5px 12px', borderBottom:'1px solid #F0F0F0' }}>
                <span className="wiki-link" style={{ cursor:'pointer' }}>{c}</span>
                <span style={{ color:'#888', fontSize:11, float:'right' }}>({cats[c].length})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:'#F8F9FA', borderTop:'1px solid #A2A9B1', padding:'16px 24px', fontFamily:'Source Sans 3,sans-serif', fontSize:12, color:'#555', textAlign:'center' }}>
        BIZPEDIA · bizpedia.com · The Financial Intelligence Encyclopedia · © {new Date().getFullYear()} Financial Intelligence Network
      </div>
    </div>
  )
}
