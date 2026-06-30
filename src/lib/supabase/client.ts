import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 
  (typeof window !== 'undefined' ? (window as any).env?.VITE_SUPABASE_URL || (window as any).env?.NEXT_PUBLIC_SUPABASE_URL : null) ||
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey = 
  (typeof window !== 'undefined' ? (window as any).env?.VITE_SUPABASE_ANON_KEY || (window as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : null) ||
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
