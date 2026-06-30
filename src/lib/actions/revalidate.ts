import { createServerFn } from "@tanstack/react-start"

export const revalidatePages = createServerFn({ method: "POST" })
  .validator((pages: string[]) => pages)
  .handler(async ({ data: pages }) => {
    console.log(`[Revalidation] On-Demand ISR purge cache request for pages:`, pages)
    
    // Webhook/Revalidation Hook execution
    // If deploying on Netlify or Vercel, we can fetch their cache tag purge or build webhook URL:
    const safeProcessEnv = (key: string) => 
      typeof process !== 'undefined' && process.env ? process.env[key] || '' : '';

    const buildHookUrl = 
      safeProcessEnv('BUILD_HOOK_URL') || 
      import.meta.env.VITE_BUILD_HOOK_URL || 
      '';
      
    if (buildHookUrl && buildHookUrl !== 'your_build_hook_url') {
      try {
        const response = await fetch(buildHookUrl, { method: 'POST' })
        console.log(`[Revalidation] Build webhook triggered. Status: ${response.status}`)
      } catch (err) {
        console.error(`[Revalidation] Failed to trigger build webhook:`, err)
      }
    }
    
    return { success: true, revalidatedPages: pages, timestamp: Date.now() }
  })
