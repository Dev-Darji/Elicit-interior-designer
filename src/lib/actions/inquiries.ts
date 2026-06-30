import { createServerFn } from "@tanstack/react-start"
import { getSupabase, isSupabaseConfigured } from "../supabase"
import { Resend } from "resend"

export const submitInquiry = createServerFn({ method: 'POST' })
  .validator((data: {
    name: string
    email: string
    phone?: string
    projectType?: string
    budget?: string
    message: string
  }) => data)
  .handler(async ({ data }) => {
    // 1. Save to Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase()
        const { error } = await supabase
          .from('inquiries')
          .insert({
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            project_type: data.projectType || null,
            budget: data.budget || null,
            message: data.message,
            status: 'new'
          })

        if (error) throw error
      } catch (e) {
        console.error("Error saving inquiry to Supabase:", e)
        throw new Error("Failed to save inquiry to database")
      }
    } else {
      console.log("Supabase not configured. Mocking inquiry submission:", data)
    }

    const safeProcessEnv = (key: string) => 
      typeof process !== 'undefined' && process.env ? process.env[key] || '' : '';

    // 2. Send email via Resend if RESEND_API_KEY is present
    const resendApiKey = 
      safeProcessEnv('RESEND_API_KEY') || 
      import.meta.env.VITE_RESEND_API_KEY || 
      import.meta.env.RESEND_API_KEY || 
      '';
      
    if (resendApiKey && resendApiKey !== 'your_resend_api_key') {
      try {
        const resend = new Resend(resendApiKey)
        // Get studio notification email
        const toEmail = 
          safeProcessEnv('NOTIFICATIONS_EMAIL') || 
          import.meta.env.VITE_NOTIFICATIONS_EMAIL || 
          'studio@elicitdesign.com';
        
        await resend.emails.send({
          from: 'Elicit Inquiries <onboarding@resend.dev>',
          to: toEmail,
          subject: `New Inquiry from ${data.name}`,
          text: `
            Name: ${data.name}
            Email: ${data.email}
            Phone: ${data.phone || 'N/A'}
            Project Type: ${data.projectType || 'N/A'}
            Budget: ${data.budget || 'N/A'}
            Message: ${data.message}
          `
        })
      } catch (e) {
        console.error("Error sending email notification via Resend:", e)
      }
    }

    return { success: true }
  })
