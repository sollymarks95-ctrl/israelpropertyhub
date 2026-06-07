import { logApiCost } from '../costs/log-api-cost'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSiteConfig, pickGuestVoice } from '@/app/lib/podcast-config'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function OPTIONS() {
  return new Response(null, { status:204, headers: { "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"POST,OPTIONS", "Access-Control-Allow-Headers":"Content-Type" } })
}

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

async function getKey(name: string) {
  if (process.env[name]) return process.env[name]!
  const { data } = await getDb().from('system_api_keys').select('key_value').eq('key_name', name).eq('is_active', true).single()
  return data?.key_value || ''
}

// Balanced settings: stability ~0.45 = natural without being flat or wobbly
// similarity_boost 0.72 = consistent voice identity with natural variation
// style 0.40 = expressive enough to sound human, not overdone
const HOST_SETTINGS  = { stability:0.45, similarity_boost:0.72, style:0.38, use_speaker_boost:true }
const GUEST_SETTINGS = { stability:0.42, similarity_boost:0.70, style:0.45, use_speaker_boost:true }

function cleanText(text: string) {
  return text
    .replace(/^(HOST|GUEST)[:\s]*/i, '')
    .replace(/\[([^\]]+)\]/g, '').replace(/\(([^)]+)\)/g, '')
    .replace(/\*([^*]+)\*/g, '$1').replace(/#{1,3}\s/g, '')
    .replace(/\s{2,}/g, ' ').trim()
}

function parseScript(script: string, hostName = 'HOST', guestName = 'GUEST') {
  const lines: Array<{ speaker: 'host'|'guest'; text: string }> = []
  const hostRe = new RegExp(`^(HOST|${hostName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}):`, 'i')
  const guestRe = new RegExp(`^(GUEST|${guestName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}):`, 'i')
  const anyNameRe = /^([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)*):/

  for (const part of script.split(/\n(?=[A-Z])/)) {
    const t = part.trim()
    if (!t || t.length < 5) continue
    if (hostRe.test(t)) {
      const text = cleanText(t.replace(hostRe, ''))
      if (text.length > 10) lines.push({ speaker: 'host', text })
    } else if (guestRe.test(t)) {
      const text = cleanText(t.replace(guestRe, ''))
      if (text.length > 10) lines.push({ speaker: 'guest', text })
    } else if (anyNameRe.test(t) && lines.length > 0) {
      const text = cleanText(t.replace(anyNameRe, ''))
      if (text.length > 10) {
        const last = lines[lines.length-1].speaker
        lines.push({ speaker: last === 'host' ? 'guest' : 'host', text })
      }
    } else if (lines.length > 0) {
      const cleaned = cleanText(t)
      if (cleaned.length > 5) lines[lines.length-1].text += ' ' + cleaned
    }
  }
  if (!lines.some(l => l.speaker === 'guest')) {
    const sents = script.match(/[^.!?]+[.!?]+/g) || [script]
    return sents.map((s, i) => ({ speaker: i%2===0 ? 'host' as const : 'guest' as const, text: cleanText(s) }))
  }
  return lines.filter(l => l.text.length > 10)
}

async function speak(text: string, voiceId: string, settings: object, apiKey: string): Promise<Buffer|null> {
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({ text, model_id:'eleven_turbo_v2_5', voice_settings: settings }),
      signal: AbortSignal.timeout(60000),
    })
    if (!r.ok) { console.error('EL', r.status, voiceId); return null }
    return Buffer.from(await r.arrayBuffer())
  } catch(e) { console.error('speak err:', e); return null }
}

// 0.5s silence between different speakers, 0.25s same speaker — creates real podcast feel
function makeSilence(ms: number): Buffer {
  // MP3 silence: simple header + silent frames
  // 128kbps MP3: 128000 bits/sec = 16000 bytes/sec
  const bytes = Math.floor((ms / 1000) * 16000)
  const buf = Buffer.alloc(bytes + 4, 0)
  // Write minimal MP3 frame sync header so players don't skip
  buf[0] = 0xFF; buf[1] = 0xFB; buf[2] = 0x90; buf[3] = 0x00
  return buf
}

// Process sequentially — one at a time to avoid ElevenLabs concurrent_limit_exceeded
async function processBatch(
  segments: Array<{ speaker:'host'|'guest'; text:string }>,
  hostVoiceId: string,
  guestVoiceId: string,
  apiKey: string,
  _batchSize = 1
): Promise<Buffer[]> {
  const results: Buffer[] = []
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const voiceId = seg.speaker === 'host' ? hostVoiceId : guestVoiceId
    const settings = seg.speaker === 'host' ? HOST_SETTINGS : GUEST_SETTINGS
    const buf = await speak(seg.text, voiceId, settings, apiKey)
    if (buf) {
      // Add silence gap BEFORE each segment (except first)
      if (i > 0) {
        const prevSpeaker = segments[i-1].speaker
        // 600ms gap when speaker changes, 300ms when same speaker continues
        const gapMs = prevSpeaker !== seg.speaker ? 600 : 300
        results.push(makeSilence(gapMs))
      }
      results.push(buf)
    }
    if (i < segments.length - 1) await new Promise(r => setTimeout(r, 200))
  }
  return results
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as any
    const { script, podcastId, title, clientId } = body
    const episodeNumber: number = parseInt(body.episodeNumber) || 1
    const guestName: string = body.guestName || 'Sarah'
    const guestGender: string = body.guestGender || 'auto'
    const siteSlug: string = body.siteSlug || ''
    const hName: string = body.hostName || 'HOST'

    const elKey = await getKey('ELEVENLABS_KEY')
    if (!elKey) return NextResponse.json({ error:'ElevenLabs key not configured' }, { status:400, headers:{"Access-Control-Allow-Origin":"*"} })
    if (!script) return NextResponse.json({ error:'Script required' }, { status:400, headers:{"Access-Control-Allow-Origin":"*"} })

    const siteConfig = getSiteConfig(siteSlug)
    const hostVoiceId = siteConfig.hostVoiceId
    const guestVoice = pickGuestVoice(guestName, guestGender as any)

    // CRITICAL FIX: use siteConfig.hostName (e.g. "David Hart") not body.hostName
    // Frontend never sends hostName to generate-audio, so body.hostName is always undefined
    // Parser was looking for "HOST:" but script has "David Hart:" → wrong voice per speaker
    const resolvedHostName = body.hostName || siteConfig.hostName || 'HOST'

    console.log(`Generating: site=${siteSlug} host=${resolvedHostName}(${hostVoiceId}) guest=${guestName}(${guestVoice.name})`)

    const segments = parseScript(script, resolvedHostName, guestName)
    console.log(`${segments.length} segments parsed`)

    const buffers = await processBatch(segments, hostVoiceId, guestVoice.id, elKey)

    if (buffers.length === 0) return NextResponse.json({ error:'No audio generated — check ElevenLabs key' }, { status:500, headers:{"Access-Control-Allow-Origin":"*"} })

    const combined = Buffer.concat(buffers)
    const fileName = `podcast-${podcastId || Date.now()}-${Date.now().toString(36)}.mp3`

    const { error: upErr } = await getDb().storage.from('podcasts')
      .upload(fileName, combined, { contentType:'audio/mpeg', cacheControl:'31536000', upsert:true })
    if (upErr) return NextResponse.json({ error: upErr.message }, { status:500, headers:{"Access-Control-Allow-Origin":"*"} })

    const { data: urlData } = getDb().storage.from('podcasts').getPublicUrl(fileName)
    const audioUrl = urlData.publicUrl

    if (podcastId) {
      await getDb().from('podcast_scripts').update({ audio_url:audioUrl, status:'ready' }).eq('id', podcastId)
      // Also upsert into portal_podcasts with the mp3_url for playback
      const epNum = parseInt(title?.match(/\d+/)?.[0] || '1')
      const { data: existing } = await getDb().from('portal_podcasts').select('id').eq('client_id', clientId).eq('title', title||'Episode').maybeSingle()
      if (existing?.id) {
        await getDb().from('portal_podcasts').update({ mp3_url: audioUrl, status:'published', script: script?.substring(0,500) }).eq('id', existing.id)
      } else {
        // Count existing episodes for this client to auto-number
        const { count } = await getDb().from('portal_podcasts').select('*', { count:'exact', head:true }).eq('client_id', clientId)
        await getDb().from('portal_podcasts').insert({
          client_id: clientId,
          episode_number: episodeNumber || (count||0) + 1,
          title: title || 'Podcast Episode',
          description: `AI podcast — ${siteConfig.hostName} × ${guestName||'Guest'}`,
          duration_minutes: Math.round((combined.length / 1024 / 128) * 8 / 60) || 20,
          status: 'published',
          mp3_url: audioUrl,
          host_name: siteConfig.hostName,
          guest_name: guestName || 'Guest',
          published_at: new Date().toISOString()
        })
      }
    }
    if (clientId) await getDb().from('portal_activity').insert({ client_id:clientId, type:'podcast_ready', description:`Audio: ${title||'Episode'}` })

    return NextResponse.json({
      success: true, audioUrl, fileName,
      segments: buffers.length,
      sizeKb: Math.round(combined.length/1024),
      voices: {
        host: `${siteConfig.hostName} — ${siteConfig.domain}`,
        guest: `${guestVoice.name} — matched to "${guestName}"`,
      },
    })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status:500, headers:{"Access-Control-Allow-Origin":"*"} })
  }
}
