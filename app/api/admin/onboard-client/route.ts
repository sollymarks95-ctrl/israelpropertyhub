import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ALL_PORTALS = [
  { name:'Nexwire', slug:'global-trade-wire', color:'#c0392b' },
  { name:'Finvex', slug:'finance-terminal', color:'#1a73e8' },
  { name:'AurexHQ', slug:'gold-markets-today', color:'#d4a017' },
  { name:'Bizplex', slug:'business-pulse', color:'#7c3aed' },
  { name:'Verivex', slug:'trust-score', color:'#059669' },
  { name:'Bizpedia', slug:'company-pedia', color:'#0369a1' },
  { name:'PresxWire', slug:'press-central', color:'#dc2626' },
  { name:'InvexHub', slug:'invest-data', color:'#0f766e' },
  { name:'Tradvex', slug:'trade-board', color:'#ea580c' },
  { name:'Certivade', slug:'global-trade-assoc', color:'#1d4ed8' },
  { name:'Execvex', slug:'executive-network', color:'#4f46e5' },
  { name:'Signalix', slug:'market-radar', color:'#b91c1c' },
]

export async function POST(req: NextRequest) {
  try {
    const { companyName, websiteUrl, regulation, tier, primaryColor, ceoName, ceoRole, analysts, accountManager, keywords, negativeUrls, brandVoice, monthlyBudget } = await req.json()
    if (!companyName) return NextResponse.json({ error: 'Company name required' }, { status: 400 })

    const brandSlug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const portals = tier === 'starter' ? ALL_PORTALS.slice(0, 5) : ALL_PORTALS

    const { data: client, error } = await supabase.from('portal_clients').insert({
      company_name: companyName, brand_slug: brandSlug,
      website_url: websiteUrl, regulation,
      tier: tier || 'pro', primary_color: primaryColor || '#0EA5E9',
      account_manager: accountManager || 'RepHuby Team',
      brand_score: 30, is_active: true,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const clientId = client.id

    // Assign portals
    await supabase.from('portal_site_coverage').insert(
      portals.map(p => ({ client_id: clientId, site_name: p.name, site_slug: p.slug, primary_color: p.color, is_active: true, articles_published: 0 }))
    )

    // Create keywords — auto-generate if not provided
    const kwList = keywords?.length ? keywords : [
      `${companyName.toLowerCase()} review`,
      `${companyName.toLowerCase()} scam`,
      `${companyName.toLowerCase()} legit`,
      `${companyName.toLowerCase()} regulated`,
      `${companyName.toLowerCase()} withdrawal`,
      `${companyName.toLowerCase()} ${(regulation || 'broker').split('/')[0].trim().toLowerCase()}`,
      `is ${companyName.toLowerCase()} safe`,
      `${companyName.toLowerCase()} complaints`,
    ]

    await supabase.from('portal_rankings').insert(
      kwList.map((kw: string) => ({ client_id: clientId, keyword: kw.trim(), current_position: 0, previous_position: 0, best_position: 100 }))
    )

    // Save intake
    await supabase.from('client_intake').insert({
      client_id: clientId, broker_keywords: kwList,
      negative_urls: negativeUrls || [], ceo_name: ceoName,
      regulatory_info: regulation, brand_voice: brandVoice || 'professional',
      monthly_articles: tier === 'starter' ? 60 : 140,
      portals_assigned: portals.map(p => p.name),
    })

    // Welcome activity
    await supabase.from('portal_activity').insert({
      client_id: clientId, type: 'portal_activated',
      title: `✅ ${companyName} onboarded to RepHuby`,
      description: `${portals.length} portals activated · ${kwList.length} keywords tracked · ${tier?.toUpperCase()} plan`,
    })

    return NextResponse.json({ success: true, clientId, client, portalsAssigned: portals.length, keywordsAdded: kwList.length, keywords: kwList })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
