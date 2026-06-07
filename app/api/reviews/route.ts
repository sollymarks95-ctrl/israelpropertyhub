import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }
const CORS = { 'Access-Control-Allow-Origin': '*' }

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
}

// GET — fetch approved reviews for a company
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || 'etoro'
  const { data, error } = await getDb()
    .from('verivex_reviews')
    .select('*')
    .eq('company_slug', slug)
    .eq('status', 'approved')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
  return NextResponse.json({ reviews: data || [] }, { headers: CORS })
}

// POST — submit a new review (goes to pending)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { company_name, company_slug, reviewer_name, reviewer_location, rating, title, review_text, trading_experience } = body

  if (!reviewer_name || !rating || !title || !review_text || !company_slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: CORS })
  }
  if (review_text.length < 50) {
    return NextResponse.json({ error: 'Review must be at least 50 characters' }, { status: 400, headers: CORS })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400, headers: CORS })
  }

  const { error } = await getDb().from('verivex_reviews').insert({
    company_name: company_name || 'eToro',
    company_slug,
    reviewer_name,
    reviewer_location,
    rating: parseInt(rating),
    title,
    review_text,
    trading_experience,
    status: 'pending',
    verified: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS })
  return NextResponse.json({ success: true, message: 'Review submitted for moderation. It will appear within 24 hours.' }, { headers: CORS })
}
