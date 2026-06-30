import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getMockServices } from "@/lib/mock-data/services";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/_public/services")({
  loader: async () => {
    const serializeMockServices = () => 
      getMockServices().map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        iconName: s.iconName || 'Sparkles',
        short: s.short || '',
        description: s.description || '',
        deliverables: s.deliverables || [],
        image: s.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      }));

    if (!isSupabaseConfigured()) {
      return { services: serializeMockServices() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        const services = data.map(s => {
          const fullDesc = (s.full_description_json as any) || {};
          // Try to find matching mock service for deliverables fallback if empty
          const matchingMock = getMockServices().find(m => m.slug === s.slug || m.title.toLowerCase() === s.title.toLowerCase());
          
          return {
            id: s.id,
            title: s.title,
            slug: s.slug,
            iconName: s.icon || 'Sparkles',
            short: s.short_description || '',
            description: fullDesc.description || s.short_description || '',
            deliverables: fullDesc.deliverables || matchingMock?.deliverables || [],
            image: s.image_url || matchingMock?.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
          };
        });
        return { services };
      } else {
        return { services: serializeMockServices() };
      }
    } catch (e) {
      console.error("Services page fetch error:", e);
      return { services: serializeMockServices() };
    }
  },
  head: () => ({
    meta: [
      { title: "Services — Elicit" },
      { name: "description", content: "A complete studio service — interior design, space planning, turnkey execution, renovation, commercial design and styling." },
      { property: "og:title", content: "Services — Elicit" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { services } = Route.useLoaderData();
  
  return (
    <>
      <section className="pt-40 pb-16 border-b border-border">
        <div className="container-editorial max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">What We Do</p>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl">A full studio service.</h1>
          <p className="mt-6 text-muted-foreground">From a single room of styling to a complete turnkey delivery — we work at every scale of an interior project.</p>
        </div>
      </section>

      {services.map((s, i) => (
        <section key={s.id} className={`section-y border-b border-border ${i % 2 === 1 ? "bg-card" : ""}`}>
          <div className={`container-editorial grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative overflow-hidden h-[560px] bg-muted">
              <img src={s.image} alt={s.title} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent">{`0${i + 1}`}</p>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">{s.title}</h2>
              <p className="mt-6 leading-relaxed text-muted-foreground">{s.description}</p>
              {s.deliverables && s.deliverables.length > 0 && (
                <ul className="mt-8 space-y-3 border-t border-border pt-6">
                  {s.deliverables.map((d: string) => (
                    <li key={d} className="flex gap-3 text-sm">
                      <span className="text-accent">—</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/contact" className="mt-10 inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] link-underline">
                Enquire about this service <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-charcoal text-cream">
        <div className="container-editorial py-24 text-center">
          <h2 className="font-serif text-3xl md:text-5xl max-w-2xl mx-auto">Not sure which service you need? Let's talk.</h2>
          <Link to="/contact" className="mt-10 inline-flex items-center gap-3 border border-cream px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-cream hover:text-charcoal transition-colors">
            Start a Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
