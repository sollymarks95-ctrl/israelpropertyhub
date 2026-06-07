import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const keys = await req.json()
  const results: string[] = []
  for (const [name, value] of Object.entries(keys)) {
    if (value && typeof value === 'string') {
      await supabase.from('system_api_keys').upsert({ key_name: name, key_value: value, is_active: true, last_used_at: new Date().toISOString() }, { onConflict: 'key_name' })
      results.push(name)
    }
  }
  return NextResponse.json({ success: true, saved: results })
}

export async function GET() {
  const { data } = await supabase.from('system_api_keys').select('key_name, is_active, last_used_at')
  return NextResponse.json({ keys: data || [] })
}
