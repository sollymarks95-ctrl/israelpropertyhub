export const metadata = { title:'Terms of Service', robots:'index, follow' }
export default function TermsPage() {
  const sections = [
    ['Acceptance','By using this service you agree to these Terms. If you disagree, please do not use the service.'],
    ['Review Content','Reviews must reflect genuine experiences. False, defamatory, or spam reviews are prohibited and will be removed. You grant us a licence to display your submitted content.'],
    ['No Financial Advice','Nothing on this platform constitutes financial or investment advice. Always verify information independently before making financial decisions.'],
    ['Accuracy','We make reasonable efforts to ensure accuracy but cannot guarantee completeness of all information including company profiles and ratings.'],
    ['Intellectual Property','All content and design is owned by or licensed to us. Reproduction without written permission is prohibited.'],
    ['Liability','To the extent permitted by law, we are not liable for indirect or consequential damages arising from use of the service.'],
    ['Governing Law','These Terms are governed by the laws of England and Wales.'],
  ]
  return (
    <div style={{fontFamily:"'Inter',system-ui",maxWidth:800,margin:'0 auto',padding:'60px 24px',color:'#191919',lineHeight:1.8}}>
      <h1 style={{fontSize:32,fontWeight:900,marginBottom:8}}>Terms of Service</h1>
      <p style={{color:'#64748B',marginBottom:40}}>Last updated: 29 May 2026</p>
      {sections.map(([h,t],i)=><div key={i} style={{marginBottom:28}}><h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{i+1}. {h}</h2><p style={{color:'#475569'}}>{t}</p></div>)}
    </div>
  )
}
