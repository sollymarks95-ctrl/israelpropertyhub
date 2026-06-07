import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { company, industry, country, type, platform, brief } = await req.json()

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Write a ${type.replace('_', ' ')} for ${company}, a company in the ${industry || 'business'} industry based in ${country || 'globally'}.
${platform ? `This will be published on: ${platform}` : ''}
${brief ? `Brief/topic: ${brief}` : ''}

Return ONLY valid JSON in this exact format, no markdown:
{"title":"...", "body":"...", "seo_title":"...", "seo_description":"..."}`
      }]
    })
  })

  const data = await res.json()
  const text = data.content?.[0]?.text || '{}'
  try {
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ title: 'Generated Content', body: text, seo_title: '', seo_description: '' })
  }
}
