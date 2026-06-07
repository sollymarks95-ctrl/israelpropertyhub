'use client'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { Plus, Globe, FileText, Eye, Pencil, Trash2, Star, Zap, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type NewsSite = { id: string; name: string; slug: string; domain: string; primary_color: string; is_live: boolean; categories: string[] }
type Article = { id: string; title: string; slug: string; category: string; status: string; is_featured: boolean; is_breaking: boolean; published_at: string; read_time_minutes: number; views: number }

export default function NewsPage() {
  const [sites, setSites] = useState<NewsSite[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedSite, setSelectedSite] = useState<NewsSite | null>(null)
  const [showSiteModal, setShowSiteModal] = useState(false)
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [siteForm, setSiteForm] = useState({ name: '', domain: '', slug: '', tagline: '', primary_color: '#bb1919', categories: 'World,Business,Technology,Markets,Industry' })
  const [articleForm, setArticleForm] = useState({ title: '', slug: '', excerpt: '', body: '', category: 'Business', author_name: 'Editorial Team', read_time_minutes: 3, is_featured: false, is_breaking: false, status: 'published' })
  const [aiPrompt, setAiPrompt] = useState('')

  useEffect(() => { fetchSites() }, [])
  useEffect(() => { if (selectedSite) fetchArticles(selectedSite.id) }, [selectedSite])

  async function fetchSites() {
    const { data } = await supabase.from('news_sites').select('*').order('created_at', { ascending: false })
    setSites(data || [])
    if (data && data.length > 0 && !selectedSite) setSelectedSite(data[0])
  }

  async function fetchArticles(siteId: string) {
    const { data } = await supabase.from('news_articles').select('*').eq('news_site_id', siteId).order('created_at', { ascending: false })
    setArticles(data || [])
  }

  async function createSite() {
    const slug = siteForm.slug || siteForm.name.toLowerCase().replace(/\s+/g, '-')
    const cats = siteForm.categories.split(',').map(c => c.trim())
    await supabase.from('news_sites').insert([{ ...siteForm, slug, categories: cats }])
    setShowSiteModal(false)
    setSiteForm({ name: '', domain: '', slug: '', tagline: '', primary_color: '#bb1919', categories: 'World,Business,Technology,Markets,Industry' })
    fetchSites()
  }

  async function createArticle() {
    if (!selectedSite) return
    const slug = articleForm.slug || articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    await supabase.from('news_articles').insert([{
      ...articleForm, slug,
      news_site_id: selectedSite.id,
      published_at: articleForm.status === 'published' ? new Date().toISOString() : null,
      ai_generated: false
    }])
    setShowArticleModal(false)
    setArticleForm({ title: '', slug: '', excerpt: '', body: '', category: 'Business', author_name: 'Editorial Team', read_time_minutes: 3, is_featured: false, is_breaking: false, status: 'published' })
    fetchArticles(selectedSite.id)
  }

  async function generateArticle() {
    if (!selectedSite || !aiPrompt) return
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, site: selectedSite, category: articleForm.category })
      })
      const data = await res.json()
      if (data.article) {
        setArticleForm(f => ({ ...f, title: data.article.title, excerpt: data.article.excerpt, body: data.article.body, slug: data.article.slug }))
        setAiPrompt('')
      }
    } catch (e) { console.error(e) }
    setGenerating(false)
  }

  async function toggleLive(site: NewsSite) {
    await supabase.from('news_sites').update({ is_live: !site.is_live }).eq('id', site.id)
    fetchSites()
  }

  async function deleteArticle(id: string) {
    await supabase.from('news_articles').delete().eq('id', id)
    if (selectedSite) fetchArticles(selectedSite.id)
  }

  async function toggleFeatured(article: Article) {
    await supabase.from('news_articles').update({ is_featured: !article.is_featured }).eq('id', article.id)
    if (selectedSite) fetchArticles(selectedSite.id)
  }

  return (
    <div>
      <TopBar title="News Sites" subtitle="BBC-style news network" />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>

        {/* Site Sidebar */}
        <div style={{ width: 260, borderRight: '1px solid var(--border)', background: 'var(--bg-2)', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '12px 12px 8px' }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowSiteModal(true)}>
              <Plus size={13} /> New News Site
            </button>
          </div>
          {sites.map(site => (
            <div key={site.id} onClick={() => setSelectedSite(site)} style={{
              padding: '13px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
              background: selectedSite?.id === site.id ? 'rgba(59,130,246,0.08)' : 'transparent',
              borderLeft: `3px solid ${selectedSite?.id === site.id ? 'var(--accent)' : 'transparent'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: site.primary_color, display: 'inline-block' }} />
                  {site.name}
                </span>
                <span style={{ fontSize: 10, fontFamily: 'Syne', fontWeight: 700, color: site.is_live ? 'var(--green)' : 'var(--yellow)' }}>
                  {site.is_live ? '● LIVE' : '○ DRAFT'}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', paddingLeft: 15 }}>{site.domain}</div>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        {selectedSite ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Site toolbar */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16 }}>{selectedSite.name}</h2>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{articles.length} articles · {selectedSite.domain}</div>
              </div>
              <a href={`/news/${selectedSite.slug}`} target="_blank"
                className="btn-ghost" style={{ fontSize: 12, padding: '7px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Eye size={12} /> Preview
              </a>
              <button
                className={selectedSite.is_live ? 'btn-ghost' : 'btn-primary'}
                style={{ fontSize: 12, padding: '7px 14px' }}
                onClick={() => toggleLive(selectedSite)}
              >
                {selectedSite.is_live ? 'Unpublish' : '● Go Live'}
              </button>
              <button className="btn-primary" onClick={() => setShowArticleModal(true)} style={{ fontSize: 12, padding: '7px 14px' }}>
                <Plus size={13} /> New Article
              </button>
            </div>

            {/* Articles list */}
            <div style={{ padding: 24 }}>
              {articles.length === 0 ? (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                  <FileText size={40} style={{ opacity: 0.15, margin: '0 auto 16px' }} />
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 8 }}>No articles yet</h3>
                  <p style={{ color: 'var(--text-2)', marginBottom: 20, fontSize: 13 }}>Create your first article manually or use AI to generate one</p>
                  <button className="btn-primary" onClick={() => setShowArticleModal(true)}><Plus size={13} /> Create First Article</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 120px', gap: 12, padding: '6px 16px', fontSize: 11, fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    <span>Title</span><span>Category</span><span>Status</span><span>Published</span><span>Actions</span>
                  </div>
                  {articles.map(article => (
                    <div key={article.id} className="card" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 120px', gap: 12, padding: '14px 16px', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          {article.is_breaking && <span style={{ fontSize: 9, fontFamily: 'Syne', fontWeight: 800, background: '#ef444420', color: '#ef4444', padding: '1px 5px', borderRadius: 3 }}>BREAKING</span>}
                          {article.is_featured && <span style={{ fontSize: 9, fontFamily: 'Syne', fontWeight: 800, background: 'rgba(245,158,11,0.15)', color: 'var(--yellow)', padding: '1px 5px', borderRadius: 3 }}>FEATURED</span>}
                        </div>
                        <div style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{article.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{article.read_time_minutes} min read · {article.views} views</div>
                      </div>
                      <span className="badge badge-blue" style={{ fontSize: 10 }}>{article.category}</span>
                      <span className={`badge ${article.status === 'published' ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: 10 }}>{article.status}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => toggleFeatured(article)} title={article.is_featured ? 'Unfeature' : 'Feature'}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: article.is_featured ? 'var(--yellow)' : 'var(--text-2)', padding: 4 }}>
                          <Star size={13} fill={article.is_featured ? 'currentColor' : 'none'} />
                        </button>
                        <a href={`/news/${selectedSite.slug}/article/${article.slug}`} target="_blank"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 4, display: 'flex', alignItems: 'center' }}>
                          <Eye size={13} />
                        </a>
                        <button onClick={() => deleteArticle(article.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 4 }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
            <div style={{ textAlign: 'center' }}>
              <Globe size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
              <p style={{ fontSize: 14 }}>Select or create a news site</p>
            </div>
          </div>
        )}
      </div>

      {/* New Site Modal */}
      {showSiteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-in" style={{ width: 500, padding: 32 }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Create News Site</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Site Name *', key: 'name', placeholder: 'e.g. Trade World News' },
                { label: 'Domain *', key: 'domain', placeholder: 'tradeworldnews.com' },
                { label: 'Tagline', key: 'tagline', placeholder: 'Global Business & Trade Intelligence' },
                { label: 'Categories (comma separated)', key: 'categories', placeholder: 'World,Business,Technology,Markets' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>{label}</label>
                  <input placeholder={placeholder} value={(siteForm as any)[key]} onChange={e => setSiteForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Brand Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="color" value={siteForm.primary_color} onChange={e => setSiteForm(f => ({ ...f, primary_color: e.target.value }))}
                    style={{ width: 44, height: 44, padding: 2, borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)' }} />
                  <input value={siteForm.primary_color} onChange={e => setSiteForm(f => ({ ...f, primary_color: e.target.value }))} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowSiteModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={createSite} disabled={!siteForm.name || !siteForm.domain}>
                <Plus size={13} /> Create Site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Article Modal */}
      {showArticleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-in" style={{ width: 720, padding: 32, maxHeight: '92vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 20 }}>New Article</h2>

            {/* AI Generator */}
            <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>
                <Zap size={13} /> AI Article Generator
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="e.g. Write about global supply chain trends in 2025 for the trading industry..."
                  value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button className="btn-primary" onClick={generateArticle} disabled={generating || !aiPrompt}
                  style={{ whiteSpace: 'nowrap', fontSize: 12, padding: '10px 16px' }}>
                  {generating ? 'Generating...' : '⚡ Generate'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Title *</label>
                <input placeholder="Article headline" value={articleForm.title} onChange={e => setArticleForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Category</label>
                <select value={articleForm.category} onChange={e => setArticleForm(f => ({ ...f, category: e.target.value }))}>
                  {(selectedSite?.categories || ['Business', 'World', 'Technology', 'Markets']).map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Author</label>
                <input value={articleForm.author_name} onChange={e => setArticleForm(f => ({ ...f, author_name: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Excerpt</label>
                <textarea rows={2} placeholder="Short summary shown on homepage" value={articleForm.excerpt} onChange={e => setArticleForm(f => ({ ...f, excerpt: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Article Body</label>
                <textarea rows={10} placeholder="Full article content..." value={articleForm.body} onChange={e => setArticleForm(f => ({ ...f, body: e.target.value }))} style={{ resize: 'vertical', fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.7 }} />
              </div>
              <div style={{ display: 'flex', gap: 20, gridColumn: '1/-1' }}>
                {[
                  { label: 'Featured (hero slot)', key: 'is_featured' },
                  { label: 'Breaking News', key: 'is_breaking' },
                ].map(({ label, key }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Syne', fontWeight: 600 }}>
                    <input type="checkbox" checked={(articleForm as any)[key]} onChange={e => setArticleForm(f => ({ ...f, [key]: e.target.checked }))}
                      style={{ width: 16, height: 16 }} />
                    {label}
                  </label>
                ))}
                <div style={{ marginLeft: 'auto' }}>
                  <select value={articleForm.status} onChange={e => setArticleForm(f => ({ ...f, status: e.target.value }))} style={{ width: 'auto' }}>
                    <option value="published">Publish Now</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowArticleModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={createArticle} disabled={!articleForm.title}>
                <CheckCircle size={13} /> {articleForm.status === 'published' ? 'Publish Article' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
