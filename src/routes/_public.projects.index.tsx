import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getMockProjects, type ProjectCategory } from "@/lib/mock-data/projects";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/_public/projects/")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { projects: getMockProjects().filter(p => p.status === "Published") };
    }
    try {
      const supabase = getSupabase();
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      const mappedProjects = (projects || []).map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category as ProjectCategory,
        location: p.location || '',
        year: p.year || 0,
        area: p.area_sqft ? `${p.area_sqft} sqft` : '',
        clientType: p.client_type || '',
        cover: p.cover_image_url || '',
        gallery: [] as string[],
        description: p.short_description || '',
        services: p.services_used || [],
        status: (p.status === 'published' ? 'Published' : 'Draft') as "Published" | "Draft",
        createdAt: p.created_at,
      }));
      
      return { projects: mappedProjects };
    } catch (e) {
      console.error("Supabase error, falling back to mock data:", e);
      return { projects: getMockProjects().filter(p => p.status === "Published") };
    }
  },
  head: () => ({
    meta: [
      { title: "Projects — Elicit" },
      { name: "description", content: "A selection of recent residential, hospitality, commercial and retail projects by Elicit." },
      { property: "og:title", content: "Projects — Elicit" },
    ],
  }),
  component: ProjectsPage,
});

const categories: ("All" | ProjectCategory)[] = ["All", "Residential", "Commercial", "Hospitality", "Retail"];

function ProjectsPage() {
  const { projects: initialProjects } = Route.useLoaderData();
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  
  const projects = useMemo(() => {
    return filter === "All" ? initialProjects : initialProjects.filter((p) => p.category === filter);
  }, [filter, initialProjects]);

  return (
    <>
      <section className="pt-40 pb-16 border-b border-border">
        <div className="container-editorial">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Link to="/" className="link-underline">Home</Link> / Projects
          </p>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl">Our Work</h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">A small, considered selection of recent projects across residences, hospitality and commercial spaces.</p>
        </div>
      </section>

      <section className="sticky top-20 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="container-editorial flex flex-wrap items-center gap-2 py-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                filter === c ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="section-y">
        <div className="container-editorial">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
            {projects.map((p, i) => (
              <Link
                key={p.id}
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className={`group ${i % 5 === 0 ? "lg:col-span-2" : ""}`}
              >
                <div className={`relative overflow-hidden bg-muted ${i % 5 === 0 ? "h-[560px]" : "h-[440px]"}`}>
                  <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl">{p.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{p.category} · {p.location}</p>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground shrink-0">{p.year}</p>
                </div>
              </Link>
            ))}
          </div>

          {projects.length === 0 && (
            <p className="text-center text-muted-foreground py-20">No projects in this category yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
