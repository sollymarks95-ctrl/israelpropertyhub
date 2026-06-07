import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Always use service role key for atomic DB writes — bypasses RLS
function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export async function POST(req: NextRequest) {
  try {
    const { articleId, siteSlug, slug } = await req.json()
    if (!articleId && !(siteSlug && slug)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const db = getDb()
    let id = articleId

    // Look up by siteSlug + slug if no direct articleId
    if (!id && siteSlug && slug) {
      // Try direct slug lookup first (fastest)
      const { data: art } = await db
        .from('news_articles')
        .select('id')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (art) {
        id = art.id
      } else {
        // Fall back to joining via news_sites
        const { data: site } = await db
          .from('news_sites')
          .select('id')
          .eq('slug', siteSlug)
          .single()

        if (site) {
          const { data: art2 } = await db
            .from('news_articles')
            .select('id')
            .eq('news_site_id', site.id)
            .eq('slug', slug)
            .eq('status', 'published')
            .single()

          if (art2) id = art2.id
        }
      }
    }

    if (!id) return NextResponse.json({ ok: false, reason: 'article_not_found' }, { status: 404 })

    // Atomic increment via SQL function — updates both news_articles AND portal_content
    const { error } = await db.rpc('increment_article_views', { article_id: id })

    if (error) {
      // Fallback: direct UPDATE if RPC fails
      await db
        .from('news_articles')
        .update({ views: db.rpc('increment_article_views', { article_id: id }) as any })
        .eq('id', id)
    }

    return NextResponse.json({ ok: true, id })
  } catch (e) {
    // Never crash the article page — swallow error silently
    return NextResponse.json({ ok: false })
  }
}
