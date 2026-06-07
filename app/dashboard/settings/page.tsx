'use client'
import { useState } from 'react'
import TopBar from '@/components/TopBar'
import { CheckCircle, ExternalLink, Eye, EyeOff, Save, Zap } from 'lucide-react'

type ApiKey = {
  key: string
  label: string
  description: string
  docsUrl: string
  getKeyUrl: string
  envVar: string
  category: string
  required: boolean
}

const API_CONFIGS: ApiKey[] = [
  // AI
  {
    key: 'anthropic', label: 'Anthropic Claude', category: 'AI Engine',
    description: 'Powers all AI content generation — articles, responses, scripts, SEO copy',
    docsUrl: 'https://docs.anthropic.com', getKeyUrl: 'https://console.anthropic.com/settings/keys',
    envVar: 'ANTHROPIC_API_KEY', required: true
  },
  {
    key: 'elevenlabs', label: 'ElevenLabs', category: 'AI Engine',
    description: 'AI voiceovers for YouTube videos and audio content',
    docsUrl: 'https://docs.elevenlabs.io', getKeyUrl: 'https://elevenlabs.io/app/settings/api-keys',
    envVar: 'ELEVENLABS_API_KEY', required: true
  },
  // Reviews
  {
    key: 'outscraper', label: 'Outscraper', category: 'Review Management',
    description: 'Scrapes reviews from Google, Trustpilot, Facebook, Yelp in real-time',
    docsUrl: 'https://outscraper.com/api-documentation', getKeyUrl: 'https://app.outscraper.com/api-key',
    envVar: 'OUTSCRAPER_API_KEY', required: true
  },
  {
    key: 'brightlocal', label: 'BrightLocal', category: 'Review Management',
    description: 'Submits client profiles to 50+ business directories automatically',
    docsUrl: 'https://brightlocal.com/api', getKeyUrl: 'https://tools.brightlocal.com/seo-tools/api',
    envVar: 'BRIGHTLOCAL_API_KEY', required: false
  },
  // Content & SEO
  {
    key: 'dataforseo', label: 'DataForSEO', category: 'SEO & Rankings',
    description: 'Tracks Google rankings for client keywords, monitors Page 1 positions',
    docsUrl: 'https://docs.dataforseo.com', getKeyUrl: 'https://app.dataforseo.com/register',
    envVar: 'DATAFORSEO_LOGIN', required: true
  },
  {
    key: 'newsapi', label: 'NewsAPI', category: 'Live Data',
    description: 'Pulls live news per company/industry to keep profiles and sites fresh',
    docsUrl: 'https://newsapi.org/docs', getKeyUrl: 'https://newsapi.org/register',
    envVar: 'NEWSAPI_KEY', required: true
  },
  {
    key: 'deepl', label: 'DeepL', category: 'Live Data',
    description: 'Translates all content for global sites into 30+ languages',
    docsUrl: 'https://developers.deepl.com', getKeyUrl: 'https://www.deepl.com/pro-api',
    envVar: 'DEEPL_API_KEY', required: false
  },
  // Video
  {
    key: 'youtube', label: 'YouTube Data API', category: 'YouTube Engine',
    description: 'Uploads videos, manages channels, tracks performance per client',
    docsUrl: 'https://developers.google.com/youtube/v3', getKeyUrl: 'https://console.cloud.google.com/apis/credentials',
    envVar: 'YOUTUBE_API_KEY', required: true
  },
  // Campaigns
  {
    key: 'twilio', label: 'Twilio (SMS)', category: 'Review Campaigns',
    description: 'Sends SMS review request campaigns to client customer lists',
    docsUrl: 'https://www.twilio.com/docs', getKeyUrl: 'https://console.twilio.com',
    envVar: 'TWILIO_ACCOUNT_SID', required: false
  },
  {
    key: 'whatsapp', label: 'WhatsApp (360dialog)', category: 'Review Campaigns',
    description: 'Sends WhatsApp review requests — higher open rates than SMS',
    docsUrl: 'https://docs.360dialog.com', getKeyUrl: 'https://hub.360dialog.com',
    envVar: 'WHATSAPP_API_KEY', required: false
  },
  // Email
  {
    key: 'sendgrid', label: 'SendGrid', category: 'Review Campaigns',
    description: 'Email campaigns for review requests and client monthly reports',
    docsUrl: 'https://docs.sendgrid.com', getKeyUrl: 'https://app.sendgrid.com/settings/api_keys',
    envVar: 'SENDGRID_API_KEY', required: false
  },
]

const CATEGORIES = [...new Set(API_CONFIGS.map(a => a.category))]
const categoryColors: Record<string, string> = {
  'AI Engine': 'var(--accent)',
  'Review Management': 'var(--green)',
  'SEO & Rankings': 'var(--purple)',
  'Live Data': 'var(--yellow)',
  'YouTube Engine': '#ef4444',
  'Review Campaigns': '#f59e0b',
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [activeCategory, setActiveCategory] = useState('All')

  function handleSave(envVar: string, apiKey: string) {
    // In production: this would call your API route to save to Vercel env vars
    setSaved(s => ({ ...s, [envVar]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [envVar]: false })), 2000)
  }

  const filtered = activeCategory === 'All'
    ? API_CONFIGS
    : API_CONFIGS.filter(a => a.category === activeCategory)

  const connectedCount = API_CONFIGS.filter(a => keys[a.envVar]?.length > 0).length

  return (
    <div>
      <TopBar
        title="API Connections"
        subtitle={`${connectedCount}/${API_CONFIGS.length} APIs connected`}
      />
      <div style={{ padding: 28 }}>

        {/* Status bar */}
        <div className="card" style={{ padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'rgba(59,130,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={20} color="var(--accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
              API Engine Status
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${(connectedCount / API_CONFIGS.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--green))',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: 'var(--accent)' }}>
            {connectedCount}/{API_CONFIGS.length}
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: 20,
                border: `1px solid ${activeCategory === cat ? categoryColors[cat] || 'var(--accent)' : 'var(--border)'}`,
                background: activeCategory === cat ? `${categoryColors[cat] || 'var(--accent)'}18` : 'transparent',
                color: activeCategory === cat ? (categoryColors[cat] || 'var(--accent)') : 'var(--text-2)',
                fontFamily: 'Syne', fontWeight: 600, fontSize: 12,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* API Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(api => {
            const hasKey = keys[api.envVar]?.length > 0
            const isVisible = visible[api.envVar]
            const wasSaved = saved[api.envVar]
            const color = categoryColors[api.category] || 'var(--accent)'

            return (
              <div key={api.key} className="card" style={{
                padding: 20,
                borderColor: hasKey ? `${color}40` : undefined
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Status dot */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0, marginTop: 2,
                    background: hasKey ? `${color}18` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${hasKey ? color + '40' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: hasKey ? color : 'var(--border)',
                      boxShadow: hasKey ? `0 0 8px ${color}` : 'none'
                    }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>{api.label}</span>
                      <span style={{
                        fontSize: 10, fontFamily: 'Syne', fontWeight: 700,
                        padding: '2px 7px', borderRadius: 4,
                        background: `${color}18`, color,
                        letterSpacing: '0.04em'
                      }}>
                        {api.category.toUpperCase()}
                      </span>
                      {api.required && (
                        <span style={{
                          fontSize: 10, color: '#ef4444', fontFamily: 'Syne', fontWeight: 700,
                          background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4
                        }}>
                          REQUIRED
                        </span>
                      )}
                      {hasKey && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--green)', fontFamily: 'Syne', fontWeight: 600 }}>
                          <CheckCircle size={11} /> Connected
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.5 }}>
                      {api.description}
                    </p>

                    {/* Key input */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type={isVisible ? 'text' : 'password'}
                          placeholder={`Enter ${api.envVar}`}
                          value={keys[api.envVar] || ''}
                          onChange={e => setKeys(k => ({ ...k, [api.envVar]: e.target.value }))}
                          style={{ paddingRight: 40, fontFamily: 'monospace', fontSize: 13 }}
                        />
                        <button
                          onClick={() => setVisible(v => ({ ...v, [api.envVar]: !v[api.envVar] }))}
                          style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)'
                          }}
                        >
                          {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <button
                        className={wasSaved ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}
                        onClick={() => handleSave(api.envVar, keys[api.envVar] || '')}
                        disabled={!keys[api.envVar]}
                      >
                        {wasSaved ? <><CheckCircle size={13} /> Saved!</> : <><Save size={13} /> Save</>}
                      </button>
                      <a href={api.getKeyUrl} target="_blank" rel="noreferrer"
                        className="btn-ghost"
                        style={{ padding: '10px 14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ExternalLink size={13} /> Get Key
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* How to add to Vercel */}
        <div className="card" style={{ marginTop: 28, padding: 24, borderColor: 'rgba(59,130,246,0.3)' }}>
          <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 12, color: 'var(--accent)' }}>
            ⚡ How to activate API keys
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>
            Add each key to Vercel so it's available across the whole platform:
          </p>
          <div style={{ background: 'var(--bg-3)', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-2)', lineHeight: 2 }}>
            <div><span style={{ color: 'var(--accent)' }}>1.</span> vercel.com → reputationhub → Settings → Environment Variables</div>
            <div><span style={{ color: 'var(--accent)' }}>2.</span> Add each key name + value → Save</div>
            <div><span style={{ color: 'var(--accent)' }}>3.</span> Redeploy → all APIs active immediately</div>
          </div>
        </div>
      </div>
    </div>
  )
}
