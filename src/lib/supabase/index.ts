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


const safeProcessEnv = (key: string) => 
  typeof process !== 'undefined' && process.env ? process.env[key] || '' : '';

export const isSupabaseConfigured = () => {
  const url = 
    import.meta.env.VITE_SUPABASE_URL || 
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
    safeProcessEnv('NEXT_PUBLIC_SUPABASE_URL') || 
    safeProcessEnv('VITE_SUPABASE_URL') || 
    '';
  return url && url !== 'your_supabase_project_url' && url.trim() !== '';
}
