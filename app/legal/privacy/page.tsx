import { headers } from 'next/headers'
export const metadata = { title:'Privacy Policy', robots:'index, follow' }
export default async function PrivacyPage() {
  const hdrs = await headers()
  const host = (hdrs.get('host')||'').replace('www.','')
  const siteName = host.includes('verivex') ? 'Verivex' : host.includes('aurexhq') ? 'AurexHQ' : host.includes('nex-wire') ? 'Nex-Wire' : host.includes('finvexx') ? 'Finvexx' : 'RepHuby'
  const email = `privacy@${host||'verivex.co'}`
  const sections = [
    ['Information We Collect',`${siteName} collects information you provide directly — name, email, and review content. We also collect anonymised analytics data including pages visited, time on site, and device information.`],
    ['How We Use Your Information',`We use your data to publish reviews after moderation, send verification emails, improve our service, and prevent fraud. We never sell your personal data.`],
    ['Cookies',`We use essential cookies for site operation and optional analytics cookies. Manage preferences via our cookie banner. See Cookie Policy for details.`],
    ['Data Retention',`Review data is retained while the review is live. Verification tokens expire in 24 hours. Contact us to request deletion.`],
    ['Your Rights',`Under GDPR you have rights to access, rectify, erase, and port your data. Contact ${email} to exercise these rights.`],
    ['Security',`We use TLS encryption, access controls, and security audits. No internet transmission is fully secure but we take all reasonable precautions.`],
    ['Contact',`Privacy queries: ${email}`],
  ]
  return (
    <div style={{fontFamily:"'Inter',system-ui",maxWidth:800,margin:'0 auto',padding:'60px 24px',color:'#191919',lineHeight:1.8}}>
      <h1 style={{fontSize:32,fontWeight:900,marginBottom:8}}>Privacy Policy</h1>
      <p style={{color:'#64748B',marginBottom:40}}>Last updated: 29 May 2026 · {host}</p>
      {sections.map(([h,t],i)=><div key={i} style={{marginBottom:28}}><h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{i+1}. {h}</h2><p style={{color:'#475569'}}>{t}</p></div>)}
    </div>
  )
}
