import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { review_text, rating, platform, company, sentiment } = await req.json()

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Write a professional, warm response to this ${rating}-star ${platform} review for ${company}.

Review: "${review_text}"
Sentiment: ${sentiment}

Rules:
- Keep it under 100 words
- Thank the reviewer by tone (not name unless provided)
- Address the main point of their review
- End with an invitation to connect if negative/neutral
- Sound human and genuine, not corporate
- Do not use generic phrases like "valued customer"

Return ONLY the response text, no preamble.`
      }]
    })
  })

  const data = await res.json()
  const response = data.content?.[0]?.text || 'Unable to generate response.'
  return NextResponse.json({ response })
}
