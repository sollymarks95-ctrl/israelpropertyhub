'use client'
import { useState, useEffect } from 'react'
import TopBar from '@/components/TopBar'
import { Globe, ExternalLink, Settings, Plus, CheckCircle, XCircle, PencilLine, Eye, Users, Star, FileText } from 'lucide-react'
import { supabase, type Site } from '@/lib/supabase'

type Tab = 'overview' | 'design' | 'content' | 'clients' | 'seo'

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [form, setForm] = useState({
    name: '', domain: '', slug: '', tagline: '',
    niche: '', primary_color: '#3b82f6', secondary_color: '#1e40af',
    seo_title: '', seo_description: '', description: ''
  })

  useEffect(() => { fetchSites() }, [])

  async function fetchSites() {
    const { data } = await supabase.from('sites').select('*').order('created_at', { ascending: false })
    setSites(data || [])
    setLoading(false)
  }

  async function createSite() {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-')
    await supabase.from('sites').insert([{ ...form, slug }])
    setShowModal(false)
    resetForm()
    fetchSites()
  }

  async function updateSite(updates: Partial<Site>) {
    if (!selectedSite) return
    await supabase.from('sites').update(updates).eq('id', selectedSite.id)
    setSelectedSite({ ...selectedSite, ...updates } as Site)
    fetchSites()
  }

  async function toggleLive(site: Site) {
    await supabase.from('sites').update({ is_live: !site.is_live }).eq('id', site.id)
    fetchSites()
    if (selectedSite?.id === site.id) setSelectedSite({ ...selectedSite, is_live: !site.is_live })
  }

  function resetForm() {
    setForm({ name: '', domain: '', slug: '', tagline: '', niche: '', primary_color: '#3b82f6', secondary_color: '#1e40af', seo_title: '', seo_description: '', description: '' })
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'design', label: 'Design', icon: PencilLine },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'seo', label: 'SEO', icon: Star },
  ]

  return (
    <div>
      <TopBar
        title="Sites"
        subtitle={`${sites.length} sites in your network`}
        action={!selectedSite ? { label: 'Add Site', onClick: () => setShowModal(true) } : undefined}
      />
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>

        {/* Site List Sidebar */}
        <div style={{
          width: 280, borderRight: '1px solid var(--border)',
          background: 'var(--bg-2)', overflowY: 'auto', flexShrink: 0
        }}>
          <div style={{ padding: '16px 12px' }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add New Site
            </button>
          </div>
          {loading ? (
            <div style={{ padding: 20, color: 'var(--text-2)', textAlign: 'center' }}>Loading...</div>
          ) : sites.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-2)' }}>
              <Globe size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: 13 }}>No sites yet</p>
            </div>
          ) : (
            sites.map(site => (
              <div
                key={site.id}
                onClick={() => { setSelectedSite(site); setActiveTab('overview') }}
                style={{
                  padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: selectedSite?.id === site.id ? 'rgba(59,130,246,0.08)' : 'transparent',
                  borderLeft: selectedSite?.id === site.id ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: site.primary_color || 'var(--accent)' }} />
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13 }}>{site.name}</span>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'Syne', fontWeight: 600, color: site.is_live ? 'var(--green)' : 'var(--yellow)' }}>
                    {site.is_live ? '● LIVE' : '○ DRAFT'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', paddingLeft: 16 }}>{site.domain}</div>
              </div>
            ))
          )}
        </div>

        {/* Site Editor Panel */}
        {selectedSite ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Site Header */}
            <div style={{
              padding: '20px 28px', borderBottom: '1px solid var(--border)',
              background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${selectedSite.primary_color}20`,
                  border: `1px solid ${selectedSite.primary_color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne', fontWeight: 800, color: selectedSite.primary_color, fontSize: 18
                }}>
                  {selectedSite.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }}>{selectedSite.name}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{selectedSite.domain}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={`/?site=${selectedSite.slug}`} target="_blank"
                  className="btn-ghost" style={{ fontSize: 12, padding: '7px 14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={13} /> Preview
                </a>
                <button
                  className={selectedSite.is_live ? 'btn-ghost' : 'btn-primary'}
                  style={{ fontSize: 12, padding: '7px 14px' }}
                  onClick={() => toggleLive(selectedSite)}
                >
                  {selectedSite.is_live ? <><XCircle size={13} /> Unpublish</> : <><CheckCircle size={13} /> Go Live</>}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 28px', background: 'var(--bg-2)' }}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    padding: '12px 16px', border: 'none', background: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'Syne', fontWeight: 600, fontSize: 13,
                    color: activeTab === id ? 'var(--accent)' : 'var(--text-2)',
                    borderBottom: `2px solid ${activeTab === id ? 'var(--accent)' : 'transparent'}`,
                    marginBottom: -1, transition: 'all 0.15s'
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: 28 }}>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                  {[
                    { label: 'Status', value: selectedSite.is_live ? 'Live' : 'Draft', color: selectedSite.is_live ? 'var(--green)' : 'var(--yellow)' },
                    { label: 'Domain', value: selectedSite.domain, color: 'var(--text)' },
                    { label: 'Niche', value: selectedSite.niche || 'Not set', color: 'var(--text-2)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card" style={{ padding: 20 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Syne', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, color }}>{value}</div>
                    </div>
                  ))}
                  <div className="card" style={{ padding: 20, gridColumn: '1/-1' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Syne', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Description</div>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
                      {selectedSite.description || 'No description set yet. Go to Content tab to add one.'}
                    </p>
                  </div>
                </div>
              )}

              {/* DESIGN TAB */}
              {activeTab === 'design' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Brand Colors</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 8, fontFamily: 'Syne', fontWeight: 600 }}>Primary Color</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="color" defaultValue={selectedSite.primary_color}
                            onChange={e => updateSite({ primary_color: e.target.value })}
                            style={{ width: 44, height: 44, padding: 2, borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-3)' }} />
                          <input defaultValue={selectedSite.primary_color} style={{ flex: 1 }}
                            onBlur={e => updateSite({ primary_color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 8, fontFamily: 'Syne', fontWeight: 600 }}>Secondary Color</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="color" defaultValue={selectedSite.secondary_color}
                            onChange={e => updateSite({ secondary_color: e.target.value })}
                            style={{ width: 44, height: 44, padding: 2, borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-3)' }} />
                          <input defaultValue={selectedSite.secondary_color} style={{ flex: 1 }}
                            onBlur={e => updateSite({ secondary_color: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Live Preview</h3>
                    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{ background: selectedSite.primary_color, padding: '12px 16px' }}>
                        <div style={{ fontFamily: 'Syne', fontWeight: 800, color: '#fff', fontSize: 14 }}>{selectedSite.name}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: 16 }}>
                        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, marginBottom: 8, width: '70%' }} />
                        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, marginBottom: 16, width: '50%' }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                          {[1,2,3].map(i => (
                            <div key={i} style={{
                              flex: 1, height: 60, borderRadius: 8,
                              background: '#fff', border: `2px solid ${selectedSite.primary_color}30`
                            }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENT TAB */}
              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Site Name', key: 'name', value: selectedSite.name },
                    { label: 'Tagline (Hero heading)', key: 'tagline', value: selectedSite.tagline || '' },
                    { label: 'Description', key: 'description', value: selectedSite.description || '' },
                    { label: 'Niche / Industry Focus', key: 'niche', value: selectedSite.niche || '' },
                  ].map(({ label, key, value }) => (
                    <div className="card" key={key} style={{ padding: 20 }}>
                      <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 8, fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</label>
                      {key === 'description' ? (
                        <textarea rows={3} defaultValue={value}
                          onBlur={e => updateSite({ [key]: e.target.value })}
                          style={{ width: '100%', resize: 'vertical' }} />
                      ) : (
                        <input defaultValue={value} onBlur={e => updateSite({ [key]: e.target.value } as any)} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* SEO TAB */}
              {activeTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card" style={{ padding: 20 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 8, fontFamily: 'Syne', fontWeight: 600 }}>SEO Title</label>
                    <input defaultValue={selectedSite.seo_title || ''} onBlur={e => updateSite({ seo_title: e.target.value })} placeholder="Page title shown in Google" />
                  </div>
                  <div className="card" style={{ padding: 20 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 8, fontFamily: 'Syne', fontWeight: 600 }}>SEO Description</label>
                    <textarea rows={3} defaultValue={selectedSite.seo_description || ''} onBlur={e => updateSite({ seo_description: e.target.value })} placeholder="Meta description for Google" style={{ resize: 'vertical' }} />
                  </div>
                  <div className="card" style={{ padding: 20 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 8, fontFamily: 'Syne', fontWeight: 600 }}>Domain</label>
                    <input defaultValue={selectedSite.domain} onBlur={e => updateSite({ domain: e.target.value })} placeholder="yoursite.com" />
                    <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8 }}>
                      Point your domain DNS to Vercel, then add it in Vercel → Project → Domains
                    </p>
                  </div>
                  {/* Google Preview */}
                  <div className="card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'Syne', fontWeight: 600, marginBottom: 14 }}>GOOGLE PREVIEW</div>
                    <div style={{ padding: 16, background: 'var(--bg-3)', borderRadius: 10 }}>
                      <div style={{ fontSize: 12, color: '#10b981', marginBottom: 4 }}>{selectedSite.domain}</div>
                      <div style={{ fontSize: 16, color: '#4a90e2', fontWeight: 600, marginBottom: 4 }}>
                        {selectedSite.seo_title || selectedSite.name}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                        {selectedSite.seo_description || 'Add a meta description to improve your Google ranking...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
            <div style={{ textAlign: 'center' }}>
              <Globe size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
              <p style={{ fontSize: 14 }}>Select a site to edit</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Site Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-in" style={{ width: 540, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Add New Site</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 24 }}>Create a new directory site in your network</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Site Name *', key: 'name', placeholder: 'e.g. Trade Verify' },
                { label: 'Domain *', key: 'domain', placeholder: 'e.g. tradeverify.com' },
                { label: 'Tagline', key: 'tagline', placeholder: "The World's Most Trusted Trading Directory" },
                { label: 'Niche / Industry', key: 'niche', placeholder: 'e.g. Trading Companies, Import/Export' },
                { label: 'Description', key: 'description', placeholder: 'Short description of this directory site' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>{label}</label>
                  <input placeholder={placeholder} value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6, fontFamily: 'Syne', fontWeight: 600 }}>Primary Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                    style={{ width: 44, height: 44, padding: 2, borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-3)' }} />
                  <input value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setShowModal(false); resetForm() }}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={createSite}
                disabled={!form.name || !form.domain}>
                <Plus size={14} /> Create Site
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
