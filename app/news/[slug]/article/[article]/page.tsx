import { getNewsSite, getArticle, getLatestArticles, timeAgo } from '@/lib/news'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ArticlePage({
  params,
}: { params: Promise<{ slug: string; article: string }> }) {
  const { slug, article: articleSlug } = await params
  const site = await getNewsSite(slug)
  if (!site) notFound()

  const [article, related] = await Promise.all([
    getArticle(site.id, articleSlug),
    getLatestArticles(site.id, 6),
  ])
  if (!article) notFound()

  const primary = site.primary_color || '#bb1919'
  const relatedFiltered = related.filter((r: any) => r.slug !== articleSlug).slice(0, 4)

  return (
    <div style={{ minHeight: '100vh', background: '#f2f2f2', fontFamily: 'Georgia, serif' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        .article-body p { margin-bottom: 20px; line-height: 1.8; font-size: 17px; color: #222; }
        .article-body h2 { font-size: 24px; font-weight: 700; margin: 32px 0 16px; color: #1a1a1a; }
        .article-body h3 { font-size: 20px; font-weight: 700; margin: 24px 0 12px; color: #1a1a1a; }
        .article-body blockquote { border-left: 4px solid ${primary}; padding: 12px 20px; margin: 24px 0; background: #f8f8f8; font-style: italic; color: #444; }
        .rel-card:hover h4 { color: ${primary}; }
      `}</style>

      {/* Header */}
      <header style={{ background: '#fff', borderBottom: `4px solid ${primary}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/news/${slug}`}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ background: primary, color: '#fff', fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 22, padding: '3px 8px' }}>
                {site.name.split(' ').map((w: string) => w.charAt(0)).join('').slice(0, 3).toUpperCase()}
              </div>
              <div style={{ background: '#1a1a1a', color: '#fff', fontFamily: 'Arial Black, sans-serif', fontWeight: 900, fontSize: 22, padding: '3px 8px' }}>
                {site.name.toUpperCase()}
              </div>
            </div>
          </Link>
          <Link href={`/news/${slug}`} style={{ fontSize: 13, color: '#666', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back to {site.name}
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>

          {/* ARTICLE */}
          <article>
            {/* Category + Breaking */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              {article.is_breaking && (
                <span style={{ background: primary, color: '#fff', fontSize: 11, fontFamily: 'Arial, sans-serif', fontWeight: 900, padding: '2px 8px', letterSpacing: '0.06em' }}>
                  BREAKING
                </span>
              )}
              {article.category && (
                <span style={{ fontSize: 13, color: primary, fontFamily: 'Arial, sans-serif', fontWeight: 700, letterSpacing: '0.06em' }}>
                  {article.category.toUpperCase()}
                </span>
              )}
              {article.is_sponsored && (
                <span style={{ background: '#f5f5f5', border: '1px solid #ddd', fontSize: 10, fontFamily: 'Arial, sans-serif', color: '#888', padding: '2px 6px' }}>
                  SPONSORED
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 36, color: '#1a1a1a', lineHeight: 1.15, marginBottom: 16 }}>
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p style={{ fontSize: 20, color: '#444', lineHeight: 1.5, marginBottom: 20, fontStyle: 'italic', borderLeft: `4px solid ${primary}`, paddingLeft: 16 }}>
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #1a1a1a' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 14 }}>
                {article.author_name?.charAt(0) || 'E'}
              </div>
              <div>
                <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>
                  {article.author_name || 'Editorial Team'}
                </div>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#888' }}>
                  {article.published_at ? new Date(article.published_at).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''} · {article.read_time_minutes} min read
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                {['Share', 'Save'].map(action => (
                  <button key={action} style={{
                    padding: '6px 14px', border: '1px solid #ddd', background: '#fff',
                    fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer'
                  }}>{action}</button>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            {article.cover_image_url ? (
              <div style={{ marginBottom: 28 }}>
                <img src={article.cover_image_url} alt={article.title}
                  style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }} />
              </div>
            ) : (
              <div style={{ width: '100%', height: 360, background: `linear-gradient(135deg, #1a1a1a, ${primary}44)`, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
                📰
              </div>
            )}

            {/* Body */}
            <div className="article-body" style={{ background: '#fff', padding: '32px 32px 40px' }}
              dangerouslySetInnerHTML={{ __html: article.body?.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/^/, '<p>').replace(/$/, '</p>') || '<p>Article content coming soon.</p>' }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div style={{ background: '#fff', padding: '16px 32px', borderTop: '1px solid #e5e5e5', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontFamily: 'Arial, sans-serif', fontWeight: 700, color: '#888', marginRight: 4 }}>TOPICS:</span>
                {article.tags.map((tag: string) => (
                  <span key={tag} style={{
                    fontSize: 12, fontFamily: 'Arial, sans-serif', fontWeight: 700,
                    color: primary, border: `1px solid ${primary}`,
                    padding: '3px 10px', cursor: 'pointer'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* SIDEBAR */}
          <aside>
            {/* Related */}
            {relatedFiltered.length > 0 && (
              <div style={{ background: '#fff', padding: '16px 20px', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 14, borderBottom: `3px solid ${primary}`, paddingBottom: 10, marginBottom: 16 }}>
                  Related Stories
                </h3>
                {relatedFiltered.map((rel: any, i: number) => (
                  <Link key={rel.id} href={`/news/${slug}/article/${rel.slug}`}>
                    <div className="rel-card" style={{
                      display: 'flex', gap: 12, marginBottom: 14,
                      paddingBottom: 14, cursor: 'pointer',
                      borderBottom: i < relatedFiltered.length - 1 ? '1px solid #e5e5e5' : 'none'
                    }}>
                      {rel.cover_image_url ? (
                        <img src={rel.cover_image_url} alt={rel.title} style={{ width: 80, height: 56, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 80, height: 56, background: '#e5e5e5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📰</div>
                      )}
                      <h4 style={{ fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3, transition: 'color 0.15s' }}>
                        {rel.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Newsletter */}
            <div style={{ background: '#1a1a1a', padding: 20 }}>
              <h3 style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900, fontSize: 15, color: '#fff', marginBottom: 8 }}>Daily Briefing</h3>
              <p style={{ fontSize: 12, color: '#999', marginBottom: 14, lineHeight: 1.5 }}>Top stories in global trade, delivered every morning.</p>
              <input placeholder="Email address" style={{ width: '100%', padding: '10px 12px', border: 'none', fontSize: 13, marginBottom: 8, fontFamily: 'Arial, sans-serif' }} />
              <button style={{ width: '100%', background: primary, color: '#fff', border: 'none', padding: '10px', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                SUBSCRIBE
              </button>
            </div>
          </aside>
        </div>
      </main>

      <footer style={{ background: '#1a1a1a', marginTop: 40, padding: '24px 20px', textAlign: 'center' }}>
        <div style={{ color: '#666', fontSize: 12, fontFamily: 'Arial, sans-serif' }}>
          © {new Date().getFullYear()} {site.name} · <Link href={`/news/${slug}`} style={{ color: '#999' }}>Home</Link> · Terms · Privacy
        </div>
      </footer>
    </div>
  )
}
