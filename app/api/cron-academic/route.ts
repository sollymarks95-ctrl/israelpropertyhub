import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic    = 'force-dynamic'
export const maxDuration = 300
const CORS = { 'Access-Control-Allow-Origin': '*' }

// ACADEMIC BACKLINK SYSTEM
// Platforms with APIs that give high-DA dofollow backlinks:
// 1. Zenodo (CERN) — DA 80 — full REST API — free — accepts working papers
// 2. OSF (Open Science Framework) — DA 75 — REST API — free
// 3. Academia.edu style formatted papers (ready for manual SSRN submission)

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Generate academic working paper from article
async function generateWorkingPaper(article: any, site: any, domain: string): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const canonical = `https://${domain}/article/${site.slug}/${article.slug}`
  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
  const year = new Date().getFullYear()

  const prompt = `Convert this financial news article into a professional academic working paper abstract and summary.

Article Title: ${article.title}
Article URL: ${canonical}
Publication: ${site.name} — ${site.tagline}
Date: ${today}

Create an academic working paper with:
1. Title (academic format, includes year e.g. "Gold Price Dynamics in ${year}: An Empirical Analysis")  
2. Abstract (150-200 words — academic tone, states research question, methodology, key findings)
3. Keywords (5-7 academic keywords)
4. Introduction (200 words — positions the article in academic literature)
5. Key Findings (bullet points formatted as research findings)
6. Policy Implications (100 words)
7. References (3-5 plausible academic references in APA format related to the topic)

The paper should cite the original publication:
${site.name} (${year}). ${article.title}. Retrieved from ${canonical}

Return ONLY valid JSON:
{
  "academic_title": "...",
  "abstract": "...", 
  "keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"],
  "introduction": "...",
  "findings": ["finding1","finding2","finding3"],
  "implications": "...",
  "references": ["ref1","ref2","ref3"]
}`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type':'application/json','x-api-key':apiKey||'','anthropic-version':'2023-06-01' },
    body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:1500, messages:[{role:'user',content:prompt}] }),
    signal: AbortSignal.timeout(30000),
  })
  const d = await r.json()
  const raw = d?.content?.[0]?.text || ''
  const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
  if (s===-1||e===-1) throw new Error('No JSON')
  return JSON.parse(raw.slice(s, e+1))
}

// Submit to Zenodo — DA 80 dofollow backlinks
async function submitToZenodo(paper: any, article: any, site: any, canonical: string, token: string): Promise<any> {
  if (!token) return { skipped: true, reason: 'No ZENODO_TOKEN — get free token at zenodo.org/account/settings/applications' }

  const year = new Date().getFullYear()

  // Step 1: Create deposition
  const createRes = await fetch('https://zenodo.org/api/deposit/depositions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata: {} }),
    signal: AbortSignal.timeout(15000),
  })
  if (!createRes.ok) return { error: `Create failed: ${createRes.status}` }
  const deposition = await createRes.json()
  const depId = deposition.id
  const bucket = deposition.links?.bucket

  // Step 2: Upload paper as text file
  const paperText = `WORKING PAPER

${paper.academic_title}

${site.name} — ${site.tagline}
${new Date().toLocaleDateString('en-US', {year:'numeric',month:'long'})}

Originally published at: ${canonical}

ABSTRACT
${paper.abstract}

KEYWORDS
${(paper.keywords||[]).join(', ')}

1. INTRODUCTION
${paper.introduction}

2. KEY FINDINGS
${(paper.findings||[]).map((f:string,i:number) => `${i+1}. ${f}`).join('\n')}

3. POLICY IMPLICATIONS
${paper.implications}

4. REFERENCES
${(paper.references||[]).join('\n')}

---
This working paper is based on analysis published at ${canonical}
© ${year} ${site.name}`

  const filename = `${article.slug}-working-paper.txt`
  const uploadRes = await fetch(`${bucket}/${filename}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'text/plain' },
    body: paperText,
    signal: AbortSignal.timeout(15000),
  })
  if (!uploadRes.ok) return { error: `Upload failed: ${uploadRes.status}` }

  // Step 3: Set metadata + related identifier (canonical backlink)
  const metadata = {
    title: paper.academic_title,
    upload_type: 'publication',
    publication_type: 'workingpaper',
    description: paper.abstract,
    creators: [{ name: `${site.name} Editorial`, affiliation: site.name }],
    keywords: paper.keywords || [],
    access_right: 'open',
    license: 'cc-by',
    publication_date: new Date().toISOString().split('T')[0],
    related_identifiers: [{
      identifier: canonical,
      relation: 'isSupplementTo',
      resource_type: 'other',
      scheme: 'url',
    }],
    journal_title: site.name,
    notes: `Originally published at ${canonical}`,
  }

  const metaRes = await fetch(`https://zenodo.org/api/deposit/depositions/${depId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata }),
    signal: AbortSignal.timeout(15000),
  })

  // Step 4: Publish
  const pubRes = await fetch(`https://zenodo.org/api/deposit/depositions/${depId}/actions/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  })

  if (!pubRes.ok) {
    // Save as draft if publish fails — still creates a backlink when published manually
    return { status: 'draft', deposition_id: depId, doi: deposition.metadata?.prereserve_doi?.doi, canonical }
  }

  const published = await pubRes.json()
  return {
    status: 'published',
    doi: published.doi,
    url: `https://zenodo.org/record/${depId}`,
    canonical,
    da: 80,
  }
}

// Submit to OSF (Open Science Framework) — DA 75
async function submitToOSF(paper: any, article: any, site: any, canonical: string, token: string): Promise<any> {
  if (!token) return { skipped: true, reason: 'No OSF_TOKEN — get free token at osf.io/settings/tokens' }

  try {
    // Create a project node
    const projRes = await fetch('https://api.osf.io/v2/nodes/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/vnd.api+json' },
      body: JSON.stringify({
        data: {
          type: 'nodes',
          attributes: {
            title: paper.academic_title,
            category: 'project',
            description: `${paper.abstract}\n\nSource: ${canonical}`,
            public: true,
          }
        }
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!projRes.ok) return { error: `OSF create failed: ${projRes.status}` }
    const proj = await projRes.json()
    const nodeId = proj.data?.id
    const nodeUrl = `https://osf.io/${nodeId}/`

    return { status: 'published', url: nodeUrl, canonical, da: 75 }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS })

  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  const report: any = { date: today, papers: [] }

  // Load API tokens
  const { data: keys } = await db.from('system_api_keys').select('key_name,key_value').eq('is_active',true)
  const km: Record<string,string> = Object.fromEntries((keys||[]).map((k:any)=>[k.key_name,k.key_value]))
  const zenodoToken = km.ZENODO_TOKEN || ''
  const osfToken    = km.OSF_TOKEN    || ''

  // Get all live indexed sites
  const { data: sites } = await db
    .from('news_sites').select('id,slug,name,tagline,domain')
    .eq('is_active',true).eq('is_live',true).eq('noindex',false)

  for (const site of (sites||[])) {
    const domain = site.domain

    // Pick today's top article not yet submitted as academic paper
    const { data: article } = await db
      .from('news_articles')
      .select('id,slug,title,body,excerpt,tags,category')
      .eq('news_site_id', site.id)
      .eq('status','published')
      .not('tags','cs','{"academic"}')
      .order('published_at',{ascending:false})
      .limit(1).single()

    if (!article) continue

    const canonical = `https://${domain}/article/${site.slug}/${article.slug}`
    const paperReport: any = { site: site.name, article: article.title, canonical }

    try {
      // Generate academic paper
      const paper = await generateWorkingPaper(article, site, domain)
      paperReport.academic_title = paper.academic_title
      paperReport.abstract_length = paper.abstract?.length

      // Submit to Zenodo (DA 80)
      paperReport.zenodo = await submitToZenodo(paper, article, site, canonical, zenodoToken)

      // Submit to OSF (DA 75)
      paperReport.osf = await submitToOSF(paper, article, site, canonical, osfToken)

      // Mark article as submitted to academic platforms
      const currentTags = article.tags || []
      if (!currentTags.includes('academic')) {
        await db.from('news_articles').update({ tags:[...currentTags,'academic'] }).eq('id',article.id)
      }

      // Save generated paper text to DB for SSRN manual submission
      await db.from('news_articles').insert({
        news_site_id:    site.id,
        title:           `[ACADEMIC] ${paper.academic_title}`,
        slug:            `academic-paper-${article.slug}-${today}`,
        excerpt:         paper.abstract?.slice(0,200),
        body:            `<p><strong>Abstract:</strong> ${paper.abstract}</p><p><strong>Keywords:</strong> ${(paper.keywords||[]).join(', ')}</p><p><strong>Source:</strong> <a href="${canonical}">${canonical}</a></p><h3>Introduction</h3><p>${paper.introduction}</p><h3>Findings</h3><ul>${(paper.findings||[]).map((f:string)=>`<li>${f}</li>`).join('')}</ul><h3>Implications</h3><p>${paper.implications}</p><hr><p><strong>Submit this to SSRN manually:</strong> <a href="https://www.ssrn.com/index.cfm/en/janda/apply/" target="_blank">ssrn.com</a></p>`,
        category:        'Research',
        tags:            [...(paper.keywords||[]).slice(0,4), 'academic-paper'],
        status:          'draft',
        article_type:    'news',
        author_name:     `${site.name} Research`,
        published_at:    new Date().toISOString(),
        read_time_minutes: 8,
        source_question: 'academic-backlink',
        ai_generated:    true,
      })

    } catch (e: any) {
      paperReport.error = e.message
    }

    report.papers.push(paperReport)
    await new Promise(r => setTimeout(r, 1500))
  }

  report.summary = {
    total: report.papers.length,
    zenodo_published: report.papers.filter((p:any)=>p.zenodo?.status==='published').length,
    osf_published: report.papers.filter((p:any)=>p.osf?.status==='published').length,
    ssrn_ready: report.papers.length,
    setup_needed: [
      !zenodoToken && 'ZENODO_TOKEN — free at zenodo.org/account/settings/applications → New token',
      !osfToken    && 'OSF_TOKEN — free at osf.io/settings/tokens → Create token',
    ].filter(Boolean),
  }

  return NextResponse.json(report, { headers: CORS })
}
