import { logApiCost } from '../costs/log-api-cost'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
}
export async function OPTIONS() { return new NextResponse(null, { headers: CORS }) }

const BKGS: Record<string, string> = {
  dark_studio:    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80&fm=jpg',
  podcast_room:   'https://images.unsplash.com/photo-1478737270197-3a37b4c58e32?w=1920&q=80&fm=jpg',
  broadcast_desk: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=1920&q=80&fm=jpg',
  blue_office:    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&fm=jpg',
  dark_bokeh:     'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80&fm=jpg',
}

// Submit one HeyGen talking head job
async function submitHeygenAvatar(opts: {
  avatarId: string
  avatarStyle: 'normal' | 'closeUp' | 'circle'
  audioUrl: string
  heygenKey: string
  bgUrl: string
}): Promise<string | null> {
  const { avatarId, avatarStyle, audioUrl, heygenKey, bgUrl } = opts
  try {
    const r = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': heygenKey },
      body: JSON.stringify({
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatarId,
            avatar_style: avatarStyle,
          },
          voice: {
            type: 'audio',
            audio_url: audioUrl,
          },
          background: {
            type: 'image',
            url: bgUrl,
          },
        }],
        // 9:16 portrait — perfect for Reels/TikTok
        // HeyGen caps long audio; 90s clip is optimal for social content
        dimension: { width: 720, height: 1280 },
        caption: false,
        title: `Podcast talking head ${avatarStyle}`,
      }),
      signal: AbortSignal.timeout(25000),
    })
    const d = await r.json().catch(() => ({}))
    console.log('[heygen:submit]', avatarId, r.status, JSON.stringify(d).slice(0, 200))
    if (!r.ok) throw new Error(`HeyGen ${r.status}: ${JSON.stringify(d).slice(0, 300)}`)
    return d?.data?.video_id || null
  } catch (e: any) {
    console.error('[heygen:submit] error:', e.message)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const body = await req.json()
    const { episode_id, studio_bg = 'dark_studio', host_avatar_id, guest_avatar_id } = body

    if (!episode_id) return NextResponse.json({ error: 'episode_id required' }, { status: 400, headers: CORS })

    const { data: ep } = await sb.from('podcast_scripts').select('*').eq('id', episode_id).single()
    if (!ep) return NextResponse.json({ error: 'Episode not found' }, { status: 404, headers: CORS })
    if (!ep.audio_url) return NextResponse.json({ error: 'Generate audio first — no audio_url on this episode' }, { status: 400, headers: CORS })

    const { data: keys } = await sb.from('system_api_keys').select('key_name,key_value').eq('is_active', true)
    const km: Record<string, string> = Object.fromEntries((keys || []).map((k: any) => [k.key_name, k.key_value]))

    const { data: site } = await sb.from('news_sites').select('name,template_config').eq('slug', ep.site_slug).single()
    const accent  = (site as any)?.template_config?.primary || '#10B981'

    const bgUrl = BKGS[studio_bg] || BKGS.dark_studio

    const hk = km.HEYGEN_KEY
    if (!hk) return NextResponse.json({ error: 'HEYGEN_KEY missing from system_api_keys' }, { status: 400, headers: CORS })

    // Avatar IDs: body → DB → safe defaults (Tyler is confirmed working)
    const hostAvatarId  = host_avatar_id  || km.HEYGEN_HOST_AVATAR_ID  || 'Tyler-insuit-20220721'
    const guestAvatarId = guest_avatar_id || km.HEYGEN_GUEST_AVATAR_ID || 'Anna_public_3_20240108'

    // Create job record
    const { data: job, error: jobErr } = await sb.from('podcast_videos').insert({
      episode_id,
      client_id:     ep.client_id || null,
      site_slug:     ep.site_slug,
      status:        'rendering',
      pipeline_phase:'heygen_render',
      current_step:  'Step 1/3: Submitting to HeyGen (ultra-realistic talking heads)…',
      progress_pct:  10,
      host_name:     ep.host_name  || 'Host',
      guest_name:    ep.guest_name || 'Guest',
      episode_title: ep.title,
      studio_bg,
      portal_accent: accent,
      audio_url:     ep.audio_url,
      duration_seconds: (ep.duration_minutes || 5) * 60,
    }).select('id').single()

    if (jobErr || !job) return NextResponse.json({ error: `DB error: ${jobErr?.message}` }, { status: 500, headers: CORS })

    // Submit both HeyGen avatar jobs in parallel
    // Host: normal (full body) | Guest: closeUp (face-focused) — differentiate visually
    const [hostJobId, guestJobId] = await Promise.all([
      submitHeygenAvatar({ avatarId: hostAvatarId,  avatarStyle: 'normal',   audioUrl: ep.audio_url, heygenKey: hk, bgUrl }),
      submitHeygenAvatar({ avatarId: guestAvatarId, avatarStyle: 'normal',   audioUrl: ep.audio_url, heygenKey: hk, bgUrl }),
    ])

    if (!hostJobId || !guestJobId) {
      const detail = `host: ${!!hostJobId} (${hostAvatarId}), guest: ${!!guestJobId} (${guestAvatarId})`
      const err = `HeyGen submit failed — ${detail}. Check avatar IDs at app.heygen.com/avatars`
      await sb.from('podcast_videos').update({ status: 'failed', current_step: err }).eq('id', job.id)
      return NextResponse.json({ error: err, video_job_id: job.id }, { status: 400, headers: CORS })
    }

    await sb.from('podcast_videos').update({
      heygen_host_job_id:  hostJobId,
      heygen_guest_job_id: guestJobId,
      current_step: `Step 1/3: HeyGen rendering both avatars (takes 5-15 min)…`,
      progress_pct: 20,
    }).eq('id', job.id)

    // Log API costs
    await Promise.all([
      logApiCost('heygen_video', `HeyGen host (${hostAvatarId.split('-')[0]}) — ${ep.title?.slice(0,40)||'podcast'}`, { episode_id, site_slug: ep.site_slug }),
      logApiCost('heygen_video', `HeyGen guest (${guestAvatarId.split('-')[0]}) — ${ep.title?.slice(0,40)||'podcast'}`, { episode_id, site_slug: ep.site_slug }),
    ])

    return NextResponse.json({
      success: true,
      video_job_id: job.id,
      engine: 'heygen → shotstack',
      host_avatar:  hostAvatarId,
      guest_avatar: guestAvatarId,
      heygen_host_job_id:  hostJobId,
      heygen_guest_job_id: guestJobId,
      note: 'Polling every 6s. Shotstack auto-composites when both HeyGen renders complete.',
    }, { headers: CORS })

  } catch (err: any) {
    console.error('[generate-video] fatal:', err)
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS })
  }
}
