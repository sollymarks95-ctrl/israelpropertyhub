import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wyvaqlmlpiullcgvdvay.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// Lazy client — safe during build time when env vars may not be available
let _supabase: ReturnType<typeof createClient> | null = null
export const getSupabase = () => {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}
export const supabase = getSupabase()

export type Site = {
  id: string; name: string; domain: string; slug: string
  tagline?: string; primary_color: string; template_config?: Record<string, unknown>
  is_live: boolean; noindex: boolean; seo_title?: string; seo_description?: string
  language: string; created_at: string
}
export type Article = {
  id: string; news_site_id: string; title: string; slug: string
  content?: string; excerpt?: string; category?: string; tags?: string[]
  image_url?: string; author?: string; status: string
  published_at: string; view_count: number; source_question?: string
}
export type Client = {
  id: string; name: string; slug: string; company_type?: string
  description?: string; website?: string; contact_email?: string
  plan: string; monthly_fee?: number; is_active: boolean; created_at: string
}
