import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function OPTIONS() { return new Response(null, { status: 204, headers: CORS }) }

export async function POST(req: NextRequest) {
  try {
    const { id, field, value } = await req.json()
    if (!id || !field) return NextResponse.json({ error: 'Missing id or field' }, { status: 400, headers: CORS })

    // Allowed fields to update
    const ALLOWED = ['company_name','contact_name','contact_email','contact_phone','website_url',
      'monthly_value','currency','contract_status','contract_start','contract_end',
      'notes','tier','account_manager','regulation','onboarding_steps','is_active']

    if (!ALLOWED.includes(field)) return NextResponse.json({ error: 'Field not allowed' }, { status: 403, headers: CORS })

    const { error } = await db().from('portal_clients').update({ [field]: value }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })

    return NextResponse.json({ ok: true }, { headers: CORS })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS })
  }
}
