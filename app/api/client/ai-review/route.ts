import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

const OUR_DOMAINS = ['nex-wire.com','finvexx.com','bizplezx.com','aurexhq.com','verivex.co','invexhuby.com','signalixx.com','execvex.com','cryptoxos.com']

function getDomain(url: string) { try { return new URL(url).hostname.replace('www.','') } catch { return url } }
function isOurs(url: string) { const d = getDomain(url); return OUR_DOMAINS.some(o => d===o || d.endsWith('.'+o)) }
function extractURLs(text: string) {
  const urls: string[] = []
  for (const re of [/\[.*?\]\((https?:\/\/[^\s)]+)\)/g, /https?:\/\/[^\s)"'<>,\]]+/g])
    for (const m of text.matchAll(re)) { const u=m[1]||m[0]; try { new URL(u); if(!urls.includes(u)) urls.push(u) } catch {} }
  return urls
}

// Get API keys from env vars OR Supabase settings table
let _cachedKeys: any = null
async function getKeys() {
  if (_cachedKeys) return _cachedKeys
  const keys = {
    anthropic:  process.env.ANTHROPIC_API_KEY || '',
    openai:     process.env.OPENAI_API_KEY || '',
    perplexity: process.env.PERPLEXITY_API_KEY || '',
    gemini:     process.env.GEMINI_API_KEY || '',
  }
  // If any are missing, fetch from Supabase settings table
  if (!keys.openai || !keys.perplexity || !keys.gemini) {
    try {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data } = await sb.from('api_keys').select('name, value')
      if (data) {
        for (const row of data) {
          if (row.name === 'OPENAI_API_KEY' && !keys.openai) keys.openai = row.value
          if (row.name === 'PERPLEXITY_API_KEY' && !keys.perplexity) keys.perplexity = row.value
          if (row.name === 'GEMINI_API_KEY' && !keys.gemini) keys.gemini = row.value
        }
      }
    } catch {}
  }
  _cachedKeys = keys
  return keys
}

async function askClaude(q: string, apiKey: string) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST', signal:AbortSignal.timeout(55000),
    headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1500, tools:[{type:'web_search_20250305',name:'web_search'}], messages:[{role:'user',content:q}] })
  })
  if (!r.ok) throw new Error(`Claude ${r.status}`)
  const data = await r.json()
  const answer = (data.content||[]).filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('\n').trim()
  const citations = extractURLs(answer)
  const ourCitations = citations.filter(isOurs)
  return { answer, citations, ourCitations, mentionsClient:/etoro/i.test(answer), mentionsOurPortals:ourCitations.length>0 }
}

async function askPerplexity(q: string, apiKey: string) {
  const r = await fetch('https://api.perplexity.ai/chat/completions', {
    method:'POST', signal:AbortSignal.timeout(30000),
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify({ model:'sonar', messages:[{role:'system',content:'Be precise. Always cite sources.'},{role:'user',content:q}], return_citations:true, search_recency_filter:'month' })
  })
  if (!r.ok) throw new Error(`Perplexity ${r.status}: ${await r.text().then(t=>t.slice(0,100))}`)
  const data = await r.json()
  const answer: string = data.choices?.[0]?.message?.content || ''
  const citations: string[] = data.citations || []
  const ourCitations = citations.filter(isOurs)
  return { answer, citations, ourCitations, mentionsClient:/etoro/i.test(answer), mentionsOurPortals:ourCitations.length>0 }
}

async function askChatGPT(q: string, apiKey: string) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST', signal:AbortSignal.timeout(40000),
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify({ model:'gpt-4o-search-preview', web_search_options:{search_context_size:'medium'}, messages:[{role:'user',content:q}] })
  })
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text().then(t=>t.slice(0,200))}`)
  const data = await r.json()
  const answer: string = data.choices?.[0]?.message?.content || ''
  const annotations: any[] = data.choices?.[0]?.message?.annotations || []
  const citationUrls = annotations.filter((a:any)=>a.type==='url_citation').map((a:any)=>a.url_citation?.url).filter(Boolean)
  const all = [...new Set([...citationUrls, ...extractURLs(answer)])]
  const ourCitations = all.filter(isOurs)
  return { answer, citations:all, ourCitations, mentionsClient:/etoro/i.test(answer), mentionsOurPortals:ourCitations.length>0 }
}

async function askGemini(q: string, apiKey: string) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method:'POST', signal:AbortSignal.timeout(30000),
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ contents:[{role:'user',parts:[{text:q}]}], tools:[{google_search:{}}], generationConfig:{maxOutputTokens:1024} })
  })
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text().then(t=>t.slice(0,100))}`)
  const data = await r.json()
  const answer = data.candidates?.[0]?.content?.parts?.filter((p:any)=>p.text).map((p:any)=>p.text).join('\n') || ''
  const citations: string[] = (data.candidates?.[0]?.groundingMetadata?.groundingChunks||[]).map((c:any)=>c.web?.uri).filter(Boolean)
  const ourCitations = citations.filter(isOurs)
  return { answer, citations, ourCitations, mentionsClient:/etoro/i.test(answer), mentionsOurPortals:ourCitations.length>0 }
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()
    if (!question?.trim()) return NextResponse.json({ error:'question required' }, { status:400 })

    const K = await getKeys()

    const engines = [
      { id:'claude',     name:'Claude (Anthropic)', icon:'🟠', fn:()=>askClaude(question, K.anthropic) },
      { id:'perplexity', name:'Perplexity AI',       icon:'🔵', fn:()=>askPerplexity(question, K.perplexity) },
      { id:'chatgpt',    name:'ChatGPT (OpenAI)',    icon:'🟢', fn:()=>askChatGPT(question, K.openai) },
      { id:'gemini',     name:'Gemini (Google)',     icon:'🔷', fn:()=>askGemini(question, K.gemini) },
    ]

    const settled = await Promise.allSettled(engines.map(e=>e.fn()))
    const results = engines.map((e, i) => {
      const r = settled[i]
      if (r.status==='fulfilled') return { engine:e.id, name:e.name, icon:e.icon, real:true, ...r.value, checkedAt:new Date().toISOString() }
      return { engine:e.id, name:e.name, icon:e.icon, real:true, error:r.reason?.message||'Error', citations:[], ourCitations:[], mentionsClient:false, mentionsOurPortals:false }
    })

    const ok = results.filter(r=>!r.error)
    return NextResponse.json({
      question, results,
      summary:{ enginesChecked:ok.length, mentionClient:ok.filter(r=>r.mentionsClient).length, mentionRate:ok.length?Math.round(ok.filter(r=>r.mentionsClient).length/ok.length*100):0, ourPortalsCited:ok.flatMap(r=>r.ourCitations||[]).length, portalEngines:ok.filter(r=>r.mentionsOurPortals).length, totalCitations:ok.flatMap(r=>r.citations||[]).length },
      checkedAt:new Date().toISOString(),
    })
  } catch(e:any) { return NextResponse.json({ error:e.message }, { status:500 }) }
}

export async function GET() {
  const K = await getKeys()
  return NextResponse.json({ keys:{ anthropic:!!K.anthropic, perplexity:!!K.perplexity, openai:!!K.openai, gemini:!!K.gemini } })
}
