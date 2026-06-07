import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 30

const CORS = { 'Access-Control-Allow-Origin': '*' }
function getDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const FLAG: Record<string,string> = {
  US:'🇺🇸',GB:'🇬🇧',IL:'🇮🇱',DE:'🇩🇪',FR:'🇫🇷',AU:'🇦🇺',CA:'🇨🇦',IN:'🇮🇳',
  SG:'🇸🇬',AE:'🇦🇪',NL:'🇳🇱',CH:'🇨🇭',JP:'🇯🇵',BR:'🇧🇷',ZA:'🇿🇦',MX:'🇲🇽',
  IT:'🇮🇹',ES:'🇪🇸',SE:'🇸🇪',PL:'🇵🇱',NG:'🇳🇬',KE:'🇰🇪',TR:'🇹🇷',RU:'🇷🇺',Unknown:'🌍',
}
const PORTAL_DOMAIN: Record<string,string> = {
  'global-trade-wire':'nex-wire.com','finance-terminal':'finvexx.com','business-pulse':'bizplezx.com',
  'gold-markets-today':'aurexhq.com','trust-score':'verivex.co','invest-data':'invexhuby.com',
  'market-radar':'signalixx.com','executive-network':'execvex.com','crypto-hub':'cryptoxos.com',
}
const PORTAL_NAME: Record<string,string> = {
  'global-trade-wire':'Nex-Wire','finance-terminal':'Finvexx','business-pulse':'Bizplezx',
  'gold-markets-today':'AurexHQ','trust-score':'Verivex','invest-data':'InvexHuby',
  'market-radar':'Signalixx','executive-network':'ExecVex','crypto-hub':'CryptoXos',
}

export async function OPTIONS() { return new Response(null,{status:204,headers:CORS}) }

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({error:'Unauthorized'},{status:401,headers:CORS})

  const days = parseInt(req.nextUrl.searchParams.get('days')||'30')
  const filterClientId = req.nextUrl.searchParams.get('client') || null  // optional client filter
  const db = getDb()
  const since = new Date(Date.now()-days*86400000).toISOString()
  const today = new Date().toISOString().slice(0,10)
  const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10)
  const weekAgo = new Date(Date.now()-7*86400000).toISOString().slice(0,10)

  // If filtering by client, get their site slugs first
  let clientSiteSlugs: string[] | null = null
  if (filterClientId) {
    const { data: cp } = await db.from('portal_content').select('site_slug').eq('client_id', filterClientId)
    clientSiteSlugs = [...new Set((cp||[]).map((r:any)=>r.site_slug))]
  }

  const [{data:views},{data:clientPortals},{data:clients},{data:invoices},{data:articleCount}] = await Promise.all([
    clientSiteSlugs
      ? db.from('page_views').select('created_at,site_slug,site_domain,path,device,country,referrer').gte('created_at',since).in('site_slug', clientSiteSlugs)
      : db.from('page_views').select('created_at,site_slug,site_domain,path,device,country,referrer').gte('created_at',since),
    db.from('portal_content').select('client_id,site_slug,article_url,title'),
    db.from('portal_clients').select('id,company_name,monthly_value,currency,contract_status'),
    db.from('client_invoices').select('client_id,amount,status,paid_at,invoice_no,description,issued_at,due_date'),
    db.from('news_articles').select('*',{count:'exact',head:true}).eq('status','published'),
  ])

  const all = views||[]
  const dailyMap:Record<string,number>={}
  const siteMap:Record<string,number>={}
  const deviceMap:Record<string,number>={}
  const countryMap:Record<string,number>={}
  const pathMap:Record<string,{views:number;site:string;title?:string}>= {}
  const refMap:Record<string,number>={}
  const sourceMap:Record<string,number>={}
  const hourMap:Record<string,number>={}
  let todayViews=0,yesterdayViews=0,weekViews=0

  const titleLookup:Record<string,string>={}
  for(const pc of clientPortals||[]) if(pc.article_url&&pc.title) titleLookup[pc.article_url]=pc.title

  all.forEach((v:any)=>{
    const d=v.created_at.slice(0,10)
    const h=v.created_at.slice(11,13)
    dailyMap[d]=(dailyMap[d]||0)+1
    siteMap[v.site_slug]=(siteMap[v.site_slug]||0)+1
    deviceMap[v.device]=(deviceMap[v.device]||0)+1
    countryMap[v.country]=(countryMap[v.country]||0)+1
    hourMap[h]=(hourMap[h]||0)+1

    if(v.path&&v.path!=='/'){
      const domain=PORTAL_DOMAIN[v.site_slug]||v.site_domain||v.site_slug
      const fullUrl=`https://${domain}${v.path}`
      if(!pathMap[fullUrl]) pathMap[fullUrl]={views:0,site:v.site_slug}
      pathMap[fullUrl].views++
      if(!pathMap[fullUrl].title) pathMap[fullUrl].title=titleLookup[fullUrl]
    }

    const ref=v.referrer||'direct'
    if(ref==='direct'||ref===''){
      sourceMap['Direct']=(sourceMap['Direct']||0)+1
    } else if(/google|bing|yahoo|duckduckgo/i.test(ref)){
      sourceMap['Organic Search']=(sourceMap['Organic Search']||0)+1
      refMap[ref]=(refMap[ref]||0)+1
    } else if(/facebook|twitter|linkedin|instagram|tiktok|reddit/i.test(ref)){
      sourceMap['Social']=(sourceMap['Social']||0)+1
      refMap[ref]=(refMap[ref]||0)+1
    } else {
      sourceMap['Referral']=(sourceMap['Referral']||0)+1
      refMap[ref]=(refMap[ref]||0)+1
    }

    if(d===today) todayViews++
    if(d===yesterday) yesterdayViews++
    if(d>=weekAgo) weekViews++
  })

  const topUrls=Object.entries(pathMap).sort((a,b)=>b[1].views-a[1].views).slice(0,30).map(([url,data])=>{
    const isArticle=url.includes('/article/')
    const slug=url.split('/').pop()||''
    const readable=slug.replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/-/g,' ').replace(/\b\w/g,l=>l.toUpperCase()).slice(0,90)
    return {
      url,path:url.replace(/^https?:\/\/[^\/]+/,''),views:data.views,
      site:data.site,siteName:PORTAL_NAME[data.site]||data.site,
      type:isArticle?'article':url.includes('/podcasts')?'podcast':'page',
      title:data.title||readable,
    }
  })

  const clientSiteMap:Record<string,Set<string>>={}
  for(const cp of clientPortals||[]){if(!clientSiteMap[cp.client_id])clientSiteMap[cp.client_id]=new Set();clientSiteMap[cp.client_id].add(cp.site_slug)}
  const clientViewMap:Record<string,number>={}
  all.forEach((v:any)=>{for(const[cid,slugs]of Object.entries(clientSiteMap)){if((slugs as Set<string>).has(v.site_slug))clientViewMap[cid]=(clientViewMap[cid]||0)+1}})

  const activeClients=(clients||[]).filter((c:any)=>c.contract_status==='active')
  const mrr=activeClients.reduce((s:number,c:any)=>s+(c.monthly_value||0),0)
  const paidRevenue=(invoices||[]).filter((iv:any)=>iv.status==='paid').reduce((s:number,iv:any)=>s+iv.amount,0)
  const pendingRevenue=(invoices||[]).filter((iv:any)=>iv.status==='pending'||iv.status==='overdue').reduce((s:number,iv:any)=>s+iv.amount,0)

  return NextResponse.json({
    filterClientId,
    clientSiteSlugs,
    total:all.length, todayViews, yesterdayViews, weekViews,
    growthPct:yesterdayViews>0?Math.round((todayViews-yesterdayViews)/yesterdayViews*100):0,
    uniquePaths:Object.keys(pathMap).length, uniqueCountries:Object.keys(countryMap).length,
    daily:Object.entries(dailyMap).sort((a,b)=>a[0]<b[0]?-1:1).map(([date,views])=>({date,views})),
    byHour:Array.from({length:24},(_,i)=>({hour:i,views:hourMap[String(i).padStart(2,'0')]||0})),
    bySite:Object.entries(siteMap).sort((a,b)=>b[1]-a[1]).map(([slug,views])=>({slug,views,name:PORTAL_NAME[slug]||slug})),
    byDevice:Object.entries(deviceMap).map(([device,views])=>({device,views})),
    byCountry:Object.entries(countryMap).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([country,views])=>({country,views,flag:FLAG[country]||'🌍',pct:Math.round(views/Math.max(all.length,1)*100)})),
    bySource:Object.entries(sourceMap).sort((a,b)=>b[1]-a[1]).map(([source,views])=>({source,views,pct:Math.round(views/Math.max(all.length,1)*100)})),
    byReferrer:Object.entries(refMap).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([referrer,views])=>({referrer,views})),
    byClient:Object.entries(clientViewMap).sort((a,b)=>b[1]-a[1]).map(([clientId,views])=>({clientId,views})),
    topUrls,
    finance:{mrr,arr:mrr*12,paidRevenue,pendingRevenue,activeClients:activeClients.length,invoices:invoices||[]},
    contentStats:{totalArticles:articleCount?.count||0},
  },{headers:CORS})
}
