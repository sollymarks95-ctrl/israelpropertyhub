import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const CORS = { 'Access-Control-Allow-Origin': '*' }
function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }
export async function GET() {
  const { data } = await getDb().from('verivex_reviews').select('*').eq('status','pending').order('created_at',{ascending:false})
  return NextResponse.json({ reviews: data||[] }, { headers: CORS })
}