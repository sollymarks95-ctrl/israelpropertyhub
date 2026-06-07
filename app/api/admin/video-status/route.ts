import { logApiCost } from '../costs/log-api-cost'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const CORS = { 'Access-Control-Allow-Origin': '*' }
export async function OPTIONS() { return new NextResponse(null, { headers: CORS }) }

const BKGS: Record<string, string> = {
  dark_studio:    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80&fm=jpg',
  podcast_room:   'https://images.unsplash.com/photo-1478737270197-3a37b4c58e32?w=1920&q=80&fm=jpg',
  broadcast_desk: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=1920&q=80&fm=jpg',
  blue_office:    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80&fm=jpg',
  dark_bokeh:     'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80&fm=jpg',
}

// ─── Build Shotstack 3-camera composite ──────────────────────────────────────
// Takes two HeyGen talking head video URLs and composites them into a
// professional 9:16 podcast clip with camera cuts, lower thirds, LIVE badge
async function buildShotstackComposite(job: any, km: Record<string,string>): Promise<string|null> {
  const ssKey = km.SHOTSTACK_KEY
  const ssEnv = km.SHOTSTACK_ENV || 'v1'
  if (!ssKey) return null

  const accent    = job.portal_accent || '#10B981'
  const bgUrl     = BKGS[job.studio_bg] || BKGS.dark_studio
  const dur       = 90   // 90s social clip
  const CUT       = 18   // camera cut every 18s = 5 cuts in 90s

  const hv = job.heygen_host_video_url
  const gv = job.heygen_guest_video_url
  if (!hv || !gv) return null

  // Camera cut schedule
  type Cut = { t: number; len: number; hero: 'host' | 'guest' }
  const cuts: Cut[] = []
  let t = 0; let hostHero = true
  while (t < dur) {
    cuts.push({ t, len: Math.min(CUT, dur - t), hero: hostHero ? 'host' : 'guest' })
    t += CUT; hostHero = !hostHero
  }

  const wipe = (i: number, hero: 'host' | 'guest') =>
    i > 0 ? { transition: { in: hero === 'host' ? 'wipeRight' : 'wipeLeft' } } : {}
  const fade = (i: number) =>
    i > 0 ? { transition: { in: 'fade' } } : {}

  const safeTitle  = (job.episode_title || '').slice(0, 52).replace(/[<>"'&]/g, ' ')
  const safePortal = (job.site_slug || 'rephuby').replace(/-/g,' ').toUpperCase().replace(/[<>"'&]/g, ' ')
  const safeHost   = (job.host_name  || 'Host').replace(/[<>"'&]/g, ' ')
  const safeGuest  = (job.guest_name || 'Guest').replace(/[<>"'&]/g, ' ')

  // ── 9:16 PODCAST LAYOUT ───────────────────────────────────────────────────
  //  ┌─────────────────────┐
  //  │ ●LIVE  PORTAL NAME  │  ← top bar
  //  │                     │
  //  │  HERO TALKING HEAD  │  ← alternates host/guest every 18s
  //  │   (wipe transition) │
  //  │                     │
  //  │       ┌──────┐      │  ← PIP: other person, bottom right
  //  │       │ PIP  │      │
  //  │       └──────┘      │
  //  │ ▎ Name    ROLE      │  ← lower third (switches with camera)
  //  ├─────────────────────┤
  //  │  Episode title...   │  ← title strip
  //  └─────────────────────┘

  const tracks: any[] = [
    // HERO — full screen talking head (muted — audio comes from soundtrack)
    { clips: cuts.map((c, i) => ({
        asset: { type: 'video', src: c.hero === 'host' ? hv : gv, trim: c.t, volume: 0 },
        start: c.t, length: c.len,
        position: 'center', offset: { x: 0, y: 0.06 }, scale: 0.92,
        ...wipe(i, c.hero),
      }))
    },

    // PIP — opposite person, bottom-right (muted)
    { clips: cuts.map((c, i) => ({
        asset: { type: 'video', src: c.hero === 'host' ? gv : hv, trim: c.t, volume: 0 },
        start: c.t, length: c.len,
        position: 'bottomRight', offset: { x: -0.03, y: 0.15 }, scale: 0.26,
        ...fade(i),
      }))
    },

    // Lower third — name + role card, switches with camera
    { clips: cuts.map((c, i) => {
        const isH  = c.hero === 'host'
        const name = isH ? safeHost : safeGuest
        const role = isH ? 'HOST' : 'GUEST'
        const col  = isH ? accent : '#818CF8'
        return {
          asset: {
            type: 'html',
            html: `<div style="border-left:5px solid ${col};background:rgba(0,0,0,0.88);padding:10px 24px 10px 14px"><p style="color:#fff;font-family:Arial,sans-serif;font-size:26px;font-weight:900;margin:0;white-space:nowrap">${name}</p><p style="color:${col};font-family:Arial,sans-serif;font-size:13px;font-weight:700;margin:0;letter-spacing:0.1em">${role}&nbsp;&nbsp;·&nbsp;&nbsp;${safePortal}</p></div>`,
            width: 720, height: 74, background: 'transparent',
          },
          start: c.t, length: c.len,
          position: 'center', offset: { x: 0, y: -0.26 },
          ...fade(i),
        }
      })
    },

    // Episode title strip — bottom
    { clips: [{ asset: {
          type: 'html',
          html: `<div style="background:rgba(0,0,0,0.90);border-top:3px solid ${accent};padding:12px 18px"><p style="color:#fff;font-family:Arial,sans-serif;font-size:22px;font-weight:900;margin:0;text-align:center;line-height:1.3">${safeTitle}</p></div>`,
          width: 940, height: 100, background: 'transparent',
        }, start: 0, length: dur, position: 'bottom', offset: { y: 0.13 } }]
    },

    // LIVE badge + portal name — top left
    { clips: [{ asset: {
          type: 'html',
          html: `<div style="display:flex;align-items:center;gap:10px;padding:6px 0"><div style="background:#DC2626;padding:4px 12px;border-radius:3px;display:flex;align-items:center;gap:6px"><div style="width:7px;height:7px;background:#fff;border-radius:50%"></div><span style="color:#fff;font-family:Arial,sans-serif;font-size:13px;font-weight:900;letter-spacing:0.08em">LIVE</span></div><span style="color:${accent};font-family:Arial,sans-serif;font-size:14px;font-weight:800;letter-spacing:0.06em">${safePortal}</span></div>`,
          width: 600, height: 42, background: 'transparent',
        }, start: 0, length: dur, position: 'topLeft', offset: { x: 0.04, y: -0.04 } }]
    },

    // Accent bar — very bottom edge
    { clips: [{ asset: { type: 'html',
          html: `<div style="background:${accent};width:100%;height:6px"></div>`,
          width: 1080, height: 7, background: 'transparent',
        }, start: 0, length: dur, position: 'bottom' }]
    },

    // Studio background (subtle — 12% opacity behind talking heads)
    { clips: [{ asset: { type: 'image', src: bgUrl },
        start: 0, length: dur, opacity: 0.12 }]
    },
  ]

  const edit = {
    timeline: {
      // Soundtrack = the original podcast audio (clean, no doubling)
      // The video clips are muted above
      soundtrack: { src: job.audio_url, effect: 'fadeOut' },
      background: '#111827',
      tracks,
    },
    output: {
      format:      'mp4',
      resolution:  'hd',
      aspectRatio: '9:16',  // Portrait for Reels/TikTok/Shorts
      fps:         25,
    },
  }

  console.log('[shotstack:build] submitting composite for job', job.id)
  const r = await fetch(`https://api.shotstack.io/edit/${ssEnv}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ssKey },
    body: JSON.stringify(edit),
    signal: AbortSignal.timeout(25000),
  })
  const text = await r.text()
  if (!r.ok) {
    console.error('[shotstack:build]', r.status, text.slice(0, 600))
    return null
  }
  const id = JSON.parse(text)?.response?.id
  console.log('[shotstack:build] render submitted →', id)
  return id || null
}

// ─── Poll HeyGen video status ────────────────────────────────────────────────
async function pollHeyGen(videoId: string | null, key: string) {
  if (!videoId) return null
  try {
    const r = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: { 'X-Api-Key': key },
      signal: AbortSignal.timeout(10000),
    })
    if (!r.ok) return null
    const d = await r.json()
    return d?.data || null
  } catch { return null }
}

// ─── GET handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const job_id = req.nextUrl.searchParams.get('job_id')
  if (!job_id) return NextResponse.json({ error: 'job_id required' }, { status: 400, headers: CORS })

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: job } = await sb.from('podcast_videos').select('*').eq('id', job_id).single()
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: CORS })

  // Already terminal
  if (job.status === 'ready' || job.status === 'failed') {
    return NextResponse.json({ ...job, done: true }, { headers: CORS })
  }

  const { data: keys } = await sb.from('system_api_keys').select('key_name,key_value').eq('is_active', true)
  const km: Record<string, string> = Object.fromEntries((keys || []).map((k: any) => [k.key_name, k.key_value]))

  const phase = job.pipeline_phase || 'heygen_render'

  // ── Phase 1: HeyGen rendering ────────────────────────────────────────────
  if (phase === 'heygen_render') {
    const hk = km.HEYGEN_KEY
    if (!hk) return NextResponse.json({ ...job, done: false }, { headers: CORS })

    const [hostSt, guestSt] = await Promise.all([
      pollHeyGen(job.heygen_host_job_id,  hk),
      pollHeyGen(job.heygen_guest_job_id, hk),
    ])

    console.log('[heygen:poll] host:', hostSt?.status, '| guest:', guestSt?.status)

    const hostDone  = hostSt?.status  === 'completed'
    const guestDone = guestSt?.status === 'completed'
    const anyFailed = hostSt?.status  === 'failed' || guestSt?.status === 'failed'

    if (anyFailed) {
      const msg = `HeyGen render failed — host: ${hostSt?.status}, guest: ${guestSt?.status}`
      await sb.from('podcast_videos').update({ status: 'failed', current_step: msg }).eq('id', job_id)
      return NextResponse.json({ ...job, status: 'failed', done: true }, { headers: CORS })
    }

    if (!hostDone || !guestDone) {
      const pct = 20 + Math.round(((hostDone?1:0) + (guestDone?1:0)) / 2 * 25)
      await sb.from('podcast_videos').update({
        progress_pct: pct,
        current_step: `Step 1/3: HeyGen rendering… host: ${hostSt?.status||'pending'} · guest: ${guestSt?.status||'pending'}`,
      }).eq('id', job_id)
      return NextResponse.json({ ...job, progress_pct: pct, done: false }, { headers: CORS })
    }

    // ✅ Both HeyGen complete → submit Shotstack
    const hostUrl  = hostSt?.video_url
    const guestUrl = guestSt?.video_url

    if (!hostUrl || !guestUrl) {
      await sb.from('podcast_videos').update({ status:'failed', current_step:'HeyGen returned no video URL' }).eq('id', job_id)
      return NextResponse.json({ ...job, status:'failed', done:true }, { headers: CORS })
    }

    await sb.from('podcast_videos').update({
      heygen_host_video_url:  hostUrl,
      heygen_guest_video_url: guestUrl,
      pipeline_phase: 'shotstack',
      current_step:   'Step 2/3: Submitting to Shotstack 3-camera compositor…',
      progress_pct:   55,
    }).eq('id', job_id)

    const ssId = await buildShotstackComposite(
      { ...job, heygen_host_video_url: hostUrl, heygen_guest_video_url: guestUrl },
      km
    )

    if (!ssId) {
      await sb.from('podcast_videos').update({ status:'failed', current_step:'Shotstack submission failed' }).eq('id', job_id)
      return NextResponse.json({ ...job, status:'failed', done:true }, { headers: CORS })
    }

    await sb.from('podcast_videos').update({
      creatomate_916_id: ssId,  // correctly named field for 9:16
      current_step: 'Step 2/3: Shotstack compositing broadcast layout (2-4 min)…',
      progress_pct: 65,
    }).eq('id', job_id)

    return NextResponse.json({ ...job, pipeline_phase:'shotstack', progress_pct:65, done:false }, { headers: CORS })
  }

  // ── Phase 2: Shotstack compositing ──────────────────────────────────────
  if (phase === 'shotstack') {
    const ssKey = km.SHOTSTACK_KEY
    const ssEnv = km.SHOTSTACK_ENV || 'v1'
    // Use whichever render ID was saved
    const ssId  = job.creatomate_916_id || job.creatomate_169_id

    if (!ssId) return NextResponse.json({ ...job, done:false }, { headers: CORS })

    try {
      const r = await fetch(`https://api.shotstack.io/edit/${ssEnv}/renders/${ssId}`, {
        headers: { 'x-api-key': ssKey },
        signal: AbortSignal.timeout(10000),
      })
      if (!r.ok) return NextResponse.json({ ...job, done:false }, { headers: CORS })

      const d      = await r.json()
      const status = d?.response?.status
      const url    = d?.response?.url

      console.log('[shotstack:poll]', ssId, '→', status)

      if (status === 'done' && url) {
        await logApiCost('shotstack_render',
          `Shotstack 9:16 composite — ${job.episode_title?.slice(0,45)||'podcast'}`,
          { episode_id: job.episode_id, site_slug: job.site_slug }
        )
        await sb.from('podcast_videos').update({
          video_916_url:  url,   // ✅ correct field for 9:16
          status:         'ready',
          pipeline_phase: 'complete',
          current_step:   '✅ Podcast video ready — 3-camera talking head composite',
          progress_pct:   100,
        }).eq('id', job_id)
        const { data: upd } = await sb.from('podcast_videos').select('*').eq('id', job_id).single()
        return NextResponse.json({ ...upd, done:true }, { headers: CORS })
      }

      if (status === 'failed') {
        const err = `Shotstack render failed (${ssId}). Check shotstack.io dashboard.`
        await sb.from('podcast_videos').update({ status:'failed', current_step: err }).eq('id', job_id)
        return NextResponse.json({ ...job, status:'failed', done:true }, { headers: CORS })
      }

      // Still rendering — update progress
      const pct = status === 'saving' ? 90 : status === 'rendering' ? 75 : 65
      await sb.from('podcast_videos').update({ progress_pct: pct, current_step:`Step 2/3: Shotstack ${status}…` }).eq('id', job_id)
    } catch (e: any) {
      console.error('[shotstack:poll] error:', e.message)
    }
  }

  return NextResponse.json({ ...job, done:false }, { headers: CORS })
}
