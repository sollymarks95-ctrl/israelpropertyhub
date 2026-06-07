import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, count } = await supabase.from('newsletter_subscribers').select('*', { count: 'exact' }).order('subscribed_at', { ascending: false })
  const bySite: Record<string, number> = {}
  data?.forEach((s: any) => { bySite[s.site_name || 'RepHuby'] = (bySite[s.site_name || 'RepHuby'] || 0) + 1 })
  return NextResponse.json({ subscribers: data || [], total: count || 0, bySite })
}
