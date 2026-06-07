import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

function getDb() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'', process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'') }

const PORTAL_URLS: Record<string,string> = {
  'global-trade-wire': 'https://nex-wire.com',
  'finance-terminal':  'https://finvexx.com',
  'business-pulse':    'https://bizplezx.com',
}

function generateFAQs(client: any) {
  const name = client.company_name
  const reg = client.regulation || 'internationally regulated'
  const industry = client.industry || 'financial services'
  return [
    { q: `Is ${name} regulated?`, a: `Yes. ${name} operates under ${reg} regulation, meaning it is subject to strict financial oversight including client fund segregation, regular audits, and compliance with anti-money laundering requirements.` },
    { q: `Is ${name} safe?`, a: `${name} is considered a regulated ${industry} provider. As a ${reg}-regulated firm, it is required to maintain segregated client funds, adhere to capital adequacy requirements, and submit to regular regulatory audits.` },
    { q: `Is ${name} legitimate?`, a: `${name} is a legitimate, regulated company operating in the ${industry} space. Its regulation under ${reg} provides a legal framework and client protections that distinguish it from unregulated providers.` },
    { q: `Is ${name} a scam?`, a: `No. ${name} is a ${reg}-regulated ${industry} firm and not a scam. Regulated firms are legally obligated to maintain client funds in segregated accounts and are subject to regulatory enforcement if they fail to meet their obligations.` },
    { q: `How does ${name} work?`, a: `${name} provides ${industry} services to retail and institutional clients. Clients open an account, complete verification (KYC), deposit funds, and access the platform's services. As a regulated entity, all operations are conducted under ${reg} oversight.` },
    { q: `What are ${name} reviews saying?`, a: `Reviews of ${name} generally highlight its regulatory standing under ${reg}, its institutional-grade infrastructure, and competitive terms for professional clients. As with any regulated firm, performance and suitability vary by individual client needs.` },
    { q: `Is ${name} regulated by CySEC?`, a: `${reg.toLowerCase().includes('cysec') ? `Yes, ${name} holds a CySEC (Cyprus Securities and Exchange Commission) licence, which is an EU-recognised regulatory body. CySEC-regulated firms must comply with MiFID II regulations, maintain client fund segregation, and participate in investor compensation schemes.` : `${name} is regulated by ${reg}. Please check their official website or regulatory register for the most current licence details.`}` },
    { q: `${name} vs competitors — what's the difference?`, a: `${name} differentiates itself through its ${reg} regulatory status, which provides clients with a higher level of legal protection compared to offshore or unregulated alternatives. The firm focuses on ${industry} with an emphasis on institutional-grade execution.` },
  ]
}

export async function generateMetadata({ params }: { params: Promise<{clientSlug: string}> }): Promise<Metadata> {
  const { clientSlug } = await params
  const { data: client } = await getDb().from('portal_clients').select('*').eq('brand_slug', clientSlug).single()
  if (!client) return {}
  const name = client.company_name
  return {
    title: `${name} FAQ — Is ${name} Safe, Regulated & Legitimate?`,
    description: `Answers to the most common questions about ${name}: regulation, safety, legitimacy, reviews and more.`,
    robots: 'index, follow',
    // canonical set per-domain at render time
    openGraph: { title: `${name} FAQ`, description: `Everything you need to know about ${name}` },
  }
}

export default async function FAQPage({ params }: { params: Promise<{clientSlug: string}> }) {
  const { clientSlug } = await params
  const { data: client } = await getDb().from('portal_clients').select('*').eq('brand_slug', clientSlug).single()
  if (!client) notFound()

  const faqs = generateFAQs(client)
  const name = client.company_name

  // Get related articles mentioning this client across all portals
  const { data: articles } = await getDb().from('news_articles')
    .select('title, slug, news_site_id')
    .ilike('body', `%${name}%`)
    .eq('status', 'published')
    .limit(12)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: client.website_url || 'https://www.etoro.com',
    description: `${name} is a ${client.regulation || 'regulated'} ${client.industry || 'financial services'} company.`,
    knowsAbout: ['Forex Trading', 'Regulated Brokerage', client.industry].filter(Boolean),
  }

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'40px 20px', fontFamily:'Georgia,serif', color:'#1a1a1a' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      {/* Hidden from nav but indexable — minimal styling intentional */}
      <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8, fontFamily:'sans-serif' }}>{name} — Frequently Asked Questions</h1>
      <p style={{ color:'#64748b', marginBottom:32, fontSize:14 }}>Common questions about {name}'s regulation, safety, and legitimacy</p>

      <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom:'1px solid #e5e7eb', padding:'24px 0' }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:10, fontFamily:'sans-serif', color:'#111' }}>{faq.q}</h2>
            <p style={{ lineHeight:1.8, color:'#374151', fontSize:16 }}>{faq.a}</p>
          </div>
        ))}
      </div>

      {articles && articles.length > 0 && (
        <div style={{ marginTop:48, padding:24, background:'#f8fafc', borderRadius:8 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16, fontFamily:'sans-serif' }}>Related Coverage of {name}</h2>
          <ul style={{ listStyle:'none', padding:0, display:'flex', flexDirection:'column', gap:8 }}>
            {articles.slice(0,6).map((a:any) => (
              <li key={a.slug}>
                <a href={`/article/${a.news_site_id}/${a.slug}`} style={{ color:'#0EA5E9', fontSize:14 }}>{a.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
