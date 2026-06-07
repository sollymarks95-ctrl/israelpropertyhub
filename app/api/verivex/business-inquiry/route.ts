import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||'') }

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { company, website, contact_name, email, phone, message, plan } = body

  if (!company || !contact_name || !email)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  // Save to DB
  const { error } = await getDb().from('business_inquiries').insert({
    company, website, contact_name, email, phone: phone||null, message: message||null, plan: plan||'starter', status: 'pending'
  })
  if (error) console.error('DB error:', error)

  // Send email notification via Resend
  const RESEND_KEY = process.env.RESEND_API_KEY
  if (RESEND_KEY) {
    // Email to admin
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'noreply@verivex.co',
        to: ['sollymarks95@gmail.com'],
        subject: `🏢 New Business Signup: ${company} (${plan})`,
        html: `<h2>New business signup on Verivex</h2>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Website:</strong> ${website||'N/A'}</p>
          <p><strong>Contact:</strong> ${contact_name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone||'N/A'}</p>
          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Message:</strong> ${message||'N/A'}</p>`
      })
    })

    // Confirmation to business
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'hello@verivex.co',
        to: [email],
        subject: `Welcome to Verivex Business — Your ${plan} request is confirmed`,
        html: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
          <div style="font-size:24px;font-weight:900;margin-bottom:4px">VERI<span style="color:#00B67A">VEX</span></div>
          <div style="font-size:12px;color:#94A3B8;margin-bottom:28px">Trust Intelligence · verivex.co</div>
          <h1 style="font-size:22px;font-weight:800;margin-bottom:12px">Hi ${contact_name},</h1>
          <p style="font-size:14px;color:#475569;margin-bottom:16px">Thanks for signing up for Verivex Business! We've received your <strong>${plan}</strong> plan request for <strong>${company}</strong>.</p>
          <p style="font-size:14px;color:#475569;margin-bottom:24px">Our team will contact you at this email within <strong>24 hours</strong> to verify your company and activate your account.</p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:18px;margin-bottom:24px">
            <div style="font-weight:700;margin-bottom:8px">What happens next:</div>
            <div style="font-size:13px;color:#166534">✓ Account verification (24h)<br/>✓ Profile activation<br/>✓ Verified badge on your listing<br/>✓ Review dashboard access</div>
          </div>
          <p style="font-size:12px;color:#94A3B8">Questions? Reply to this email or contact hello@verivex.co</p>
        </div>`
      })
    })
  }

  return NextResponse.json({ success: true })
}
