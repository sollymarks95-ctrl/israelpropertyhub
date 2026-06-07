import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function OPTIONS() { return new Response(null, { status: 204, headers: CORS }) }

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json()
    if (!id || !action) return NextResponse.json({ error: 'Missing id or action' }, { status: 400, headers: CORS })

    if (action === 'publish') {
      await db().from('podcast_scripts').update({ status: 'published' }).eq('id', id)
      return NextResponse.json({ ok: true, status: 'published' }, { headers: CORS })
    }
    if (action === 'unpublish') {
      await db().from('podcast_scripts').update({ status: 'draft' }).eq('id', id)
      return NextResponse.json({ ok: true, status: 'draft' }, { headers: CORS })
    }
    if (action === 'delete') {
      await db().from('podcast_scripts').delete().eq('id', id)
      return NextResponse.json({ ok: true, deleted: true }, { headers: CORS })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: CORS })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS })
  }
}
