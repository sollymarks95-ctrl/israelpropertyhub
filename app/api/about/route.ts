import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "RepHuby Intelligence",
    "url": "https://rephuby.com",
    "description": "B2B reputation management for Forex, Crypto and Trading brokers. 12 proprietary financial portals, AI podcasts, Google brand rank tracking.",
    "contactPoint": { "@type":"ContactPoint","contactType":"sales","url":"https://t.me/rephub_intelligence" },
    "offers": [
      {"@type":"Offer","name":"Authority Starter","price":"5000","priceCurrency":"USD"},
      {"@type":"Offer","name":"Authority Pro","price":"9500","priceCurrency":"USD"},
      {"@type":"Offer","name":"Enterprise","description":"Custom for multi-brand groups"}
    ],
    "knowsAbout": ["SEO","Brand Reputation","Financial Publishing","Forex Brokers","AI Podcasts"]
  }, { headers: { 'Content-Type':'application/ld+json', 'Cache-Control':'public, max-age=3600' } })
}
