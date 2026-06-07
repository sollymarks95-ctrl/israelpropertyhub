import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateArticleImage } from '@/app/api/admin/generate-image/route'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '15')

  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, title, slug, category')
    .eq('status', 'published')
    .or('cover_image_url.is.null,cover_image_url.like.%unsplash%')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (!articles?.length) {
    return NextResponse.json({ message: 'All articles have unique images', count: 0 })
  }

  let updated = 0
  for (const article of articles) {
    const url = await generateArticleImage(article.title, article.category || 'Markets', article.id, article.slug)
    if (url) updated++
    await new Promise(r => setTimeout(r, 3500))
  }

  return NextResponse.json({ updated, total: articles.length, message: `Run again for next batch` })
}
