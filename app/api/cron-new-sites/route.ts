import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

// Runs all 5 batches for ExecVex + CryptoXos daily at 08:00 UTC
// Piggybacked onto 1 cron slot since we're at Pro plan limit (40 jobs)
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const BASE = 'https://rephuby.com'
  const results: any[] = []

  const sites = ['executive-network', 'crypto-hub']
  const batches = [0, 1, 2, 3, 4]

  for (const batch of batches) {
    for (const site of sites) {
      try {
        const url = `${BASE}/api/cron-site?secret=${secret}&site=${site}&batch=${batch}`
        const r = await fetch(url, { signal: AbortSignal.timeout(55000) })
        const d = await r.json()
        results.push({ site, batch, ...d })
        await new Promise(res => setTimeout(res, 1000))
      } catch (e: any) {
        results.push({ site, batch, error: e.message })
      }
    }
  }

  const total = results.reduce((s: number, r: any) => s + (r.inserted || 0), 0)
  return NextResponse.json({ ok: true, total, results })
}
