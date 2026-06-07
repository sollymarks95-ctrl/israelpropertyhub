'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Globe, Users, FileText, Video, Star, BarChart3,
  Settings, ChevronRight, Zap, TrendingUp, Mail, Newspaper
} from 'lucide-react'

const nav = [
  { label: 'Overview', href: '/dashboard', icon: BarChart3 },
  { label: 'Sites', href: '/dashboard/sites', icon: Globe },
  { label: 'News Sites', href: '/dashboard/news', icon: Newspaper },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { label: 'Content', href: '/dashboard/content', icon: FileText },
  { label: 'YouTube', href: '/dashboard/youtube', icon: Video },
  { label: 'Campaigns', href: '/dashboard/campaigns', icon: Mail },
  { label: 'Rankings', href: '/dashboard/rankings', icon: TrendingUp },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{ width:240, minHeight:'100vh', background:'var(--bg-2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'fixed', left:0, top:0, zIndex:100 }}>
      <div style={{ padding:'24px 20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px var(--accent-glow)' }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:15, letterSpacing:'-0.03em' }}>RepHub</div>
            <div style={{ fontSize:10, color:'var(--text-2)', letterSpacing:'0.08em' }}>REPUTATION OS</div>
          </div>
        </div>
      </div>
      <nav style={{ padding:'12px 8px', flex:1 }}>
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{ textDecoration:'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, marginBottom:2, background:active?'rgba(59,130,246,0.12)':'transparent', color:active?'var(--accent)':'var(--text-2)', transition:'all 0.15s', cursor:'pointer', position:'relative' }}
                onMouseEnter={e => { if(!active){(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)';(e.currentTarget as HTMLElement).style.color='var(--text)'}}}
                onMouseLeave={e => { if(!active){(e.currentTarget as HTMLElement).style.background='transparent';(e.currentTarget as HTMLElement).style.color='var(--text-2)'}}}>
                {active && <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:3, height:16, background:'var(--accent)', borderRadius:'0 2px 2px 0' }} />}
                <Icon size={15} />
                <span style={{ fontFamily:'Syne', fontWeight:600, fontSize:13 }}>{label}</span>
                {active && <ChevronRight size={13} style={{ marginLeft:'auto' }} />}
              </div>
            </Link>
          )
        })}
      </nav>
      <div style={{ padding:'16px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ padding:'12px', borderRadius:10, background:'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))', border:'1px solid rgba(59,130,246,0.2)' }}>
          <div style={{ fontFamily:'Syne', fontWeight:700, fontSize:12, marginBottom:4 }}>AI Engine Active</div>
          <div style={{ fontSize:11, color:'var(--text-2)' }}>Content generating 24/7</div>
          <div style={{ marginTop:8, height:3, borderRadius:2, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:'73%', background:'linear-gradient(90deg, var(--accent), var(--purple))', borderRadius:2 }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
