import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const CORS = { 'Access-Control-Allow-Origin': '*' }
function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }
export async function OPTIONS() { return new Response(null,{status:204,headers:{...CORS,'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}})}
export async function POST(req: NextRequest) {
  const { id, status } = await req.json()
  if (!id || !['approved','rejected'].includes(status)) return NextResponse.json({error:'Invalid'},{status:400,headers:CORS})
  const { error } = await getDb().from('verivex_reviews').update({status}).eq('id',id)
  if (error) return NextResponse.json({error:error.message},{status:500,headers:CORS})
  return NextResponse.json({success:true},{headers:CORS})
}