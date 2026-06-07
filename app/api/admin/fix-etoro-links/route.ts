import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

const ETORO_LINK = '<a href="https://etoro.com" rel="noopener noreferrer" target="_blank">eToro</a>'
const ETORO_REGEX = /eToro(?![^<]*<\/a>)/  // first eToro not already in <a> tag

function isAlreadyLinked(body: string): boolean {
  return /href[^"]*"[^"]*etoro/i.test(body)
}

function addLinkToHTML(body: string): string {
  // Body already has HTML tags — replace first unlinked eToro
  return body.replace(ETORO_REGEX, ETORO_LINK)
}

function convertPlainTextToHTML(body: string): string {
  // 1. Split on double newline (paragraph separator)
  const paragraphs = body
    .replace(/\\n/g, '\n')  // handle literal \n
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)

  // 2. Convert each block
  const htmlParts = paragraphs.map(p => {
    const line = p.replace(/\n/g, ' ').trim()
    // Detect section headers (all caps short line, or markdown ##)
    if (/^#{1,3}\s/.test(line)) return `<h2>${line.replace(/^#{1,3}\s*/, '')}</h2>`
    if (line === line.toUpperCase() && line.length < 80 && line.length > 3 && !/[.!?]$/.test(line)) return `<h2>${line}</h2>`
    if (/^Q:\s.+\?/.test(line)) return `<p>${line}</p>`
    return `<p>${line}</p>`
  })

  return htmlParts.join('\n')
}

function processBody(body: string): string {
  const hasHTML = /<[a-z][^>]*>/i.test(body)

  let processed: string
  if (hasHTML) {
    processed = addLinkToHTML(body)
  } else {
    // Convert plain text to HTML first, then add link
    const html = convertPlainTextToHTML(body)
    processed = addLinkToHTML(html)
  }

  return processed
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get all articles mentioning eToro without a link
  const { data: articles, error } = await sb
    .from('news_articles')
    .select('id, title, body, slug')
    .ilike('body', '%etoro%')
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const toFix = (articles || []).filter(a => !isAlreadyLinked(a.body || ''))
  let fixed = 0
  let errors = 0
  const log: string[] = []

  // Process in batches of 20
  const BATCH = 20
  for (let i = 0; i < toFix.length; i += BATCH) {
    const batch = toFix.slice(i, i + BATCH)
    const updates = batch.map(a => ({
      id: a.id,
      body: processBody(a.body || '')
    }))

    for (const u of updates) {
      const { error: updateErr } = await sb
        .from('news_articles')
        .update({ body: u.body })
        .eq('id', u.id)

      if (updateErr) {
        errors++
        log.push(`❌ ${u.id}: ${updateErr.message}`)
      } else {
        fixed++
      }
    }

    // Brief pause between batches
    if (i + BATCH < toFix.length) await new Promise(r => setTimeout(r, 200))
  }

  return NextResponse.json({
    total_with_etoro: articles?.length || 0,
    already_linked: (articles?.length || 0) - toFix.length,
    processed: toFix.length,
    fixed,
    errors,
    log: log.slice(0, 10),
  })
}

// GET to check status without running
export async function GET(req: NextRequest) {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await sb
    .from('news_articles')
    .select('id, body')
    .ilike('body', '%etoro%')
    .limit(500)

  if (error) return NextResponse.json({ error: error.message })

  const all = data || []
  const linked = all.filter(a => /href[^"]*"[^"]*etoro/i.test(a.body || ''))
  const needsLink = all.filter(a => !/href[^"]*"[^"]*etoro/i.test(a.body || ''))
  const hasHTML = needsLink.filter(a => /<[a-z][^>]*>/i.test(a.body || ''))
  const plainText = needsLink.filter(a => !/<[a-z][^>]*>/i.test(a.body || ''))

  return NextResponse.json({
    total_with_etoro: all.length,
    already_linked: linked.length,
    needs_link: needsLink.length,
    breakdown: { has_html: hasHTML.length, plain_text: plainText.length }
  })
}
