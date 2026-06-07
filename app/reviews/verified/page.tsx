'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function Content() {
  const p = useSearchParams()
  const status = p.get('status'), company = p.get('company')||'etoro'
  const cfg = status==='success'
    ? {icon:'✅',title:'Review Verified!',color:'#00B67A',msg:'Your review has been verified and submitted for moderation. It will appear within 24 hours once our team approves it.',cta:'View Reviews',href:`/reviews/${company}`}
    : status==='expired'
    ? {icon:'⏰',title:'Link Expired',color:'#F59E0B',msg:'This link has expired or already been used. Please submit your review again.',cta:'Write Again',href:`/reviews/${company}`}
    : {icon:'❌',title:'Invalid Link',color:'#EF4444',msg:'This link is not valid. Please submit your review again.',cta:'Write Review',href:`/reviews/${company}`}
  return (
    <div style={{fontFamily:"'Inter',system-ui",minHeight:'100vh',background:'#F4F6F8',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{background:'#fff',border:'1px solid #E2E8F0',borderRadius:16,padding:48,maxWidth:460,width:'100%',textAlign:'center'}}>
        <a href="/" style={{fontWeight:900,fontSize:20,color:'#191919',textDecoration:'none',display:'block',marginBottom:28}}>VERI<span style={{color:'#00B67A'}}>VEX</span></a>
        <div style={{fontSize:52,marginBottom:12}}>{cfg.icon}</div>
        <h1 style={{fontSize:22,fontWeight:800,color:cfg.color,marginBottom:12}}>{cfg.title}</h1>
        <p style={{fontSize:14,color:'#64748B',lineHeight:1.7,marginBottom:24}}>{cfg.msg}</p>
        <a href={cfg.href} style={{display:'inline-block',background:'#00B67A',color:'#fff',padding:'12px 24px',borderRadius:8,fontWeight:700,fontSize:14,textDecoration:'none'}}>{cfg.cta}</a>
      </div>
    </div>
  )
}

export default function VerifiedPage() {
  return <Suspense fallback={null}><Content /></Suspense>
}
