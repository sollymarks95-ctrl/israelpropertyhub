import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 180

const getDb = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const REVIEWER_NAMES = [
  'James T.','Sarah M.','David K.','Emma L.','Michael R.','Priya S.','Tom H.','Olivia C.',
  'Marcus W.','Aisha B.','Chris F.','Natalie P.','Ben J.','Fatima A.','Luke D.','Sophie G.',
  'Raj N.','Claire O.','Aaron Z.','Mia V.','George B.','Hannah K.','Felix R.','Zara A.',
  'Daniel W.','Chloe M.','Sam P.','Yasmin H.','Jack L.','Isla T.','Noah C.','Grace F.',
]

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }

// Use Claude to generate fresh, unique AI reviews
async function generateReviewsForCompany(company: any, count: number): Promise<any[]> {
  const ANTH = process.env.ANTHROPIC_API_KEY
  if (!ANTH) return []

  const posCount = Math.round(count * (company.category?.includes('bankrupt') ? 0.2 : 0.75))
  const negCount = count - posCount
  const today = new Date().toISOString().split('T')[0]

  const prompt = `Generate ${count} realistic NEW customer reviews for ${company.name} (${company.category || 'broker'}).
Regulation: ${company.regulation || 'varies'}
Description: ${company.description || company.tagline || company.name}
Date context: ${today}

Requirements:
- ${posCount} positive (rating 4-5 stars), ${negCount} negative/neutral (rating 2-3 stars)  
- Each 80-160 words, first-person, specific experiences
- Mention regulation naturally where relevant
- Vary: experienced trader, beginner, long-term investor, day trader, crypto trader
- Sound genuinely human — include specific details, minor complaints even in positive reviews
- Reference recent 2026 market conditions where natural

Return ONLY valid JSON array:
[{"rating":5,"title":"Concise title","body":"Review text here"}]`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTH, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const text = data.content?.[0]?.text?.trim() || ''
    const clean = text.replace(/```json\s*/g, '').replace(/```/g, '').trim()
    return JSON.parse(clean).slice(0, count)
  } catch { return [] }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getDb()

  // Load all active companies
  const { data: companies } = await db
    .from('verivex_companies')
    .select('slug, name, category, regulation, description, tagline, is_featured')
    .order('slug')

  if (!companies || companies.length === 0) return NextResponse.json({ ok: true, message: 'No companies yet' })

  // Pick 5 companies to receive reviews today (weighted toward fewer-reviewed)
  const { data: reviewCounts } = await db
    .from('verivex_reviews')
    .select('company_slug')
    .eq('status', 'approved')

  const counts: Record<string, number> = {}
  for (const co of (companies as any[])) counts[co.slug] = 0
  for (const r of reviewCounts || []) counts[r.company_slug] = (counts[r.company_slug] || 0) + 1

  // Weighted random: lower review count = higher chance of being picked
  const weighted = companies.flatMap(co => {
    const c = counts[co.slug] || 0
    const weight = Math.max(1, 20 - Math.floor(c / 5)) // decreases as reviews accumulate
    return Array(weight).fill(co)
  })

  // Pick 5 unique companies
  const picked: any[] = []
  const seen = new Set<string>()
  for (let i = 0; i < 200 && picked.length < 5; i++) {
    const co = rand(weighted) as any
    if (!seen.has(co.slug)) { picked.push(co); seen.add(co.slug) }
  }

  let totalInserted = 0
  const results: any[] = []

  for (const company of picked) {
    const reviewsToAdd = randInt(2, 4)
    const reviews = await generateReviewsForCompany(company, reviewsToAdd)
    if (reviews.length === 0) continue

    const toInsert = reviews.map((r: any, i: number) => ({
      company_slug: company.slug,
      company_name: company.name,
      reviewer_name: rand(REVIEWER_NAMES),
      rating: Math.max(1, Math.min(5, parseInt(r.rating) || 4)),
      title: (r.title || 'Review').slice(0, 120),
      review_text: r.body || '',
      verified: Math.random() > 0.2,
      status: 'approved',
      created_at: new Date(Date.now() - randInt(0, 48) * 3600000).toISOString(),
    }))

    const { error } = await db.from('verivex_reviews').insert(toInsert)
    if (!error) {
      totalInserted += toInsert.length
      results.push({ company: company.name, added: toInsert.length })

      // trust_score column removed from schema
    }

    await new Promise(r => setTimeout(r, 400))
  }

  return NextResponse.json({
    ok: true,
    reviewsAdded: totalInserted,
    companies: results,
    totalCompanies: companies.length,
    totalReviews: (reviewCounts?.length || 0) + totalInserted,
  })
}
