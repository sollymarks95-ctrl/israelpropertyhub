import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 86400 // Cache 24 hours

// Priority logo sources per domain — server-side fetch, no CORS
const LOGO_SOURCES: Record<string, string[]> = {
  'etoro.com': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Etoro_logo.svg/200px-Etoro_logo.svg.png',
    'https://www.etoro.com/wp-content/uploads/2018/05/etoro-logo-white-new-2019.png',
  ],
  'icmarkets.com': [
    'https://www.icmarkets.com/au/wp-content/uploads/2023/01/IC-Markets-Logo.png',
    'https://logo.clearbit.com/icmarkets.com',
  ],
  'pepperstone.com': [
    'https://pepperstone.com/assets/images/pepperstone-logo.svg',
    'https://logo.clearbit.com/pepperstone.com',
  ],
  'xm.com': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/XM_Group_logo.svg/200px-XM_Group_logo.svg.png',
    'https://logo.clearbit.com/xm.com',
  ],
  'ftmo.com': [
    'https://logo.clearbit.com/ftmo.com',
    'https://ftmo.com/wp-content/uploads/2021/01/logo-full.png',
  ],
  'binance.com': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Binance_Logo.svg/200px-Binance_Logo.svg.png',
    'https://logo.clearbit.com/binance.com',
  ],
  'coinbase.com': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Coinbase.svg/200px-Coinbase.svg.png',
    'https://logo.clearbit.com/coinbase.com',
  ],
  'interactivebrokers.com': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Interactive_Brokers_logo.svg/200px-Interactive_Brokers_logo.svg.png',
    'https://logo.clearbit.com/interactivebrokers.com',
  ],
  'plus500.com': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Plus500_logo.svg/200px-Plus500_logo.svg.png',
    'https://logo.clearbit.com/plus500.com',
  ],
  'myforexfunds.com': [
    'https://logo.clearbit.com/myforexfunds.com',
  ],
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> | { domain: string } }
) {
  const resolvedParams = typeof (params as any).then === 'function' ? await (params as Promise<{ domain: string }>) : params as { domain: string }
  const domain = resolvedParams.domain
  const sources = LOGO_SOURCES[domain] || [`https://logo.clearbit.com/${domain}`]

  for (const src of sources) {
    try {
      const res = await fetch(src, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Verivex/1.0)' },
        signal: AbortSignal.timeout(4000),
      })
      if (res.ok) {
        const blob = await res.blob()
        if (blob.size > 500) { // Must be a real image
          return new NextResponse(blob, {
            headers: {
              'Content-Type': res.headers.get('content-type') || 'image/png',
              'Cache-Control': 'public, max-age=86400',
              'Access-Control-Allow-Origin': '*',
            }
          })
        }
      }
    } catch {}
  }

  // Fallback: return a transparent 1x1 pixel
  return new NextResponse(null, { status: 404 })
}
