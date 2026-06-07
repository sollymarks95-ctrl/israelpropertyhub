import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getDb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
const CORS = { 'Access-Control-Allow-Origin':'*' }

export async function OPTIONS() {
  return new Response(null, { status:204, headers:{ ...CORS,'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type' }})
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { company_name, company_slug, reviewer_name, reviewer_email, reviewer_location, rating, title, review_text, trading_experience } = body

  if (!reviewer_email || !reviewer_name || !rating || !title || !review_text || !company_slug)
    return NextResponse.json({ error:'Missing required fields' }, { status:400, headers:CORS })
  if (review_text.length < 50)
    return NextResponse.json({ error:'Review must be at least 50 characters' }, { status:400, headers:CORS })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewer_email))
    return NextResponse.json({ error:'Valid email required to verify your review' }, { status:400, headers:CORS })

  const reviewData = { company_name, company_slug, reviewer_name, reviewer_location, rating: parseInt(rating), title, review_text, trading_experience }

  const sb = getDb()
  const { data: tokenRow, error: tokenErr } = await getDb().from('verivex_review_tokens').insert({
    email: reviewer_email, review_data: reviewData,
  }).select('token').single()

  if (tokenErr || !tokenRow)
    return NextResponse.json({ error:'Failed to process submission' }, { status:500, headers:CORS })

  const verifyUrl = `https://verivex.co/api/reviews/verify?token=${tokenRow.token}`

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (RESEND_KEY) {
    await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'reviews@verivex.co',
        to: [reviewer_email],
        subject: `Verify your ${company_name} review on Verivex`,
        html: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
          <div style="font-size:24px;font-weight:900;color:#191919;margin-bottom:4px">VERI<span style="color:#00B67A">VEX</span></div>
          <div style="font-size:12px;color:#94A3B8;margin-bottom:28px">Trust Intelligence · verivex.co</div>
          <h1 style="font-size:22px;font-weight:800;color:#191919;margin-bottom:12px">Verify your ${company_name} review</h1>
          <div style="background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;padding:18px;margin-bottom:24px">
            <div style="font-size:22px;color:#00B67A;margin-bottom:6px">${'★'.repeat(parseInt(rating))}${'☆'.repeat(5-parseInt(rating))}</div>
            <div style="font-weight:700;font-size:16px;margin-bottom:6px">${title}</div>
            <div style="font-size:13px;color:#64748B">${review_text.substring(0,200)}${review_text.length>200?'...':''}</div>
          </div>
          <p style="font-size:14px;color:#475569;margin-bottom:24px">Click below to verify your email and submit your review for publication. Link expires in 24 hours.</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#00B67A;color:#fff;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;margin-bottom:24px">✅ Verify & Submit Review</a>
          <p style="font-size:12px;color:#94A3B8">If you didn't write this review, ignore this email.</p>
        </div>`
      })
    })
  }

  return NextResponse.json({
    success: true,
    message: `Verification email sent to ${reviewer_email}. Click the link to publish your review.`,
  }, { headers:CORS })
}
