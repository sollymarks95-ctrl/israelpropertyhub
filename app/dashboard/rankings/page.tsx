'use client'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { TrendingUp, Plus, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function RankingsPage() {
  const [rankings, setRankings] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ client_id: '', keyword: '', url: '', position: 1, platform: 'Google' })

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: rank }, { data: cli }] = await Promise.all([
      supabase.from('page_rankings').select('*, clients(company_name)').order('snapshot_date', { ascending: false }),
      supabase.from('clients').select('id, company_name')
    ])
    setRankings(rank || [])
    setClients(cli || [])
    setLoading(false)
  }

  async function addRanking() {
    await supabase.from('page_rankings').insert([{ ...form, snapshot_date: new Date().toISOString().split('T')[0] }])
    setShowModal(false)
    setForm({ client_id: '', keyword: '', url: '', position: 1, platform: 'Google' })
    load()
  }

  const posColor = (p: number) => p <= 3 ? 'var(--green)' : p <= 10 ? 'var(--yellow)' : 'var(--text-2)'

  return (
    <div>
      <TopBar
        title="Rankings"
        subtitle={`${rankings.length} keywords tracked · ${rankings.filter(r => r.position <= 10).length} on page 1`}
        action={{ label: 'Add Keyword', onClick: () => setShowModal(true) }}
      />
      <div style={{ padding: 28 }}>
        {loading ? (
          <div style={{ color: 'var(--text-2)', textAlign: 'center', padding: 60 }}>Loading...</div>
        ) : rankings.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <TrendingUp size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 8 }}>No keywords tracked yet</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>Track Google/Bing rankings for your clients' brand keywords</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add Keyword</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 1fr', gap: 16, padding: '8px 20px', fontSize: 11, fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <span>Keyword</span><span>Client</span><span>Platform</span><span>Position</span><span>URL</span>
            </div>
            {rankings.map((r: any) => (
              <div key={r.id} className="card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 1fr', gap: 16, padding: '14px 20px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{r.keyword}</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.clients?.company_name}</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.platform}</span>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: posColor(r.position) }}>#{r.position}</span>
                <span style={{ fontSize: 12, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.url || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-in" style={{ width: 480, padding: 32 }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Track Keyword</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Client *</label>
                <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                  <option value="">Select client</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Keyword *</label>
                <input placeholder="e.g. Acme Trading reviews" value={form.keyword} onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Current Position</label>
                  <input type="number" min={1} value={form.position} onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))} />
                </div>
                <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Platform</label>
                  <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                    {['Google', 'Bing', 'YouTube'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Ranking URL</label>
                <input placeholder="https://..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={addRanking} disabled={!form.client_id || !form.keyword}>
                <Plus size={14} /> Add Keyword
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
