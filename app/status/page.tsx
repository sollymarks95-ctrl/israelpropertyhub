import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StatusPage() {
  const { data: sites } = await supabase.from('news_sites').select('id, name, slug, site_type, primary_color')
  const { data: counts } = await supabase.from('news_articles').select('news_site_id').eq('status', 'published')
  const countMap: Record<string, number> = {}
  counts?.forEach((r: any) => { countMap[r.news_site_id] = (countMap[r.news_site_id] || 0) + 1 })
  const { count: total } = await supabase.from('news_articles').select('*', { count: 'exact', head: true })
  const { count: unsplash } = await supabase.from('news_articles').select('*', { count: 'exact', head: true }).ilike('cover_image_url', '%unsplash%')
  const ROUTES: Record<string, string> = {
    'global-trade-wire':'news','finance-terminal':'finance','gold-markets-today':'commodities',
    'business-pulse':'magazine','trust-score':'reviews-hub','company-pedia':'wiki',
    'press-central':'pressroom','invest-data':'investdb','trade-board':'forum',
    'global-trade-assoc':'association','executive-network':'executive','market-radar':'market-radar',
  }
  return (
    <div style={{fontFamily:'sans-serif',padding:32,maxWidth:900,margin:'0 auto'}}>
      <h1 style={{fontSize:28,fontWeight:900,marginBottom:4}}>🔧 RepHuby Status Dashboard</h1>
      <p style={{color:'#666',marginBottom:24}}>Last updated: {new Date().toLocaleString()}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:32}}>
        {[
          {label:'Total Articles',value:total||0,color:'#16a34a'},
          {label:'AI Images Needed',value:unsplash||0,color:'#dc2626'},
          {label:'AI Images Done',value:(total||0)-(unsplash||0),color:'#2563eb'},
        ].map(s=>(
          <div key={s.label} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:16,textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:900,color:s.color}}>{s.value}</div>
            <div style={{fontSize:13,color:'#6b7280',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden',marginBottom:24}}>
        <div style={{padding:'12px 16px',background:'#111',color:'#fff',fontWeight:700}}>12 Sites — Live Status</div>
        {sites?.map((site:any)=>{
          const route=ROUTES[site.slug]||'news'
          const articleCount=countMap[site.id]||0
          return(
            <div key={site.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:'1px solid #f3f4f6'}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:site.primary_color||'#888'}}></div>
                <strong>{site.name}</strong>
                <span style={{fontSize:12,color:'#6b7280'}}>/{site.slug}</span>
              </div>
              <div style={{display:'flex',gap:16,alignItems:'center'}}>
                <span style={{fontSize:13,fontWeight:600,color:articleCount>=20?'#16a34a':articleCount>=10?'#f59e0b':'#dc2626'}}>{articleCount} articles</span>
                <Link href={`/${route}/${site.slug}`} target="_blank"><span style={{fontSize:12,color:'#2563eb'}}>View site →</span></Link>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:8,padding:16,fontSize:13,color:'#374151'}}>
        <strong>Image Generation:</strong> Visit <code>/api/generate-images?action=run&token=rephuby-img-2025</code> to generate AI images for articles. Requires OPENAI_API_KEY in Vercel env vars.<br/><br/>
        <strong>Daily Cron:</strong> Runs at 5am UTC (7am Israel) — generates 3 new AI articles per site (36 total/day).<br/><br/>
        <strong>Auto-deploy:</strong> Every push to GitHub main branch → auto-deploys via deploy hook.
      </div>
    </div>
  )
}
