'use client'
import React from 'react'

// ─── Shared logo component — consistent across ALL pages on all 9 portals ───
// Matches the MobileNav style: dark name + accent on the split point
// Nex-Wire  → "Nex" + "-"(accent) + "Wire"
// Finvexx   → "Finve" + "xx"(accent)
// CryptoXos → "CryptoX" + "os"(accent)
// AurexHQ   → "Aurex" + "HQ"(accent)
// Verivex   → "Verive" + "x"(accent)
// InvexHuby → "InvexHu" + "by"(accent)
// Signalixx → "Signali" + "xx"(accent)
// ExecVex   → "Exec" + "Vex"(accent)  [capital split]
// Bizplezx  → "Bizple" + "zx"(accent)

interface SiteLogoProps {
  name: string
  accentColor: string
  fontSize?: number
  darkText?: string   // color of the non-accent part
  href?: string       // link target (default "/")
  style?: React.CSSProperties
}

function splitName(name: string): [string, string, string] {
  // Prefer splitting on hyphen
  if (name.includes('-')) {
    const idx = name.indexOf('-')
    return [name.slice(0, idx), '-', name.slice(idx + 1)]
  }
  // Split on internal capital letter (e.g. ExecVex, InvexHuby)
  const capMatch = name.slice(1).match(/[A-Z]/)
  if (capMatch && capMatch.index !== undefined) {
    const idx = capMatch.index + 1
    return [name.slice(0, idx), '', name.slice(idx)]
  }
  // Default: last 2 chars in accent
  return [name.slice(0, -2), '', name.slice(-2)]
}

export default function SiteLogo({
  name,
  accentColor,
  fontSize = 22,
  darkText = '#0f172a',
  href = '/',
  style = {},
}: SiteLogoProps) {
  const [pre, sep, post] = splitName(name)

  const logo = (
    <span style={{
      fontFamily: "'Georgia','Times New Roman',serif",
      fontSize,
      fontWeight: 900,
      letterSpacing: '-0.03em',
      color: darkText,
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 0,
      ...style,
    }}>
      {pre}
      <span style={{ color: accentColor }}>{sep}{post}</span>
    </span>
  )

  return (
    <a href={href} style={{ textDecoration: 'none' }}>
      {logo}
    </a>
  )
}
