import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}

export async function GET() {
  const results: Record<string, any> = {}
  
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      return NextResponse.json({ 
        ready: false, error: 'Missing SUPABASE env vars', results 
      }, { status: 200, headers: CORS })
    }
    const sb = createClient(url, key)

    // Get API keys from DB
    const { data: keys } = await sb
      .from('system_api_keys')
      .select('key_name, key_value, is_active')
      .eq('is_active', true)
    const km: Record<string, string> = Object.fromEntries(
      (keys || []).map((k: any) => [k.key_name, k.key_value])
    )
    results.db = { ok: true, message: `✅ Supabase OK — ${keys?.length || 0} keys loaded` }

    // 1. ElevenLabs
    try {
      const r = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': km.ELEVENLABS_KEY || '' },
        signal: AbortSignal.timeout(8000),
      })
      const d = await r.json()
      results.elevenlabs = {
        ok: r.ok,
        message: r.ok ? `✅ ElevenLabs — ${d.voices?.length || 0} voices` : `❌ HTTP ${r.status}`,
      }
    } catch (e: any) {
      results.elevenlabs = { ok: false, message: `❌ ElevenLabs: ${e.message}` }
    }

    // 2. Nextcut (stored as CREATOMATE_KEY)
    const nk = km.CREATOMATE_KEY
    if (nk && nk.length > 10) {
      try {
        const ssEnv = km.SHOTSTACK_ENV || 'v1'
        const r = await fetch(`https://api.shotstack.io/edit/${ssEnv}/renders?limit=1`, {
          headers: { 'x-api-key': nk },
          signal: AbortSignal.timeout(8000),
        })
        const body = await r.text()
        results.shotstack = {
          ok: r.ok || r.status === 404,  // 404 = valid key, no renders yet
          message: r.ok ? `✅ Shotstack (${ssEnv}) — connected` 
                 : r.status === 401 ? '❌ Shotstack: invalid API key'
                 : r.status === 404 ? `✅ Shotstack (${ssEnv}) — key valid, no renders yet`
                 : `⚠️ Shotstack HTTP ${r.status}`,
        }
      } catch (e: any) {
        results.shotstack = { ok: false, message: `❌ Nextcut: ${e.message}` }
      }
    } else {
      results.shotstack = { ok: false, message: '⚠️ No SHOTSTACK_KEY — add at shotstack.io/register' }
    }

    // 3. HeyGen — check credits (fast endpoint, no timeout)
    try {
      const r = await fetch('https://api.heygen.com/v2/user/remaining_quota', {
        headers: { 'X-Api-Key': km.HEYGEN_KEY || '' },
        signal: AbortSignal.timeout(8000),
      })
      const d = await r.json()
      const quota  = d?.data?.remaining_quota ?? -1
      const hasKey = !!km.HEYGEN_KEY
      results.heygen = {
        ok: r.ok && quota > 0,
        quota,
        message: !hasKey
          ? '❌ HeyGen: HEYGEN_KEY not set'
          : !r.ok
            ? `❌ HeyGen: HTTP ${r.status}`
            : quota === 0
              ? `⚠️ HeyGen: remaining_quota=0 — add credits at app.heygen.com/billing`
              : `✅ HeyGen: ${quota} API credits remaining — avatars: Tyler + Anna`,
      }
    } catch (e: any) {
      results.heygen = { ok: false, message: `❌ HeyGen: ${e.message}` }
    }

    // 4. Latest episode with audio
    try {
      const { data: ep } = await sb
        .from('podcast_scripts')
        .select('id, title, audio_url, host_name')
        .not('audio_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (ep?.audio_url) {
        const r = await fetch(ep.audio_url, { method: 'HEAD', signal: AbortSignal.timeout(6000) })
        const kb = Math.round(parseInt(r.headers.get('content-length') || '0') / 1024)
        results.audio = {
          ok: r.ok,
          title: ep.title,
          episode_id: ep.id,
          audio_url: ep.audio_url,
          message: r.ok ? `✅ Audio OK — ${kb}KB` : `❌ HTTP ${r.status}`,
        }
      } else {
        results.audio = { ok: false, message: '⚠️ No episodes with audio yet' }
      }
    } catch (e: any) {
      results.audio = { ok: false, message: `❌ Audio check: ${e.message}` }
    }

    const ready = !!(results.elevenlabs?.ok && (results.shotstack?.ok || results.heygen?.ok))
    return NextResponse.json({
      ready,
      note: ready ? '🟢 Video pipeline ready' : '🟡 Check services above',
      timestamp: new Date().toISOString(),
      results,
    }, { status: 200, headers: CORS })

  } catch (err: any) {
    return NextResponse.json({
      ready: false,
      error: err.message || 'Unknown error',
      results,
    }, { status: 200, headers: CORS })
  }
}
