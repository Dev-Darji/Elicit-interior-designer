import { createFileRoute } from "@tanstack/react-router";
import { getMockTeam } from "@/lib/mock-data/team";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/_public/about")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { team: getMockTeam() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        const team = data.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role || '',
          bio: m.bio || '',
          photo: m.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        }));
        return { team };
      } else {
        return { team: getMockTeam() };
      }
    } catch (e) {
      console.error("About page team fetch error:", e);
      return { team: getMockTeam() };
    }
  },
  head: () => ({
    meta: [
      { title: "About — Elicit" },
      { name: "description", content: "Elicit is a fifteen-year-old interior design studio working at the intersection of architecture, craft and the way people live." },
      { property: "og:title", content: "About — Elicit" },
    ],
  }),
  component: AboutPage,
});

const awards = [
  "AD100 — India · 2024",
  "Wallpaper* Design Award · 2023",
  "Elle Decor Designer of the Year · 2023",
  "Dezeen Award, Hospitality Interior · 2022",
  "IIID Award, Best Residential · 2021",
];

const strip = [
  "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
];

function AboutPage() {
  const { team } = Route.useLoaderData();
  
  return (
    <>
      <section className="pt-40 pb-20 border-b border-border">
        <div className="container-editorial max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Studio · Est. 2010</p>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[1.05]">A studio built on restraint, craft and the patience to get it right.</h1>
        </div>
      </section>

      <section className="section-y">
        <div className="container-editorial grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Our Story</p>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">Fifteen years of considered work.</h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
            <p>Elicit was founded in Bangalore in 2010 with a simple idea: that good interiors are the product of good thinking, slowed down. We have spent the years since refining what that means in practice.</p>
            <p>Today we are a team of fourteen — designers, architects, project managers, and an in-house execution team — working on a small number of carefully chosen projects each year. We design homes, hotels, restaurants, offices, and the occasional small shop.</p>
            <p>Our work is shaped by a belief that the best interiors are quiet ones. We use natural materials, work closely with craftspeople, and resist the temptation to over-design. We would rather have one extraordinary thing in a room than ten clever ones.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3">
        {strip.map((src, i) => (
          <div key={i} className="relative h-[280px] md:h-[520px] overflow-hidden bg-muted">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </section>

      <section className="section-y border-b border-border">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">The Team</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">The people behind the work.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {team.map((m) => (
              <div key={m.id}>
                <div className="relative overflow-hidden h-[420px] bg-muted">
                  <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-5 font-serif text-2xl">{m.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-accent">{m.role}</p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-editorial grid lg:grid-cols-2 gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Recognition</p>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl">Awards & Recognition</h2>
          </div>
          <ul className="divide-y divide-border border-t border-border">
            {awards.map((a) => (
              <li key={a} className="py-5 font-serif text-xl">{a}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
