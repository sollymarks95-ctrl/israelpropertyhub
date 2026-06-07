import { supabase } from './supabase'

export async function getSiteBySlug(slug: string) {
  const { data } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export async function getSiteClients(siteId: string) {
  const { data } = await supabase
    .from('client_profiles')
    .select(`
      *,
      clients (
        id, company_name, country, industry,
        website, logo_url, description
      )
    `)
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
  return data || []
}

export async function getClientProfile(siteId: string, slug: string) {
  const { data } = await supabase
    .from('client_profiles')
    .select(`
      *,
      clients (*)
    `)
    .eq('site_id', siteId)
    .eq('slug', slug)
    .single()
  return data
}

export async function getClientReviews(clientId: string) {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('client_id', clientId)
    .order('review_date', { ascending: false })
    .limit(20)
  return data || []
}
