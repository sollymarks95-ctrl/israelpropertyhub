'use client'
import dynamic from 'next/dynamic'

// Each portal mapped to its unique design template
const TEMPLATE_MAP: Record<string, string> = {
  'global-trade-wire':  'wire',       // Nex-Wire → BBC News style
  'press-central':      'wire',       // PresxWire → PR Newswire style
  'finance-terminal':   'terminal',   // Finvexx → Bloomberg Terminal style
  'invest-data':        'terminal',   // InvexHub → Morningstar style
  'market-radar':       'terminal',   // Signalix → TradingView style
  'business-pulse':     'magazine',   // Bizplezx → Forbes/Economist style
  'executive-network':  'magazine',   // Execvex → LinkedIn editorial style
  'gold-markets-today': 'data',       // AurexHQ → Reuters Commodities style
  'company-pedia':      'wiki',       // Bizpedia → Wikipedia/Crunchbase style
  'global-trade-assoc': 'data',       // Certivade → Government/regulatory style
  'trust-score':        'trust',      // Verivex → Trustpilot style
  'trade-board':        'community',  // Tradvex → Reddit/StockTwits style
}

const WireTemplate      = dynamic(() => import('./templates/WireTemplate'),      { ssr: false })
const TerminalTemplate  = dynamic(() => import('./templates/TerminalTemplate'),  { ssr: false })
const MagazineTemplate  = dynamic(() => import('./templates/MagazineTemplate'),  { ssr: false })
const DataTemplate      = dynamic(() => import('./templates/DataTemplate'),      { ssr: false })
const WikiTemplate      = dynamic(() => import('./templates/WikiTemplate'),      { ssr: false })
const TrustTemplate     = dynamic(() => import('./templates/TrustTemplate'),     { ssr: false })
const CommunityTemplate = dynamic(() => import('./templates/CommunityTemplate'), { ssr: false })

export default function SiteRenderer(props: any) {
  const template = TEMPLATE_MAP[props.siteSlug] || 'wire'
  switch (template) {
    case 'terminal':  return <TerminalTemplate  {...props} />
    case 'magazine':  return <MagazineTemplate  {...props} />
    case 'data':      return <DataTemplate      {...props} />
    case 'wiki':      return <WikiTemplate      {...props} />
    case 'trust':     return <TrustTemplate     {...props} />
    case 'community': return <CommunityTemplate {...props} />
    default:          return <WireTemplate      {...props} />
  }
}
