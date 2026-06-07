'use client'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { FileText, Plus, Sparkles, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const TYPES = ['article', 'press_release', 'blog_post', 'profile_bio', 'social_post']

export default function ContentPage() {
  const [content, setContent] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ client_id: '', type: 'article', platform: '', title: '', brief: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: cnt }, { data: cli }] = await Promise.all([
      supabase.from('content').select('*, clients(company_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name, industry, country')
    ])
    setContent(cnt || [])
    setClients(cli || [])
    setLoading(false)
  }

  async function generateContent() {
    if (!form.client_id || !form.type) return
    setGenerating(true)
    const client = clients.find(c => c.id === form.client_id)
    try {
      const res = await fetch('/api/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company: client?.company_name, industry: client?.industry, country: client?.country })
      })
      const { title, body, seo_title, seo_description } = await res.json()
      await supabase.from('content').insert([{
        client_id: form.client_id, type: form.type, platform: form.platform,
        title, body, seo_title, seo_description, ai_generated: true, status: 'draft'
      }])
      setShowModal(false)
      setForm({ client_id: '', type: 'article', platform: '', title: '', brief: '' })
      load()
    } catch (e) { console.error(e) }
    setGenerating(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('content').update({ status, published_at: status === 'published' ? new Date().toISOString() : null }).eq('id', id)
    load()
  }

  const statusStyle: Record<string, string> = { draft: 'badge-yellow', approved: 'badge-blue', published: 'badge-green', scheduled: 'badge-purple' }

  return (
    <div>
      <TopBar
        title="Content"
        subtitle={`${content.length} pieces · ${content.filter(c => c.status === 'published').length} published`}
        action={{ label: 'Generate Content', onClick: () => setShowModal(true) }}
      />
      <div style={{ padding: 28 }}>
        {loading ? (
          <div style={{ color: 'var(--text-2)', textAlign: 'center', padding: 60 }}>Loading...</div>
        ) : content.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 8 }}>No content yet</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>Use AI to generate articles, press releases and more</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}><Sparkles size={14} /> Generate Content</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {content.map((c: any) => (
              <div key={c.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className={`badge ${statusStyle[c.status]}`}>{c.status}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Syne', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.type.replace('_', ' ')}</span>
                      {c.ai_generated && <span style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={10} /> AI</span>}
                    </div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{c.title || 'Untitled'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.clients?.company_name} {c.platform && `· ${c.platform}`}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                      {expanded === c.id ? 'Hide' : 'View'}
                    </button>
                    {c.status === 'draft' && <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px', color: 'var(--accent)' }} onClick={() => updateStatus(c.id, 'approved')}>Approve</button>}
                    {c.status === 'approved' && <button className="btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => updateStatus(c.id, 'published')}><CheckCircle size={12} /> Publish</button>}
                  </div>
                </div>
                {expanded === c.id && (
                  <div style={{ marginTop: 16, padding: '16px', background: 'var(--bg-3)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-1)' }}>
                    {c.body}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-in" style={{ width: 520, padding: 32 }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Generate AI Content</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Client *</label>
                <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                  <option value="">Select client</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Content Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Platform / Site</label>
                  <input placeholder="e.g. trustpilot.com" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Brief / Topic</label>
                <textarea rows={3} placeholder="What should this content cover? Key points, angle, tone..." value={form.brief} onChange={e => setForm(f => ({ ...f, brief: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={generateContent} disabled={generating || !form.client_id}>
                <Sparkles size={14} /> {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
