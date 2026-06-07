import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
const CORS = { 'Access-Control-Allow-Origin': '*' }

function sb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function GET() {
  const { data } = await sb().from('cost_entries').select('*').order('date', { ascending: false })
  return NextResponse.json(data || [], { headers: CORS })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await sb().from('cost_entries').insert({
    date:         body.date,
    category:     body.category,
    description:  body.description,
    amount_usd:   body.amount_usd,
    billing_type: body.billing_type || 'one_time',
    notes:        body.notes || null,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400, headers: CORS })
  return NextResponse.json(data, { headers: CORS })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400, headers: CORS })
  await sb().from('cost_entries').delete().eq('id', id)
  return NextResponse.json({ ok: true }, { headers: CORS })
}

export async function OPTIONS() { return new NextResponse(null, { headers: CORS }) }
