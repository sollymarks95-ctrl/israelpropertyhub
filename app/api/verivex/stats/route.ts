import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const CORS = { 'Access-Control-Allow-Origin': '*' }
function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }
export async function GET() {
  const { data } = await getDb().from('verivex_reviews').select('company_slug, rating').eq('status','approved')
  const stats: Record<string,{count:number,avg:number}> = {}
  for (const r of data||[]) {
    if (!stats[r.company_slug]) stats[r.company_slug] = {count:0,avg:0}
    stats[r.company_slug].count++
    stats[r.company_slug].avg += r.rating
  }
  for (const slug of Object.keys(stats)) {
    stats[slug].avg = Math.round((stats[slug].avg/stats[slug].count)*10)/10
  }
  return NextResponse.json({ stats }, { headers: CORS })
}