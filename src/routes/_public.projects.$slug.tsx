import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { getMockProjectBySlug, getMockProjects, type Project } from "@/lib/mock-data/projects";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { TipTapRenderer } from "@/components/public/tiptap-renderer";

export const Route = createFileRoute("/_public/projects/$slug")({
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    return {
      meta: [
        { title: p ? `${p.title} — Elicit` : "Project — Elicit" },
        { name: "description", content: p?.description?.slice(0, 160) ?? "" },
        { property: "og:title", content: p?.title ?? "Project" },
        { property: "og:image", content: p?.cover ?? "" },
      ],
    };
  },
  loader: async ({ params }) => {
    if (!isSupabaseConfigured()) {
      const project = getMockProjectBySlug(params.slug);
      if (!project) throw notFound();
      const related = getMockProjects()
        .filter((p) => p.slug !== project.slug && p.category === project.category)
        .slice(0, 3);
      return { project, related };
    }

    try {
      const supabase = getSupabase();
      const { data: project, error } = await supabase
        .from('projects')
        .select('*, project_images(*)')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single();
        
      if (error || !project) {
        // Fall back to mock if slug exists in mock
        const mockProject = getMockProjectBySlug(params.slug);
        if (mockProject) {
          const related = getMockProjects()
            .filter((p) => p.slug !== mockProject.slug && p.category === mockProject.category)
            .slice(0, 3);
          return { project: mockProject, related };
        }
        throw notFound();
      }

      const gallery = (project.project_images || [])
        .filter((img: any) => img.image_type === 'gallery')
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => img.url);

      // Fetch related projects from Supabase
      const { data: relatedData } = await supabase
        .from('projects')
        .select('id, title, slug, category, cover_image_url, year')
        .eq('status', 'published')
        .eq('category', project.category)
        .neq('id', project.id)
        .limit(3);

      const related = (relatedData || []).map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        year: p.year || 0,
        cover: p.cover_image_url || '',
      }));

      const mappedProject = {
        id: project.id,
        slug: project.slug,
        title: project.title,
        category: project.category,
        location: project.location || '',
        year: project.year || 0,
        area: project.area_sqft ? `${project.area_sqft} sqft` : '',
        clientType: project.client_type || '',
        cover: project.cover_image_url || '',
        gallery: gallery.length > 0 ? gallery : [project.cover_image_url || ''],
        description: project.short_description || '',
        body_json: project.body_json,
        services: project.services_used || [],
        status: project.status === 'published' ? 'Published' : 'Draft',
        createdAt: project.created_at,
      };

      return { project: mappedProject, related };
    } catch (e) {
      console.error("Error loading project from Supabase:", e);
      const mockProject = getMockProjectBySlug(params.slug);
      if (!mockProject) throw notFound();
      const related = getMockProjects()
        .filter((p) => p.slug !== mockProject.slug && p.category === mockProject.category)
        .slice(0, 3);
      return { project: mockProject, related };
    }
  },
  notFoundComponent: () => (
    <div className="container-editorial pt-40 pb-32 text-center">
      <h1 className="font-serif text-4xl">Project not found</h1>
      <Link to="/projects" className="mt-6 inline-block link-underline text-sm uppercase tracking-[0.2em]">Back to all projects</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-editorial pt-40 pb-32 text-center">
      <h1 className="font-serif text-3xl">Couldn't load this project</h1>
      <button onClick={reset} className="mt-6 link-underline text-sm uppercase tracking-[0.2em]">Try again</button>
    </div>
  ),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { project, related } = Route.useLoaderData();
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
        <img src={project.cover} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        <div className="relative container-editorial h-full flex flex-col justify-end pb-16 text-cream">
          <p className="text-xs uppercase tracking-[0.3em] opacity-80">{project.category}</p>
          <h1 className="mt-4 font-serif text-5xl md:text-7xl max-w-4xl">{project.title}</h1>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container-editorial grid grid-cols-2 md:grid-cols-5 gap-8 py-10 text-xs uppercase tracking-[0.2em]">
          {[
            ["Category", project.category],
            ["Location", project.location],
            ["Year", String(project.year)],
            ["Area", project.area],
            ["Client", project.clientType],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-muted-foreground">{k}</p>
              <p className="mt-2 text-foreground tracking-normal text-sm normal-case">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-y">
        <div className="container-editorial grid lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">The Brief</p>
            {project.body_json ? (
              <TipTapRenderer content={project.body_json} />
            ) : (
              project.description?.split("\n").map((p: string, i: number) => (
                <p key={i} className="font-serif text-2xl md:text-[28px] leading-[1.45] text-foreground/90">{p}</p>
              ))
            )}
          </div>
          <aside className="lg:col-span-1 lg:pl-8 lg:border-l border-border space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Services</p>
              <ul className="mt-3 space-y-2 text-sm">
                {project.services?.map((s: string) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <Link to="/contact" className="inline-flex border border-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors">
              Start a Similar Project
            </Link>
          </aside>
        </div>
      </section>

      <section className="pb-32">
        <div className="container-editorial">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {project.gallery?.map((src: string, i: number) => {
              const span = i % 5 === 0 ? "md:col-span-6 h-[640px]" : i % 5 === 1 || i % 5 === 2 ? "md:col-span-3 h-[480px]" : "md:col-span-2 h-[400px]";
              return (
                <button key={i} onClick={() => setLightbox(src)} className={`relative overflow-hidden bg-muted group ${span}`}>
                  <img src={src} alt={`${project.title} gallery ${i + 1}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border section-y">
          <div className="container-editorial">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-10">Related Projects</p>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link key={p.id} to="/projects/$slug" params={{ slug: p.slug }} className="group">
                  <div className="relative overflow-hidden h-[400px] bg-muted">
                    <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl">{p.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{p.category} · {p.year}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button aria-label="Close" className="absolute top-6 right-6 text-cream"><X className="h-6 w-6" /></button>
          <img src={lightbox} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </>
  );
}
