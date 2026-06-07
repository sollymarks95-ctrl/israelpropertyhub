import AdminDashboard from './AdminDashboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin | RepHuby Intelligence', robots: 'noindex, nofollow' }

// Fallback sites if DB is slow
const FALLBACK_SITES = [
  { id:'4d048bde-1dcd-4891-8434-a7960ab9d3ae', name:'NEX-WIRE',   slug:'global-trade-wire',  primary_color:'#c0392b', site_type:'news',       domain:'nex-wire.com',  noindex:false },
  { id:'48bed332-6525-4d76-aaa5-6d10a5112d77', name:'FINVEXX',    slug:'finance-terminal',   primary_color:'#1a73e8', site_type:'finance',    domain:'finvexx.com',   noindex:false },
  { id:'3b440202-e1c3-4f54-8a4e-65cf7e7dbfe1', name:'AUREXHQ',    slug:'gold-markets-today', primary_color:'#d4a017', site_type:'commodities',domain:'aurexhq.com',   noindex:false },
  { id:'c0f14745-8189-444d-af09-39d7248fa319', name:'BIZPLEZX',   slug:'business-pulse',     primary_color:'#7c3aed', site_type:'magazine',   domain:'bizplezx.com',  noindex:false },
  { id:'6ae7e692-bce9-489d-b835-87dcba9ffc47', name:'VERIVEX',    slug:'trust-score',        primary_color:'#059669', site_type:'reviews',    domain:'verivex.co',    noindex:false },
]

async function getData() {
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gykxxhxsakxhfuutgobb.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  const [clients, content, rankings, podcasts, activity, articleCount, subCount, reviewsData, pendingReviews, businessInquiries, allSitesData, companiesData, todayArticles, invoicesData] = await Promise.all([
    sb.from('portal_clients').select('*').order('created_at', { ascending: false }),
    sb.from('portal_content').select('*').order('published_at', { ascending: false }).limit(200),
    sb.from('portal_rankings').select('*').order('current_position'),
    sb.from('podcast_scripts').select('*').order('created_at', { ascending: false }).limit(200),
    sb.from('portal_activity').select('*').order('created_at', { ascending: false }).limit(25),
    sb.from('news_articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    sb.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    sb.from('verivex_reviews').select('*').order('created_at', { ascending: false }).limit(100),
    sb.from('verivex_reviews').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    sb.from('business_inquiries').select('*').order('created_at', { ascending: false }).limit(200),
    sb.from('news_sites').select('id,name,slug,domain,noindex,is_active,template_config,category,tagline').eq('is_active', true).order('created_at', { ascending: false }),
    sb.from('verivex_companies').select('*').order('is_featured', { ascending: false }),
    sb.from('client_invoices').select('*').order('issued_at', { ascending: false }),
    sb.from('news_articles').select('news_site_id,published_at').eq('status','published').gte('published_at', new Date(Date.now()-86400000).toISOString()),
  ])

  return {
    clients: clients.data || [],
    allContent: content.data || [],
    allRankings: rankings.data || [],
    allPodcasts: podcasts.data || [],
    allActivity: activity.data || [],
    totalArticles: articleCount.count || 0,
    totalSubscribers: subCount.count || 0,
    allReviews: reviewsData.data || [],
    pendingReviews: pendingReviews.data || [],
    businessInquiries: businessInquiries.data || [],
    allDbSites: allSitesData.data || [],
    portalArticlesToday: (() => {
      const t: Record<string,number> = {}
      for (const a of (todayArticles?.data || [])) t[a.news_site_id] = (t[a.news_site_id]||0)+1
      return t
    })(),
    companies: companiesData.data || [],
    invoices: invoicesData.data || [],
  }
}

export default async function AdminPage() {
  const data = await getData()
  // Use DB sites if available, fallback to hardcoded 5 portals
  const sites = data.allDbSites.length > 0 
    ? data.allDbSites.map((s: any) => ({
        ...s,
        primary_color: s.template_config?.primary || '#1a56db',
        site_type: s.category?.toLowerCase().replace(/\s+/g, '') || 'news',
      }))
    : FALLBACK_SITES
  return <AdminDashboard {...data} sites={sites} />
}
