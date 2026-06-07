export const SITE_PODCAST_CONFIG: Record<string, {showName:string;hostName:string;hostRole:string;hostVoiceId:string;accentColor:string;bgColor:string;domain:string;tagline:string}> = {
  'global-trade-wire': { showName:'Nex-Wire Intelligence', hostName:'James Hart', hostRole:'Senior Markets Editor, Nex-Wire', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#E03131', bgColor:'#0D0505', domain:'nex-wire.com', tagline:'Global Trade & Market Intelligence' },
  'finance-terminal':  { showName:'Finvexx Markets', hostName:'Marcus Webb', hostRole:'Chief Markets Analyst, Finvexx', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#1565C0', bgColor:'#020C1A', domain:'finvexx.com', tagline:'Financial Markets & Investment Intelligence' },
  'business-pulse':    { showName:'Bizplezx Executive', hostName:'Daniel Sterling', hostRole:'Editorial Director, Bizplezx', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#6741D9', bgColor:'#07031A', domain:'bizplezx.com', tagline:'Business Strategy & Innovation Intelligence' },
  'gold-markets-today':{ showName:'AurexHQ Commodities', hostName:'Richard Stone', hostRole:'Head of Commodities Research', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#B08700', bgColor:'#0D0A01', domain:'aurexhq.com', tagline:'Precious Metals & Commodities Intelligence' },
  'market-radar':      { showName:'Signalixx Radar', hostName:'Jordan Blake', hostRole:'Lead Signals Analyst, Signalix', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#A61E4D', bgColor:'#0D0106', domain:'signalixx.com', tagline:'Market Signals & Technical Analysis' },
  'invest-data':       { showName:'InvexHuby Insights', hostName:'Michael Torres', hostRole:'Chief Investment Strategist', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#0B6E4F', bgColor:'#011009', domain:'invexhuby.com', tagline:'Investment Intelligence & Fund Analysis' },
  'trust-score':       { showName:'Verivex Verified', hostName:'Nathan Chen', hostRole:'Head of Research, Verivex', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#0CA678', bgColor:'#011209', domain:'verivex.co', tagline:'Verified Reviews & Broker Intelligence' },
  'executive-network': { showName:'Execvex Leadership', hostName:'Alexander Ross', hostRole:'Executive Editor, Execvex', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#3B5BDB', bgColor:'#02031A', domain:'execvex.com', tagline:'Executive Leadership & Career Intelligence' },
  'crypto-hub':        { showName:'CryptoXos Intelligence', hostName:'Alex Rivera', hostRole:'Crypto Markets Analyst, CryptoXos', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#F97316', bgColor:'#0D0500', domain:'cryptoxos.com', tagline:'Crypto Markets & Digital Asset Intelligence' },
}
export function getSiteConfig(slug: string) {
  return SITE_PODCAST_CONFIG[slug] || { showName:'RepHuby Intelligence', hostName:'James Richardson', hostRole:'Show Host', hostVoiceId:'5brWtFSh48YR4WFgv6SU', accentColor:'#0EA5E9', bgColor:'#0A0E17', domain:'rephuby.com', tagline:'Financial Market Intelligence' }
}
// Guest voice pool — 3 approved voices, never repeat same voice per portal
export const GUEST_VOICES = [
  { id:'5brWtFSh48YR4WFgv6SU', name:'Voice A' },
  { id:'syLxORVim00JlDnItZLs', name:'Voice B' },
  { id:'DXbpPpkz5tclPlaznu23', name:'Voice C' },
] as const

// Portal order index — used to stagger starting voice per portal
const PORTAL_ORDER: Record<string, number> = {
  'global-trade-wire':   0,
  'finance-terminal':    1,
  'business-pulse':      2,
  'gold-markets-today':  3,
  'trust-score':         4,
  'invest-data':         5,
  'market-radar':        6,
  'executive-network':   7,
  'crypto-hub':          8,
  'crypto-hub':          8,
}

/**
 * Returns the guest voice for a given portal + episode.
 * Rule: never use the same voice twice within the same portal.
 * Each portal starts at a different offset, rotating through all 3 voices.
 *
 * Example (3 voices A/B/C):
 *   global-trade-wire  ep1→A  ep2→B  ep3→C
 *   finance-terminal   ep1→B  ep2→C  ep3→A
 *   business-pulse     ep1→C  ep2→A  ep3→B
 *   ... (cycles through portals)
 */
export function pickPortalGuestVoice(siteSlug: string, episodeNumber: number = 1) {
  const portalIdx = PORTAL_ORDER[siteSlug] ?? 0
  const voiceIdx = (portalIdx + (episodeNumber - 1)) % GUEST_VOICES.length
  return GUEST_VOICES[voiceIdx]
}

// Legacy shim — kept for backward compat
export function pickGuestVoice(guestName: string, _gender?: string) {
  let h = 0
  for (let i = 0; i < guestName.length; i++) h = (h * 31 + guestName.charCodeAt(i)) & 0x7fffffff
  return GUEST_VOICES[h % GUEST_VOICES.length]
}
