import { redirect } from 'next/navigation'
const SLUG_MAP: Record<string,string> = {
  'global-trade-wire': '/news/global-trade-wire',
  'finance-terminal': '/finance/finance-terminal',
  'gold-markets-today': '/commodities/gold-markets-today',
  'business-pulse': '/magazine/business-pulse',
  'trust-score': '/reviews-hub/trust-score',
  'company-pedia': '/wiki/company-pedia',
  'press-central': '/pressroom/press-central',
  'invest-data': '/investdb/invest-data',
  'trade-board': '/forum/trade-board',
  'global-trade-assoc': '/association/global-trade-assoc',
  'executive-network': '/executive/executive-network',
  'market-radar': '/market-radar/market-radar',
}
export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(SLUG_MAP[slug] || '/')
}
