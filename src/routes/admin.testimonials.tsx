import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star, X, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { Section, FieldText, FieldTextarea, ImageDropzone } from "@/components/admin/project-form";
import { getMockTestimonials } from "@/lib/mock-data/testimonials";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePages } from "@/lib/actions/revalidate";


export const Route = createFileRoute("/admin/testimonials")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { initialTestimonials: getMockTestimonials() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        const mapped = data.map(t => ({
          id: t.id,
          name: t.client_name,
          projectType: t.project_type || '',
          quote: t.quote || '',
          rating: t.rating || 5,
          photo: t.client_photo_url || '',
          published: t.is_visible ?? true,
          display_order: t.display_order ?? 0,
        }));
        return { initialTestimonials: mapped };
      } else {
        return { initialTestimonials: getMockTestimonials() };
      }
    } catch (e) {
      console.error(e);
      return { initialTestimonials: getMockTestimonials() };
    }
  },
  head: () => ({ meta: [{ title: "Testimonials — Admin" }] }),
  component: TestimonialsAdmin,
});

function TestimonialsAdmin() {
  const { initialTestimonials } = Route.useLoaderData();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>(initialTestimonials);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [photo, setPhoto] = useState<string | undefined>("");
  const [published, setPublished] = useState(true);

  useEffect(() => {
    setItems(initialTestimonials);
  }, [initialTestimonials]);

  useEffect(() => {
    if (!editing) return;

    if (editing === "new") {
      setClientName("");
      setProjectType("");
      setQuote("");
      setRating(5);
      setPhoto(undefined);
      setPublished(true);
    } else {
      const t = items.find(x => x.id === editing);
      if (t) {
        setClientName(t.name);
        setProjectType(t.projectType);
        setQuote(t.quote);
        setRating(t.rating);
        setPhoto(t.photo);
        setPublished(t.published);
      }
    }
  }, [editing, items]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setItems(reordered);

    if (isSupabaseConfigured()) {
      const toastId = toast.loading("Saving testimonials order...");
      try {
        const supabase = getSupabase();
        await Promise.all(
          reordered.map((item, idx) => 
            supabase
              .from('testimonials')
              .update({ display_order: idx })
              .eq('id', item.id)
          )
        );
        toast.success("Order saved successfully!", { id: toastId });
        
        // Revalidate homepage where testimonials display
        revalidatePages({ data: ["/"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to save order.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Testimonials order updated locally.");
    }
  };

  const handleTogglePublished = async (id: string, currentlyPublished: boolean) => {
    const nextVal = !currentlyPublished;
    setItems(items.map(item => item.id === id ? { ...item, published: nextVal } : item));

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('testimonials')
          .update({ is_visible: nextVal })
          .eq('id', id);
        if (error) throw error;
        toast.success(nextVal ? "Testimonial published" : "Testimonial hidden");
        revalidatePages({ data: ["/"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to update status in database.");
        console.error(e);
      }
    } else {
      toast.success(`Mock: Testimonial toggled to ${nextVal ? "Published" : "Hidden"}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error("Client Name is required");
      return;
    }
    if (!quote.trim()) {
      toast.error("Quote is required");
      return;
    }

    const testimonialData = {
      client_name: clientName,
      project_type: projectType,
      quote,
      rating,
      client_photo_url: photo || null,
      is_visible: published,
      updated_at: new Date().toISOString()
    };

    const toastId = toast.loading("Saving testimonial...");
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (editing === "new") {
          const { error } = await supabase
            .from('testimonials')
            .insert({
              ...testimonialData,
              display_order: 9999,
              created_at: new Date().toISOString()
            });
          if (error) throw error;
          toast.success("Testimonial added successfully!", { id: toastId });
        } else {
          const { error } = await supabase
            .from('testimonials')
            .update(testimonialData)
            .eq('id', editing);
          if (error) throw error;
          toast.success("Testimonial updated successfully!", { id: toastId });
        }
        revalidatePages({ data: ["/"] }).catch(console.error);
      } else {
        toast.success("Mock Success: Testimonial saved locally.", { id: toastId });
      }

      setEditing(null);
      navigate({ to: "." });
    } catch (e) {
      console.error(e);
      toast.error("Failed to save testimonial.", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    setItems(items.filter(x => x.id !== confirmDeleteId));

    if (isSupabaseConfigured()) {
      const toastId = toast.loading("Deleting testimonial...");
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('testimonials')
          .delete()
          .eq('id', confirmDeleteId);
        if (error) throw error;
        toast.success("Testimonial deleted successfully!", { id: toastId });
        revalidatePages({ data: ["/"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to delete testimonial.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Testimonial deleted locally.");
    }

    setConfirmDeleteId(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        description="Client quotes shown on the homepage. Drag handles to reorder."
        action={
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-[0.2em]">
            <Plus className="h-4 w-4" /> Add Testimonial
          </button>
        }
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="testimonials-list">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="border border-border bg-card divide-y divide-border"
            >
              {items.map((t, index) => (
                <Draggable key={t.id} draggableId={t.id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-background/50 ${snapshot.isDragging ? "bg-muted shadow-md" : ""}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <span 
                          {...provided.dragHandleProps} 
                          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mr-1 shrink-0"
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <img src={t.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt="" className="h-12 w-12 rounded-full object-cover bg-muted shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-base">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.projectType}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/40 pt-3 sm:pt-0 sm:border-0">
                        <div className="flex text-accent shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "fill-current text-accent" : "text-border"}`} />
                          ))}
                        </div>
                        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none shrink-0">
                          <input 
                            type="checkbox" 
                            checked={t.published} 
                            onChange={() => handleTogglePublished(t.id, t.published)}
                            className="accent-foreground" 
                          />
                          Published
                        </label>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditing(t.id)} className="p-2 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setConfirmDeleteId(t.id)} className="p-2 hover:bg-muted text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {items.length === 0 && (
                <div className="p-10 text-center text-muted-foreground">
                  No testimonials found.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setEditing(null)}>
          <aside className="h-full w-full max-w-xl bg-background border-l border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-serif text-xl">{editing === "new" ? "Add Testimonial" : "Edit Testimonial"}</h3>
              <button onClick={() => setEditing(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <form className="p-6 space-y-6" onSubmit={handleSave}>
              <Section title="Testimonial">
                <FieldText label="Client Name" value={clientName} onChange={setClientName} />
                <FieldText label="Project Type" value={projectType} onChange={setProjectType} />
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Quote</label>
                  <textarea 
                    value={quote} 
                    onChange={(e) => setQuote(e.target.value)} 
                    rows={5} 
                    className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setRating(n)}>
                        <Star className={`h-6 w-6 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <ImageDropzone label="Photo" value={photo} onChange={setPhoto} bucket="team" />
                <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={published} 
                    onChange={(e) => setPublished(e.target.checked)}
                    className="accent-foreground" 
                  />
                  <span>Show this testimonial on home page</span>
                </label>
              </Section>
              <button type="submit" className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition">
                {editing === "new" ? "Add Testimonial" : "Save Changes"}
              </button>
            </form>
          </aside>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-card border border-border max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl">Delete testimonial?</h3>
            <p className="mt-3 text-sm text-muted-foreground">This action cannot be undone. The testimonial will be removed from the public website.</p>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] border border-border hover:bg-muted">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2.5 text-xs uppercase tracking-[0.2em] bg-destructive text-destructive-foreground">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
