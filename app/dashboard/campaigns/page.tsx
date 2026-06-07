'use client'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { Mail, Plus, Send, Users, MousePointer, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ client_id: '', name: '', channel: 'whatsapp', target_platform: 'Google', target_url: '', message_template: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: cam }, { data: cli }] = await Promise.all([
      supabase.from('review_campaigns').select('*, clients(company_name)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name')
    ])
    setCampaigns(cam || [])
    setClients(cli || [])
    setLoading(false)
  }

  async function createCampaign() {
    const defaultTemplate = `Hi! We'd love to hear your feedback about your experience with ${clients.find(c => c.id === form.client_id)?.company_name}. Could you take 1 minute to leave us a review? ${form.target_url}`
    await supabase.from('review_campaigns').insert([{ ...form, message_template: form.message_template || defaultTemplate }])
    setShowModal(false)
    setForm({ client_id: '', name: '', channel: 'whatsapp', target_platform: 'Google', target_url: '', message_template: '' })
    load()
  }

  const statusColor: Record<string, string> = { active: 'badge-green', paused: 'badge-yellow', completed: 'badge-blue' }

  return (
    <div>
      <TopBar
        title="Review Campaigns"
        subtitle={`${campaigns.length} campaigns · ${campaigns.filter(c => c.status === 'active').length} active`}
        action={{ label: 'New Campaign', onClick: () => setShowModal(true) }}
      />
      <div style={{ padding: 28 }}>
        {loading ? (
          <div style={{ color: 'var(--text-2)', textAlign: 'center', padding: 60 }}>Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <Mail size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 8 }}>No campaigns yet</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>Create campaigns to collect more reviews via WhatsApp, SMS or Email</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Campaign</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campaigns.map((c: any) => (
              <div key={c.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>{c.name}</span>
                      <span className={`badge ${statusColor[c.status]}`}>{c.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {c.clients?.company_name} · {c.channel} → {c.target_platform}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
                    {[
                      { icon: Send, val: c.total_sent, label: 'Sent' },
                      { icon: MousePointer, val: c.total_clicks, label: 'Clicks' },
                      { icon: Star, val: c.total_reviews, label: 'Reviews' },
                    ].map(({ icon: Icon, val, label }) => (
                      <div key={label}>
                        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20 }}>{val}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-in" style={{ width: 540, padding: 32 }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 24 }}>New Campaign</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Client *</label>
                <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                  <option value="">Select client</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Campaign Name *</label>
                <input placeholder="e.g. Q2 Google Review Push" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Channel</label>
                  <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Target Platform</label>
                  <select value={form.target_platform} onChange={e => setForm(f => ({ ...f, target_platform: e.target.value }))}>
                    {['Google', 'Trustpilot', 'Facebook', 'Yelp', 'G2'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Review Link URL</label>
                <input placeholder="https://g.page/r/..." value={form.target_url} onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))} />
              </div>
              <div><label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Message Template (optional)</label>
                <textarea rows={3} placeholder="Leave blank to auto-generate..." value={form.message_template} onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={createCampaign} disabled={!form.client_id || !form.name}>
                <Plus size={14} /> Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
