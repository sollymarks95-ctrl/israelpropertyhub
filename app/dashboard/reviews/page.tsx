'use client'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { Star, Plus, Sparkles, CheckCircle, AlertCircle, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ client_id: '', platform: 'Google', rating: 5, reviewer_name: '', review_text: '', sentiment: 'positive' })

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: rev }, { data: cli }] = await Promise.all([
      supabase.from('reviews').select('*, clients(company_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name')
    ])
    setReviews(rev || [])
    setClients(cli || [])
    setLoading(false)
  }

  async function addReview() {
    await supabase.from('reviews').insert([{ ...form, review_date: new Date().toISOString() }])
    setShowModal(false)
    setForm({ client_id: '', platform: 'Google', rating: 5, reviewer_name: '', review_text: '', sentiment: 'positive' })
    load()
  }

  async function generateAIResponse(review: any) {
    setGenerating(review.id)
    try {
      const res = await fetch('/api/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_text: review.review_text, rating: review.rating, platform: review.platform, company: review.clients?.company_name, sentiment: review.sentiment })
      })
      const { response } = await res.json()
      await supabase.from('reviews').update({ ai_response: response }).eq('id', review.id)
      load()
    } catch (e) { console.error(e) }
    setGenerating(null)
  }

  async function markPublished(id: string) {
    await supabase.from('reviews').update({ response_published: true, response_published_at: new Date().toISOString() }).eq('id', id)
    load()
  }

  const sentimentColor: Record<string, string> = { positive: 'badge-green', neutral: 'badge-yellow', negative: 'badge-red' }
  const filtered = filter === 'all' ? reviews : filter === 'pending' ? reviews.filter(r => !r.ai_response) : reviews.filter(r => r.ai_response && !r.response_published)

  return (
    <div>
      <TopBar
        title="Reviews"
        subtitle={`${reviews.length} total · ${reviews.filter(r => !r.ai_response).length} need response`}
        action={{ label: 'Add Review', onClick: () => setShowModal(true) }}
      />
      <div style={{ padding: 28 }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'pending', 'ready'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)',
              background: filter === f ? 'var(--accent)' : 'var(--bg-2)',
              color: filter === f ? '#fff' : 'var(--text-2)',
              fontFamily: 'Syne', fontWeight: 600, fontSize: 12, cursor: 'pointer'
            }}>
              {f === 'all' ? `All (${reviews.length})` : f === 'pending' ? `Need Response (${reviews.filter(r => !r.ai_response).length})` : `Ready to Publish (${reviews.filter(r => r.ai_response && !r.response_published).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-2)', textAlign: 'center', padding: 60 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <Star size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-2)' }}>No reviews here yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((r: any) => (
              <div key={r.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>{r.clients?.company_name || 'Unknown Client'}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>via {r.platform}</span>
                      <span className={`badge ${sentimentColor[r.sentiment]}`}>{r.sentiment}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? 'var(--yellow)' : 'var(--border)' }}>★</span>)}
                      {r.reviewer_name && <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 8 }}>— {r.reviewer_name}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!r.ai_response && (
                      <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => generateAIResponse(r)} disabled={generating === r.id}>
                        <Sparkles size={13} /> {generating === r.id ? 'Generating…' : 'AI Response'}
                      </button>
                    )}
                    {r.ai_response && !r.response_published && (
                      <button className="btn-ghost" style={{ fontSize: 12, padding: '7px 14px', color: 'var(--green)' }} onClick={() => markPublished(r.id)}>
                        <CheckCircle size={13} /> Mark Published
                      </button>
                    )}
                    {r.response_published && (
                      <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={11} /> Published</span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.6, marginBottom: r.ai_response ? 14 : 0 }}>{r.review_text}</p>
                {r.ai_response && (
                  <div style={{ padding: '14px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Sparkles size={12} color="var(--accent)" />
                      <span style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 700, color: 'var(--accent)' }}>AI RESPONSE</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.6, margin: 0 }}>{r.ai_response}</p>
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
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Add Review</h2>
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
                  <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Platform</label>
                  <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                    {['Google', 'Trustpilot', 'Facebook', 'Yelp', 'G2', 'Other'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Rating</label>
                  <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} stars</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Reviewer Name</label>
                <input placeholder="John D." value={form.reviewer_name} onChange={e => setForm(f => ({ ...f, reviewer_name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Review Text</label>
                <textarea rows={4} placeholder="Paste review here..." value={form.review_text} onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Sentiment</label>
                <select value={form.sentiment} onChange={e => setForm(f => ({ ...f, sentiment: e.target.value }))}>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={addReview} disabled={!form.client_id || !form.review_text}>
                <Plus size={14} /> Add Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
