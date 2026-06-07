'use client'
import React, { useState, useEffect, useRef } from 'react'

// CONFIRMED WORKING avatar IDs on this HeyGen account (verified June 2026)
const AVATARS = [
  { id: 'Tyler-insuit-20220721',   label: 'Tyler',  desc: 'Male · Business suit',    emoji: '👨‍💼' },
  { id: 'Anna_public_3_20240108',  label: 'Anna',   desc: 'Female · Professional',   emoji: '👩‍💼' },
]

const BACKGROUNDS = [
  { id: 'dark_studio',    label: 'Dark Studio',    emoji: '🎙' },
  { id: 'podcast_room',   label: 'Podcast Room',   emoji: '🎚' },
  { id: 'broadcast_desk', label: 'Broadcast Desk', emoji: '📡' },
  { id: 'blue_office',    label: 'Blue Office',    emoji: '🏢' },
  { id: 'dark_bokeh',     label: 'Dark Bokeh',     emoji: '✨' },
]

const G = '#10B981'

export default function VideoStudio({ allPodcasts }: { allPodcasts: any[] }) {
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null)
  const [hostAvatarId,    setHostAvatarId]    = useState('Tyler-insuit-20220721')
  const [guestAvatarId,   setGuestAvatarId]   = useState('Anna_public_3_20240108')
  const [studioBg,        setStudioBg]        = useState('dark_studio')
  const [generating,      setGenerating]      = useState(false)
  const [currentJob,      setCurrentJob]      = useState<any>(null)
  const [lastResult,      setLastResult]      = useState<any>(null)
  const [videos,          setVideos]          = useState<any[]>([])
  const [loadingVideos,   setLoadingVideos]   = useState(false)
  const [previewId,       setPreviewId]       = useState<string|null>(null)
  const pollRef = useRef<any>(null)

  useEffect(() => { loadVideos() }, [])

  // Poll every 6s when a job is active
  useEffect(() => {
    if (!currentJob?.id || currentJob.done) return
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/admin/video-status?job_id=${currentJob.id}`)
        if (!res.ok) return
        const data = await res.json()
        setCurrentJob(data)
        if (data.done) { clearInterval(pollRef.current); loadVideos() }
      } catch {}
    }, 6000)
    return () => clearInterval(pollRef.current)
  }, [currentJob?.id, currentJob?.done])

  async function loadVideos() {
    setLoadingVideos(true)
    try {
      const res = await fetch('/api/admin/list-videos')
      if (res.ok) { const d = await res.json(); setVideos(d.videos || []) }
    } catch {}
    setLoadingVideos(false)
  }

  async function handleGenerate() {
    if (!selectedEpisode) return alert('Pick an episode first')
    if (!selectedEpisode.audio_url) return alert('This episode has no audio yet — generate audio first from the Podcasts tab')
    setGenerating(true); setCurrentJob(null); setLastResult(null)
    try {
      const res = await fetch('/api/admin/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode_id:      selectedEpisode.id,
          studio_bg:       studioBg,
          host_avatar_id:  hostAvatarId,
          guest_avatar_id: guestAvatarId,
        }),
      })
      const data = await res.json()
      if (data.error) { alert(`Error: ${data.error}`); setGenerating(false); return }
      setLastResult(data)
      setCurrentJob({ id: data.video_job_id, status: 'rendering', progress_pct: 15, done: false,
        current_step: 'Step 1/2: HeyGen rendering talking heads (5–15 min)…', pipeline_phase: 'heygen_render' })
    } catch (e: any) { alert(`Error: ${e.message}`) }
    setGenerating(false)
  }

  const withAudio = allPodcasts.filter((p: any) => p.audio_url)
  const pct       = currentJob?.progress_pct || 10

  // Phase indicators
  const phase = currentJob?.pipeline_phase || ''
  const phases = [
    { key: 'heygen_render', label: 'HeyGen Render',       done: ['shotstack','complete'].includes(phase), active: phase==='heygen_render' },
    { key: 'shotstack',     label: 'Shotstack Composite', done: ['complete'].includes(phase),              active: phase==='shotstack' },
    { key: 'complete',      label: 'Done',                done: phase==='complete' || currentJob?.status==='ready', active: false },
  ]

  const card = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:20, marginBottom:16 }

  return (
    <div style={{ padding:24 }}>
      <div style={{ fontSize:18, fontWeight:800, color:'#F1F5F9', marginBottom:4 }}>🎬 AI Video Studio</div>
      <div style={{ fontSize:12, color:'#475569', marginBottom:24 }}>
        HeyGen talking heads → Shotstack 3-camera broadcast composite · 9:16 for Reels/TikTok
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

        {/* LEFT: Configure */}
        <div>

          {/* Episode selector */}
          <div style={card}>
            <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8', marginBottom:10 }}>📻 SELECT EPISODE</div>
            {withAudio.length === 0
              ? <div style={{ fontSize:12, color:'#64748b' }}>No episodes with audio. Go to Podcasts tab → Generate Audio first.</div>
              : (
                <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:220, overflowY:'auto' }}>
                  {withAudio.map((ep: any) => (
                    <button key={ep.id} onClick={() => setSelectedEpisode(ep)}
                      style={{ textAlign:'left', padding:'10px 14px', borderRadius:8, cursor:'pointer', border:'none',
                        background: selectedEpisode?.id===ep.id ? `${G}22` : 'rgba(255,255,255,0.03)',
                        borderLeft: `3px solid ${selectedEpisode?.id===ep.id ? G : 'transparent'}` }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#F1F5F9', marginBottom:2 }}>
                        {ep.title || `Episode ${ep.episode_number}`}
                      </div>
                      <div style={{ fontSize:10, color:'#64748b' }}>
                        {ep.site_slug} · {ep.duration_minutes||5} min · 🎙 audio ready
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>

          {/* Avatar picker */}
          <div style={card}>
            <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8', marginBottom:10 }}>👥 AVATARS (verified working)</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {(['host','guest'] as const).map(role => {
                const val = role==='host' ? hostAvatarId : guestAvatarId
                const set = role==='host' ? setHostAvatarId : setGuestAvatarId
                return (
                  <div key={role}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase' }}>
                      {role==='host' ? '🎙 HOST (CAM 1)' : '🎤 GUEST (CAM 2)'}
                    </div>
                    {AVATARS.map(av => (
                      <button key={av.id} onClick={() => set(av.id)}
                        style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 10px', marginBottom:5,
                          borderRadius:7, cursor:'pointer', border:'none',
                          background: val===av.id ? `${G}22` : 'rgba(255,255,255,0.03)',
                          outline: val===av.id ? `1px solid ${G}` : '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize:14 }}>{av.emoji}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:'#F1F5F9', marginLeft:6 }}>{av.label}</span>
                        <div style={{ fontSize:10, color:'#64748b', marginLeft:24 }}>{av.desc}</div>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
            {hostAvatarId === guestAvatarId && (
              <div style={{ fontSize:10, color:'#F59E0B', marginTop:8, padding:'6px 10px', background:'rgba(245,158,11,0.1)', borderRadius:6 }}>
                ⚠ Same avatar for host + guest — they'll look identical. Consider different avatars.
              </div>
            )}
          </div>

          {/* Background */}
          <div style={card}>
            <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8', marginBottom:10 }}>🖼 STUDIO BACKGROUND</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {BACKGROUNDS.map(bg => (
                <button key={bg.id} onClick={() => setStudioBg(bg.id)}
                  style={{ padding:'6px 12px', borderRadius:7, cursor:'pointer', border:'none', fontSize:12,
                    background: studioBg===bg.id ? `${G}22` : 'rgba(255,255,255,0.04)',
                    outline: studioBg===bg.id ? `1px solid ${G}` : '1px solid rgba(255,255,255,0.06)',
                    color: studioBg===bg.id ? G : '#94A3B8' }}>
                  {bg.emoji} {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button onClick={handleGenerate} disabled={generating || !selectedEpisode}
            style={{ width:'100%', padding:'14px', borderRadius:10, border:'none', cursor: (generating||!selectedEpisode)?'not-allowed':'pointer',
              fontWeight:800, fontSize:14, color:'#fff',
              background: (generating||!selectedEpisode) ? '#1e293b' : `linear-gradient(135deg, ${G}, #0EA5E9)`,
              opacity: !selectedEpisode ? 0.5 : 1 }}>
            {generating ? '⏳ Submitting to HeyGen…' : '🎬 Generate Podcast Video'}
          </button>

          {/* HeyGen Video Podcast shortcut */}
          <div style={{...card, borderColor:`${G}33`, marginTop:8}}>
            <div style={{fontSize:12,fontWeight:800,color:'#94A3B8',marginBottom:8}}>
              🎙 HEYGEN VIDEO PODCAST (1-CLICK)
            </div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:10,lineHeight:1.5}}>
              Skip the pipeline — upload your script PDF directly to HeyGen and get a polished 2-avatar video podcast in minutes.
            </div>
            {selectedEpisode ? (
              <div style={{display:'flex',gap:8}}>
                <button
                  onClick={() => window.open(`/api/admin/podcast-pdf?id=${selectedEpisode.id}`, '_blank')}
                  style={{flex:1,padding:'9px',borderRadius:7,border:`1px solid ${G}`,background:`${G}18`,color:G,fontWeight:700,fontSize:12,cursor:'pointer'}}>
                  📄 Download Script PDF
                </button>
                <button
                  onClick={() => window.open('https://labs.heygen.com/video-podcast', '_blank')}
                  style={{flex:1,padding:'9px',borderRadius:7,border:'1px solid #64748b',background:'rgba(255,255,255,0.04)',color:'#94A3B8',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                  🚀 Open HeyGen →
                </button>
              </div>
            ) : (
              <div style={{fontSize:11,color:'#475569'}}>← Select an episode above first</div>
            )}
          </div>

          {!selectedEpisode && (
            <div style={{ fontSize:11, color:'#475569', textAlign:'center', marginTop:8 }}>
              Select an episode with audio to enable
            </div>
          )}
        </div>

        {/* RIGHT: Status + library */}
        <div>

          {/* Active job progress */}
          {currentJob && (
            <div style={{ ...card, borderColor: currentJob.status==='failed' ? '#EF444444' : `${G}44` }}>
              <div style={{ fontSize:13, fontWeight:800, color:'#F1F5F9', marginBottom:12 }}>
                {currentJob.status==='ready' ? '✅ Video Ready!' : currentJob.status==='failed' ? '❌ Failed' : '⏳ Rendering…'}
              </div>

              {/* Phase indicators */}
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {phases.map((p, i) => (
                  <div key={p.key} style={{ display:'flex', alignItems:'center', gap:4, flex:1 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900, flexShrink:0,
                      background: p.done ? G : p.active ? '#F59E0B' : 'rgba(255,255,255,0.08)',
                      color: p.done||p.active ? '#fff' : '#64748b' }}>
                      {p.done ? '✓' : i+1}
                    </div>
                    <div style={{ fontSize:10, color: p.done ? G : p.active ? '#F59E0B' : '#64748b', lineHeight:1.2 }}>{p.label}</div>
                    {i<phases.length-1 && <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)', margin:'0 4px' }}/>}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden', marginBottom:10 }}>
                <div style={{ height:'100%', width:`${pct}%`, borderRadius:3, transition:'width 2s',
                  background: currentJob.status==='failed' ? '#EF4444' : `linear-gradient(90deg,${G},#0EA5E9)` }} />
              </div>

              <div style={{ fontSize:11, color:'#94A3B8', marginBottom:8 }}>
                {currentJob.current_step || `Rendering… ${pct}%`}
              </div>

              {currentJob.status==='failed' && (
                <div style={{ fontSize:11, color:'#EF4444', background:'rgba(239,68,68,0.1)', padding:'8px 12px', borderRadius:6 }}>
                  {currentJob.current_step}
                </div>
              )}

              {currentJob.status==='ready' && currentJob.video_916_url && (
                <div style={{ marginTop:12 }}>
                  <video src={currentJob.video_916_url} controls style={{ width:'100%', borderRadius:8, maxHeight:300 }} />
                  <a href={currentJob.video_916_url} download>
                    <button style={{ marginTop:8, width:'100%', padding:'8px', borderRadius:7, background:`${G}22`, border:`1px solid ${G}44`, color:G, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      ⬇ Download 9:16
                    </button>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Previous videos */}
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#94A3B8' }}>📚 VIDEO LIBRARY</div>
              <button onClick={loadVideos} style={{ fontSize:10, color:'#64748b', background:'none', border:'none', cursor:'pointer' }}>↻ Refresh</button>
            </div>

            {loadingVideos
              ? <div style={{ fontSize:12, color:'#64748b' }}>Loading…</div>
              : videos.length === 0
                ? <div style={{ fontSize:12, color:'#64748b' }}>No videos yet. Generate your first one!</div>
                : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:500, overflowY:'auto' }}>
                    {videos.map((v: any) => {
                      const hasVideo = v.video_916_url || v.video_169_url
                      const statusColor = v.status==='ready' ? G : v.status==='failed' ? '#EF4444' : '#F59E0B'
                      return (
                        <div key={v.id} style={{ padding:'12px 14px', borderRadius:8, background:'rgba(255,255,255,0.02)', border:`1px solid rgba(255,255,255,0.06)` }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:700, color:'#F1F5F9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {v.episode_title || 'Podcast Video'}
                              </div>
                              <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>
                                {v.site_slug} · {new Date(v.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <span style={{ fontSize:9, padding:'2px 8px', borderRadius:99, fontWeight:700, flexShrink:0, marginLeft:8,
                              background:`${statusColor}22`, color:statusColor }}>
                              {v.status}
                            </span>
                          </div>

                          {v.status === 'rendering' && (
                            <>
                              <div style={{ fontSize:10, color:'#94A3B8', marginBottom:6 }}>{v.current_step}</div>
                              <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                                <div style={{ height:'100%', width:`${v.progress_pct||10}%`, background:G, transition:'width 1s' }} />
                              </div>
                            </>
                          )}

                          {hasVideo && (
                            <div style={{ marginTop:8 }}>
                              {previewId === v.id ? (
                                <div>
                                  <video src={v.video_916_url || v.video_169_url} controls autoPlay
                                    style={{ width:'100%', borderRadius:6, maxHeight:280 }} />
                                  <button onClick={() => setPreviewId(null)}
                                    style={{ width:'100%', marginTop:4, padding:'5px', borderRadius:6, background:'rgba(255,255,255,0.05)', border:'none', color:'#64748b', fontSize:11, cursor:'pointer' }}>
                                    ✕ Close
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display:'flex', gap:6 }}>
                                  <button onClick={() => setPreviewId(v.id)}
                                    style={{ flex:1, padding:'6px', borderRadius:6, background:`${G}22`, border:`1px solid ${G}44`, color:G, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                                    ▶ Preview
                                  </button>
                                  {v.video_916_url && (
                                    <a href={v.video_916_url} download style={{ flex:1 }}>
                                      <button style={{ width:'100%', padding:'6px', borderRadius:6, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#94A3B8', fontSize:11, cursor:'pointer' }}>
                                        ⬇ 9:16
                                      </button>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}
