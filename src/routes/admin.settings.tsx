import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { Section, FieldText, FieldTextarea, ImageDropzone } from "@/components/admin/project-form";
import { getSiteSettings, saveSiteSettings } from "@/lib/supabase/settings";
import { getMockSettings } from "@/lib/mock-data/site-settings";
import { revalidatePages } from "@/lib/actions/revalidate";


export const Route = createFileRoute("/admin/settings")({
  loader: async () => {
    const settings = await getSiteSettings();
    return { initialSettings: settings };
  },
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: SettingsAdmin,
});

const tabs = ["Contact", "Social", "Homepage", "SEO", "Notifications"] as const;
type Tab = (typeof tabs)[number];

function SettingsAdmin() {
  const { initialSettings } = Route.useLoaderData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Contact");
  const [settings, setSettings] = useState(initialSettings);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  // Helper to update deeply nested settings fields
  const updateField = (path: string[], value: any) => {
    setSettings((prev: any) => {
      const next = { ...prev };
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] };
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Saving settings changes...");
    
    try {
      await saveSiteSettings(settings);
      toast.success("Settings saved successfully!", { id: toastId });
      
      // Revalidate site pages affected by site settings
      revalidatePages({ data: ["/", "/about", "/services", "/contact"] }).catch(console.error);
      
      navigate({ to: "." });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Site Settings" description="Edit the studio's public-facing information." />

      <div className="border-b border-border mb-8 flex gap-1 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-xs uppercase tracking-[0.2em] border-b-2 -mb-px transition ${tab === t ? "border-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {tab === "Contact" && (
          <>
            <Section title="Contact Info">
              <FieldText 
                label="Phone" 
                value={settings.contact.phone} 
                onChange={(v) => updateField(["contact", "phone"], v)} 
                disabled={submitting}
              />
              <FieldText 
                label="Email" 
                value={settings.contact.email} 
                onChange={(v) => updateField(["contact", "email"], v)} 
                disabled={submitting}
              />
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Address</label>
                <textarea 
                  value={settings.contact.address} 
                  onChange={(e) => updateField(["contact", "address"], e.target.value)}
                  rows={3} 
                  disabled={submitting}
                  className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none disabled:opacity-50" 
                />
              </div>
              <FieldText 
                label="WhatsApp (including country code)" 
                value={settings.contact.whatsapp} 
                onChange={(v) => updateField(["contact", "whatsapp"], v)} 
                disabled={submitting}
              />
              <FieldText 
                label="Google Maps Embed URL" 
                value={settings.contact.mapsUrl} 
                onChange={(v) => updateField(["contact", "mapsUrl"], v)} 
                disabled={submitting}
              />
            </Section>
            
            <Section title="Business Hours">
              <div className="space-y-3">
                {settings.contact.hours.map((h, i) => (
                  <div key={h.day} className="grid grid-cols-12 gap-3 items-center">
                    <p className="col-span-3 text-sm font-serif">{h.day}</p>
                    <label className="col-span-3 inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={!h.closed} 
                        onChange={(e) => {
                          const updatedHours = [...settings.contact.hours];
                          updatedHours[i] = { ...h, closed: !e.target.checked };
                          updateField(["contact", "hours"], updatedHours);
                        }}
                        disabled={submitting}
                        className="accent-foreground" 
                      />
                      Open
                    </label>
                    <input 
                      type="time" 
                      value={h.open || "09:00"} 
                      onChange={(e) => {
                        const updatedHours = [...settings.contact.hours];
                        updatedHours[i] = { ...h, open: e.target.value };
                        updateField(["contact", "hours"], updatedHours);
                      }}
                      disabled={h.closed || submitting}
                      className="col-span-3 border border-border bg-background px-3 py-2 text-sm disabled:opacity-50" 
                    />
                    <input 
                      type="time" 
                      value={h.close || "18:00"} 
                      onChange={(e) => {
                        const updatedHours = [...settings.contact.hours];
                        updatedHours[i] = { ...h, close: e.target.value };
                        updateField(["contact", "hours"], updatedHours);
                      }}
                      disabled={h.closed || submitting}
                      className="col-span-3 border border-border bg-background px-3 py-2 text-sm disabled:opacity-50" 
                    />
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {tab === "Social" && (
          <Section title="Social Links">
            <FieldText 
              label="Instagram" 
              value={settings.social.instagram} 
              onChange={(v) => updateField(["social", "instagram"], v)} 
              disabled={submitting}
            />
            <FieldText 
              label="Pinterest" 
              value={settings.social.pinterest} 
              onChange={(v) => updateField(["social", "pinterest"], v)} 
              disabled={submitting}
            />
            <FieldText 
              label="LinkedIn" 
              value={settings.social.linkedin} 
              onChange={(v) => updateField(["social", "linkedin"], v)} 
              disabled={submitting}
            />
            <FieldText 
              label="Facebook" 
              value={settings.social.facebook} 
              onChange={(v) => updateField(["social", "facebook"], v)} 
              disabled={submitting}
            />
            <FieldText 
              label="Houzz" 
              value={settings.social.houzz} 
              onChange={(v) => updateField(["social", "houzz"], v)} 
              disabled={submitting}
            />
          </Section>
        )}

        {tab === "Homepage" && (
          <>
            <Section title="Hero Intro">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Hero Title</label>
                <textarea 
                  value={settings.homepage.heroTitle} 
                  onChange={(e) => updateField(["homepage", "heroTitle"], e.target.value)}
                  rows={2} 
                  disabled={submitting}
                  className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none disabled:opacity-50" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Tagline</label>
                <textarea 
                  value={settings.homepage.heroTagline} 
                  onChange={(e) => updateField(["homepage", "heroTagline"], e.target.value)}
                  rows={3} 
                  disabled={submitting}
                  className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none disabled:opacity-50" 
                />
              </div>
              <FieldText 
                label="CTA Button Text" 
                value={settings.homepage.ctaText} 
                onChange={(v) => updateField(["homepage", "ctaText"], v)} 
                disabled={submitting}
              />
              <ImageDropzone 
                label="Hero Image" 
                value={settings.homepage.heroImage} 
                onChange={(url) => updateField(["homepage", "heroImage"], url)} 
                bucket="projects"
              />
            </Section>
            
            <Section title="Stats Counter">
              {settings.homepage.stats.map((st, i) => (
                <div key={i} className="grid grid-cols-2 gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                  <FieldText 
                    label={`Stat ${i + 1} Label`} 
                    value={st.label} 
                    onChange={(v) => {
                      const updatedStats = [...settings.homepage.stats];
                      updatedStats[i] = { ...st, label: v };
                      updateField(["homepage", "stats"], updatedStats);
                    }}
                    disabled={submitting}
                  />
                  <FieldText 
                    label={`Stat ${i + 1} Value`} 
                    value={st.value} 
                    onChange={(v) => {
                      const updatedStats = [...settings.homepage.stats];
                      updatedStats[i] = { ...st, value: v };
                      updateField(["homepage", "stats"], updatedStats);
                    }}
                    disabled={submitting}
                  />
                </div>
              ))}
            </Section>
            
            <Section title="About Section Intro">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">About Intro Paragraph</label>
                <textarea 
                  value={settings.homepage.aboutIntro} 
                  onChange={(e) => updateField(["homepage", "aboutIntro"], e.target.value)}
                  rows={4} 
                  disabled={submitting}
                  className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none disabled:opacity-50" 
                />
              </div>
            </Section>
          </>
        )}

        {tab === "SEO" && (
          <Section title="Global SEO">
            <FieldText 
              label="Site Name" 
              value={settings.seo.siteName} 
              onChange={(v) => updateField(["seo", "siteName"], v)} 
              disabled={submitting}
            />
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Default Meta Description</label>
              <textarea 
                value={settings.seo.metaDescription} 
                onChange={(e) => updateField(["seo", "metaDescription"], e.target.value)}
                rows={3} 
                disabled={submitting}
                className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none disabled:opacity-50" 
              />
            </div>
            <ImageDropzone 
              label="Open Graph Share Image" 
              value={settings.seo.ogImage} 
              onChange={(url) => updateField(["seo", "ogImage"], url)} 
              bucket="projects"
            />
          </Section>
        )}

        {tab === "Notifications" && (
          <Section title="Notifications">
            <FieldText 
              label="Notification Email Address" 
              value={settings.notifications.email} 
              onChange={(v) => updateField(["notifications", "email"], v)} 
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">New inquiries submitted from the Contact form will be sent to this email address when RESEND_API_KEY is configured.</p>
          </Section>
        )}

        <button 
          type="submit" 
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
