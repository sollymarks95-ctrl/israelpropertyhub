import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const ROUTES: Record<string,string> = {
  '4d048bde-1dcd-4891-8434-a7960ab9d3ae':'news/global-trade-wire',
  '48bed332-6525-4d76-aaa5-6d10a5112d77':'finance/finance-terminal',
  '3b440202-e1c3-4f54-8a4e-65cf7e7dbfe1':'commodities/gold-markets-today',
  'c0f14745-8189-444d-af09-39d7248fa319':'magazine/business-pulse',
  '6ae7e692-bce9-489d-b835-87dcba9ffc47':'reviews-hub/trust-score',
  'aa04790b-9aed-4fa9-867d-3481adc828c5':'wiki/company-pedia',
  '104ceccb-e3d0-4979-85be-b7297abb7f90':'pressroom/press-central',
  '1cd6688f-bec9-4d1b-a024-80952bf31a21':'investdb/invest-data',
  'd020965e-d84d-4c9e-a068-d3b90f6902d0':'forum/trade-board',
  '1972c09e-a68e-4997-b2a8-00756ead609c':'association/global-trade-assoc',
  '64a6087d-480f-4040-9df1-ad020faf5796':'executive/executive-network',
  '27fdf1e6-8c0c-4591-ae9b-5a2c5cacee22':'market-radar/market-radar',
}
const SLUG_MAP: Record<string,string> = {
  '4d048bde-1dcd-4891-8434-a7960ab9d3ae':'global-trade-wire',
  '48bed332-6525-4d76-aaa5-6d10a5112d77':'finance-terminal',
  '3b440202-e1c3-4f54-8a4e-65cf7e7dbfe1':'gold-markets-today',
  'c0f14745-8189-444d-af09-39d7248fa319':'business-pulse',
  '6ae7e692-bce9-489d-b835-87dcba9ffc47':'trust-score',
  'aa04790b-9aed-4fa9-867d-3481adc828c5':'company-pedia',
  '104ceccb-e3d0-4979-85be-b7297abb7f90':'press-central',
  '1cd6688f-bec9-4d1b-a024-80952bf31a21':'invest-data',
  'd020965e-d84d-4c9e-a068-d3b90f6902d0':'trade-board',
  '1972c09e-a68e-4997-b2a8-00756ead609c':'global-trade-assoc',
  '64a6087d-480f-4040-9df1-ad020faf5796':'executive-network',
  '27fdf1e6-8c0c-4591-ae9b-5a2c5cacee22':'market-radar',
}

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{q?:string}> }) {
  const sp = searchParams ? await searchParams : {}
  return { title: `Search: ${sp.q || ''} | RepHuby`, description: 'Search global trade and financial news across all RepHuby publications', robots: 'noindex' }
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string, site?: string, category?: string }> }) {
  const sp = searchParams ? await searchParams : {}
  const q = sp.q || ''
  let results: any[] = []
  
  if (q.length >= 2) {
    let query = supabase.from('news_articles')
      .select('id, title, slug, excerpt, category, cover_image_url, published_at, read_time_minutes, author_name, news_site_id')
      .eq('status', 'published')
    if (sp.site) query = query.eq('news_site_id', sp.site)
    if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,category.ilike.%${q}%`)
    const { data } = await query.order('published_at', { ascending: false }).limit(30)
    results = data || []
  }

  const { data: sites } = await supabase.from('news_sites').select('id,name,primary_color').eq('is_live',true).order('name')

  return (
    <div style={{ minHeight:'100vh', background:'#f8f8f8', fontFamily:'sans-serif' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none;color:inherit}`}</style>
      
      <header style={{ background:'#111827', padding:'16px 24px', borderBottom:'3px solid #3b82f6' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <Link href="/news/global-trade-wire"><div style={{ fontWeight:900, fontSize:22, color:'#fff', marginBottom:12 }}>🌐 RepHuby Global Search</div></Link>
          <form action="/search" method="GET">
            <div style={{ display:'flex', gap:8 }}>
              <input name="q" defaultValue={q} placeholder="Search articles, markets, analysis..." autoFocus
                style={{ flex:1, padding:'12px 16px', borderRadius:6, border:'none', fontSize:15, outline:'none' }} />
              <button type="submit" style={{ background:'#3b82f6', color:'#fff', border:'none', padding:'12px 24px', borderRadius:6, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                Search
              </button>
            </div>
          </form>
        </div>
      </header>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px' }}>
        {q.length >= 2 ? (
          <>
            <div style={{ marginBottom:20, fontSize:14, color:'#6b7280' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "<strong style={{color:'#111'}}>{q}</strong>"
            </div>
            {results.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 20px', background:'#fff', borderRadius:8, border:'1px solid #e5e7eb' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
                <div style={{ fontSize:20, fontWeight:700, color:'#374151' }}>No results found</div>
                <p style={{ color:'#6b7280', marginTop:8 }}>Try different keywords or browse our sites below</p>
              </div>
            ) : results.map((art:any) => {
              const siteSlug = SLUG_MAP[art.news_site_id] || 'global-trade-wire'
              return (
                <Link key={art.id} href={`/article/${siteSlug}/${art.slug}`}>
                  <div style={{ display:'flex', gap:16, background:'#fff', borderRadius:8, border:'1px solid #e5e7eb', padding:16, marginBottom:12, cursor:'pointer' }}>
                    {art.cover_image_url && <img src={art.cover_image_url} alt="" style={{ width:120, height:84, objectFit:'cover', borderRadius:6, flexShrink:0 }} />}
                    <div style={{ flex:1 }}>
                      {art.category && <span style={{ fontSize:10, fontWeight:800, color:'#3b82f6', textTransform:'uppercase', letterSpacing:'0.05em' }}>{art.category}</span>}
                      <h3 style={{ fontWeight:700, fontSize:16, color:'#111', margin:'4px 0 6px', lineHeight:1.35, fontFamily:'Georgia, serif' }}>{art.title}</h3>
                      <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.6, marginBottom:8 }}>{art.excerpt?.slice(0,160)}...</p>
                      <div style={{ fontSize:11, color:'#9ca3af', display:'flex', gap:12 }}>
                        <span>By {art.author_name || 'Editorial'}</span>
                        <span>·</span>
                        <span>{art.published_at ? new Date(art.published_at).toLocaleDateString('en-GB',{month:'short',day:'numeric',year:'numeric'}) : ''}</span>
                        <span>·</span>
                        <span>{art.read_time_minutes || 5} min</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </>
        ) : (
          <div>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:20, color:'#374151' }}>Browse All Publications</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {sites?.map((s:any) => (
                <Link key={s.id} href={`/${ROUTES[s.id] || 'news/global-trade-wire'}`}>
                  <div style={{ background:'#fff', border:`2px solid ${s.primary_color || '#e5e7eb'}`, borderRadius:8, padding:16, cursor:'pointer', textAlign:'center' }}>
                    <div style={{ width:36, height:36, background:s.primary_color||'#3b82f6', borderRadius:6, margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:14 }}>
                      {s.name.charAt(0)}
                    </div>
                    <div style={{ fontWeight:700, fontSize:14, color:'#111' }}>{s.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
