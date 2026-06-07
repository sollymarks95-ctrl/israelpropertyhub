import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All Broker Reviews — Verivex Trust Intelligence',
  description: 'Read verified trader reviews for the world\'s top forex brokers, crypto exchanges and prop firms. eToro, IC Markets, Pepperstone, Binance and more.',
  robots: 'index, follow',
  alternates: { canonical: 'https://verivex.co/reviews' },
}

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

function stars(r: number) { return '★'.repeat(r) + '☆'.repeat(5 - r) }

const COLORS: Record<string, string> = {
  etoro: '#00C853', binance: '#F0B90B', coinbase: '#0052FF',
  'ic-markets': '#0066CC', pepperstone: '#FF6600', xm: '#D40000',
  'interactive-brokers': '#CC0000', plus500: '#00A651', ftmo: '#00C8FF', myforexfunds: '#7B2FF7',
}

export default async function ReviewsPage() {
  const db = getDb()
  const { data: companies } = await db
    .from('verivex_companies')
    .select('*')
    .order('is_featured', { ascending: false })

  const { data: reviewCounts } = await db
    .from('verivex_reviews')
    .select('company_slug, rating')
    .eq('status', 'approved')

  // Aggregate stats per company
  const stats: Record<string, { count: number; avg: number }> = {}
  for (const r of reviewCounts || []) {
    if (!stats[r.company_slug]) stats[r.company_slug] = { count: 0, avg: 0 }
    stats[r.company_slug].count++
    stats[r.company_slug].avg += r.rating
  }
  for (const slug of Object.keys(stats)) {
    stats[slug].avg = stats[slug].avg / stats[slug].count
  }

  const GREEN = '#00B67A'

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        .company-card { transition: box-shadow .2s, transform .2s; }
        .company-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.1); transform: translateY(-2px); }
      `}</style>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
              VERI<span style={{ color: GREEN }}>VEX</span>
            </span>
          </Link>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/for-businesses" style={{ fontSize: 13, color: '#475569', padding: '8px 14px', border: '1px solid #E2E8F0', borderRadius: 8, textDecoration: 'none' }}>For Businesses</Link>
            <Link href="/reviews" style={{ fontSize: 13, fontWeight: 700, color: '#fff', padding: '9px 18px', borderRadius: 8, background: GREEN, textDecoration: 'none' }}>✍️ Write a Review</Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #00875A 100%)`, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>VERIFIED REVIEWS</div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 }}>
          All Broker Reviews
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 480, margin: '0 auto 24px' }}>
          Real reviews from verified traders. Compare brokers, read honest feedback and make informed decisions.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          {[
            { num: '284k+', label: 'Verified reviews' },
            { num: '10', label: 'Platforms reviewed' },
            { num: '63+', label: 'Countries' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{s.num}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Companies grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {(companies || []).map((co: any) => {
            const s = stats[co.slug] || { count: co.total_reviews || 0, avg: co.avg_rating || 4 }
            const color = COLORS[co.slug] || GREEN
            const score = s.avg.toFixed(1)
            const label = parseFloat(score) >= 4.5 ? 'Excellent' : parseFloat(score) >= 4 ? 'Great' : parseFloat(score) >= 3.5 ? 'Good' : 'Average'
            return (
              <Link key={co.slug} href={`/reviews/${co.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="company-card" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 24, cursor: 'pointer' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Logo */}
                      <div style={{ width: 52, height: 52, borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={co.logo_url || `https://www.google.com/s2/favicons?domain=${co.slug}.com&sz=64`} alt={co.name} width={44} height={44} style={{ objectFit: 'contain', borderRadius: 6 }} referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                          {co.name} {co.is_verified && <span style={{ fontSize: 12, color: GREEN }}>✓</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{co.regulation || 'Regulated'}</div>
                      </div>
                    </div>
                    <div style={{ background: parseFloat(score) >= 4 ? '#D1FAE5' : '#FEF3C7', color: parseFloat(score) >= 4 ? '#065F46' : '#92400E', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                      {label}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: '#64748B', marginBottom: 14, lineHeight: 1.5 }}>
                    {co.description?.slice(0, 90) || `${co.name} — reviewed by verified traders`}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#F59E0B', fontSize: 14, letterSpacing: -1 }}>{'★'.repeat(Math.round(s.avg))}</span>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{score}</span>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>· {s.count || co.total_reviews || 0} reviews</span>
                    </div>
                    <span style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>Read reviews →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Write a review CTA */}
        <div style={{ background: GREEN, borderRadius: 16, padding: '36px 32px', marginTop: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Share your experience</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>Your honest review helps millions of traders make better decisions.</p>
          </div>
          <Link href="/reviews/etoro" style={{ background: '#fff', color: GREEN, fontWeight: 800, padding: '14px 28px', borderRadius: 100, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            ✍️ Write a Review
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0F172A', color: '#64748B', padding: '32px 24px', marginTop: 48 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>VERI<span style={{ color: GREEN }}>VEX</span></span>
            <div style={{ fontSize: 11, marginTop: 4 }}>Verified Trust Intelligence · verivex.co</div>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
            {[['Privacy', '/legal/privacy'], ['Terms', '/legal/terms'], ['Cookies', '/legal/cookies'], ['For Businesses', '/for-businesses']].map(([l, h]) => (
              <Link key={l} href={h} style={{ color: '#94A3B8', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
