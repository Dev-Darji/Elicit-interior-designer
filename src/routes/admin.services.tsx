import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { GripVertical, Pencil, Trash2, Plus, X } from "lucide-react";
import * as Icons from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { Section, FieldText, FieldTextarea, ImageDropzone } from "@/components/admin/project-form";
import { getMockServices } from "@/lib/mock-data/services";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePages } from "@/lib/actions/revalidate";


export const Route = createFileRoute("/admin/services")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { initialServices: getMockServices() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        const mapped = data.map(s => {
          const fullDesc = (s.full_description_json as any) || {};
          return {
            id: s.id,
            title: s.title,
            slug: s.slug || '',
            iconName: s.icon || 'Sparkles',
            short: s.short_description || '',
            description: fullDesc.description || s.short_description || '',
            deliverables: fullDesc.deliverables || [],
            image: s.image_url || '',
            visible: s.is_visible ?? true,
            order: s.display_order ?? 0,
          };
        });
        return { initialServices: mapped };
      } else {
        return { initialServices: getMockServices() };
      }
    } catch (e) {
      console.error(e);
      return { initialServices: getMockServices() };
    }
  },
  head: () => ({ meta: [{ title: "Services — Admin" }] }),
  component: ServicesAdmin,
});

const iconChoices = ["Compass", "PenTool", "Hammer", "RefreshCw", "Building2", "Sparkles", "Home", "Lamp", "Sofa", "Brush", "Ruler", "Layers"];

function ServicesAdmin() {
  const { initialServices } = Route.useLoaderData();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>(initialServices);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Sparkles");
  const [cover, setCover] = useState<string | undefined>("");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setItems(initialServices);
  }, [initialServices]);

  useEffect(() => {
    if (!editing) return;

    if (editing === "new") {
      setTitle("");
      setShortDesc("");
      setFullDesc("");
      setDeliverables("");
      setSelectedIcon("Sparkles");
      setCover(undefined);
      setVisible(true);
    } else {
      const s = items.find(x => x.id === editing);
      if (s) {
        setTitle(s.title);
        setShortDesc(s.short);
        setFullDesc(s.description);
        setDeliverables(s.deliverables?.join(", ") ?? "");
        setSelectedIcon(s.iconName || "Sparkles");
        setCover(s.image);
        setVisible(s.visible);
      }
    }
  }, [editing, items]);

  const slugify = (s: string) => {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    setItems(reordered);
    
    if (isSupabaseConfigured()) {
      const toastId = toast.loading("Saving services order...");
      try {
        const supabase = getSupabase();
        await Promise.all(
          reordered.map((item, idx) => 
            supabase
              .from('services')
              .update({ display_order: idx })
              .eq('id', item.id)
          )
        );
        toast.success("Order saved successfully!", { id: toastId });
        
        // Revalidate homepage and services listing
        revalidatePages({ data: ["/", "/services"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to save new order.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Services order updated locally.");
    }
  };

  const handleToggleVisibility = async (id: string, currentlyVisible: boolean) => {
    const nextVal = !currentlyVisible;
    setItems(items.map(item => item.id === id ? { ...item, visible: nextVal } : item));

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('services')
          .update({ is_visible: nextVal })
          .eq('id', id);
        if (error) throw error;
        toast.success(nextVal ? "Service visible on public site" : "Service hidden");
        revalidatePages({ data: ["/", "/services"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to update visibility in database.");
        console.error(e);
      }
    } else {
      toast.success(`Mock: Visibility toggled to ${nextVal}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const serviceData = {
      title,
      slug: slugify(title),
      icon: selectedIcon,
      short_description: shortDesc,
      image_url: cover || null,
      is_visible: visible,
      full_description_json: {
        description: fullDesc,
        deliverables: deliverables.split(",").map(d => d.trim()).filter(Boolean)
      }
    };

    const toastId = toast.loading("Saving service...");
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (editing === "new") {
          const { error } = await supabase
            .from('services')
            .insert({
              ...serviceData,
              display_order: 9999,
              created_at: new Date().toISOString()
            });
          if (error) throw error;
          toast.success("Service added successfully!", { id: toastId });
        } else {
          const { error } = await supabase
            .from('services')
            .update(serviceData)
            .eq('id', editing);
          if (error) throw error;
          toast.success("Service updated successfully!", { id: toastId });
        }
        revalidatePages({ data: ["/", "/services"] }).catch(console.error);
      } else {
        toast.success("Mock Success: Service saved locally.", { id: toastId });
      }

      setEditing(null);
      navigate({ to: "." });
    } catch (e) {
      console.error(e);
      toast.error("Failed to save service.", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    setItems(items.filter(x => x.id !== confirmDeleteId));
    
    if (isSupabaseConfigured()) {
      const toastId = toast.loading("Deleting service...");
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', confirmDeleteId);
        if (error) throw error;
        toast.success("Service deleted successfully!", { id: toastId });
        revalidatePages({ data: ["/", "/services"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to delete service.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Service deleted locally.");
    }

    setConfirmDeleteId(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Drag rows to reorder, toggle public visibility, or edit services."
        action={
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-[0.2em]">
            <Plus className="h-4 w-4" /> Add Service
          </button>
        }
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="services-list">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {items.map((s, index) => {
                // Dynamically resolve icon, fallback to Sparkles if not found
                const IconComponent = (Icons as any)[s.iconName || 'Sparkles'] || Icons.Sparkles;
                
                return (
                  <Draggable key={s.id} draggableId={s.id} index={index}>
                    {(provided, snapshot) => (
                      <li 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`border border-border bg-card flex items-center gap-4 p-4 ${snapshot.isDragging ? "bg-muted shadow-md" : ""}`}
                      >
                        <span {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <IconComponent className="h-5 w-5 text-accent shrink-0" strokeWidth={1.25} />
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-lg">{s.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.short}</p>
                        </div>
                        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={s.visible} 
                            onChange={() => handleToggleVisibility(s.id, s.visible)}
                            className="accent-foreground" 
                          />
                          Visible
                        </label>
                        <button onClick={() => setEditing(s.id)} className="p-2 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setConfirmDeleteId(s.id)} className="p-2 hover:bg-muted text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </li>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              {items.length === 0 && (
                <li className="border border-border border-dashed p-10 text-center text-muted-foreground">
                  No services found.
                </li>
              )}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setEditing(null)}>
          <aside className="h-full w-full max-w-2xl bg-background border-l border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-serif text-xl">{editing === "new" ? "Add Service" : "Edit Service"}</h3>
              <button onClick={() => setEditing(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <form className="p-6 space-y-6" onSubmit={handleSave}>
              <Section title="Service">
                <FieldText label="Title" value={title} onChange={setTitle} />
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Short Description</label>
                  <textarea 
                    value={shortDesc} 
                    onChange={(e) => setShortDesc(e.target.value)} 
                    rows={2} 
                    className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Full Description</label>
                  <textarea 
                    value={fullDesc} 
                    onChange={(e) => setFullDesc(e.target.value)} 
                    rows={5} 
                    className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none" 
                  />
                </div>
                <FieldText label="Deliverables (comma separated)" value={deliverables} onChange={setDeliverables} />
              </Section>
              
              <Section title="Icon">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {iconChoices.map((i) => {
                    const TempIcon = (Icons as any)[i] || Icons.Sparkles;
                    return (
                      <button 
                        type="button" 
                        key={i} 
                        onClick={() => setSelectedIcon(i)}
                        className={`border p-3 text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 hover:border-foreground transition ${selectedIcon === i ? "border-foreground bg-muted" : "border-border"}`}
                      >
                        <TempIcon className="h-4 w-4 text-accent" strokeWidth={1.25} />
                        <span>{i}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>
              
              <Section title="Image">
                <ImageDropzone label="Cover Image" value={cover} onChange={setCover} bucket="projects" />
              </Section>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                  <input 
                    type="checkbox" 
                    checked={visible} 
                    onChange={(e) => setVisible(e.target.checked)} 
                    className="accent-foreground" 
                  />
                  <span>Show this service on the public website</span>
                </label>
              </div>
              
              <button type="submit" className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition">
                {editing === "new" ? "Add Service" : "Save Changes"}
              </button>
            </form>
          </aside>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-card border border-border max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl">Delete service?</h3>
            <p className="mt-3 text-sm text-muted-foreground">This action cannot be undone. It will remove the service from the public website.</p>
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
