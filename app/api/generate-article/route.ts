import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, site, category } = await req.json()

  const systemPrompt = `You are a professional journalist writing for ${site.name}, a BBC-style global business news publication. Write authoritative, factual, well-structured news articles. Return ONLY valid JSON with these fields: title, slug (URL-safe), excerpt (2 sentences), body (full article, 400-600 words with paragraph breaks using \\n\\n).`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Write a ${category} news article about: ${prompt}. Return only JSON, no markdown.`
      }]
    })
  })

  const data = await response.json()
  const text = data.content?.[0]?.text || '{}'

  try {
    const article = JSON.parse(text)
    return NextResponse.json({ article })
  } catch {
    return NextResponse.json({ error: 'Failed to parse article' }, { status: 500 })
  }
}
