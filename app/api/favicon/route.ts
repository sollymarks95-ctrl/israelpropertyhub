import { NextRequest, NextResponse } from 'next/server'

const FAVICONS: Record<string, { svg: string; color: string }> = {
  'nex-wire.com':  { color:'#E03131', svg:'<text x="32" y="46" font-family="Arial Black" font-weight="900" font-size="38" fill="white" text-anchor="middle" letter-spacing="-2">N</text>' },
  'finvexx.com':   { color:'#1565C0', svg:'<text x="32" y="46" font-family="Arial Black" font-weight="900" font-size="30" fill="white" text-anchor="middle" letter-spacing="-1">FX</text>' },
  'bizplezx.com':  { color:'#6741D9', svg:'<text x="32" y="46" font-family="Arial Black" font-weight="900" font-size="38" fill="white" text-anchor="middle" letter-spacing="-2">B</text>' },
  'aurexhq.com':   { color:'#B08700', svg:'<text x="32" y="46" font-family="Arial Black" font-weight="900" font-size="28" fill="white" text-anchor="middle" letter-spacing="-1">AU</text>' },
  'verivex.co':    { color:'#00B67A', svg:'<text x="32" y="46" font-family="Arial Black" font-weight="900" font-size="30" fill="white" text-anchor="middle" letter-spacing="-1">VX</text>' },
  'rephuby.com':   { color:'#0EA5E9', svg:'<text x="32" y="46" font-family="Arial Black" font-weight="900" font-size="28" fill="white" text-anchor="middle" letter-spacing="-1">RH</text>' },
}

export async function GET(req: NextRequest) {
  const host = (req.headers.get('host') || '').replace(/:\d+$/, '').replace(/^www\./, '')
  const f = FAVICONS[host] || FAVICONS['rephuby.com']
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#fff" stop-opacity=".18"/>
    <stop offset="100%" stop-color="#000" stop-opacity=".12"/>
  </linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="${f.color}"/>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  ${f.svg}
</svg>`
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    }
  })
}
