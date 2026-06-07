export const metadata = { title:'Cookie Policy', robots:'index, follow' }
export default function CookiesPage() {
  const sections = [
    ['What Are Cookies','Cookies are small files stored on your device. They help the site function and understand usage patterns.'],
    ['Essential Cookies','Required for the site to operate — session, security. Cannot be disabled.'],
    ['Analytics Cookies','Anonymised analytics (pages visited, time on site, device). No personally identifiable information collected.'],
    ['Preference Cookies','Remember your settings such as cookie consent choices.'],
    ['Third-Party Cookies','Embedded content such as company logos may set cookies from third parties. We do not control these.'],
    ['Managing Cookies','Use our consent banner on first visit or your browser settings. Disabling cookies may affect functionality.'],
  ]
  return (
    <div style={{fontFamily:"'Inter',system-ui",maxWidth:800,margin:'0 auto',padding:'60px 24px',color:'#191919',lineHeight:1.8}}>
      <h1 style={{fontSize:32,fontWeight:900,marginBottom:8}}>Cookie Policy</h1>
      <p style={{color:'#64748B',marginBottom:40}}>Last updated: 29 May 2026</p>
      {sections.map(([h,t],i)=><div key={i} style={{marginBottom:28}}><h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{i+1}. {h}</h2><p style={{color:'#475569'}}>{t}</p></div>)}
    </div>
  )
}
