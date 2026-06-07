import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: videos } = await sb
    .from('podcast_videos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  return NextResponse.json({ videos: videos || [] })
}
