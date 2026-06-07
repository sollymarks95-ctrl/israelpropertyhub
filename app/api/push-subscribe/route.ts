import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, email, siteSlug, siteName } = await req.json()
    const db = getDb()
    const results: Record<string, any> = {}

    // 1. Save push subscription if provided
    if (subscription?.endpoint) {
      const { error: pushErr } = await db.from('push_subscriptions').upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh || '',
        auth: subscription.keys?.auth || '',
        site_slug: siteSlug || 'unknown',
        site_name: siteName || siteSlug,
      }, { onConflict: 'endpoint' })
      results.push = pushErr ? 'error' : 'saved'
    }

    // 2. Save email newsletter subscription if provided
    if (email && email.includes('@')) {
      const { error: emailErr } = await db.from('newsletter_subscribers').upsert({
        email: email.toLowerCase().trim(),
        site_id: siteSlug,
        site_name: siteName,
        status: 'active',
      }, { onConflict: 'email,site_id' })
      results.email = emailErr ? 'error' : 'saved'
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
