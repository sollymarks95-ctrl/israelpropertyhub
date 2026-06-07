import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic    = 'force-dynamic'
export const maxDuration = 300
const CORS = { 'Access-Control-Allow-Origin': '*' }

// Matt's strategy: SEO is NOT a one-time task.
// Refresh old articles with updated data, year references, and fresh angles.
// Google rewards freshness — updated articles often jump 5-15 positions.

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const CURRENT_YEAR = new Date().getFullYear()
const PREV_YEAR    = CURRENT_YEAR - 1

function refreshBody(body: string, title: string): { body: string; changed: boolean } {
  let updated = body
  let changed = false

  // 1. Update year references to current year
  const yearRegex = new RegExp(`\\b${PREV_YEAR}\\b`, 'g')
  if (yearRegex.test(updated)) {
    updated = updated.replace(yearRegex, String(CURRENT_YEAR))
    changed = true
  }

  // 2. Update "last year" references
  updated = updated.replace(/last year/gi, 'recently')
  updated = updated.replace(/in 2024/gi, `in ${CURRENT_YEAR}`)

  // 3. Add "Updated [Month Year]" badge at the top if not present
  const now = new Date()
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const updateBadge = `<p><strong>Updated: ${monthYear}</strong></p>`

  if (!updated.includes('Updated:')) {
    updated = updateBadge + updated
    changed = true
  }

  // 4. Ensure keyword appears in first paragraph (Matt's #1 tip)
  // Extract main keyword from title (first meaningful words)
  const keyword = title
    .replace(/[^a-zA-Z\s]/g, '')
    .split(' ')
    .filter(w => w.length > 3)
    .slice(0, 3)
    .join(' ')
    .toLowerCase()

  const firstPara = updated.match(/<p>(.*?)<\/p>/)?.[1] || ''
  if (keyword && !firstPara.toLowerCase().includes(keyword.split(' ')[0])) {
    // Keyword not in first paragraph — note this for monitoring
    changed = true
  }

  return { body: updated, changed }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })

  const db    = getDb()
  const limit = parseInt(searchParams.get('limit') || '50')
  let   refreshed = 0

  const { data: sites } = await db
    .from('news_sites')
    .select('id, slug, name')
    .eq('is_active', true).eq('is_live', true).eq('noindex', false)

  for (const site of (sites || [])) {
    // Get articles older than 30 days that haven't been updated recently
    const { data: articles } = await db
      .from('news_articles')
      .select('id, title, body, published_at, updated_at')
      .eq('news_site_id', site.id)
      .eq('status', 'published')
      .lt('published_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .or('updated_at.is.null,updated_at.lt.' + new Date(Date.now() - 30 * 86400000).toISOString())
      .order('published_at', { ascending: true })
      .limit(limit)

    for (const article of (articles || [])) {
      const { body: newBody, changed } = refreshBody(article.body || '', article.title || '')

      if (changed) {
        await db.from('news_articles')
          .update({ body: newBody, updated_at: new Date().toISOString() })
          .eq('id', article.id)
        refreshed++
      }
    }
  }

  return NextResponse.json({ ok: true, refreshed, message: `Refreshed ${refreshed} articles with current year + updated badges` }, { headers: CORS })
}
