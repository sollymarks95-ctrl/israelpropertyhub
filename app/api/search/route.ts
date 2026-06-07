import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  const siteId = req.nextUrl.searchParams.get('site') || ''
  const category = req.nextUrl.searchParams.get('category') || ''
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 50)

  if (q.length < 2) return NextResponse.json({ results: [], query: q })

  let query = getDb().from('news_articles')
    .select('id, title, slug, excerpt, category, tags, cover_image_url, published_at, read_time_minutes, author_name, news_site_id')
    .eq('status', 'published')
    .limit(limit)

  if (siteId) query = query.eq('news_site_id', siteId)
  if (category) query = query.eq('category', category)
  
  // Use full-text search
  query = query.textSearch('search_vector', q, { type: 'websearch', config: 'english' })

  const { data, error } = await query.order('published_at', { ascending: false })
  if (error) {
    // Fallback to ilike if full-text fails
    const { data: fallback } = await getDb().from('news_articles')
      .select('id, title, slug, excerpt, category, cover_image_url, published_at, read_time_minutes, author_name, news_site_id')
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .limit(limit)
    return NextResponse.json({ results: fallback || [], query: q })
  }
  return NextResponse.json({ results: data || [], query: q })
}
