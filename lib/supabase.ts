import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gykxxhxsakxhfuutgobb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Site = {
  id: string; name: string; domain: string; slug: string
  tagline?: string; description?: string; logo_url?: string
  primary_color: string; secondary_color: string; niche?: string
  is_live: boolean; seo_title?: string; seo_description?: string; created_at: string
}
export type Client = {
  id: string; company_name: string; contact_name?: string; contact_email?: string
  contact_phone?: string; country?: string; industry?: string; website?: string
  logo_url?: string; status: 'active'|'inactive'|'onboarding'; plan: 'basic'|'pro'|'premium'
  monthly_fee: number; currency: string; start_date: string; created_at: string
}
export type Review = {
  id: string; client_id: string; platform: string; reviewer_name?: string
  rating: number; review_text?: string; review_date?: string
  sentiment: 'positive'|'neutral'|'negative'; ai_response?: string
  response_published: boolean; flagged: boolean
}
export type Content = {
  id: string; client_id: string; site_id?: string; type: string
  title?: string; body?: string; status: 'draft'|'approved'|'published'|'scheduled'
  platform?: string; ai_generated: boolean; published_at?: string; created_at: string
}
export type YoutubeVideo = {
  id: string; client_id: string; site_id?: string; channel_name?: string
  title?: string; description?: string; status: 'draft'|'generating'|'ready'|'published'|'failed'
  views: number; published_at?: string
}
