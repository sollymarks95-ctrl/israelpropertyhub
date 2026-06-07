import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic    = 'force-dynamic'
export const maxDuration = 300
const CORS = { 'Access-Control-Allow-Origin': '*' }

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function injectInternalLinks(body: string, currentSlug: string, allArticles: any[], domain: string, siteSlug: string): string {
  const candidates = allArticles.filter(a => a.slug !== currentSlug).sort(() => Math.random() - 0.5).slice(0, 20)
  let injectedCount = 0
  let updated = body

  for (const candidate of candidates) {
    if (injectedCount >= 3) break
    const words = candidate.title.toLowerCase().replace(/[^a-z\s]/g,'').split(' ').filter((w:string)=>w.length>4)
    for (const word of words) {
      const url = `https://${domain}/article/${siteSlug}/${candidate.slug}`
      const rx  = new RegExp(`(?<![">])(\\b${word}\\b)(?![^<]*>)`, 'i')
      if (rx.test(updated) && !updated.includes(url)) {
        updated = updated.replace(rx, `<a href="${url}" title="${candidate.title.replace(/"/g,"'")}">${word}</a>`)
        injectedCount++
        break
      }
    }
  }

  if (!updated.includes('Related Articles')) {
    const rel = allArticles.filter(a=>a.slug!==currentSlug).slice(0,3)
    updated += `\n<h3>Related Articles</h3>\n<ul>\n${rel.map(a=>`<li><a href="https://${domain}/article/${siteSlug}/${a.slug}">${a.title}</a></li>`).join('\n')}\n</ul>`
  }
  return updated
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })

  const db = getDb()
  const limit = parseInt(searchParams.get('limit') || '100')
  let updated = 0

  const { data: sites } = await db.from('news_sites').select('id,slug,name,domain')
    .eq('is_active',true).eq('is_live',true).eq('noindex',false)

  for (const site of (sites||[])) {
    const { data: articles } = await db.from('news_articles')
      .select('id,slug,title,body,category')
      .eq('news_site_id', site.id).eq('status','published')
      .not('body','ilike',`%href="https://${site.domain}%`)
      .order('published_at',{ascending:false}).limit(limit)

    const { data: allArts } = await db.from('news_articles')
      .select('slug,title,category').eq('news_site_id',site.id)
      .eq('status','published').limit(300)

    for (const art of (articles||[])) {
      const newBody = injectInternalLinks(art.body||'', art.slug, allArts||[], site.domain, site.slug)
      if (newBody !== art.body) {
        await db.from('news_articles').update({body:newBody}).eq('id',art.id)
        updated++
      }
    }
  }
  return NextResponse.json({ ok:true, updated }, { headers: CORS })
}
