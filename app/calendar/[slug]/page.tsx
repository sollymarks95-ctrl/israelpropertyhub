import { redirect } from 'next/navigation'
const SLUG_MAP: Record<string,string> = {
  'global-trade-wire': '/news/global-trade-wire#calendar',
  'finance-terminal': '/finance/finance-terminal#calendar',
  'gold-markets-today': '/commodities/gold-markets-today#calendar',
  'business-pulse': '/magazine/business-pulse#calendar',
  'trust-score': '/reviews-hub/trust-score#calendar',
  'company-pedia': '/wiki/company-pedia#calendar',
  'press-central': '/pressroom/press-central#calendar',
  'invest-data': '/investdb/invest-data#calendar',
  'trade-board': '/forum/trade-board#calendar',
  'global-trade-assoc': '/association/global-trade-assoc#calendar',
  'executive-network': '/executive/executive-network#calendar',
  'market-radar': '/market-radar/market-radar#calendar',
}
export default async function CalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(SLUG_MAP[slug] || '/')
}
