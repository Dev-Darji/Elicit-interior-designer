import { createClient as createBrowserClient } from './client'

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    const creator = (globalThis as any).getSupabaseServerClient
    if (creator) {
      return creator()
    }
  }
  return createBrowserClient()
}


export const isSupabaseConfigured = () => {
  const url = 
    import.meta.env.VITE_SUPABASE_URL || 
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL || 
    '';
  return url && url !== 'your_supabase_project_url' && url.trim() !== '';
}
