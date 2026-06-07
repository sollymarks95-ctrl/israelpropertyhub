'use client'
import MobileNav from '@/app/components/MobileNav'
import React, { useState } from 'react'


const IMGS = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1526628953301-3cd9e37dc0d7?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1518183214770-9cffbec72538?w=1200&q=80&fm=jpg',
  'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=1200&q=80&fm=jpg',
]
function slugHash(s:string){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))&0xffffffff;return Math.abs(h)}
const getImg = (a:any, i:number) => (a?.cover_image_url && a.cover_image_url.startsWith('http')) ? a.cover_image_url : IMGS[(a?.slug ? slugHash(a.slug) : i) % IMGS.length]

const SITE_META: Record<string,{name:string;domain:string;color:string;tagline:string}> = {
  'business-pulse':    {name:'Bizplezx', domain:'bizplezx.com', color:'#6741D9', tagline:'Business Strategy & Innovation Intelligence'},
  'executive-network': {name:'Execvex',  domain:'execvex.com',  color:'#3B5BDB', tagline:'Executive Leadership & Career Intelligence'},
}

const SECTIONS = ['All','Markets','Strategy','Leadership','ESG','Analysis','Business']
const SEC_FILTER: Record<string,string[]> = {
  'Markets':   ['markets','equities','stocks','financial'],
  'Strategy':  ['strategy','strategic','execution','planning'],
  'Leadership':['leadership','executive','ceo','management','director'],
  'ESG':       ['esg','sustainability','environment','governance','social'],
  'Analysis':  ['analysis','research','report','outlook'],
  'Business':  ['business','corporate','enterprise','company'],
}

function timeAgo(d:string) {
  const s=Math.floor((Date.now()-new Date(d).getTime())/1000)
  if(s<3600) return `${Math.floor(s/60)} min ago`
  if(s<86400) return `${Math.floor(s/3600)} hours ago`
  return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long'})
}

function Newsletter({siteName,p}:any) {
  const [email,setEmail]=useState('');const [done,setDone]=useState(false)
  async function sub(e:React.FormEvent){e.preventDefault();try{await fetch('/api/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,siteName})})}catch{}setDone(true)}
  return done
    ?<div style={{padding:'14px 18px',background:'rgba(255,255,255,0.15)',borderRadius:4,fontSize:14,fontWeight:700,color:'#fff',fontFamily:'Inter,sans-serif'}}>✓ Subscribed! First issue tomorrow morning.</div>
    :<form onSubmit={sub} style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <input value={email} onChange={(e:any)=>setEmail(e.target.value)} type="email" placeholder="Your work email" required
        style={{flex:1,padding:'11px 16px',border:'none',fontFamily:'Inter,sans-serif',fontSize:13,minWidth:200,outline:'none'}}/>
      <button type="submit" style={{padding:'11px 22px',background:'#1A1A1A',color:'#fff',border:'none',fontFamily:'Inter,sans-serif',fontWeight:700,fontSize:13,cursor:'pointer',whiteSpace:'nowrap'}}>Join Free →</button>
    </form>
}
export default function MagazineTemplate({ articles=[], site, siteSlug, primaryColor , searchParams}:any) {
  const [section, setSection] = useState('All')
  const meta = SITE_META[siteSlug] || {name:site?.name||'Bizplezx',domain:'bizplezx.com',color:'#6741D9',tagline:'Business Intelligence'}
  const p = primaryColor || meta.color

  const [searchQ, setSearchQ] = useState(((searchParams as any)?.q as string) || '')

  // Filter by section: exact category match OR keyword in title
  const filtered = section === 'All'
    ? articles
    : articles.filter((a:any) => {
        const cat = (a.category || '').toLowerCase().trim()
        const title = (a.title || '').toLowerCase()
        const sec = section.toLowerCase()
        const kws = SEC_FILTER[section] || [sec]
        return cat === sec || cat.startsWith(sec) || kws.some((k:string) => title.includes(k) || cat.includes(k))
      })

  // Search overrides section filter
  const visible = searchQ.trim()
    ? articles.filter((a:any) => `${a.title} ${a.excerpt||''} ${a.category||''}`.toLowerCase().includes(searchQ.toLowerCase()))
    : filtered

  const hero=visible[0]; const feat=visible.slice(1,4); const list=visible.slice(4,14)


  const MobileLayout = () => (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:'#FAFAF8',minHeight:'100vh',paddingTop:88}}>
      <MobileNav siteName={site?.name||'Bizplezx'} domain="bizplezx.com" accentColor={primaryColor||'#6741D9'}
        sections={['All','Strategy','Leadership','Innovation','Finance']} activeSection="All" onSectionChange={()=>{}}
        logoStyle="serif"/>
      <div style={{padding:'0 16px 32px'}}>
        {articles[0] && (
          <a href={`/article/${siteSlug}/${articles[0].slug}`} style={{display:'block',textDecoration:'none',paddingBottom:20,marginBottom:20,marginTop:16,borderBottom:'2px solid #1a1a1a'}}>
            <img referrerPolicy="no-referrer" crossOrigin="anonymous"
              src={articles[0].cover_image_url||`https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=75`}
              alt={articles[0].title} style={{width:'100%',height:210,objectFit:'cover',borderRadius:6,marginBottom:14}}
              onError={(e:any)=>{e.currentTarget.style.display='none'}}/>
            <span style={{fontSize:9,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:primaryColor||'#6741D9',display:'block',marginBottom:8}}>{articles[0].category||'Strategy'}</span>
            <div style={{fontFamily:"'Georgia',serif",fontSize:22,fontWeight:800,lineHeight:1.25,color:'#1a1a1a',marginBottom:8}}>{articles[0].title}</div>
            <div style={{fontSize:14,color:'#555',lineHeight:1.7,marginBottom:8}}>{(articles[0].excerpt||'').slice(0,150)}…</div>
            <div style={{fontSize:11,color:'#999'}}>{articles[0].author_name||'Staff'} · {articles[0].read_time_minutes||5} min read</div>
          </a>
        )}
        {articles.slice(1,25).map((a:any,i:number)=>(
          <a key={a.id} href={`/article/${siteSlug}/${a.slug}`}
            style={{display:'flex',gap:12,paddingBottom:18,marginBottom:18,borderBottom:'1px solid #ede8e0',textDecoration:'none',alignItems:'flex-start'}}>
            <img referrerPolicy="no-referrer" crossOrigin="anonymous"
              src={a.cover_image_url||`https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=60`}
              alt={a.title} style={{width:90,height:68,objectFit:'cover',borderRadius:4,flexShrink:0}}
              onError={(e:any)=>{e.currentTarget.style.display='none'}}/>
            <div style={{flex:1,minWidth:0}}>
              <span style={{fontSize:9,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:primaryColor||'#6741D9',display:'block',marginBottom:4}}>{a.category||'Business'}</span>
              <div style={{fontFamily:"'Georgia',serif",fontSize:15,fontWeight:700,lineHeight:1.3,color:'#1a1a1a',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.title}</div>
              <div style={{fontSize:11,color:'#999',marginTop:4}}>{a.author_name||'Staff'} · {a.read_time_minutes||4} min</div>
            </div>
          </a>
        ))}
      </div>
      <div style={{background:'#1a1a1a',color:'#888',padding:'20px 16px'}}>
        <div style={{fontFamily:"'Georgia',serif",fontSize:16,fontWeight:900,color:'#fff',marginBottom:6}}>{site?.name||'Bizplezx'}</div>
        <div style={{fontSize:11,lineHeight:1.6,marginBottom:12}}>Business strategy and leadership intelligence.</div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:8}}>
          {[['Privacy','/legal/privacy'],['Terms','/legal/terms'],['About','/legal/about']].map(([l,h])=>(<a key={l} href={h} style={{color:'#888',fontSize:11,textDecoration:'none'}}>{l}</a>))}
        </div>
        <div style={{fontSize:10,color:'#555'}}>© {new Date().getFullYear()} bizplezx.com</div>
      </div>
    </div>
  )



  return (
    <>
      <div className="mag-mobile" style={{display:'none'}}>
        <MobileLayout/>
      </div>
      <div className="mag-desktop" style={{display:'block'}}>
    <div style={{fontFamily:'Georgia,serif',background:'#FAFAF8',color:'#1A1A1A',minHeight:'100vh'}}>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} a{text-decoration:none;color:inherit} img{max-width:100%;display:block}
        .mhl{font-family:'Playfair Display',Georgia,serif;font-weight:800;line-height:1.2;color:#1A1A1A}
        .mcard:hover .mhl{color:${p}}
        .mmeta{font-family:Inter,sans-serif;font-size:11px;color:#888;font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin-top:8px}
        .mcat{font-family:Inter,sans-serif;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${p};margin-bottom:8px;display:block}
        .mnav button{font-family:Inter,sans-serif;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:11px 14px;border:none;background:none;cursor:pointer;color:#888;border-bottom:2px solid transparent;white-space:nowrap}
        .mnav button.on,.mnav button:hover{color:${p};border-bottom-color:${p}}
        .flink{font-family:Inter,sans-serif;font-size:12px;color:#888}
        .flink:hover{color:${p}}.m2{grid-template-columns:1fr!important}}

        @media(max-width:768px){
          .mag-grid{grid-template-columns:1fr!important}
          .mag-featured{grid-template-columns:1fr!important}
          .mag-sidebar{display:none!important}
          .mag-nav{overflow-x:auto!important;flex-wrap:nowrap!important;gap:6px!important}
        }
        @media(max-width:480px){
          h1{font-size:22px!important}
          h2{font-size:18px!important}
          h3{font-size:15px!important}
          .mag-hero{padding:16px!important}
          p{font-size:14px!important}
          section{padding:16px!important}
        }section{padding:16px!important}}
          .mag-grid{grid-template-columns:1fr!important}
          .mag-sidebar{display:none!important}
          .mag-nav{overflow-x:auto;white-space:nowrap}
          h1{font-size:22px!important}
          .mag-layout{grid-template-columns:1fr!important}
          }
      `}</style>

      {/* Top stripe */}
      <div style={{background:p,color:'#fff',fontFamily:'Inter,sans-serif',fontSize:11,fontWeight:700,letterSpacing:'.06em',padding:'7px 28px',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <span>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
        <span>{meta.domain} · {meta.tagline}</span>
      </div>

      {/* Masthead */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 28px',borderBottom:'3px solid #1A1A1A'}}>
        <div style={{textAlign:'center',padding:'18px 0 14px',borderBottom:'1px solid #ddd',marginBottom:10}}>
          {/* Clickable logo */}
          <a href="/">
            <div style={{fontFamily:'Playfair Display,serif',fontSize:58,fontWeight:900,letterSpacing:'-0.04em',lineHeight:1,display:'inline-block'}}>
              {meta.name.slice(0,-1)}<span style={{color:p}}>{meta.name.slice(-1)}</span>
            </div>
          </a>
          <div style={{fontFamily:'Georgia,serif',fontSize:13,color:'#888',marginTop:5,fontStyle:'italic'}}>{meta.tagline}</div>
        </div>
        <nav className="mnav" style={{display:'flex',justifyContent:'center',flexWrap:'wrap'}}>
          {SECTIONS.map(s => {
          const cnt = s === 'All' ? articles.length : articles.filter((a:any) => {
            const cat = (a.category||'').toLowerCase().trim()
            const kws = SEC_FILTER[s] || [s.toLowerCase()]
            return cat === s.toLowerCase() || kws.some((k:string) => (a.title||'').toLowerCase().includes(k) || cat.includes(k))
          }).length
          return (
            <button key={s} onClick={()=>setSection(s)} className={section===s?'on':''}>
              {s}{s!=='All' && cnt>0 && <span style={{marginLeft:4,fontSize:9,opacity:.7}}>({cnt})</span>}
            </button>
          )
        })}
        
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',padding:'0 8px',gap:6,flexShrink:0}}>
            <input value={searchQ} onChange={(e:any)=>setSearchQ(e.target.value)}
              placeholder="🔍 Search…"
              style={{padding:'5px 10px',border:'1px solid #ddd',fontSize:12,fontFamily:'Inter,sans-serif',outline:'none',borderRadius:2,width:150,background:'transparent'}}
            />
            {searchQ && <button onClick={()=>setSearchQ('')} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:12,fontWeight:700}}>✕</button>}
          </div>
</nav>
      <div style={{background:'#fff',borderBottom:'1px solid #eee',padding:'6px 28px',display:'flex',gap:20,alignItems:'center',fontFamily:'Inter,sans-serif'}}>
        <a href="/podcasts" style={{fontSize:12,fontWeight:700,color:'#6741D9',letterSpacing:'.04em',display:'flex',alignItems:'center',gap:5}}>🎙 Podcast Series</a>
      </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1280,margin:'0 auto',padding:'32px 28px'}}>
              {/* Hero */}
        {hero && (
          <div className="mhero" style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:44,marginBottom:44,paddingBottom:36,borderBottom:'1px solid #ddd'}}>
            <div className="mcard">
              <span className="mcat">{hero.category}</span>
              <a href={`/article/${siteSlug}/${hero.slug}`}><div className="mhl" style={{fontSize:40,marginBottom:14}}>{hero.title}</div></a>
              <div style={{fontFamily:'Georgia,serif',fontSize:16,color:'#444',lineHeight:1.75,marginBottom:12}}>{hero.excerpt?.slice(0,240)}</div>
              <div className="mmeta">By {hero.author_name||'Editorial'} · {timeAgo(hero.published_at)} · {hero.read_time_minutes||5} min read</div>
              <a href={`/article/${siteSlug}/${hero.slug}`} style={{display:'inline-block',marginTop:14,fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:700,color:p,borderBottom:`2px solid ${p}`,paddingBottom:2}}>Read Full Article →</a>
            </div>
            <a href={`/article/${siteSlug}/${hero.slug}`}><img referrerPolicy="no-referrer" crossOrigin="anonymous" src={getImg(hero,0)} alt={hero.title} style={{width:'100%',height:340,objectFit:'cover'}} onError={(e:any)=>{const fb=IMGS[Math.floor(Math.random()*IMGS.length)];e.currentTarget.onerror=null;e.currentTarget.src=fb}}/></a>
          </div>
        )}

        {/* 3-col featured */}
        <div className="m3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:28,marginBottom:44,paddingBottom:36,borderBottom:'1px solid #ddd'}}>
          {(feat.length ? feat : articles.slice(1,4)).map((a:any,i:number)=>(
            <div key={a.id} className="mcard">
              <a href={`/article/${siteSlug}/${a.slug}`}><img referrerPolicy="no-referrer" crossOrigin="anonymous" src={getImg(a,i+1)} alt={a.title} style={{width:'100%',height:190,objectFit:'cover',marginBottom:12}} onError={(e:any)=>{const fb=IMGS[Math.floor(Math.random()*IMGS.length)];e.currentTarget.onerror=null;e.currentTarget.src=fb}}/></a>
              <span className="mcat">{a.category}</span>
              <a href={`/article/${siteSlug}/${a.slug}`}><div className="mhl" style={{fontSize:20,marginBottom:8}}>{a.title}</div></a>
              <div style={{fontFamily:'Georgia,serif',fontSize:13,color:'#555',lineHeight:1.6}}>{a.excerpt?.slice(0,110)}</div>
              <div className="mmeta">{timeAgo(a.published_at)}</div>
            </div>
          ))}
        </div>

        {/* List */}
        <div style={{fontFamily:'Inter,sans-serif',fontSize:10,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#999',marginBottom:18,paddingBottom:6,borderBottom:'2px solid #1A1A1A'}}>Latest Analysis</div>
        <div className="m2" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:18,marginBottom:44}}>
          {(list.length ? list : articles.slice(4,14)).map((a:any,i:number)=>(
            <a key={a.id} href={`/article/${siteSlug}/${a.slug}`} className="mcard" style={{display:'flex',gap:14,paddingBottom:16,borderBottom:'1px solid #ddd'}}>
              <img referrerPolicy="no-referrer" crossOrigin="anonymous" src={getImg(a,i+4)} alt={a.title} style={{width:96,height:68,objectFit:'cover',flexShrink:0}} onError={(e:any)=>{const fb=IMGS[Math.floor(Math.random()*IMGS.length)];e.currentTarget.onerror=null;e.currentTarget.src=fb}}/>
              <div>
                <span className="mcat" style={{fontSize:9,marginBottom:4}}>{a.category}</span>
                <div className="mhl" style={{fontSize:16,marginBottom:4}}>{a.title}</div>
                <div className="mmeta" style={{margin:0}}>{timeAgo(a.published_at)}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Newsletter */}
        <div style={{background:`linear-gradient(135deg,${p},${p}CC)`,padding:'30px 32px',borderRadius:4,marginBottom:32}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:24,fontWeight:800,color:'#fff',marginBottom:6}}>Get the {meta.name} Morning Brief</div>
          <div style={{fontFamily:'Inter,sans-serif',fontSize:14,color:'rgba(255,255,255,0.8)',marginBottom:18}}>Top business intelligence, executive insights and strategy analysis — every morning, free.</div>
          <Newsletter siteName={meta.name} p={p}/>
        </div>
      </div>

      {/* Legal footer */}
      <div style={{background:'#1A1A1A',color:'#666',padding:'28px'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:24,marginBottom:20}}>
            <div>
              <a href="/"><div style={{fontFamily:'Playfair Display,serif',fontSize:22,fontWeight:900,color:'#fff',marginBottom:8}}>{meta.name}</div></a>
              <div style={{fontFamily:'Inter,sans-serif',fontSize:12,color:'#555',lineHeight:1.7,maxWidth:380}}>
                {meta.tagline}. All content is for informational purposes only and does not constitute professional business or financial advice.
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px 32px'}}>
              {[['About','/legal/about'],['Privacy Policy','/legal/privacy'],['Terms of Service','/legal/terms'],['Disclaimer','/legal/disclaimer'],['Advertise','/legal/advertise'],['Contact','https://t.me/rephub_intelligence']].map(([l,h])=>(
                <a key={l} href={h} className="flink">{l}</a>
              ))}
            </div>
          </div>
          <div style={{borderTop:'1px solid #222',paddingTop:14,fontFamily:'Inter,sans-serif',fontSize:11,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>

            {/* Cross-portal intelligence network */}
            
            <span>© {new Date().getFullYear()} {meta.domain} · All Rights Reserved</span>
            <span style={{color:'#444'}}>Content is editorial and does not constitute financial or business advice. Always consult a professional.</span>
          </div>
        </div>
      </div>
    </div>
      </div>
    </>
  )
}
