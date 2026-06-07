'use client'

// Domain-mapped logo configs — each portal has a unique visual identity
export const PORTAL_LOGOS: Record<string, {
  wordmark: string     // How the name renders (may differ from DB name)
  domain: string
  color: string
  accent: string       // second color for gradient/accent
  icon: string         // emoji icon
  tagStyle: 'slash' | 'dot' | 'wire' | 'dash' | 'xx' | 'plain'
}> = {
  'global-trade-wire': {
    wordmark: 'NEX-WIRE', domain: 'nex-wire.com',
    color: '#E03131', accent: '#FF6B6B',
    icon: '📡', tagStyle: 'wire',
  },
  'finance-terminal': {
    wordmark: 'FINVEXX', domain: 'finvexx.com',
    color: '#1971C2', accent: '#74C0FC',
    icon: '📈', tagStyle: 'xx',
  },
  'gold-markets-today': {
    wordmark: 'AUREXHQ', domain: 'aurexhq.com',
    color: '#B08700', accent: '#FFD43B',
    icon: '🥇', tagStyle: 'dot',
  },
  'business-pulse': {
    wordmark: 'BIZPLEZX', domain: 'bizplezx.com',
    color: '#6741D9', accent: '#B197FC',
    icon: '💼', tagStyle: 'xx',
  },
  'trust-score': {
    wordmark: 'VERIVEX', domain: 'verivex.co',
    color: '#0CA678', accent: '#63E6BE',
    icon: '✅', tagStyle: 'dot',
  },
  'company-pedia': {
    wordmark: 'BIZPEDIA', domain: 'bizpedia.com',
    color: '#1864AB', accent: '#74C0FC',
    icon: '📖', tagStyle: 'plain',
  },
  'press-central': {
    wordmark: 'PRESXWIRE', domain: 'presxwire.com',
    color: '#C92A2A', accent: '#FF8787',
    icon: '📢', tagStyle: 'wire',
  },
  'invest-data': {
    wordmark: 'INVEXHUB', domain: 'invexhub.com',
    color: '#0B6E4F', accent: '#63E6BE',
    icon: '💹', tagStyle: 'plain',
  },
  'trade-board': {
    wordmark: 'TRADVEX', domain: 'tradvex.com',
    color: '#D9480F', accent: '#FFA94D',
    icon: '🔄', tagStyle: 'plain',
  },
  'global-trade-assoc': {
    wordmark: 'CERTIVADE', domain: 'certivade.com',
    color: '#1864AB', accent: '#A5D8FF',
    icon: '🏛', tagStyle: 'slash',
  },
  'executive-network': {
    wordmark: 'EXECVEX', domain: 'execvex.com',
    color: '#3B5BDB', accent: '#BAC8FF',
    icon: '👔', tagStyle: 'plain',
  },
  'market-radar': {
    wordmark: 'SIGNALIX', domain: 'signalix.com',
    color: '#A61E4D', accent: '#F783AC',
    icon: '📡', tagStyle: 'slash',
  },
}

interface PortalLogoProps {
  slug: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'icon-only' | 'wordmark' | 'full' | 'badge'
  theme?: 'light' | 'dark'
  showDomain?: boolean
}

const SIZES = {
  xs:  { box: 28, font: 9,  gap: 6,  iconSize: 14, domainFont: 8  },
  sm:  { box: 36, font: 11, gap: 8,  iconSize: 18, domainFont: 9  },
  md:  { box: 44, font: 14, gap: 10, iconSize: 22, domainFont: 10 },
  lg:  { box: 56, font: 18, gap: 12, iconSize: 28, domainFont: 11 },
  xl:  { box: 72, font: 22, gap: 14, iconSize: 36, domainFont: 13 },
}

export function PortalLogo({ slug, size = 'md', variant = 'full', theme = 'dark', showDomain = false }: PortalLogoProps) {
  const cfg = PORTAL_LOGOS[slug]
  if (!cfg) return null

  const s = SIZES[size]
  const isDark = theme === 'dark'

  // Icon-only: colored square with styled abbreviation
  const IconBox = () => (
    <div style={{
      width: s.box, height: s.box, borderRadius: s.box * 0.22,
      background: `linear-gradient(135deg, ${cfg.color}, ${cfg.accent}22)`,
      border: `1.5px solid ${cfg.color}60`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle gloss */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'50%', background:'rgba(255,255,255,0.08)', borderRadius: `${s.box * 0.22}px ${s.box * 0.22}px 50% 50%` }} />
      <WordmarkAbbr />
    </div>
  )

  // Abbreviation inside the icon box
  const WordmarkAbbr = () => {
    const word = cfg.wordmark
    // Take first 2-3 chars smartly
    const abbr = word.includes('-')
      ? word.split('-').map(p => p[0]).join('')            // NEX-WIRE → NW
      : word.length <= 4 ? word                           // AUREX → AX, short names stay
      : word.slice(0, 2)                                  // FINVEXX → FI
    return (
      <span style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 900,
        fontSize: s.font * 0.95, color: '#fff',
        letterSpacing: '-0.03em', lineHeight: 1, position: 'relative', zIndex: 1,
        textShadow: `0 1px 4px ${cfg.color}80`,
      }}>{abbr}</span>
    )
  }

  // Styled wordmark text
  const Wordmark = () => {
    const word = cfg.wordmark
    const textColor = isDark ? '#F1F5F9' : '#111827'

    // Split on special chars for styling
    let parts: JSX.Element
    if (cfg.tagStyle === 'wire' && word.includes('-')) {
      const [a, b] = word.split('-')
      parts = <>
        <span style={{ color: textColor }}>{a}</span>
        <span style={{ color: cfg.color, fontWeight: 900 }}>-</span>
        <span style={{ color: cfg.accent || cfg.color }}>{b}</span>
      </>
    } else if (cfg.tagStyle === 'xx') {
      // FINVEXX — style the XX
      const base = word.slice(0, -2)
      const xx = word.slice(-2)
      parts = <>
        <span style={{ color: textColor }}>{base}</span>
        <span style={{ color: cfg.color }}>{xx}</span>
      </>
    } else if (cfg.tagStyle === 'dot') {
      // First 4 chars, then dot, then rest
      const mid = Math.floor(word.length / 2)
      parts = <>
        <span style={{ color: textColor }}>{word.slice(0, mid)}</span>
        <span style={{ color: cfg.color, fontSize: '0.7em', verticalAlign: 'middle', margin:'0 1px' }}>·</span>
        <span style={{ color: cfg.accent || cfg.color }}>{word.slice(mid)}</span>
      </>
    } else if (cfg.tagStyle === 'slash') {
      const mid = Math.ceil(word.length * 0.55)
      parts = <>
        <span style={{ color: textColor }}>{word.slice(0, mid)}</span>
        <span style={{ color: cfg.color }}>{word.slice(mid)}</span>
      </>
    } else {
      // plain — color split at midpoint
      const mid = Math.ceil(word.length * 0.5)
      parts = <>
        <span style={{ color: textColor }}>{word.slice(0, mid)}</span>
        <span style={{ color: cfg.color }}>{word.slice(mid)}</span>
      </>
    }

    return (
      <span style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 900,
        fontSize: s.font * 1.1, letterSpacing: '-0.03em',
        lineHeight: 1, whiteSpace: 'nowrap',
      }}>{parts}</span>
    )
  }

  if (variant === 'icon-only') return <IconBox />

  if (variant === 'badge') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap: s.gap * 0.6, padding:`${s.gap * 0.3}px ${s.gap * 0.7}px`, background:`${cfg.color}15`, border:`1px solid ${cfg.color}40`, borderRadius: 100 }}>
        <span style={{ fontSize: s.iconSize * 0.55 }}>{cfg.icon}</span>
        <Wordmark />
      </div>
    )
  }

  if (variant === 'wordmark') {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap: 2 }}>
        <Wordmark />
        {showDomain && <span style={{ fontSize: s.domainFont, color: isDark ? '#475569' : '#9CA3AF', letterSpacing:'.04em' }}>{cfg.domain}</span>}
      </div>
    )
  }

  // Full: icon + wordmark
  return (
    <div style={{ display:'flex', alignItems:'center', gap: s.gap }}>
      <IconBox />
      <div style={{ display:'flex', flexDirection:'column', gap: 2 }}>
        <Wordmark />
        {showDomain && <span style={{ fontSize: s.domainFont, color: isDark ? '#475569' : '#9CA3AF', letterSpacing:'.04em' }}>{cfg.domain}</span>}
      </div>
    </div>
  )
}

// Standalone for ticker usage (compact)
export function PortalTickerLogo({ slug, color }: { slug: string; color: string }) {
  const cfg = PORTAL_LOGOS[slug]
  const word = cfg?.wordmark || slug.toUpperCase()
  const textColor = cfg ? cfg.color : color

  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap: 10, padding:'8px 20px', flexShrink: 0, textDecoration:'none' }}>
      {/* Icon */}
      <div style={{ width: 34, height: 34, borderRadius: 8, background:`${textColor}25`, border:`1.5px solid ${textColor}50`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:11, color:textColor, letterSpacing:'-0.02em' }}>
          {word.includes('-') ? word.split('-').map((p:string) => p[0]).join('') : word.slice(0,2)}
        </span>
      </div>
      {/* Wordmark */}
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:900, fontSize:14, letterSpacing:'-0.02em', whiteSpace:'nowrap' }}>
          {cfg ? renderWordmark(cfg.wordmark, cfg.tagStyle, cfg.color, cfg.accent) : word}
        </div>
        {cfg?.domain && <div style={{ fontSize:10, color:'#475569', marginTop:1 }}>{cfg.domain}</div>}
      </div>
    </div>
  )
}

function renderWordmark(word: string, style: string, color: string, accent: string) {
  if (style === 'wire' && word.includes('-')) {
    const [a, b] = word.split('-')
    return <><span style={{color:'#F1F5F9'}}>{a}</span><span style={{color}}>-</span><span style={{color:accent||color}}>{b}</span></>
  }
  if (style === 'xx') {
    return <><span style={{color:'#F1F5F9'}}>{word.slice(0,-2)}</span><span style={{color}}>{word.slice(-2)}</span></>
  }
  const mid = Math.floor(word.length / 2)
  return <><span style={{color:'#F1F5F9'}}>{word.slice(0,mid)}</span><span style={{color}}>{word.slice(mid)}</span></>
}
