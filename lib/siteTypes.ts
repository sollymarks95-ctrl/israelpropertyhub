export type SiteType = 
  | 'news'          // BBC/Reuters - already built
  | 'finance'       // Bloomberg dark terminal
  | 'magazine'      // Forbes bright
  | 'reviews'       // Trustpilot
  | 'markets'       // Live dashboard
  | 'wiki'          // Wikipedia minimal
  | 'pressroom'     // PR Newswire
  | 'investdb'      // Crunchbase
  | 'forum'         // Reddit style
  | 'executive'     // LinkedIn professional
  | 'association'   // Gov/official
  | 'commodities'   // CNBC/investing.com

export const SITE_TYPE_CONFIG: Record<SiteType, {
  label: string
  description: string
  colors: { primary: string; bg: string; surface: string; text: string; accent: string }
  font: { heading: string; body: string }
  liveData: string[]
}> = {
  news: {
    label: 'News Wire',
    description: 'BBC/Reuters breaking news style',
    colors: { primary: '#bb1919', bg: '#f2f2f2', surface: '#ffffff', text: '#1a1a1a', accent: '#cc0000' },
    font: { heading: 'Georgia, serif', body: 'Arial, sans-serif' },
    liveData: ['topnews'],
  },
  finance: {
    label: 'Finance Terminal',
    description: 'Bloomberg dark terminal style',
    colors: { primary: '#ff6600', bg: '#0a0a0a', surface: '#131313', text: '#ffffff', accent: '#00d4aa' },
    font: { heading: '"Courier New", monospace', body: '"Courier New", monospace' },
    liveData: ['markets', 'gold', 'forex'],
  },
  magazine: {
    label: 'Business Magazine',
    description: 'Forbes/Fortune bright magazine style',
    colors: { primary: '#c8102e', bg: '#ffffff', surface: '#f8f8f8', text: '#111111', accent: '#c8102e' },
    font: { heading: '"Playfair Display", Georgia, serif', body: '"Helvetica Neue", Arial, sans-serif' },
    liveData: ['topnews'],
  },
  reviews: {
    label: 'Review Platform',
    description: 'Trustpilot clean review site',
    colors: { primary: '#00b67a', bg: '#f9f9f9', surface: '#ffffff', text: '#191919', accent: '#00b67a' },
    font: { heading: '"Helvetica Neue", Arial, sans-serif', body: '"Helvetica Neue", Arial, sans-serif' },
    liveData: [],
  },
  markets: {
    label: 'Market Intelligence',
    description: 'Real-time dark dashboard',
    colors: { primary: '#00ff88', bg: '#050d14', surface: '#0d1f2d', text: '#e0e8f0', accent: '#00d4ff' },
    font: { heading: '"IBM Plex Mono", monospace', body: '"IBM Plex Sans", Arial, sans-serif' },
    liveData: ['markets', 'gold', 'silver', 'forex'],
  },
  wiki: {
    label: 'Company Wiki',
    description: 'Wikipedia-style encyclopedia',
    colors: { primary: '#3366cc', bg: '#f8f9fa', surface: '#ffffff', text: '#202122', accent: '#3366cc' },
    font: { heading: '"Linux Libertine", Georgia, serif', body: '"Helvetica Neue", Arial, sans-serif' },
    liveData: [],
  },
  pressroom: {
    label: 'Press Wire',
    description: 'PR Newswire official style',
    colors: { primary: '#003087', bg: '#ffffff', surface: '#f5f5f5', text: '#000000', accent: '#003087' },
    font: { heading: '"Times New Roman", serif', body: 'Arial, sans-serif' },
    liveData: ['topnews'],
  },
  investdb: {
    label: 'Investment DB',
    description: 'Crunchbase company database',
    colors: { primary: '#146aff', bg: '#f5f5f7', surface: '#ffffff', text: '#1d1d1f', accent: '#146aff' },
    font: { heading: '"SF Pro Display", -apple-system, sans-serif', body: '"SF Pro Text", -apple-system, sans-serif' },
    liveData: ['markets'],
  },
  forum: {
    label: 'Trade Forum',
    description: 'Reddit-style community discussion',
    colors: { primary: '#ff4500', bg: '#dae0e6', surface: '#ffffff', text: '#1c1c1c', accent: '#0079d3' },
    font: { heading: 'Verdana, sans-serif', body: 'Verdana, sans-serif' },
    liveData: ['topnews'],
  },
  executive: {
    label: 'Executive Hub',
    description: 'LinkedIn professional style',
    colors: { primary: '#0a66c2', bg: '#f3f2ef', surface: '#ffffff', text: '#000000', accent: '#0a66c2' },
    font: { heading: '"Source Sans Pro", Arial, sans-serif', body: '"Source Sans Pro", Arial, sans-serif' },
    liveData: [],
  },
  association: {
    label: 'Industry Association',
    description: 'Official certified member directory',
    colors: { primary: '#1a3c6e', bg: '#f0f4f8', surface: '#ffffff', text: '#1a1a2e', accent: '#c5952a' },
    font: { heading: '"Merriweather", Georgia, serif', body: '"Open Sans", Arial, sans-serif' },
    liveData: [],
  },
  commodities: {
    label: 'Commodities Portal',
    description: 'CNBC/Investing.com live markets',
    colors: { primary: '#e31837', bg: '#f0f4f8', surface: '#ffffff', text: '#0a0a0a', accent: '#006fba' },
    font: { heading: '"Roboto Condensed", Arial, sans-serif', body: '"Roboto", Arial, sans-serif' },
    liveData: ['gold', 'silver', 'forex', 'markets'],
  },
}
