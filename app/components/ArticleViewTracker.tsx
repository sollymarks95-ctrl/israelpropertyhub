'use client'
import { useEffect } from 'react'

export default function ArticleViewTracker({ siteSlug, slug }: { siteSlug: string; slug: string }) {
  useEffect(() => {
    // Track view once on mount — fire and forget
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteSlug, slug }),
    }).catch(() => {})
  }, [siteSlug, slug])

  return null
}
