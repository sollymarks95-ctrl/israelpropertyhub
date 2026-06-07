import { getSiteBySlug, getClientProfile, getClientReviews } from '@/lib/site'
import { notFound } from 'next/navigation'

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string; company: string }>
}) {
  const { slug, company } = await params
  const site = await getSiteBySlug(slug)
  if (!site) notFound()

  const profile = await getClientProfile(site.id, company)
  if (!profile) notFound()

  const reviews = await getClientReviews(profile.client_id)
  const client = profile.clients as any
  const primary = site.primary_color || '#2563eb'
  const avgRating = reviews.length > 0
    ? (reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'Syne', fontWeight: 800, color: '#0f172a', textDecoration: 'none', fontSize: 18 }}>
          ← {site.name}
        </a>
        {profile.is_verified && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontFamily: 'Syne', fontWeight: 700, fontSize: 13 }}>
            ✓ Verified Business
          </div>
        )}
      </header>

      {/* Company Hero */}
      <div style={{ background: `linear-gradient(135deg, #0f172a, #1e293b)`, padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 28, alignItems: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 16,
            background: `${primary}20`, border: `2px solid ${primary}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne', fontWeight: 800, color: primary, fontSize: 32,
            flexShrink: 0
          }}>
            {client?.company_name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: '#fff', marginBottom: 8 }}>
              {client?.company_name}
            </h1>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {client?.industry && <span style={{ color: '#94a3b8', fontSize: 14 }}>📁 {client.industry}</span>}
              {client?.country && <span style={{ color: '#94a3b8', fontSize: 14 }}>📍 {client.country}</span>}
              {client?.website && <a href={client.website} style={{ color: primary, fontSize: 14 }}>🔗 Website</a>}
              {avgRating && <span style={{ color: '#f59e0b', fontFamily: 'Syne', fontWeight: 700 }}>★ {avgRating} ({reviews.length} reviews)</span>}
            </div>
          </div>
          {profile.trust_score > 0 && (
            <div style={{ textAlign: 'center', background: '#1e293b', borderRadius: 12, padding: '16px 24px', border: `1px solid ${primary}30` }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 36, color: primary }}>{profile.trust_score}</div>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Syne', fontWeight: 600 }}>TRUST SCORE</div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
        {/* Main */}
        <div>
          {/* About */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#0f172a', marginBottom: 14 }}>About</h2>
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15 }}>
              {profile.bio || client?.description || 'Verified and trusted business on the global directory.'}
            </p>
          </div>

          {/* Reviews */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#0f172a' }}>
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {avgRating && (
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, color: '#f59e0b' }}>
                  ★ {avgRating}
                </div>
              )}
            </div>
            {reviews.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>
                No reviews yet. Be the first to review this company.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map((review: any) => (
                  <div key={review.id} style={{
                    padding: '16px 0', borderBottom: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {review.reviewer_name || 'Anonymous'}
                      </div>
                      <div style={{ color: '#f59e0b', fontSize: 14 }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{review.review_text}</p>
                    {review.ai_response && (
                      <div style={{
                        marginTop: 12, padding: '10px 14px',
                        background: `${primary}08`, border: `1px solid ${primary}20`,
                        borderRadius: 8, fontSize: 13, color: '#475569'
                      }}>
                        <span style={{ fontFamily: 'Syne', fontWeight: 700, color: primary }}>Response: </span>
                        {review.ai_response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 15, color: '#0f172a', marginBottom: 16 }}>
              Company Details
            </h3>
            {[
              { label: 'Industry', value: client?.industry },
              { label: 'Country', value: client?.country },
              { label: 'Listed on', value: site.name },
              { label: 'Status', value: profile.is_verified ? '✓ Verified' : 'Listed' },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Syne', fontWeight: 700, marginBottom: 3, letterSpacing: '0.06em' }}>
                  {label.toUpperCase()}
                </div>
                <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {client?.website && (
            <a href={client.website} target="_blank" style={{
              display: 'block', background: primary, color: '#fff',
              padding: '14px', borderRadius: 10, textAlign: 'center',
              fontFamily: 'Syne', fontWeight: 700, textDecoration: 'none', fontSize: 14,
              marginBottom: 12
            }}>
              Visit Website →
            </a>
          )}

          <div style={{
            background: '#f8fafc', borderRadius: 10,
            border: '1px solid #e2e8f0', padding: 18,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
              Always verify business credentials independently before making transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
