import { getSupabase, isSupabaseConfigured } from './index'
import { mockSiteSettings, type SiteSettings } from '../mock-data/site-settings'

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    return mockSiteSettings
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.from('site_settings').select('key, value')
    if (error) throw error

    if (!data || data.length === 0) {
      return mockSiteSettings
    }

    const settingsMap = Object.fromEntries(data.map(r => [r.key, r.value]))

    // Helper to get nested value or fallback
    const getVal = (section: string, key: string, fallback: any) => {
      return settingsMap[section]?.[key] ?? fallback
    }

    return {
      contact: {
        phone: getVal('contact_info', 'phone', mockSiteSettings.contact.phone),
        email: getVal('contact_info', 'email', mockSiteSettings.contact.email),
        address: getVal('contact_info', 'address', mockSiteSettings.contact.address),
        whatsapp: getVal('contact_info', 'whatsapp', mockSiteSettings.contact.whatsapp),
        mapsUrl: getVal('contact_info', 'maps_url', mockSiteSettings.contact.mapsUrl),
        hours: settingsMap.contact_info?.business_hours ? [
          { day: "Monday", open: settingsMap.contact_info.business_hours.mon_fri?.split(' – ')[0] || "09:30", close: settingsMap.contact_info.business_hours.mon_fri?.split(' – ')[1] || "18:30", closed: false },
          { day: "Tuesday", open: "09:30", close: "18:30", closed: false },
          { day: "Wednesday", open: "09:30", close: "18:30", closed: false },
          { day: "Thursday", open: "09:30", close: "18:30", closed: false },
          { day: "Friday", open: "09:30", close: "18:30", closed: false },
          { day: "Saturday", open: settingsMap.contact_info.business_hours.sat?.split(' – ')[0] || "10:00", close: settingsMap.contact_info.business_hours.sat?.split(' – ')[1] || "16:00", closed: false },
          { day: "Sunday", open: "", close: "", closed: true }
        ] : mockSiteSettings.contact.hours
      },
      social: {
        instagram: getVal('social_links', 'instagram', mockSiteSettings.social.instagram),
        pinterest: getVal('social_links', 'pinterest', mockSiteSettings.social.pinterest),
        linkedin: getVal('social_links', 'linkedin', mockSiteSettings.social.linkedin),
        facebook: getVal('social_links', 'facebook', mockSiteSettings.social.facebook),
        houzz: getVal('social_links', 'houzz', mockSiteSettings.social.houzz),
      },
      homepage: {
        heroTitle: getVal('homepage', 'hero_title', mockSiteSettings.homepage.heroTitle),
        heroTagline: getVal('homepage', 'hero_tagline', mockSiteSettings.homepage.heroTagline),
        ctaText: getVal('homepage', 'cta_text', mockSiteSettings.homepage.ctaText),
        heroImage: getVal('homepage', 'hero_image', getVal('homepage', 'heroImage', mockSiteSettings.homepage.heroImage)),
        stats: getVal('homepage', 'stats', mockSiteSettings.homepage.stats),
        aboutIntro: getVal('homepage', 'about_intro', getVal('homepage', 'aboutIntro', mockSiteSettings.homepage.aboutIntro)),
      },
      seo: {
        siteName: getVal('seo', 'site_name', mockSiteSettings.seo.siteName),
        metaDescription: getVal('seo', 'default_meta_description', getVal('seo', 'metaDescription', mockSiteSettings.seo.metaDescription)),
        ogImage: getVal('seo', 'og_image_url', getVal('seo', 'ogImage', mockSiteSettings.seo.ogImage)),
      },
      notifications: {
        email: settingsMap.notification_email ?? mockSiteSettings.notifications.email
      }
    }
  } catch (e) {
    console.error("Error loading site settings from Supabase, using mock:", e)
    return mockSiteSettings
  }
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  if (!isSupabaseConfigured()) {
    return
  }

  const supabase = getSupabase()
  
  // Format business hours
  const monFriHour = settings.contact.hours.find(h => h.day === "Monday")
  const satHour = settings.contact.hours.find(h => h.day === "Saturday")
  
  const business_hours = {
    mon_fri: monFriHour && !monFriHour.closed ? `${monFriHour.open} – ${monFriHour.close}` : "09:30 – 18:30",
    sat: satHour && !satHour.closed ? `${satHour.open} – ${satHour.close}` : "10:00 – 16:00",
  }

  const rows = [
    {
      key: 'contact_info',
      value: {
        phone: settings.contact.phone,
        email: settings.contact.email,
        address: settings.contact.address,
        whatsapp: settings.contact.whatsapp,
        maps_url: settings.contact.mapsUrl,
        business_hours
      }
    },
    {
      key: 'social_links',
      value: {
        instagram: settings.social.instagram,
        pinterest: settings.social.pinterest,
        linkedin: settings.social.linkedin,
        facebook: settings.social.facebook,
        houzz: settings.social.houzz
      }
    },
    {
      key: 'homepage',
      value: {
        hero_title: settings.homepage.heroTitle,
        hero_tagline: settings.homepage.heroTagline,
        cta_text: settings.homepage.ctaText,
        hero_image: settings.homepage.heroImage,
        stats: settings.homepage.stats,
        about_intro: settings.homepage.aboutIntro
      }
    },
    {
      key: 'seo',
      value: {
        site_name: settings.seo.siteName,
        default_meta_description: settings.seo.metaDescription,
        og_image_url: settings.seo.ogImage
      }
    },
    {
      key: 'notification_email',
      value: settings.notifications.email
    }
  ]

  for (const row of rows) {
    const { error } = await supabase
      .from('site_settings')
      .upsert(row, { onConflict: 'key' })
    if (error) throw error
  }
}

