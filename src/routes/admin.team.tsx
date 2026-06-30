import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { Section, FieldText, FieldTextarea, ImageDropzone } from "@/components/admin/project-form";
import { getMockTeam } from "@/lib/mock-data/team";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePages } from "@/lib/actions/revalidate";


export const Route = createFileRoute("/admin/team")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { initialTeam: getMockTeam() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        const mapped = data.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          bio: m.bio || '',
          photo: m.photo_url || '',
          visible: m.is_visible ?? true,
          display_order: m.display_order ?? 0,
        }));
        return { initialTeam: mapped };
      } else {
        return { initialTeam: getMockTeam() };
      }
    } catch (e) {
      console.error(e);
      return { initialTeam: getMockTeam() };
    }
  },
  head: () => ({ meta: [{ title: "Team — Admin" }] }),
  component: TeamAdmin,
});

function TeamAdmin() {
  const { initialTeam } = Route.useLoaderData();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>(initialTeam);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<string | undefined>("");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setItems(initialTeam);
  }, [initialTeam]);

  useEffect(() => {
    if (!editing) return;

    if (editing === "new") {
      setName("");
      setRole("");
      setBio("");
      setPhoto(undefined);
      setVisible(true);
    } else {
      const m = items.find(x => x.id === editing);
      if (m) {
        setName(m.name);
        setRole(m.role);
        setBio(m.bio);
        setPhoto(m.photo);
        setVisible(m.visible);
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
      const toastId = toast.loading("Saving team order...");
      try {
        const supabase = getSupabase();
        await Promise.all(
          reordered.map((item, idx) => 
            supabase
              .from('team_members')
              .update({ display_order: idx })
              .eq('id', item.id)
          )
        );
        toast.success("Order saved successfully!", { id: toastId });
        
        // Revalidate About page
        revalidatePages({ data: ["/about"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to save order.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Team order updated locally.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!role.trim()) {
      toast.error("Role is required");
      return;
    }

    const memberData = {
      name,
      role,
      bio,
      photo_url: photo || null,
      is_visible: visible,
      updated_at: new Date().toISOString()
    };

    const toastId = toast.loading("Saving team member...");
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (editing === "new") {
          const { error } = await supabase
            .from('team_members')
            .insert({
              ...memberData,
              display_order: 9999,
              created_at: new Date().toISOString()
            });
          if (error) throw error;
          toast.success("Team member added successfully!", { id: toastId });
        } else {
          const { error } = await supabase
            .from('team_members')
            .update(memberData)
            .eq('id', editing);
          if (error) throw error;
          toast.success("Team member updated successfully!", { id: toastId });
        }
        
        // Revalidate About page
        revalidatePages({ data: ["/about"] }).catch(console.error);
      } else {
        toast.success("Mock Success: Team member saved locally.", { id: toastId });
      }

      setEditing(null);
      navigate({ to: "." });
    } catch (e) {
      console.error(e);
      toast.error("Failed to save team member.", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    setItems(items.filter(x => x.id !== confirmDeleteId));

    if (isSupabaseConfigured()) {
      const toastId = toast.loading("Deleting team member...");
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', confirmDeleteId);
        if (error) throw error;
        toast.success("Team member deleted successfully!", { id: toastId });
        
        // Revalidate About page
        revalidatePages({ data: ["/about"] }).catch(console.error);
      } catch (e) {
        toast.error("Failed to delete team member.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Team member deleted locally.");
    }

    setConfirmDeleteId(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Team"
        description="Manage team members shown on the About page. Drag handles to reorder."
        action={
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-[0.2em]">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        }
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="team-list" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {items.map((m, index) => (
                <Draggable key={m.id} draggableId={m.id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`border border-border bg-card relative ${snapshot.isDragging ? "shadow-lg bg-muted" : ""}`}
                    >
                      <div className="relative h-64 bg-muted overflow-hidden">
                        <img src={m.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'} alt={m.name} className="h-full w-full object-cover" />
                        <span 
                          {...provided.dragHandleProps} 
                          className="absolute top-2 left-2 bg-background/80 hover:bg-background p-1.5 cursor-grab active:cursor-grabbing border border-border"
                          title="Drag to reorder"
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="p-5">
                        <p className="font-serif text-xl">{m.name}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-accent mt-1">{m.role}</p>
                        {!m.visible && <p className="text-[10px] text-muted-foreground mt-1 italic">Hidden</p>}
                        <div className="mt-4 flex justify-end gap-2">
                          <button onClick={() => setEditing(m.id)} className="p-2 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setConfirmDeleteId(m.id)} className="p-2 hover:bg-muted text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {items.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-4 border border-border border-dashed p-10 text-center text-muted-foreground">
                  No team members found.
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
              <h3 className="font-serif text-xl">{editing === "new" ? "Add Member" : "Edit Member"}</h3>
              <button onClick={() => setEditing(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <form className="p-6 space-y-6" onSubmit={handleSave}>
              <Section title="Member">
                <FieldText label="Name" value={name} onChange={setName} />
                <FieldText label="Role" value={role} onChange={setRole} />
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    rows={4} 
                    className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none" 
                  />
                </div>
                <ImageDropzone label="Photo" value={photo} onChange={setPhoto} bucket="team" />
                <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={visible} 
                    onChange={(e) => setVisible(e.target.checked)}
                    className="accent-foreground" 
                  />
                  <span>Visible on public site</span>
                </label>
              </Section>
              <button type="submit" className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition">
                {editing === "new" ? "Add Member" : "Save Changes"}
              </button>
            </form>
          </aside>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-card border border-border max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl">Delete member?</h3>
            <p className="mt-3 text-sm text-muted-foreground">This action cannot be undone. The member will be removed from the public site.</p>
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
