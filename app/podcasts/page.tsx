import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const db = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PORTALS: Record<string, { slug: string; name: string; show: string; color: string; tagline: string }> = {
  'nex-wire.com':   { slug:'global-trade-wire',  name:'Nex-Wire',   show:'Nex-Wire Intelligence', color:'#E03131', tagline:'Global Trade & Market Intelligence' },
  'finvexx.com':    { slug:'finance-terminal',   name:'Finvexx',    show:'Finvexx Markets',        color:'#1971C2', tagline:'Financial Markets & Investment Intelligence' },
  'bizplezx.com':   { slug:'business-pulse',     name:'Bizplezx',   show:'Bizplezx Executive',     color:'#6741D9', tagline:'Business Strategy & Leadership' },
  'aurexhq.com':    { slug:'gold-markets-today', name:'AurexHQ',    show:'AurexHQ Commodities',    color:'#B08700', tagline:'Precious Metals & Commodities Intelligence' },
  'verivex.co':     { slug:'trust-score',        name:'Verivex',    show:'Verivex Verified',       color:'#00B67A', tagline:'Verified Reviews & Broker Intelligence' },
  'invexhuby.com':  { slug:'invest-data',        name:'InvexHuby',  show:'InvexHuby Insights',     color:'#0EA5E9', tagline:'Investment Intelligence & Fund Analysis' },
  'signalixx.com':  { slug:'market-radar',       name:'Signalixx',  show:'Signalixx Radar',        color:'#7C3AED', tagline:'Market Signals & Technical Analysis' },
  'execvex.com':    { slug:'executive-network',  name:'ExecVex',    show:'ExecVex Leadership',     color:'#DC2626', tagline:'Executive Leadership & Career Intelligence' },
  'cryptoxos.com':  { slug:'crypto-hub',         name:'CryptoXos',  show:'CryptoXos Intelligence', color:'#F97316', tagline:'Crypto Markets & Digital Asset Intelligence' },
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const host = (h.get('host') || '').replace(/^www\./, '').split(':')[0]
  const p = PORTALS[host] || PORTALS['nex-wire.com']
  return {
    title: `${p.show} — Podcast`,
    description: `Expert interviews from ${p.show}. ${p.tagline}.`,
    robots: 'index, follow',
    alternates: { canonical: `https://${host}/podcasts` },
  }
}

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Professional SVG podcast cover — unique per portal
function PodcastCover({ color, name, size = 120 }: { color: string; name: string; size?: number }) {
  const light = color + '22'
  const mid   = color + '55'
  // Derive a unique pattern per portal name
  const seed = name.charCodeAt(0) + name.length
  const bars = [0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.6, 0.75, 0.45, 0.85, 0.55, 0.65].map((v, i) => ({
    h: v * 0.55 + (seed % (i + 3)) * 0.02,
    x: i * (size / 12),
  }))

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 14, flexShrink: 0, display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <defs>
        <linearGradient id={`g${name}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f1623" />
          <stop offset="100%" stopColor="#1a2035" />
        </linearGradient>
        <linearGradient id={`bar${name}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color + '66'} />
        </linearGradient>
      </defs>
      <rect width={size} height={size} fill={`url(#g${name})`} />

      {/* Subtle grid lines */}
      {[0.25, 0.5, 0.75].map((v, i) => (
        <line key={i} x1="0" y1={size * v} x2={size} y2={size * v} stroke={light} strokeWidth="0.5" />
      ))}
      {[0.25, 0.5, 0.75].map((v, i) => (
        <line key={i} x1={size * v} y1="0" x2={size * v} y2={size} stroke={light} strokeWidth="0.5" />
      ))}

      {/* Circular glow behind waveform */}
      <circle cx={size / 2} cy={size * 0.52} r={size * 0.28} fill={light} />
      <circle cx={size / 2} cy={size * 0.52} r={size * 0.16} fill={mid} />

      {/* Waveform bars */}
      {bars.map((bar, i) => {
        const bw = (size / 12) * 0.55
        const bh = bar.h * size * 0.44
        const by = size * 0.52 - bh / 2
        return (
          <rect key={i} x={bar.x + (size / 12) * 0.22} y={by} width={bw} height={bh}
            fill={`url(#bar${name})`} rx={bw / 2} opacity={0.9} />
        )
      })}

      {/* Dot in centre of glow */}
      <circle cx={size / 2} cy={size * 0.52} r={size * 0.05} fill={color} opacity={0.9} />

      {/* Portal name text at bottom */}
      <text x={size / 2} y={size - 8} textAnchor="middle" fill={color} fontSize={size * 0.085}
        fontFamily="'SF Pro Display','Helvetica Neue',Arial,sans-serif" fontWeight="800" letterSpacing="0.5">
        {name.toUpperCase()}
      </text>
    </svg>
  )
}

export default async function PodcastPage() {
  const h = await headers()
  const host = (h.get('host') || '').replace(/^www\./, '').split(':')[0]
  const p = PORTALS[host] || PORTALS['nex-wire.com']

  const { data: episodes } = await db()
    .from('podcast_scripts')
    .select('*')
    .eq('site_slug', p.slug)
    .eq('status', 'published')
    .order('episode_number')

  const eps = episodes || []

  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", background: '#fff', color: '#111827', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0 }
        a { text-decoration: none; color: inherit }
        body { background: #fff }
        .ep-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; transition: border-color .18s, box-shadow .18s }
        .ep-card:hover { border-color: ${p.color}44; box-shadow: 0 2px 20px ${p.color}10 }
        audio { accent-color: ${p.color}; width: 100%; height: 34px }
        @media(max-width:640px){
          .ep-card{padding:14px!important}
          .hero-inner{flex-direction:column!important}
          .pod-grid{grid-template-columns:1fr!important}
          .pod-hero{padding:48px 16px 24px!important}
          .pod-hero h1{font-size:22px!important;line-height:1.2!important}
          .pod-hero p{font-size:13px!important}
          .pod-nav{padding:10px 14px!important;flex-wrap:wrap!important;gap:6px!important}
          .pod-nav a{font-size:11px!important}
          .ep-card audio{width:100%!important;margin-top:10px!important}
          .ep-meta{flex-wrap:wrap!important;gap:6px!important;font-size:11px!important}
          .ep-cover{width:56px!important;height:56px!important;flex-shrink:0!important}
          .ep-card-inner{flex-direction:column!important;gap:12px!important}
          .ep-actions{flex-wrap:wrap!important;gap:6px!important}
          .ep-title{font-size:15px!important}
          .portal-filter{flex-wrap:wrap!important;gap:6px!important}
        }
        @media(max-width:400px){
          .pod-hero h1{font-size:18px!important}
          .ep-card{padding:12px 10px!important}
          .ep-cover{width:48px!important;height:48px!important}
        }
      `}</style>

      {/* Top nav */}
      <div style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <Link href="/" style={{ fontSize: 13, fontWeight: 700, color: p.color, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>←</span> {p.name}
          </Link>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '.12em', textTransform: 'uppercase' }}>Podcast</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ borderTop: `3px solid ${p.color}`, borderBottom: '1px solid #f3f4f6', background: '#fafafa', padding: '32px 24px' }}>
        <div className="hero-inner" style={{ maxWidth: 880, margin: '0 auto', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Professional SVG cover art */}
          <PodcastCover color={p.color} name={p.name} size={110} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: p.color, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>{p.name} · Podcast</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1.25, marginBottom: 8 }}>
              {eps[0]?.show_name || p.show}
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, marginBottom: 14, maxWidth: 560 }}>
              {p.tagline}. Expert interviews with industry leaders, analysts and executives — every week.
            </p>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#9ca3af', flexWrap: 'wrap' }}>
              <span>🎧 {eps.length} Episode{eps.length !== 1 ? 's' : ''}</span>
              {eps.length > 0 && <span>⏱ ~{Math.round(eps.reduce((s: number, e: any) => s + (e.duration_minutes || 20), 0) / eps.length)} min avg</span>}
              <span>📅 New weekly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px' }}>
        {eps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <PodcastCover color={p.color} name={p.name} size={80} />
            <div style={{ marginTop: 20, fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Episodes Coming Soon</div>
            <div style={{ fontSize: 14, color: '#9ca3af' }}>New episodes produced weekly. Check back soon.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {eps.map((ep: any, i: number) => (
              <div key={ep.id} className="ep-card">
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                  {/* EP number */}
                  <div style={{ textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: p.color, letterSpacing: '.1em', textTransform: 'uppercase' }}>EP</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: p.color, lineHeight: 1 }}>{ep.episode_number || i + 1}</div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.4, marginBottom: 6 }}>{ep.title}</h2>

                    {/* Guest + meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                      {ep.guest_name && (
                        <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{ep.guest_name}</span>
                      )}
                      {ep.guest_role && (
                        <><span style={{ color: '#d1d5db' }}>·</span><span style={{ fontSize: 12, color: '#6b7280' }}>{ep.guest_role}</span></>
                      )}
                      {ep.duration_minutes && (
                        <><span style={{ color: '#d1d5db' }}>·</span><span style={{ fontSize: 12, color: '#9ca3af' }}>⏱ {ep.duration_minutes} min</span></>
                      )}
                    </div>

                    {/* Date published */}
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Published {formatDate(ep.created_at)}
                    </div>

                    {ep.topic && (
                      <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 14 }}>{ep.topic}</p>
                    )}

                    {/* Audio player */}
                    {(ep.audio_url || ep.mp3_url) ? (
                      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px' }}>
                        <audio controls src={ep.audio_url || ep.mp3_url} preload="none" />
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>Audio coming soon</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #f3f4f6', padding: '20px 24px', marginTop: 16 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: p.color }}>← Back to {p.name}</Link>
          <span style={{ fontSize: 11, color: '#d1d5db' }}>© {new Date().getFullYear()} {p.name}</span>
        </div>
      </div>
    </div>
  )
}
