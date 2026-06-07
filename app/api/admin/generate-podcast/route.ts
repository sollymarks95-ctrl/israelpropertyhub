import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSiteConfig, pickPortalGuestVoice, SITE_PODCAST_CONFIG as PODCAST_CFG } from '@/app/lib/podcast-config'

export const runtime = 'nodejs'
export const maxDuration = 300

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST,OPTIONS' }

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function getKey(name: string) {
  if (process.env[name]) return process.env[name]!
  const { data } = await db().from('system_api_keys').select('key_value').eq('key_name', name).eq('is_active', true).single()
  return data?.key_value || ''
}

// Clean text for TTS — remove stage directions, normalize punctuation
function cleanForTTS(text: string): string {
  return text
    .replace(/\[laughs?\]/gi, '')          // remove [laughs]
    .replace(/\[both laugh\]/gi, '')        // remove [both laugh]
    .replace(/\[chuckles?\]/gi, '')         // remove [chuckles]
    .replace(/\[pauses?\]/gi, '...')        // pause → ellipsis
    .replace(/\[sighs?\]/gi, '')
    .replace(/--/g, ' — ')                 // normalize dashes
    .replace(/\s{2,}/g, ' ')               // collapse spaces
    .trim()
}

async function speak(text: string, voiceId: string, apiKey: string, isInterruption = false): Promise<Buffer | null> {
  const cleaned = cleanForTTS(text).slice(0, 2500)
  if (!cleaned || cleaned.length < 3) return null
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({
        text: cleaned,
        model_id: 'eleven_multilingual_v2',  // better naturalness than turbo
        voice_settings: {
          stability: 0.40,          // lower = more expressive/varied
          similarity_boost: 0.75,
          style: 0.45,              // higher = more emotional range
          use_speaker_boost: true,
          speed: isInterruption ? 1.08 : 1.0,  // interruptions slightly faster
        }
      }),
      signal: AbortSignal.timeout(35000),
    })
    if (!r.ok) { console.error('EL error', r.status, await r.text()); return null }
    return Buffer.from(await r.arrayBuffer())
  } catch (e) { console.error('speak err', e); return null }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientId, clientBrand, siteSlug, hostName, guestName, guestRole, topic, title, episodeNumber, durationMinutes, guestGender } = body
    const duration = parseInt(durationMinutes) || 5

    const [elKey, anthKey] = await Promise.all([
      getKey('ELEVENLABS_KEY'),
      Promise.resolve(process.env.ANTHROPIC_API_KEY || '')
    ])

    if (!elKey) return NextResponse.json({ error: 'ElevenLabs key not configured' }, { status: 400, headers: CORS })
    if (!anthKey) return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 400, headers: CORS })

    const cfg = getSiteConfig(siteSlug || 'global-trade-wire')
    const HOST = hostName || cfg.hostName
    const GUEST = guestName || 'James Richardson'
    // Per-portal voice assignment: never repeat same voice within a portal
    const guestVoice = pickPortalGuestVoice(siteSlug || 'global-trade-wire', parseInt(episodeNumber) || 1)
    const targetWords = duration * 140

    // STEP 1: Generate script with Claude
    console.log(`Generating ${duration}-min script: ${HOST} interviews ${GUEST}`)
    const scriptRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': anthKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: Math.min(targetWords * 6, 8000),
        system: `You write ultra-realistic podcast scripts that sound like REAL recorded conversations — not scripted, not corporate. Think Joe Rogan, Lex Fridman, How I Built This. Natural human dialogue.`,
        messages: [
          {
            role: 'user',
            content: `You are writing a podcast script. Output ONLY raw dialogue lines. No preamble, no explanation, no scene direction except [laughs].

HOST NAME: ${HOST}
GUEST NAME: ${GUEST}
GUEST TITLE: ${guestRole || 'industry expert'}
TOPIC: ${topic || (clientBrand?.name ? clientBrand.name + ' — strategy and positioning' : 'markets and strategy')}
TARGET LENGTH: ~${targetWords} words
${clientBrand ? `\nBRAND BRIEF: ${clientBrand.name} | ${clientBrand.website} | Regulated: ${clientBrand.regulation || 'multi-jurisdiction'}. Weave in naturally 2-3 times — expert discussion, not an ad.` : ''}

MANDATORY FORMAT — every single line must be one of:
${HOST}: [what they say]
${GUEST}: [what they say]

HARD RULES:
- Line 1 is ${HOST}: with a sharp, opinionated opening statement or provocative question — already mid-topic
- NEVER: "Welcome", "hello everyone", "I'm your host", "joining me today", "introduce yourself", "today's episode", "today we'll be discussing" — these are banned
- NEVER have the guest say their own name or explain who they are
- [laughs] or [both laugh] must appear at least 6 times spread throughout
- At least 4 interruptions where someone cuts off mid-sentence using " —"
- At least one moment: ${HOST}: "I'm not buying that — " followed by pushback
- At least one personal story or specific anecdote from the guest (something that happened to them)
- Natural filler: "you know", "I mean", "honestly", "look —", "right?", "here's the thing"
- One tangent that drifts, then: "anyway — where were we"
- Conversation sounds like it was recorded, not written
- TRANSITIONS between topics: "right, so — " / "which actually brings me to..." / "that's interesting because..." — never a hard full stop before a new topic
- BREATH MOMENTS after intense exchanges — one person says something very short: "God, yeah." / "Right." / "Exactly." / "Hm." — then the next thought
- ENERGY VARIATION: some exchanges are rapid-fire (3-4 short lines each), some are long monologues (one person speaks 5+ sentences uninterrupted while the other just says "mm" or "right")
- [laughs] stays inline inside a dialogue line — never on its own line
- DO NOT end the episode with a formal goodbye or "thanks for listening" — just stop mid-conversation energy or trail off naturally`
          },
          {
            role: 'assistant',
            content: `${HOST}: `
          }
        ]
      }),
      signal: AbortSignal.timeout(120000),
    })

    if (!scriptRes.ok) {
      const err = await scriptRes.text()
      console.error('Claude error:', scriptRes.status, err)
      return NextResponse.json({ error: `Script generation failed: ${scriptRes.status}` }, { status: 500, headers: CORS })
    }

    const scriptData = await scriptRes.json()
    // Prepend the assistant prefill (HOST: ) since Claude continues from it
    const rawScript = scriptData.content?.[0]?.text?.trim() || ''
    const script = rawScript.startsWith(`${HOST}:`) ? rawScript : `${HOST}: ${rawScript}`
    if (!script) return NextResponse.json({ error: 'Empty script from Claude' }, { status: 500, headers: CORS })
    console.log(`Script: ${script.split(' ').length} words`)

    // STEP 2: Parse script into segments
    const segments: Array<{ speaker: 'host' | 'guest'; text: string }> = []
    const hostRe = new RegExp(`^${HOST}:`, 'i')
    const guestRe = new RegExp(`^${GUEST}:`, 'i')
    for (const line of script.split('\n')) {
      const t = line.trim()
      if (!t || t.length < 5) continue
      if (hostRe.test(t)) segments.push({ speaker: 'host', text: t.replace(hostRe, '').trim() })
      else if (guestRe.test(t)) segments.push({ speaker: 'guest', text: t.replace(guestRe, '').trim() })
      else if (/^(HOST|GUEST):/i.test(t)) {
        const isHost = /^HOST:/i.test(t)
        segments.push({ speaker: isHost ? 'host' : 'guest', text: t.replace(/^(HOST|GUEST):\s*/i, '').trim() })
      }
    }

    if (segments.length === 0) {
      // fallback: split by sentences
      const sents = script.match(/[^.!?]+[.!?]+/g) || [script]
      sents.forEach((s, i) => segments.push({ speaker: i % 2 === 0 ? 'host' : 'guest', text: s.trim() }))
    }

    console.log(`${segments.length} segments. Host voice: ${cfg.hostVoiceId}, Guest: ${guestVoice.name}`)

    // STEP 3: Group consecutive same-speaker segments, then generate audio
    // This avoids awkward mid-sentence pauses when one person speaks multiple lines
    type Seg = { speaker: 'host'|'guest'; text: string; isInterruption?: boolean }
    const grouped: Seg[] = []
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const prev = grouped[grouped.length - 1]
      const isInterruption = seg.text.endsWith('—') || seg.text.startsWith('—') || seg.text.includes(' — ')
      // Merge with previous if same speaker AND short utterance (natural continuation)
      if (prev && prev.speaker === seg.speaker && prev.text.length < 300 && seg.text.length < 200) {
        prev.text = prev.text + ' ' + seg.text
      } else {
        grouped.push({ ...seg, isInterruption })
      }
    }

    const maxSegs = Math.min(grouped.length, 22)
    const buffers: Buffer[] = []

    // Silence constants (at ~128kbps MP3, 1 second ≈ 16000 bytes)
    // For MP3 we use a very short null buffer — actual gap from audio end/start is enough
    const silTiny  = Buffer.alloc(2000, 0)  // ~125ms — same speaker continuation
    const silShort = Buffer.alloc(5000, 0)  // ~310ms — fast speaker switch (interruption)
    const silMid   = Buffer.alloc(9000, 0)  // ~560ms — normal speaker switch
    const silBreath = Buffer.alloc(13000, 0) // ~810ms — after laugh/long pause

    for (let i = 0; i < maxSegs; i++) {
      const seg = grouped[i]
      const voiceId = seg.speaker === 'host' ? cfg.hostVoiceId : guestVoice.id
      const buf = await speak(seg.text, voiceId, elKey, seg.isInterruption)
      if (buf) {
        if (i > 0) {
          const prev = grouped[i - 1]
          const speakerSwitch = prev.speaker !== seg.speaker
          const hasLaugh = prev.text.toLowerCase().includes('[laugh') || seg.text.toLowerCase().includes('[laugh')
          const isInterrupt = seg.isInterruption || prev.text.endsWith('—')
          // Choose silence based on context
          if (hasLaugh) buffers.push(silBreath)
          else if (!speakerSwitch) buffers.push(silTiny)
          else if (isInterrupt) buffers.push(silShort)
          else buffers.push(silMid)
        }
        buffers.push(buf)
      }
      await new Promise(r => setTimeout(r, 100))
    }

    if (buffers.length === 0) return NextResponse.json({ error: 'No audio generated — ElevenLabs failed' }, { status: 500, headers: CORS })

    const mp3 = Buffer.concat(buffers)
    const fileName = `podcast-${Date.now()}.mp3`

    // STEP 4: Upload to Supabase storage
    const { error: upErr } = await db().storage.from('podcasts').upload(fileName, mp3, {
      contentType: 'audio/mpeg', cacheControl: '31536000', upsert: true
    })
    if (upErr) return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500, headers: CORS })

    const { data: urlData } = db().storage.from('podcasts').getPublicUrl(fileName)
    const audioUrl = urlData.publicUrl

    // STEP 5: Save to portal_podcasts
    await db().from('portal_podcasts').insert({
      title: title || `${cfg.showName} — Episode ${episodeNumber || 1}`,
      script,
      audio_url: audioUrl,
      status: 'published',
      client_id: clientId || null,
      site_slug: siteSlug || null,
      host_name: HOST,
      guest_name: GUEST,
      episode_number: parseInt(episodeNumber) || 1,
      duration_seconds: duration * 60,
    })

    // Upsert podcast_scripts: update if exists, create if not
    const { data: existingScript } = await db()
      .from('podcast_scripts')
      .select('id')
      .eq('site_slug', siteSlug || '')
      .eq('episode_number', parseInt(episodeNumber) || 1)
      .maybeSingle()

    if (existingScript?.id) {
      await db()
        .from('podcast_scripts')
        .update({ audio_url: audioUrl, script, status: 'published' })
        .eq('id', existingScript.id)
    } else {
      // Create new episode record
      await db().from('podcast_scripts').insert({
        site_slug: siteSlug || null,
        episode_number: parseInt(episodeNumber) || 1,
        title: title || `${cfg.showName} — Episode ${episodeNumber || 1}`,
        script,
        audio_url: audioUrl,
        status: 'published',
        host_name: HOST,
        show_name: cfg.showName,
        guest_name: GUEST,
        guest_role: guestRole || 'Guest',
        topic: topic || null,
        duration_minutes: duration,
        duration_seconds: duration * 60,
        client_id: clientId || null,
        word_count: script.split(/\s+/).length,
      })
    }

    return NextResponse.json({
      ok: true,
      audioUrl,
      script,
      host: HOST,
      guest: GUEST,
      segments: segments.length,
      words: script.split(' ').length,
    }, { headers: CORS })

  } catch (e: any) {
    console.error('generate-podcast error:', e)
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS })
  }
}
