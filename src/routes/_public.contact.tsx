import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/supabase/settings";
import { submitInquiry } from "@/lib/actions/inquiries";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const Route = createFileRoute("/_public/contact")({
  loader: async () => {
    const settings = await getSiteSettings();
    return { settings };
  },
  head: () => ({
    meta: [
      { title: "Contact — Elicit" },
      { name: "description", content: "Start a conversation with Elicit about your next interior project. We take on a small number of projects each year." },
      { property: "og:title", content: "Contact — Elicit" },
    ],
  }),
  component: ContactPage,
});

const projectTypes = ["Residential", "Commercial", "Hospitality", "Retail", "Other"];
const budgets = ["Under ₹25L", "₹25L – ₹50L", "₹50L – ₹1Cr", "₹1Cr – ₹3Cr", "₹3Cr+"];

function ContactPage() {
  const { settings } = Route.useLoaderData();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const phone = fd.get("phone") as string;
    const projectType = fd.get("projectType") as string;
    const budget = fd.get("budget") as string;
    const message = fd.get("message") as string;

    const next: Record<string, string> = {};
    if (!name) next.name = "Required";
    if (!email) next.email = "Required";
    if (!message) next.message = "Required";
    
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const toastId = toast.loading("Sending message...");
    
    try {
      await submitInquiry({
        data: { name, email, phone, projectType, budget, message }
      });
      
      toast.success("Message sent successfully!", { id: toastId });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to send message. Please try again.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="pt-40 pb-12 border-b border-border">
        <ScrollReveal variant="fade-up" duration={1000}>
          <div className="container-editorial max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Get in touch</p>
            <h1 className="mt-6 font-serif text-5xl md:text-7xl">Begin the conversation.</h1>
            <p className="mt-6 text-muted-foreground">Tell us about your project. We typically respond within two business days.</p>
          </div>
        </ScrollReveal>
      </section>

      <section className="section-y">
        <div className="container-editorial grid lg:grid-cols-2 gap-16">
          {/* Form */}
          <ScrollReveal variant="fade-up" delay={100} duration={1000}>
            <div>
              {submitted ? (
                <div className="border border-border p-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-accent mx-auto" strokeWidth={1.25} />
                  <h2 className="mt-6 font-serif text-3xl">Thank you.</h2>
                  <p className="mt-3 text-muted-foreground max-w-sm mx-auto">Your message is with the studio. We will be in touch within two business days.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-8 text-xs uppercase tracking-[0.2em] link-underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                  <Field label="Name" name="name" required error={errors.name} disabled={submitting} />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Field label="Email" name="email" type="email" required error={errors.email} disabled={submitting} />
                    <Field label="Phone" name="phone" type="tel" disabled={submitting} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <SelectField label="Project Type" name="projectType" options={projectTypes} disabled={submitting} />
                    <SelectField label="Budget" name="budget" options={budgets} disabled={submitting} />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Message</label>
                    <textarea
                      name="message"
                      rows={6}
                      disabled={submitting}
                      className="w-full border-b border-border bg-transparent py-3 text-foreground focus:outline-none focus:border-accent transition-colors resize-none disabled:opacity-50"
                    />
                    {errors.message && <p className="mt-2 text-xs text-destructive">{errors.message}</p>}
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="inline-flex items-center border border-foreground px-10 py-4 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* Info */}
          <ScrollReveal variant="fade-up" delay={250} duration={1000} className="w-full">
            <div className="space-y-10 lg:pl-16 lg:border-l border-border h-full">
              {settings.contact.email && <InfoRow icon={Mail} label="Email" value={settings.contact.email} />}
              {settings.contact.phone && <InfoRow icon={Phone} label="Phone" value={settings.contact.phone} />}
              {settings.contact.whatsapp && <InfoRow icon={MessageCircle} label="WhatsApp" value={settings.contact.whatsapp} />}
              {settings.contact.address && <InfoRow icon={MapPin} label="Studio" value={settings.contact.address} />}

              {settings.contact.hours && settings.contact.hours.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Business Hours</p>
                  <ul className="space-y-2 text-sm">
                    {settings.contact.hours.map((h) => (
                      <li key={h.day} className="flex justify-between border-b border-border/60 py-2">
                        <span>{h.day}</span>
                        <span className="text-muted-foreground">{h.closed ? "Closed" : `${h.open} — ${h.close}`}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {settings.contact.mapsUrl && (
        <section className="border-t border-border h-[420px] w-full">
          <iframe
            title="Map"
            src={settings.contact.mapsUrl}
            className="h-full w-full grayscale"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      )}
    </>
  );
}

function Field({ label, name, type = "text", required, error, disabled }: { label: string; name: string; type?: string; required?: boolean; error?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}{required && " *"}</label>
      <input
        name={name}
        type={type}
        disabled={disabled}
        className="w-full border-b border-border bg-transparent py-3 text-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
      />
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, options, disabled }: { label: string; name: string; options: string[]; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</label>
      <select 
        name={name} 
        disabled={disabled}
        className="w-full border-b border-border bg-transparent py-3 text-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
      >
        <option value="" className="bg-background text-foreground">Select…</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-background text-foreground">{o}</option>
        ))}
      </select>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-5">
      <Icon className="h-5 w-5 text-accent shrink-0 mt-1" strokeWidth={1.25} />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="mt-1 whitespace-pre-line text-sm">{value}</p>
      </div>
    </div>
  );
}
