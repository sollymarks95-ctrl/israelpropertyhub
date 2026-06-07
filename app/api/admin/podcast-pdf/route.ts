import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const CORS = { 'Access-Control-Allow-Origin': '*' }

// Format dialogue for HeyGen Video Podcast
// HeyGen reads speaker labels like "JAMES:" or "HOST:" to assign avatars
function formatScript(script: string, hostName: string, guestName: string): string {
  if (!script) return ''
  const hostFirst = hostName.split(' ')[0].toUpperCase()
  const guestFirst = guestName.split(' ')[0].toUpperCase()

  return script
    .split('\n')
    .map(line => {
      // Normalise speaker labels → FIRSTNAME: format HeyGen recognises
      line = line.replace(new RegExp(`^${hostName}\\s*:`, 'i'), `${hostFirst}:`)
      line = line.replace(new RegExp(`^${hostFirst}\\s*:`, 'i'), `${hostFirst}:`)
      line = line.replace(new RegExp(`^${guestName}\\s*:`, 'i'), `${guestFirst}:`)
      line = line.replace(new RegExp(`^${guestFirst}\\s*:`, 'i'), `${guestFirst}:`)
      return line
    })
    .join('\n')
}

function buildPDFHtml(ep: any): string {
  const hostFirst  = (ep.host_name  || 'HOST').split(' ')[0].toUpperCase()
  const guestFirst = (ep.guest_name || 'GUEST').split(' ')[0].toUpperCase()
  const script     = formatScript(ep.script || '', ep.host_name || '', ep.guest_name || '')
  const today      = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })

  // Format script lines with colour-coded speakers for readability
  const scriptHtml = script.split('\n').map(line => {
    if (!line.trim()) return '<p class="spacer"></p>'
    if (line.startsWith(hostFirst + ':')) {
      const text = line.slice(hostFirst.length + 1).trim()
      return `<p class="line host"><span class="speaker">${hostFirst}</span>${text}</p>`
    }
    if (line.startsWith(guestFirst + ':')) {
      const text = line.slice(guestFirst.length + 1).trim()
      return `<p class="line guest"><span class="speaker">${guestFirst}</span>${text}</p>`
    }
    return `<p class="line note">${line}</p>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${ep.show_name || 'Podcast'} — Ep ${ep.episode_number}: ${ep.title}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12pt; color: #1a1a1a; background: #fff; padding: 60px 72px; line-height: 1.6; }
  
  /* Header */
  .show-name { font-size: 10pt; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .episode-num { font-size: 9pt; color: #aaa; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 20px; }
  .title { font-size: 22pt; font-weight: 900; line-height: 1.15; color: #000; margin-bottom: 16px; }
  .topic { font-size: 11pt; color: #444; line-height: 1.6; margin-bottom: 24px; padding: 14px 18px; background: #f7f7f7; border-left: 4px solid #1a56db; }
  
  /* Cast block */
  .cast { display: flex; gap: 40px; margin-bottom: 32px; padding: 16px 18px; border: 1px solid #e5e7eb; border-radius: 6px; }
  .cast-role { font-size: 9pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #888; margin-bottom: 2px; }
  .cast-name { font-size: 13pt; font-weight: 700; color: #000; }
  .cast-org  { font-size: 10pt; color: #555; }
  .cast-label-host  { color: #1a56db; }
  .cast-label-guest { color: #059669; }
  
  /* Divider */
  .divider { border: none; border-top: 2px solid #000; margin: 28px 0 24px; }
  .script-label { font-size: 9pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #888; margin-bottom: 20px; }
  
  /* Script lines */
  .line { margin-bottom: 14px; padding-left: 90px; position: relative; }
  .speaker { position: absolute; left: 0; width: 82px; font-weight: 700; font-size: 10pt; letter-spacing: .05em; }
  .line.host .speaker   { color: #1a56db; }
  .line.guest .speaker  { color: #059669; }
  .line.note  { color: #777; font-style: italic; padding-left: 0; font-size: 10pt; }
  .spacer { margin-bottom: 8px; }
  
  /* Footer */
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 9pt; color: #aaa; display: flex; justify-content: space-between; }

  @page { margin: 0; }
  @media print {
    body { padding: 48px 64px; }
    .line { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<div class="show-name">${ep.show_name || 'Podcast'}</div>
<div class="episode-num">Episode ${ep.episode_number || 1} &nbsp;·&nbsp; ${ep.duration_minutes || 8} minutes &nbsp;·&nbsp; ${today}</div>
<h1 class="title">${ep.title}</h1>

${ep.topic ? `<div class="topic">${ep.topic}</div>` : ''}

<div class="cast">
  <div>
    <div class="cast-role cast-label-host">${hostFirst} — Host</div>
    <div class="cast-name">${ep.host_name || 'Host'}</div>
    <div class="cast-org">${ep.show_name || ''}</div>
  </div>
  <div>
    <div class="cast-role cast-label-guest">${guestFirst} — Guest</div>
    <div class="cast-name">${ep.guest_name || 'Guest'}</div>
    <div class="cast-org">${ep.guest_role || ''}</div>
  </div>
</div>

<hr class="divider"/>
<div class="script-label">Transcript</div>

${scriptHtml}

<div class="footer">
  <span>${ep.show_name || 'Podcast'} — ${ep.title}</span>
  <span>Generated for HeyGen Video Podcast</span>
</div>

</body>
</html>`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: CORS })

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: ep, error } = await sb
    .from('podcast_scripts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !ep) return NextResponse.json({ error: 'Episode not found' }, { status: 404, headers: CORS })

  const html = buildPDFHtml(ep)
  const safe = (ep.title || 'podcast').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60)
  const filename = `heygen-podcast-ep${ep.episode_number}-${safe}.html`

  // Return HTML (user prints to PDF, or we serve as downloadable HTML)
  return new NextResponse(html, {
    status: 200,
    headers: {
      ...CORS,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}"`,
    }
  })
}
