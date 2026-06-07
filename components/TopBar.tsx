'use client'
import { Bell, Search, Plus } from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export default function TopBar({ title, subtitle, action }: TopBarProps) {
  return (
    <div style={{
      height: 64,
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      background: 'rgba(8,11,16,0.8)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-3)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '7px 12px', width: 220,
      }}>
        <Search size={13} color="var(--text-2)" />
        <input
          placeholder="Search..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 13, width: '100%', padding: 0
          }}
        />
      </div>

      {/* Notifications */}
      <button className="btn-ghost" style={{ padding: '7px', borderRadius: 8, position: 'relative' }}>
        <Bell size={15} />
        <div style={{
          position: 'absolute', top: 5, right: 5,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 6px var(--accent)'
        }} />
      </button>

      {/* Action */}
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          <Plus size={14} />
          {action.label}
        </button>
      )}
    </div>
  )
}
