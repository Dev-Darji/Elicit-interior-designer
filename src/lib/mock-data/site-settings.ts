export interface BusinessHour { day: string; open: string; close: string; closed: boolean; }

export interface SiteSettings {
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
    mapsUrl: string;
    hours: BusinessHour[];
  };
  social: { instagram: string; pinterest: string; linkedin: string; facebook: string; houzz: string };
  homepage: {
    heroTitle: string;
    heroTagline: string;
    ctaText: string;
    heroImage: string;
    stats: { label: string; value: string }[];
    aboutIntro: string;
  };
  seo: { siteName: string; metaDescription: string; ogImage: string };
  notifications: { email: string };
}

export const mockSiteSettings: SiteSettings = {
  contact: {
    phone: "+91 80 4112 9090",
    email: "studio@elicitdesign.com",
    address: "12 Lavelle Road, 2nd Floor\nBangalore 560001, India",
    whatsapp: "+91 98201 90909",
    mapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62209.41073408374!2d77.55492962167968!3d12.971598999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15e7e5f4f7d3%3A0x1a6f4a5ce3f1c1f1!2sBangalore!5e0!3m2!1sen!2sin!4v1700000000000",
    hours: [
      { day: "Monday", open: "09:30", close: "18:30", closed: false },
      { day: "Tuesday", open: "09:30", close: "18:30", closed: false },
      { day: "Wednesday", open: "09:30", close: "18:30", closed: false },
      { day: "Thursday", open: "09:30", close: "18:30", closed: false },
      { day: "Friday", open: "09:30", close: "18:30", closed: false },
      { day: "Saturday", open: "10:00", close: "16:00", closed: false },
      { day: "Sunday", open: "", close: "", closed: true },
    ],
  },
  social: {
    instagram: "https://instagram.com/elicitdesign",
    pinterest: "https://pinterest.com/elicitdesign",
    linkedin: "https://linkedin.com/company/elicitdesign",
    facebook: "",
    houzz: "https://houzz.com/pro/elicitdesign",
  },
  homepage: {
    heroTitle: "Considered interiors,\nbuilt to last.",
    heroTagline: "An interior design studio shaping timeless residential, hospitality and commercial spaces across India and beyond.",
    ctaText: "View Our Work",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
    stats: [
      { label: "Years of practice", value: "15+" },
      { label: "Projects completed", value: "320+" },
      { label: "Happy clients", value: "200+" },
      { label: "Design awards", value: "12" },
    ],
    aboutIntro: "We are a fifteen-year-old studio working at the intersection of architecture, craft and the way people actually live.",
  },
  seo: {
    siteName: "Elicit",
    metaDescription: "Elicit is an interior design studio crafting timeless, considered spaces for residences, hospitality and commercial environments.",
    ogImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  notifications: { email: "studio@elicitdesign.com" },
};

export function getMockSettings() { return mockSiteSettings; }
