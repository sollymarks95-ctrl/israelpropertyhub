'use client'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { Users, Plus, Globe, Mail } from 'lucide-react'
import { supabase, type Client } from '@/lib/supabase'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    company_name: '', contact_name: '', contact_email: '',
    contact_phone: '', country: '', industry: '', website: '',
    plan: 'premium', monthly_fee: 2500, currency: 'USD'
  })

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  async function createClient() {
    await supabase.from('clients').insert([form])
    setShowModal(false)
    setForm({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', country: '', industry: '', website: '', plan: 'premium', monthly_fee: 2500, currency: 'USD' })
    fetchClients()
  }

  const statusColor: Record<string, string> = {
    active: 'badge-green', inactive: 'badge-red', onboarding: 'badge-yellow'
  }
  const planColor: Record<string, string> = {
    premium: 'badge-purple', pro: 'badge-blue', basic: 'badge-yellow'
  }

  return (
    <div>
      <TopBar
        title="Clients"
        subtitle={`${clients.length} clients · $${clients.reduce((a, c) => a + c.monthly_fee, 0).toLocaleString()}/mo MRR`}
        action={{ label: 'Add Client', onClick: () => setShowModal(true) }}
      />
      <div style={{ padding: 28 }}>
        {loading ? (
          <div style={{ color: 'var(--text-2)', textAlign: 'center', padding: 60 }}>Loading...</div>
        ) : clients.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <Users size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, marginBottom: 8 }}>No clients yet</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>Add your first client to start managing their reputation</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add First Client
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
              gap: 16, padding: '8px 20px',
              fontSize: 11, fontFamily: 'Syne', fontWeight: 700,
              color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase'
            }}>
              <span>Company</span>
              <span>Plan</span>
              <span>MRR</span>
              <span>Status</span>
              <span>Industry</span>
              <span>Actions</span>
            </div>
            {clients.map(client => (
              <div key={client.id} className="card" style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
                gap: 16, padding: '16px 20px', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{client.company_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 10, marginTop: 3 }}>
                    {client.contact_email && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={10} />{client.contact_email}</span>}
                    {client.country && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Globe size={10} />{client.country}</span>}
                  </div>
                </div>
                <span className={`badge ${planColor[client.plan]}`}>{client.plan}</span>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--green)' }}>
                  ${client.monthly_fee.toLocaleString()}
                </span>
                <span className={`badge ${statusColor[client.status]}`}>{client.status}</span>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{client.industry || '—'}</span>
                <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px', justifyContent: 'center' }}>View</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-in" style={{ width: 560, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Add New Client</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Company Name *</label>
                <input placeholder="e.g. Acme Trading Co." value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Contact Name</label>
                <input placeholder="Full name" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Email</label>
                <input placeholder="email@company.com" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Phone</label>
                <input placeholder="+1 234 567 8900" value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Country</label>
                <input placeholder="e.g. USA, UAE, Israel" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Industry</label>
                <input placeholder="e.g. Import/Export" value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Website</label>
                <input placeholder="https://" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Plan</label>
                <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Monthly Fee (USD)</label>
                <input type="number" value={form.monthly_fee} onChange={e => setForm(f => ({ ...f, monthly_fee: Number(e.target.value) }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={createClient}>
                <Plus size={14} /> Add Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
