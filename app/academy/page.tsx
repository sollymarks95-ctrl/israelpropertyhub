import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const metadata = { title: 'Academy | RepHuby', description: 'Financial education and professional development courses coming soon.' }

export default async function AcademyPage() {
  const { data: sites } = await supabase.from('news_sites').select('name,slug,primary_color').eq('is_live',true).limit(6)
  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', fontFamily:'sans-serif', color:'#fff', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ textAlign:'center', maxWidth:600 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🎓</div>
        <h1 style={{ fontSize:40, fontWeight:900, marginBottom:16, letterSpacing:'-1px' }}>RepHuby Academy</h1>
        <p style={{ fontSize:20, color:'#94a3b8', lineHeight:1.7, marginBottom:32 }}>
          Professional courses in commodity trading, trade finance, market analysis, and global business strategy. 
          Curriculum being developed with industry experts.
        </p>
        <div style={{ background:'#1e293b', borderRadius:12, padding:32, marginBottom:32, border:'1px solid #334155' }}>
          <div style={{ fontWeight:800, fontSize:18, marginBottom:12 }}>📧 Be First to Know</div>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:16 }}>Get notified when courses launch. Early subscribers receive 50% off.</p>
          <form action="/api/newsletter" method="POST" style={{ display:'flex', gap:8 }}>
            <input name="email" type="email" placeholder="your@email.com"
              style={{ flex:1, padding:'12px 16px', borderRadius:6, border:'none', fontSize:14, background:'#0f172a', color:'#fff', outline:'none', fontFamily:'sans-serif' }} />
            <button type="submit" style={{ background:'#3b82f6', color:'#fff', border:'none', padding:'12px 20px', borderRadius:6, fontWeight:800, fontSize:14, cursor:'pointer', whiteSpace:'nowrap' }}>
              Notify Me →
            </button>
          </form>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:32, textAlign:'left' }}>
          {[
            { icon:'📊', title:'Market Analysis', desc:'Technical and fundamental analysis for commodity and FX markets' },
            { icon:'🏦', title:'Trade Finance', desc:'Letters of credit, structured finance, and risk management' },
            { icon:'🌐', title:'Global Trade', desc:'Incoterms, customs compliance, and international regulations' },
            { icon:'💼', title:'Deal Structuring', desc:'M&A, private equity, and investment frameworks for traders' },
            { icon:'⚖️', title:'Compliance & Risk', desc:'Sanctions, AML, ESG, and regulatory frameworks' },
            { icon:'🤖', title:'AI in Trading', desc:'Using artificial intelligence and data analytics in modern trading' },
          ].map(c => (
            <div key={c.title} style={{ background:'#1e293b', borderRadius:8, padding:16, border:'1px solid #334155' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{c.title}</div>
              <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <Link href="/news/global-trade-wire">
          <button style={{ background:'transparent', color:'#94a3b8', border:'1px solid #334155', padding:'10px 24px', borderRadius:6, cursor:'pointer', fontSize:14, fontFamily:'sans-serif' }}>
            ← Back to RepHuby
          </button>
        </Link>
      </div>
    </div>
  )
}
