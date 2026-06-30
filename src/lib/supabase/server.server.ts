import { createServerClient } from '@supabase/ssr'

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const createClient = () => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        try {
          const { getEvent } = await import('vinxi/http')
          const event = getEvent()
          if (!event) return []
          const reqCookies = event.node?.req?.headers?.cookie || ''
          return reqCookies
            .split(';')
            .map((c: string) => {
              const [name, ...val] = c.trim().split('=')
              return { name, value: val.join('=') }
            })
            .filter((c: any) => c.name)
        } catch (e) {
          // Not in a request context (e.g. during build / static analysis)
          return []
        }
      },
      async setAll(cookiesToSet) {
        try {
          const { getEvent, setCookie } = await import('vinxi/http')
          const event = getEvent()
          if (!event) return
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              setCookie(event, name, value, {
                domain: options.domain,
                path: options.path,
                maxAge: options.maxAge,
                secure: options.secure,
                sameSite: options.sameSite as any,
                httpOnly: options.httpOnly,
              })
            } catch (e) {
              // Ignore cookie setting errors when called out of appropriate context
            }
          })
        } catch (e) {
          // Not in a request context
        }
      },
    },
  })
}
