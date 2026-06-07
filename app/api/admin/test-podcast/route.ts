import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSiteConfig, pickGuestVoice } from '@/app/lib/podcast-config'

export const runtime = 'nodejs'
export const maxDuration = 300

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }
async function getKey(name: string) {
  if (process.env[name]) return process.env[name]!
  const { data } = await getDb().from('system_api_keys').select('key_value').eq('key_name', name).eq('is_active', true).single()
  return data?.key_value || ''
}

export async function GET() {
  const log: string[] = []
  const t0 = Date.now()
  const ms = () => `+${((Date.now()-t0)/1000).toFixed(1)}s`

  log.push(`${ms()} Starting full end-to-end podcast test`)
  const elKey = await getKey('ELEVENLABS_KEY')
  const anthKey = process.env.ANTHROPIC_API_KEY || ''
  if (!elKey) return new Response('<h1>Error: ElevenLabs key missing</h1>',{headers:{'Content-Type':'text/html'}})
  log.push(`${ms()} Keys OK — EL:${elKey.slice(0,8)} AN:${anthKey.slice(0,8)}`)

  let script = ''
  try {
    log.push(`${ms()} Calling Claude for 3-min script...`)
    const r = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':anthKey,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,messages:[{role:'user',content:'Write a 3-minute financial podcast script (approx 400 words) between HOST Marcus Webb and GUEST James Richardson CEO of eToro. Format as "HOST: ..." or "GUEST: ..." per line. Topic: regulatory credibility and institutional trust in 2026. Start immediately.'}]})
    })
    const d = await r.json()
    script = d.content?.[0]?.text || ''
    if (!script) throw new Error(d.error?.message||'Empty response')
    log.push(`${ms()} Script OK: ${script.split(' ').length} words`)
  } catch(e:any) { return html('Script Failed','',log,e.message) }

  const siteConfig = getSiteConfig('finance-terminal')
  const guestVoice = pickGuestVoice('James Richardson','male')
  const segs: {s:'host'|'guest',t:string}[] = []
  let cur: {s:'host'|'guest',t:string}|null = null
  for (const line of script.split('\n').filter(l=>l.trim())) {
    const hm=line.match(/^HOST:\s*(.+)/i), gm=line.match(/^GUEST:\s*(.+)/i)
    if (hm){if(cur)segs.push(cur);cur={s:'host',t:hm[1].trim()}}
    else if(gm){if(cur)segs.push(cur);cur={s:'guest',t:gm[1].trim()}}
    else if(cur&&line.trim()) cur.t+=' '+line.trim()
  }
  if(cur) segs.push(cur)
  log.push(`${ms()} Parsed ${segs.length} segments — Host:${siteConfig.hostName}(Arnold) Guest:${guestVoice.name}`)

  log.push(`${ms()} Calling ElevenLabs — sequential (1 at a time)...`)
  const bufs: Buffer[] = new Array(segs.length)
  const HS = {stability:0.30,similarity_boost:0.70,style:0.55,use_speaker_boost:true}
  const GS = {stability:0.25,similarity_boost:0.65,style:0.65,use_speaker_boost:true}
  try {
    for (let i=0;i<segs.length;i++) {
      const seg=segs[i]
      const vId=seg.s==='host'?siteConfig.hostVoiceId:guestVoice.id
      const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`,{
        method:'POST',headers:{'xi-api-key':elKey,'Content-Type':'application/json'},
        body:JSON.stringify({text:seg.t,model_id:'eleven_turbo_v2_5',voice_settings:seg.s==='host'?HS:GS})
      })
      if(!r.ok) throw new Error(`EL seg${i}: `+(await r.text()).slice(0,100))
      bufs[i]=Buffer.from(await r.arrayBuffer())
      log.push(`${ms()} Seg ${i+1}/${segs.length} done`)
      if(i<segs.length-1) await new Promise(res=>setTimeout(res,200))
    }
  } catch(e:any){ return html('ElevenLabs Failed','',log,e.message) }

  const combined=Buffer.concat(bufs)
  const sizeKb=Math.round(combined.length/1024)
  log.push(`${ms()} Audio combined: ${sizeKb}KB`)

  const fname=`test-e2e-${Date.now()}.mp3`
  const {error:upErr}=await getDb().storage.from('podcasts').upload(fname,combined,{contentType:'audio/mpeg',upsert:true})
  if(upErr) return html('Upload Failed','',log,upErr.message)
  const {data:ud}=getDb().storage.from('podcasts').getPublicUrl(fname)
  const audioUrl=ud.publicUrl
  log.push(`${ms()} Uploaded to Storage`)

  const {count}:any=await getDb().from('portal_podcasts').select('*',{count:'exact',head:true}).eq('client_id','a1b2c3d4-0000-0000-0000-000000000001')
  await getDb().from('portal_podcasts').insert({client_id:'a1b2c3d4-0000-0000-0000-000000000001',episode_number:(count||0)+1,title:'E2E Test — eToro CEO Interview',description:`Marcus Webb x James Richardson | Guest: ${guestVoice.name}`,duration_minutes:Math.round(combined.length/1024/128*8/60)||3,status:'published',mp3_url:audioUrl,host_name:'Marcus Webb',guest_name:'James Richardson',published_at:new Date().toISOString()})
  log.push(`${ms()} Saved to portal_podcasts DB`)
  log.push(`${ms()} COMPLETE in ${((Date.now()-t0)/1000).toFixed(1)}s`)

  return html('PASSED',audioUrl,log,'',script.slice(0,500),sizeKb,segs.length,guestVoice.name)
}

function html(status:string,audioUrl:string,log:string[],err='',scriptPreview='',kb=0,segs=0,guest=''){
  const ok=status==='PASSED'
  return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>RepHuby E2E Test</title>
<style>*{box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0B0F19;color:#F1F5F9;padding:30px;max-width:740px;margin:0 auto}
h1{color:${ok?'#10B981':'#EF4444'};font-size:28px;margin:0 0 6px}
p.sub{color:#64748b;margin:0 0 24px}
.card{background:#1C2333;border-radius:12px;padding:20px;margin:14px 0;border:1px solid rgba(255,255,255,0.08)}
audio{width:100%;margin:10px 0;border-radius:8px}
a.btn{display:inline-block;padding:8px 18px;background:rgba(14,165,233,0.15);border:1px solid rgba(14,165,233,0.3);color:#0EA5E9;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600}
a.dl{display:inline-block;padding:8px 18px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);color:#10B981;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600;margin-right:8px}
pre{background:#0B0F19;padding:14px;border-radius:8px;font-size:11.5px;line-height:1.65;overflow:auto;max-height:280px;margin:0}
.ok{color:#10B981}.err{color:#EF4444}.tag{display:inline-block;padding:2px 10px;border-radius:100px;font-size:11px;font-weight:700;background:rgba(16,185,129,0.15);color:#10B981;border:1px solid rgba(16,185,129,0.3)}
</style></head><body>
<h1>${ok?'✅':'❌'} E2E Test — ${status}</h1>
<p class="sub">Claude → ElevenLabs → Supabase Storage → DB | Full production pipeline</p>
${err?`<div class="card"><b style="color:#EF4444">Error:</b> ${err}</div>`:''}
${audioUrl?`<div class="card">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
<b>🎙 Live Audio</b>
<div><span class="tag">HOST: Marcus Webb (Arnold)</span>&nbsp;<span class="tag">GUEST: ${guest} (${guest})</span></div>
</div>
<small style="color:#64748b">${kb}KB · ${segs} segments · 3-min CEO interview</small>
<audio controls src="${audioUrl}"></audio>
<a class="dl" href="${audioUrl}" download="e2e-test.mp3">⬇ Download MP3</a>
<a class="btn" href="https://rephuby.com/portal/admin">View in Admin →</a>
</div>`:''}
${scriptPreview?`<div class="card"><b>📝 Script preview</b><pre>${scriptPreview}...</pre></div>`:''}
<div class="card"><b>📊 Pipeline log</b><pre>${log.map(l=>`<span class="${l.includes('OK')||l.includes('COMPLETE')||l.includes('done')||l.includes('Uploaded')||l.includes('Saved')||l.includes('Keys')?'ok':l.includes('Failed')||l.includes('error')?'err':''}">${l}</span>`).join('\n')}</pre></div>
</body></html>`,{headers:{'Content-Type':'text/html','Cache-Control':'no-cache'}})
}
