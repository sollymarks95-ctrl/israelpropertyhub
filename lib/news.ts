import { supabase } from './supabase'

export async function getNewsSite(slug: string) {
  const { data } = await supabase
    .from('news_sites')
    .select('*')
    .eq('slug', slug)
    .single()
  return data
}

export async function getFeaturedArticles(siteId: string, limit = 5) {
  const { data } = await supabase
    .from('news_articles')
    .select('*')
    .eq('news_site_id', siteId)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getArticlesByCategory(siteId: string, category: string, limit = 8) {
  const { data } = await supabase
    .from('news_articles')
    .select('*')
    .eq('news_site_id', siteId)
    .eq('status', 'published')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getLatestArticles(siteId: string, limit = 20) {
  const { data } = await supabase
    .from('news_articles')
    .select('*')
    .eq('news_site_id', siteId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  return data || []
}

export async function getArticle(siteId: string, slug: string) {
  const { data } = await supabase
    .from('news_articles')
    .select('*')
    .eq('news_site_id', siteId)
    .eq('slug', slug)
    .single()
  return data
}

export async function getBreakingNews(siteId: string) {
  const { data } = await supabase
    .from('news_articles')
    .select('title, slug')
    .eq('news_site_id', siteId)
    .eq('status', 'published')
    .eq('is_breaking', true)
    .order('published_at', { ascending: false })
    .limit(5)
  return data || []
}

export function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
