'use client'
import { useEffect } from 'react'

export default function TrackView({ siteSlug, siteDomain }: { siteSlug: string, siteDomain: string }) {
  useEffect(() => {
    // Fire and forget — never blocks rendering
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_slug: siteSlug,
        site_domain: siteDomain,
        path: window.location.pathname,
        referrer: document.referrer || '',
      }),
    }).catch(() => {})
  }, [])
  return null
}
