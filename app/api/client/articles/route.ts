import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

const PORTAL_SLUGS: Record<string,string> = {
  '4d048bde-1dcd-4891-8434-a7960ab9d3ae': 'global-trade-wire',
  '48bed332-6525-4d76-aaa5-6d10a5112d77': 'finance-terminal',
  'c0f14745-8189-444d-af09-39d7248fa319': 'business-pulse',
  '3b440202-e1c3-4f54-8a4e-65cf7e7dbfe1': 'gold-markets-today',
  '6ae7e692-bce9-489d-b835-87dcba9ffc47': 'trust-score',
}

const DOMAIN_MAP: Record<string,string> = {
  'global-trade-wire': 'https://nex-wire.com',
  'finance-terminal': 'https://finvexx.com',
  'business-pulse': 'https://bizplexz.com',
  'gold-markets-today': 'https://aurexhq.com',
  'trust-score': 'https://verivex.co',
}

export async function GET(req: NextRequest) {
  const client = req.nextUrl.searchParams.get('client') || 'etoro'
  
  const { data } = await getDb()
    .from('news_articles')
    .select('id, title, excerpt, published_at, cover_image_url, slug, news_site_id, category')
    .ilike('body', `%${client}%`)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  const articles = (data || []).map((a: any) => {
    const portalSlug = PORTAL_SLUGS[a.news_site_id]
    const domain = DOMAIN_MAP[portalSlug] || 'https://rephuby.com'
    return { ...a, portal: portalSlug, url: `${domain}/article/${portalSlug}/${a.slug}` }
  })

  return NextResponse.json({ articles }, { headers: { 'Access-Control-Allow-Origin': '*' } })
}
