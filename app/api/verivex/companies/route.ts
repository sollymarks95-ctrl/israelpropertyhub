import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=120' }
function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

// Map full DB category strings → normalised display groups
export function normaliseCategory(cat: string): string {
  const c = (cat || '').toLowerCase()
  if (c.includes('crypto') || c.includes('defi') || c.includes('bitcoin') || c.includes('blockchain') || c.includes('nft')) return 'crypto'
  if (c.includes('prop') || c.includes('funded') || c.includes('funding')) return 'prop'
  if (c.includes('neobank') || c.includes('fintech') || c.includes('savings') || c.includes('banking') || c.includes('transfer') || c.includes('money')) return 'fintech'
  if (c.includes('robo') || c.includes('etf') || c.includes('isa') || c.includes('investment') || c.includes('wealth')) return 'investment'
  if (c.includes('social') || c.includes('copy')) return 'social'
  if (c.includes('option') || c.includes('futures') || c.includes('stock') || c.includes('us broker')) return 'stocks'
  if (c.includes('spread') || c.includes('cfd') || c.includes('forex') || c.includes('fx') || c.includes('cfd')) return 'forex'
  return 'other'
}

export async function GET() {
  const db = getDb()
  const [{ data: raw }, { data: reviews }] = await Promise.all([
    db.from('verivex_companies').select('*').order('is_featured', { ascending: false }).order('name'),
    db.from('verivex_reviews').select('company_slug, rating').eq('status', 'approved'),
  ])
  
  const companies = (raw || [])
  
  // Build review stats per company
  const stats: Record<string, { count: number; avg: number }> = {}
  for (const r of reviews || []) {
    if (!stats[r.company_slug]) stats[r.company_slug] = { count: 0, avg: 0 }
    stats[r.company_slug].count++
    stats[r.company_slug].avg += r.rating
  }
  for (const slug of Object.keys(stats)) {
    stats[slug].avg = Math.round((stats[slug].avg / stats[slug].count) * 10) / 10
  }
  
  // Attach stats + normalised group to each company, sort eToro first
  const enriched = companies.map((co: any) => ({
    ...co,
    review_count: stats[co.slug]?.count || 0,
    avg_rating: stats[co.slug]?.avg || 0,
    group: normaliseCategory(co.category),
  }))
  
  const etoro = enriched.find((c: any) => c.slug === 'etoro')
  const rest = enriched.filter((c: any) => c.slug !== 'etoro').sort((a: any, b: any) => (b.review_count - a.review_count))
  
  return NextResponse.json({ companies: etoro ? [etoro, ...rest] : enriched }, { headers: CORS })
}
