import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getDb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/reviews/verified?status=invalid', req.url))

  const sb = getDb()
  const { data } = await getDb().from('verivex_review_tokens')
    .select('*').eq('token', token).eq('used', false)
    .gt('expires_at', new Date().toISOString()).single()

  if (!data) return NextResponse.redirect(new URL('/reviews/verified?status=expired', req.url))

  await getDb().from('verivex_review_tokens').update({ used:true }).eq('id', data.id)

  const review = data.review_data as any
  await getDb().from('verivex_reviews').insert({
    ...review, reviewer_email: data.email,
    verified_email: true, status:'pending', verified:true,
    created_at: new Date().toISOString(),
  })

  return NextResponse.redirect(new URL(`/reviews/verified?status=success&company=${review.company_slug||'etoro'}`, req.url))
}
