import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

// IndexNow key verification — served at /{key}.txt on every domain
// Required for Bing, Yandex, Naver to verify domain ownership
export async function GET(req: NextRequest, { params }: { params: Promise<{ indexnow: string }> }) {
  const { indexnow } = await params
  const KEY = process.env.INDEX_NOW_KEY || ''
  
  // Only serve for exact key match
  if (indexnow !== `${KEY}.txt` && indexnow !== KEY) {
    return new NextResponse('Not found', { status: 404 })
  }
  
  return new NextResponse(KEY, {
    status: 200,
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' }
  })
}
