import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

export async function POST(req: NextRequest) {
  try {
    const { email, siteId, siteName } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const cleanEmail = email.toLowerCase().trim()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const { error } = await getDb().from('newsletter_subscribers').upsert({
      email: cleanEmail, news_site_id: siteId || null, site_name: siteName || 'RepHuby',
      ip_address: ip, is_confirmed: true, subscribed_at: new Date().toISOString()
    }, { onConflict: 'email,news_site_id', ignoreDuplicates: true })
    if (error && !error.message.includes('duplicate')) {
      console.error('Newsletter error:', error)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Subscribed successfully!' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
