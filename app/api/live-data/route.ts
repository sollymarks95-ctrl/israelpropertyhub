import { NextRequest, NextResponse } from 'next/server'

const ALPHA_VANTAGE = process.env.ALPHA_VANTAGE_KEY!
const NEWSAPI = process.env.NEWSAPI_KEY!

// In-memory cache — 15 min for markets, 10 min for news
const cache = new Map<string, { data: unknown; ts: number }>()

function getCache(key: string, ttl: number) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < ttl) return hit.data
  return null
}
function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() })
  return data
}

async function fetchAV(params: string) {
  const res = await fetch(`https://www.alphavantage.co/query?${params}&apikey=${ALPHA_VANTAGE}`)
  return res.json()
}

async function getGold() {
  const c = getCache('gold', 900_000)
  if (c) return c
  const d = await fetchAV('function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD')
  const r = d['Realtime Currency Exchange Rate']
  return setCache('gold', {
    price: parseFloat(r?.['5. Exchange Rate'] || '2345'),
    change: parseFloat(r?.['9. Change'] || '0'),
    changePct: parseFloat(r?.['10. Change Percent']?.replace('%', '') || '0'),
    updated: r?.['6. Last Refreshed'] || new Date().toISOString(),
  })
}

async function getSilver() {
  const c = getCache('silver', 900_000)
  if (c) return c
  const d = await fetchAV('function=CURRENCY_EXCHANGE_RATE&from_currency=XAG&to_currency=USD')
  const r = d['Realtime Currency Exchange Rate']
  return setCache('silver', {
    price: parseFloat(r?.['5. Exchange Rate'] || '29.4'),
    changePct: parseFloat(r?.['10. Change Percent']?.replace('%', '') || '0'),
  })
}

async function getForex() {
  const c = getCache('forex', 900_000)
  if (c) return c
  const pairs = [['EUR', 'USD'], ['GBP', 'USD'], ['USD', 'JPY'], ['USD', 'ILS']]
  const results = await Promise.allSettled(pairs.map(async ([from, to]) => {
    const d = await fetchAV(`function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}`)
    const r = d['Realtime Currency Exchange Rate']
    return { pair: `${from}/${to}`, rate: parseFloat(r?.['5. Exchange Rate'] || '1'), change: parseFloat(r?.['9. Change'] || '0') }
  }))
  const data = results.map((r, i) => r.status === 'fulfilled' ? r.value : { pair: `${pairs[i][0]}/${pairs[i][1]}`, rate: 1, change: 0 })
  return setCache('forex', data)
}

async function getStock(symbol: string) {
  const c = getCache(`stock_${symbol}`, 900_000)
  if (c) return c
  const d = await fetchAV(`function=GLOBAL_QUOTE&symbol=${symbol}`)
  const q = d['Global Quote']
  return setCache(`stock_${symbol}`, {
    symbol,
    price: parseFloat(q?.['05. price'] || '0'),
    changePct: q?.['10. change percent']?.replace('%', '') || '0',
  })
}

// GNews — free tier, works in production (100 req/day)
async function getNews(query = '', category = 'business') {
  const cacheKey = `gnews_${query || category}`
  const c = getCache(cacheKey, 600_000)
  if (c) return c

  // Try GNews first (free, production-ready)
  try {
    const q = query || 'business finance trade'
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=12&apikey=${NEWSAPI}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.articles?.length) {
      const articles = data.articles.map((a: any) => ({
        title: a.title, description: a.description,
        url: a.url, urlToImage: a.image,
        publishedAt: a.publishedAt, source: { name: a.source?.name }
      }))
      return setCache(cacheKey, articles)
    }
  } catch {}

  // Fallback: Alpha Vantage News Sentiment
  try {
    const topic = query || 'finance'
    const d = await fetchAV(`function=NEWS_SENTIMENT&topics=${topic}&limit=12&sort=LATEST`)
    if (d.feed?.length) {
      const articles = d.feed.map((f: any) => ({
        title: f.title, description: f.summary?.slice(0, 200),
        url: f.url, urlToImage: f.banner_image,
        publishedAt: f.time_published, source: { name: f.source }
      }))
      return setCache(cacheKey, articles)
    }
  } catch {}

  // Last fallback: Claude-generated headlines
  return setCache(cacheKey, [])
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || 'gold'
  const q = req.nextUrl.searchParams.get('q') || ''

  try {
    switch (type) {
      case 'gold':    return NextResponse.json(await getGold())
      case 'silver':  return NextResponse.json(await getSilver())
      case 'forex':   return NextResponse.json(await getForex())
      case 'markets': {
        const [gold, silver, sp500, oil] = await Promise.all([getGold(), getSilver(), getStock('SPY'), getStock('USO')])
        const forex = await getForex()
        return NextResponse.json({ gold, silver, sp500, oil, forex })
      }
      case 'news':    return NextResponse.json(await getNews(q))
      case 'topnews': return NextResponse.json(await getNews('', 'business'))
      default:        return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
