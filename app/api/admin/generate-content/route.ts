import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { clientId, portalSlug, portalName, articleType, topic, ceoName, brokerName, regulation } = await req.json()
    if (!clientId || !topic || !brokerName) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const typePrompts: Record<string,string> = {
      analysis: `Write a professional 700-word financial market analysis article. Naturally reference ${brokerName} (${regulation} regulated broker) as a source of expert commentary. Include a quote from ${ceoName || 'their Chief Market Analyst'}. Topic: ${topic}. Professional journalism tone. No fluff.`,
      interview: `Write a 650-word interview featuring ${ceoName || 'the CEO'} of ${brokerName} (${regulation} regulated). Topic: ${topic}. Include 4-5 substantive Q&A exchanges. CEO should come across as knowledgeable and client-focused.`,
      review: `Write a 600-word authoritative review of ${brokerName} for a professional financial portal. Cover: regulation (${regulation}), trading conditions, platform, fees, client protection. Factual and credible. Positive but not promotional verdict.`,
      press_release: `Write a professional 500-word press release from ${brokerName} (${regulation}) about: ${topic}. Formal press release format. Include quote from ${ceoName || 'company spokesperson'}.`,
      research: `Write a 750-word research piece published under ${brokerName}'s research team. Topic: ${topic}. Data-driven, cite realistic market statistics. Position ${brokerName}'s analysts as credible experts.`,
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', max_tokens: 1500,
        system: 'You are a senior financial journalist writing for elite financial portals. Write substantive, credible content. Never use filler phrases or obvious promotional language.',
        messages: [{ role: 'user', content: typePrompts[articleType] || typePrompts.analysis }],
      }),
    })
    const data = await response.json()
    const generated = data.content?.[0]?.text || ''
    const lines = generated.split('\n').filter(Boolean)
    const title = lines[0].replace(/^#+\s*/, '').replace(/\*+/g, '').trim()
    const body = lines.slice(1).join('\n\n').trim()

    const { data: job } = await supabase.from('content_jobs').insert({
      client_id: clientId, portal_name: portalName, portal_slug: portalSlug,
      article_type: articleType, topic, generated_title: title,
      generated_body: body, status: 'review', word_count: body.split(' ').length,
    }).select().single()

    return NextResponse.json({ success: true, job, title, body, wordCount: body.split(' ').length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
