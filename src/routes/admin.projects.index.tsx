import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { StatusBadge } from "./admin.dashboard";
import { getMockProjects } from "@/lib/mock-data/projects";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePages } from "@/lib/actions/revalidate";


export const Route = createFileRoute("/admin/projects/")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { initialProjects: getMockProjects() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });

      const mapped = (data || []).map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        location: p.location || '',
        year: p.year || 0,
        area: p.area_sqft ? `${p.area_sqft} sqft` : '',
        clientType: p.client_type || '',
        cover: p.cover_image_url || '',
        gallery: [],
        description: p.short_description || '',
        services: p.services_used || [],
        status: (p.status === 'published' ? 'Published' : 'Draft') as "Published" | "Draft",
        createdAt: new Date(p.created_at).toLocaleDateString(),
        display_order: p.display_order || 0
      }));
      return { initialProjects: mapped };
    } catch (e) {
      console.error(e);
      return { initialProjects: getMockProjects() };
    }
  },
  head: () => ({ meta: [{ title: "Projects — Admin" }] }),
  component: ProjectsAdmin,
});

function ProjectsAdmin() {
  const { initialProjects } = Route.useLoaderData();
  const [items, setItems] = useState(initialProjects);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialProjects);
  }, [initialProjects]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    setItems(reordered);
    
    if (isSupabaseConfigured()) {
      const toastId = toast.loading("Saving new project order...");
      try {
        const supabase = getSupabase();
        
        // Execute updates sequentially or concurrently
        await Promise.all(
          reordered.map((item, idx) => 
            supabase
              .from('projects')
              .update({ display_order: idx })
              .eq('id', item.id)
          )
        );
        
        toast.success("Order saved successfully!", { id: toastId });
        
        // Revalidate listing and homepage since display order changed
        revalidatePages({ data: ["/", "/projects"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to save new order.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Project order updated locally.");
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    
    const targetProj = items.find(p => p.id === confirmId);
    setItems(items.filter(p => p.id !== confirmId));
    
    if (isSupabaseConfigured()) {
      const toastId = toast.loading("Deleting project...");
      try {
        const supabase = getSupabase();
        
        // First delete project images
        await supabase
          .from('project_images')
          .delete()
          .eq('project_id', confirmId);

        // Then delete project
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', confirmId);
          
        if (error) throw error;
        toast.success("Project deleted successfully!", { id: toastId });

        if (targetProj) {
          revalidatePages({ data: ["/", "/projects", `/projects/${targetProj.slug}`] }).catch(console.error);
        }
      } catch (e) {
        toast.error("Failed to delete project.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Project deleted locally.");
    }
    
    setConfirmId(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Projects"
        description="Manage your published and draft project entries. Drag rows by the handle to reorder."
        action={
          <Link to="/admin/projects/new" className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Project
          </Link>
        }
      />

      <div className="border border-border bg-card overflow-x-auto w-full">
        <DragDropContext onDragEnd={handleDragEnd}>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="w-10 px-4 py-3"></th>
                <th className="w-20 text-left px-6 py-3 font-normal">Cover</th>
                <th className="text-left px-6 py-3 font-normal">Title</th>
                <th className="text-left px-6 py-3 font-normal">Category</th>
                <th className="text-left px-6 py-3 font-normal">Status</th>
                <th className="text-left px-6 py-3 font-normal">Created</th>
                <th className="text-right px-6 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <Droppable droppableId="projects-list">
              {(provided) => (
                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                  {items.map((p, index) => (
                    <Draggable key={p.id} draggableId={p.id} index={index}>
                      {(provided, snapshot) => (
                        <tr 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border-b border-border/60 last:border-0 hover:bg-background ${snapshot.isDragging ? "bg-muted shadow-lg" : ""}`}
                        >
                          <td className="px-4 py-4 align-middle">
                            <span {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                              <GripVertical className="h-4 w-4" />
                            </span>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {p.cover ? (
                              <img src={p.cover} alt="" className="h-10 w-14 object-cover bg-muted border border-border/40" />
                            ) : (
                              <div className="h-10 w-14 bg-muted border border-border/40 flex items-center justify-center text-[10px] text-muted-foreground">No Cover</div>
                            )}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div>
                              <p className="font-serif text-base">{p.title}</p>
                              <p className="text-xs text-muted-foreground">/{p.slug}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground align-middle">{p.category}</td>
                          <td className="px-6 py-4 align-middle"><StatusBadge status={p.status} /></td>
                          <td className="px-6 py-4 text-muted-foreground align-middle">{p.createdAt}</td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <Link to="/admin/projects/$id/edit" params={{ id: p.id }} className="p-2 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                              <button onClick={() => setConfirmId(p.id)} className="p-2 hover:bg-muted text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No projects found.</td>
                    </tr>
                  )}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setConfirmId(null)}>
          <div className="bg-card border border-border max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl">Delete project?</h3>
            <p className="mt-3 text-sm text-muted-foreground">This action cannot be undone. The project will be removed from the public site.</p>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setConfirmId(null)} className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] border border-border hover:bg-muted">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] bg-destructive text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
