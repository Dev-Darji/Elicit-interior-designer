import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import * as Icons from "lucide-react";
import { getMockProjects } from "@/lib/mock-data/projects";
import { getMockServices } from "@/lib/mock-data/services";
import { getMockTestimonials } from "@/lib/mock-data/testimonials";
import { getMockSettings } from "@/lib/mock-data/site-settings";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/supabase/settings";

export const Route = createFileRoute("/_public/")({
  loader: async () => {
    // 1. Fetch site settings
    const settings = await getSiteSettings();

    // 2. Fetch projects
    let projects = [];
    if (!isSupabaseConfigured()) {
      projects = getMockProjects().filter((p) => p.featured).slice(0, 6);
    } else {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('projects')
          .select('id, title, slug, category, cover_image_url, year')
          .eq('status', 'published')
          .order('display_order', { ascending: true })
          .limit(6);
          
        if (data && data.length > 0) {
          projects = data.map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            category: p.category,
            year: p.year || 0,
            cover: p.cover_image_url || '',
          }));
        } else {
          projects = getMockProjects().filter((p) => p.featured).slice(0, 6);
        }
      } catch (e) {
        console.error("Home page projects fetch error:", e);
        projects = getMockProjects().filter((p) => p.featured).slice(0, 6);
      }
    }

    // 3. Fetch services
    let services = [];
    if (!isSupabaseConfigured()) {
      services = getMockServices().slice(0, 6).map(s => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        iconName: s.iconName || 'Sparkles',
        short: s.short || '',
      }));
    } else {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true })
          .limit(6);

        if (data && data.length > 0) {
          services = data.map(s => {
            return {
              id: s.id,
              title: s.title,
              slug: s.slug,
              iconName: s.icon || 'Sparkles',
              short: s.short_description || '',
            };
          });
        } else {
          services = getMockServices().slice(0, 6).map(s => ({
            id: s.id,
            title: s.title,
            slug: s.slug,
            iconName: s.iconName || 'Sparkles',
            short: s.short || '',
          }));
        }
      } catch (e) {
        console.error("Home page services fetch error:", e);
        services = getMockServices().slice(0, 6).map(s => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          iconName: s.iconName || 'Sparkles',
          short: s.short || '',
        }));
      }
    }

    // 4. Fetch testimonials
    let testimonials = [];
    if (!isSupabaseConfigured()) {
      testimonials = getMockTestimonials();
    } else {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true });

        if (data && data.length > 0) {
          testimonials = data.map(t => ({
            id: t.id,
            name: t.client_name,
            projectType: t.project_type || '',
            quote: t.quote,
            rating: t.rating || 5,
          }));
        } else {
          testimonials = getMockTestimonials();
        }
      } catch (e) {
        console.error("Home page testimonials fetch error:", e);
        testimonials = getMockTestimonials();
      }
    }

    return { settings, projects, services, testimonials };
  },
  head: () => ({
    meta: [
      { title: "Elicit — Considered interiors, built to last." },
      { name: "description", content: "Elicit is an interior design studio shaping timeless residential, hospitality and commercial spaces across India and beyond." },
      { property: "og:title", content: "Elicit — Interior Design Studio" },
      { property: "og:description", content: "Timeless interiors for residences, hospitality and commercial spaces." },
    ],
  }),
  component: HomePage,
});

const steps = [
  { n: "01", title: "Discovery", body: "We start with a long conversation. Goals, constraints, the way you actually live." },
  { n: "02", title: "Concept Design", body: "Mood, material and plan come together in a single, considered direction." },
  { n: "03", title: "Detailed Design", body: "Joinery, lighting, finishes — every detail drawn, costed and specified." },
  { n: "04", title: "Execution", body: "Our team manages every contractor, every delivery, every detail on site." },
  { n: "05", title: "Handover", body: "A beautifully finished space, snagged and styled, ready to live in." },
];

function HomePage() {
  const { settings, projects, services, testimonials } = Route.useLoaderData();

  const heroImages = [
    settings.homepage.heroImage,
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=80",
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen min-h-[720px] w-full overflow-hidden bg-charcoal">
        {/* Background Slides */}
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              idx === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt={`Elicit design ${idx + 1}`}
              className={`h-full w-full object-cover transition-transform duration-[6000ms] ease-out ${
                idx === activeSlide ? "scale-105" : "scale-100"
              }`}
            />
          </div>
        ))}

        {/* Cinematic Overlays */}
        <div 
          className="absolute inset-0 z-1" 
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.7) 100%)' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-transparent z-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-charcoal/30 z-1" />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="container-editorial text-cream">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-cream/10 backdrop-blur-md border border-cream/20 rounded-full animate-fade-up text-[10px] uppercase tracking-[0.25em] mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Interior Architecture & Styling
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] whitespace-pre-line max-w-4xl animate-fade-up">
              {settings.homepage.heroTitle}
            </h1>
            
            <p className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-cream/90 font-light tracking-wide animate-fade-up">
              {settings.homepage.heroTagline}
            </p>
            
            <div className="mt-12 flex flex-wrap items-center gap-6 animate-fade-up">
              <Link 
                to="/projects" 
                className="group inline-flex items-center gap-3 bg-cream text-charcoal px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-accent hover:text-cream transition-all duration-300 shadow-lg"
              >
                Explore Projects 
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-3 px-4 py-4 text-xs uppercase tracking-[0.2em] text-cream link-underline"
              >
                Collaborate with Us
              </Link>
            </div>
          </div>
        </div>

        {/* Slideshow Controls (Bottom Right) */}
        <div className="absolute bottom-10 right-10 z-10 hidden md:flex items-center gap-4 text-cream">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] focus:outline-none"
            >
              <span className={`block h-px transition-all duration-500 ${
                idx === activeSlide ? "w-10 bg-accent" : "w-4 bg-cream/40 group-hover:bg-cream"
              }`} />
              <span className={idx === activeSlide ? "text-accent font-medium" : "text-cream/60 group-hover:text-cream"}>
                0{idx + 1}
              </span>
            </button>
          ))}
        </div>

        {/* Scroll indicator (Bottom Left) */}
        <div className="absolute bottom-10 left-10 z-10 text-cream text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-3">
          <div className="flex flex-col items-center gap-2">
            <span className="block w-[18px] h-[30px] border border-cream/50 rounded-full relative">
              <span className="block w-1 h-1.5 bg-accent rounded-full absolute top-1.5 left-1/2 -translate-x-1/2 animate-bounce" />
            </span>
          </div>
          <span>Discover Elicit</span>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="container-editorial py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {settings.homepage.stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-5xl md:text-6xl text-foreground">{s.value}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      <section className="section-y">
        <div className="container-editorial">
          <div className="flex items-end justify-between mb-16 gap-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Selected Work</p>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">Recent Projects</h2>
            </div>
            <Link to="/projects" className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] link-underline">
              All Projects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {projects.map((p, i) => {
              const span = [
                "md:col-span-4 md:row-span-2",
                "md:col-span-2",
                "md:col-span-2",
                "md:col-span-3",
                "md:col-span-3",
                "md:col-span-6",
              ][i] || "md:col-span-2";
              const height = i === 0 ? "h-[640px]" : i === 5 ? "h-[480px]" : "h-[320px]";
              return (
                <Link
                  key={p.id}
                  to="/projects/$slug"
                  params={{ slug: p.slug }}
                  className={`group relative overflow-hidden bg-muted ${span} ${height}`}
                >
                  <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-90" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                    <p className="text-[10px] uppercase tracking-[0.25em] opacity-80">{p.category}</p>
                    <h3 className="mt-2 font-serif text-2xl md:text-3xl">{p.title}</h3>
                  </div>
                  <span className="absolute right-6 top-6 inline-flex items-center gap-2 text-cream text-[10px] uppercase tracking-[0.25em] opacity-0 group-hover:opacity-100 transition-opacity">
                    View Project <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-y bg-card border-y border-border">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">What We Do</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">A full studio service, from first sketch to final handover.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {services.map((s) => {
              const Icon = (Icons as any)[s.iconName || 'Sparkles'] || Icons.Sparkles;
              return (
                <div key={s.id} className="bg-card p-10 group">
                  <Icon className="h-7 w-7 text-accent" strokeWidth={1.25} />
                  <h3 className="mt-8 font-serif text-2xl">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.short}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-y">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Our Process</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Five stages, one continuous conversation.</h2>
          </div>
          <div className="grid md:grid-cols-5 gap-8 md:gap-4">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <p className="font-serif text-5xl text-accent/80">{s.n}</p>
                <div className="mt-4 h-px bg-border" />
                <h3 className="mt-4 font-serif text-xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials carousel */}
      {testimonials.length > 0 && <TestimonialsCarousel items={testimonials} />}

      {/* CTA */}
      <section className="relative">
        <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=80" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-charcoal/70" />
        <div className="relative container-editorial py-32 text-cream text-center">
          <h2 className="font-serif text-4xl md:text-6xl max-w-3xl mx-auto leading-tight">Start your project today.</h2>
          <p className="mt-6 max-w-xl mx-auto opacity-80">We take on a small number of projects each year, residential and commercial. Tell us what you have in mind.</p>
          <Link to="/contact" className="mt-10 inline-flex items-center gap-3 border border-cream px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-cream hover:text-charcoal transition-colors">
            Begin the Conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function TestimonialsCarousel({ items }: { items: any[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setI((x) => (x + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;
  const t = items[i] || items[0];

  return (
    <section className="section-y bg-card border-y border-border">
      <div className="container-editorial max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Clients</p>
        <div className="mt-10">
          <div className="flex items-center justify-center gap-1 text-accent mb-8">
            {Array.from({ length: t.rating || 5 }).map((_, k) => (
              <Star key={k} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <blockquote className="font-serif text-2xl md:text-3xl leading-[1.4] italic">
            "{t.quote}"
          </blockquote>
          <div className="mt-10">
            <p className="font-serif text-lg">{t.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.projectType}</p>
          </div>
        </div>
        {items.length > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {items.map((_, k) => (
              <button
                key={k}
                aria-label={`Testimonial ${k + 1}`}
                onClick={() => setI(k)}
                className={`h-px transition-all ${k === i ? "w-12 bg-foreground" : "w-6 bg-border"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
