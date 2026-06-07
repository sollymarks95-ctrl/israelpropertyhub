import { NextResponse, NextRequest } from 'next/server'

const DOMAIN_MAP: Record<string, { route: string; slug: string }> = {
  'nex-wire.com':     { route:'news',        slug:'global-trade-wire'   },
  'www.nex-wire.com': { route:'news',        slug:'global-trade-wire'   },
  'finvexx.com':      { route:'finance',     slug:'finance-terminal'    },
  'www.finvexx.com':  { route:'finance',     slug:'finance-terminal'    },
  'bizplezx.com':     { route:'magazine',    slug:'business-pulse'      },
  'www.bizplezx.com': { route:'magazine',    slug:'business-pulse'      },
  'aurexhq.com':      { route:'commodities', slug:'gold-markets-today'  },
  'www.aurexhq.com':  { route:'commodities', slug:'gold-markets-today'  },
  'verivex.co':       { route:'reviews-hub', slug:'trust-score'         },
  'www.verivex.co':   { route: 'reviews-hub', slug: 'trust-score' },
  'invexhuby.com':    { route: 's', slug: 'invest-data' },
  'www.invexhuby.com':{ route: 's', slug: 'invest-data' },
  'signalixx.com':    { route: 's', slug: 'market-radar' },
  'www.signalixx.com':{ route: 's', slug: 'market-radar' },
  'execvex.com':      { route: 's', slug: 'executive-network' },
  'www.execvex.com':  { route: 's', slug: 'executive-network' },
  'cryptoxos.com':    { route: 's', slug: 'crypto-hub' },
  'www.cryptoxos.com':{ route: 's', slug: 'crypto-hub' },
  'bizpedia.com':     { route:'wiki',        slug:'company-pedia'       },
  'presxwire.com':    { route:'pressroom',   slug:'press-central'       },
  'invexhub.com':     { route:'investdb',    slug:'invest-data'         },
  'tradvex.com':      { route:'forum',       slug:'trade-board'         },
  'certivade.com':    { route:'association', slug:'global-trade-assoc'  },
  'signalix.com':     { route:'market-radar',slug:'market-radar'        },
}

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.replace(':443','').replace(':80','') || ''
  const pathname = request.nextUrl.pathname

  const portal = DOMAIN_MAP[host]
  if (!portal) {
    // Main app domain — serve normally (portal dashboard, login, etc.)
    const mainDomains = ['rephuby.com', 'www.rephuby.com', 'localhost', '127.0.0.1']
    if (mainDomains.some(d => host.includes(d)) || host.endsWith('.vercel.app')) {
      return NextResponse.next()
    }
    // Unknown domain → try universal DB-driven site renderer
    // Any domain added to news_sites table will work instantly
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone()
      url.pathname = '/s'
      return NextResponse.rewrite(url)
    }
    // /robots.txt for unknown domains
    if (pathname === '/robots.txt') {
      const url = request.nextUrl.clone()
      url.pathname = '/api/robots'
      return NextResponse.rewrite(url)
    }
    // /sitemap.xml for unknown domains  
    if (pathname === '/sitemap.xml') {
      const url = request.nextUrl.clone()
      url.pathname = '/api/sitemap'
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // Always pass through these paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/article/') ||
    pathname.startsWith('/faq/') ||
    pathname.startsWith('/reviews') ||  // includes /reviews (index) and /reviews/[company]
    pathname.startsWith('/search') ||
    pathname.startsWith('/legal') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/charts') ||
    pathname.startsWith('/podcasts') ||
    pathname.startsWith('/for-businesses') ||
    pathname === '/favicon.ico' || pathname === '/sw.js' ||
    pathname === '/robots.txt' || pathname === '/sitemap.xml' ||
    pathname === '/llms.txt' ||
    pathname.startsWith('/.well-known/') ||
    pathname.startsWith('/feed') ||
    pathname.endsWith('.txt') ||
    pathname.endsWith('.json')
  ) return NextResponse.next()

  // Robots.txt — serve dynamic per-domain file with AI crawler rules
  if (pathname === '/robots.txt') {
    const url = request.nextUrl.clone()
    url.pathname = '/api/robots'
    return NextResponse.rewrite(url)
  }

  // Sitemap — pass host as query param so API knows which site
  if (pathname === '/sitemap.xml' || pathname === '/sitemap') {
    const url = request.nextUrl.clone()
    url.pathname = '/api/sitemap'
    url.searchParams.set('host', host)
    return NextResponse.rewrite(url)
  }

  // Already on the internal route — don't rewrite again (prevents loop)
  // Loop prevention — already on internal route
  if (portal.route === 's') {
    if (pathname.startsWith('/s')) return NextResponse.next()
  } else {
    if (pathname.startsWith(`/${portal.route}/`)) return NextResponse.next()
  }

  // Rewrite root and sub-paths to internal portal route (REWRITE not REDIRECT)
  const url = request.nextUrl.clone()
  // For DynamicTemplate sites (route='s'), /s reads host header directly
  // Articles and real app routes should pass through unchanged
  // Only rewrite root and category pages to /s
  if (portal.route === 's') {
    // Pass through article pages, API routes, and other real routes
    if (pathname.startsWith('/article/') || pathname.startsWith('/api/') || 
        pathname.startsWith('/_next/') || pathname.startsWith('/favicon')) {
      return NextResponse.next()
    }
    // Rewrite root and all other paths to /s for DynamicTemplate rendering
    url.pathname = pathname === '/' || pathname === '' ? '/s' : '/s'
  } else {
    url.pathname = pathname === '/' || pathname === ''
      ? `/${portal.route}/${portal.slug}`
      : `/${portal.route}/${portal.slug}${pathname}`
  }

  const res = NextResponse.rewrite(url)
  // Tell the page it's on a custom domain — so Home links use "/" not "/${route}/${slug}"
  res.headers.set('x-custom-domain', 'true')
  res.headers.set('x-site-slug', portal.slug)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|map)).*)'],
}
