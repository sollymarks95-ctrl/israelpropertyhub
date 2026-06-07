import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 120

async function getSearchApiKey(): Promise<string> {
  // 1. Check env var first (fastest)
  if (process.env.SEARCHAPI_KEY) return process.env.SEARCHAPI_KEY
  if (process.env.SERPAPI_KEY) return process.env.SERPAPI_KEY
  // 2. Fall back to Supabase
  const { data } = await supabase
    .from('system_api_keys')
    .select('key_value')
    .in('key_name', ['SEARCHAPI_KEY', 'SERPAPI_KEY'])
    .eq('is_active', true)
    .order('key_name')
    .limit(1)
    .single()
  return data?.key_value || ''
}

async function checkRankWithSearchApi(keyword: string, domain: string, apiKey: string): Promise<{ position: number; url: string } | null> {
  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: keyword,
      api_key: apiKey,
      num: '100',
      gl: 'us',
      hl: 'en',
    })

    const res = await fetch(`https://www.searchapi.io/api/v1/search?${params}`, {
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) {
      console.error('SearchAPI error:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const results = data.organic_results || []

    for (let i = 0; i < results.length; i++) {
      const r = results[i]
      const url: string = r.link || r.url || ''
      if (url.includes(domain) || (r.displayed_link || '').includes(domain)) {
        return { position: i + 1, url }
      }
    }
    return null
  } catch (e) {
    console.error('SearchAPI fetch error:', e)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, keyword, domain } = await req.json()

    const apiKey = await getSearchApiKey()
    if (!apiKey) {
      return NextResponse.json({ error: 'SearchAPI key not configured' }, { status: 400 })
    }

    // Get client domains if not provided
    let searchDomain = domain
    if (!searchDomain && clientId) {
      const { data: client } = await supabase
        .from('portal_clients')
        .select('website_url')
        .eq('id', clientId)
        .single()
      searchDomain = client?.website_url?.replace(/^https?:\/\/(www\.)?/, '') || ''
    }

    // Fallback: try to get domain from existing rankings for this client
    if (!searchDomain && clientId) {
      const { data: existingRank } = await supabase
        .from('portal_rankings')
        .select('target_url')
        .eq('client_id', clientId)
        .not('target_url', 'is', null)
        .limit(1)
        .single()
      if (existingRank?.target_url) {
        try { searchDomain = new URL(existingRank.target_url).hostname.replace('www.', '') } catch {}
      }
    }

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }
    if (!searchDomain) {
      return NextResponse.json({ error: 'No website found for this client — add a website URL in client settings' }, { status: 400 })
    }

    const result = await checkRankWithSearchApi(keyword, searchDomain, apiKey)

    // Update or insert ranking in DB
    if (clientId) {
      const { data: existing } = await supabase
        .from('portal_rankings')
        .select('id, current_position')
        .eq('client_id', clientId)
        .eq('keyword', keyword)
        .single()

      const prevPosition = existing?.current_position || null
      const newPosition = result?.position || 0

      if (existing) {
        await supabase.from('portal_rankings').update({
          current_position: newPosition,
          previous_position: prevPosition,
          ranking_url: result?.url || null,
          last_checked: new Date().toISOString(),
        }).eq('id', existing.id)
      } else {
        await supabase.from('portal_rankings').insert({
          client_id: clientId,
          keyword,
          current_position: newPosition,
          previous_position: null,
          ranking_url: result?.url || null,
          last_checked: new Date().toISOString(),
        })
      }

      // Log activity
      if (prevPosition && newPosition > 0 && newPosition < prevPosition) {
        await supabase.from('portal_activity').insert({
          client_id: clientId,
          type: 'rank_improved',
          description: `"${keyword}" improved from #${prevPosition} to #${newPosition}`,
        })
      }
    }

    await supabase
      .from('system_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_name', 'SEARCHAPI_KEY')

    // Get previous position for the UI
    const { data: prevData } = await supabase
      .from('portal_rankings')
      .select('previous_position')
      .eq('client_id', clientId)
      .eq('keyword', keyword)
      .single()

    return NextResponse.json({
      keyword,
      domain: searchDomain,
      position: result?.position || 0,
      previousPosition: prevData?.previous_position || null,
      url: result?.url || null,
      found: !!result,
      usedRealApi: true,
      credits_used: 1,
    })
  } catch (e: any) {
    console.error('check-rankings error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
