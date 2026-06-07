import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSiteConfig } from '@/app/lib/podcast-config'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function OPTIONS() {
  return new Response(null, { status:204, headers: { "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"POST,OPTIONS", "Access-Control-Allow-Headers":"Content-Type" } })
}

const ANTHROPIC = process.env.ANTHROPIC_API_KEY!

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    clientId,
    topic,
    episode,
    episodeNumber,
    hostName,
    hostRole,
    guestName,
    guestRole,
    siteSlug = '',
  } = body

  // Support both `duration` and `durationMinutes` from frontend
  const duration: number = parseInt(body.durationMinutes || body.duration) || 20
  const epNum = episodeNumber || episode || 1

  const client = clientId
    ? (await supabase.from('portal_clients').select('*').eq('id', clientId).single()).data
    : null

  const company = client?.company_name || 'the firm'
  const industry = client?.industry || 'financial services'

  const siteCfg = getSiteConfig(siteSlug)
  const SHOW_NAME = siteCfg.showName
  const HOST = hostName || siteCfg.hostName
  const HOST_TITLE = hostRole || siteCfg.hostRole
  const GUEST = guestName || 'Sarah Mitchell'
  const GUEST_TITLE = guestRole || 'Expert Analyst'

  const targetWords = Math.round(duration * 140)
  const minWords = Math.round(duration * 130)

  const prompt = `Write a ${duration}-minute financial podcast conversation that sounds like two REAL humans talking — not corporate, not scripted, not AI.

SHOW: "${SHOW_NAME}" | HOST: ${HOST} (${HOST_TITLE}) | GUEST: ${GUEST} (${GUEST_TITLE} at ${company})
TOPIC: ${topic || company + ' — story, edge, and 2026 outlook in ' + industry}
LENGTH: ${targetWords} words

FORMAT (strict):
- Every line starts with the speaker's name and colon: "${HOST}:" or "${GUEST}:"
- NEVER write "HOST:" or "GUEST:" — always their real names
- NO stage directions, NO [brackets], NO asterisks, NO (notes)
- Each turn = 2-5 sentences. Nobody speaks for 6+ sentences straight.
- Rapid back-and-forth — keep the energy moving

SOUND HUMAN — these are non-negotiable:
1. SHORT REACTIONS between longer thoughts: "Yeah.", "Right.", "Exactly.", "Hm.", "Interesting.", "Go on."
2. NATURAL STUMBLES: "It's— look, it's complicated.", "And honestly?", "I mean, at the end of the day...", "Here's the thing—"
3. REAL PUSHBACK occasionally: "I'd actually challenge that a bit.", "Some critics would say...", "Fair, but—"
4. INTERRUPTION ENERGY: sentences that cut in with "—" or start with "Wait—" or "Hold on—"
5. SPECIFICS: real numbers, real competitor names, real dates, real regulations — no vague generalities
6. CASUAL VOCABULARY: how smart people actually talk over coffee. No "leverage", "synergies", "robust"
7. MIX sentence lengths — "Wow." next to a 3-sentence explanation. Rhythm matters.

STRUCTURE:
- First 90 sec: ${HOST} opens with a punchy hook and introduces ${GUEST} like they know each other
- Middle: Meaty real conversation — debate, stories, data, challenges, surprises  
- Last 90 sec: One bold prediction from ${GUEST}, warm sign-off from ${HOST}

START immediately with "${HOST}:" — no title, no preamble, no explanation:`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system: 'You are writing a financial podcast script. Write detailed, professional scripts using realistic but general market context. Always produce the full script immediately.',
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(270000),
    })

    const data = await res.json()

    if (data.error) {
      console.error('Anthropic API error:', data.error)
      return NextResponse.json({ error: data.error.message || 'Anthropic API error', details: data.error }, { status: 500, headers: { "Access-Control-Allow-Origin": "*", 'Access-Control-Allow-Headers': 'Content-Type' } })
    }

    const textBlocks = (data.content || []).filter((b: any) => b.type === 'text')
    const script = (textBlocks[textBlocks.length - 1]?.text || '').trim()

    if (!script) {
      console.error('Empty script. Full response:', JSON.stringify(data).slice(0, 500))
      return NextResponse.json({ error: 'Empty script returned — check API key and model' }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } })
    }

    const wordCount = script.split(/\s+/).length
    const hostLines = (script.match(new RegExp('^' + HOST + ':', 'gm')) || []).length
    const guestLines = (script.match(new RegExp('^' + GUEST + ':', 'gm')) || []).length

    const { data: saved, error: saveErr } = await supabase.from('podcast_scripts').insert({
      client_id: clientId || null,
      title: `${SHOW_NAME} — Episode ${epNum}: ${topic || GUEST_TITLE + ' Interview'}`,
      script,
      status: 'draft',
      episode_number: epNum,
      duration_minutes: duration,
      duration_seconds: duration * 60,
      site_slug: siteSlug || null,
      host_name: HOST,
      show_name: SHOW_NAME,
      guest_name: GUEST,
      guest_role: GUEST_TITLE,
      topic: topic || null,
      word_count: wordCount,
    }).select().single()
    
    if (saveErr) console.error('Script save error:', saveErr.message)

    return NextResponse.json({
      success: true, script,
      podcastId: saved?.id,
      showName: SHOW_NAME,
      hostName: HOST,
      guestName: GUEST,
      stats: { wordCount, hostLines, guestLines, estimatedMinutes: Math.round(wordCount / 140) },
    }, { headers: { "Access-Control-Allow-Origin": "*" } })

  } catch (e: any) {
    console.error('generate-script error:', e)
    return NextResponse.json({ error: e.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } })
  }
}
