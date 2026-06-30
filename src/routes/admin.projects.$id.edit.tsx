import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProjectForm } from "@/components/admin/project-form";
import { getMockProjects } from "@/lib/mock-data/projects";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/admin/projects/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Project — Admin" }] }),
  loader: async ({ params }) => {
    if (!isSupabaseConfigured()) {
      const project = getMockProjects().find((p) => p.id === params.id);
      if (!project) throw notFound();
      return { project };
    }

    try {
      const supabase = getSupabase();
      const { data: project, error } = await supabase
        .from('projects')
        .select('*, project_images(*)')
        .eq('id', params.id)
        .single();

      if (error || !project) {
        throw notFound();
      }

      const gallery = (project.project_images || [])
        .filter((img: any) => img.image_type === 'gallery')
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((img: any) => img.url);

      const mapped = {
        id: project.id,
        slug: project.slug,
        title: project.title,
        category: project.category,
        location: project.location || '',
        year: project.year || 0,
        area: project.area_sqft ? `${project.area_sqft} sqft` : '',
        clientType: project.client_type || '',
        cover: project.cover_image_url || '',
        gallery: gallery,
        description: project.short_description || '',
        body_json: project.body_json,
        services: project.services_used || [],
        status: (project.status === 'published' ? 'Published' : 'Draft') as "Published" | "Draft",
        createdAt: new Date(project.created_at).toLocaleDateString(),
      };

      return { project: mapped };
    } catch (e) {
      console.error(e);
      const project = getMockProjects().find((p) => p.id === params.id);
      if (!project) throw notFound();
      return { project };
    }
  },
  notFoundComponent: () => <p className="p-10">Project not found.</p>,
  errorComponent: ({ reset }) => (
    <div className="p-10">
      <p>Couldn't load this project.</p>
      <button onClick={reset} className="mt-4 link-underline text-xs uppercase tracking-[0.2em]">Try again</button>
    </div>
  ),
  component: EditPage,
});

function EditPage() {
  const { project } = Route.useLoaderData();
  return <ProjectForm mode="edit" initial={project} />;
}
