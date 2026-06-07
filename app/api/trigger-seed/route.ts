import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 300

// One-time seeder: fills all 12 sites with 40 historical articles each
export async function POST(req: NextRequest) {
  const { data: sites } = await supabase.from('news_sites').select('*').eq('is_live', true)
  if (!sites?.length) return NextResponse.json({ error: 'No live sites' })

  const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  const results = []

  for (const site of sites) {
    const res = await fetch(`${base}/api/seed-articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: site.id,
        siteType: site.site_type || 'news',
        siteName: site.name,
        categories: site.categories || ['Business', 'Markets', 'Analysis'],
        targetCount: 40,  // 40 historical articles
        daysBack: 14,     // spread over past 2 weeks
      })
    })
    const data = await res.json()
    results.push({ site: site.name, inserted: data.inserted || 0, errors: data.errors })
  }

  const total = results.reduce((a, r) => a + r.inserted, 0)
  return NextResponse.json({ success: true, total, results })
}
