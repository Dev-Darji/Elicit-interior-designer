import { UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { getMockServices } from "@/lib/mock-data/services";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { uploadImage } from "@/lib/supabase/storage";
import { TipTapEditor } from "./tiptap-editor";
import { revalidatePages } from "@/lib/actions/revalidate";



const categories = ["Residential", "Commercial", "Hospitality", "Retail"];

export function ProjectForm({ initial, mode }: { initial?: any; mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const services = getMockServices();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [status, setStatus] = useState(initial?.status ?? "Draft");
  const [category, setCategory] = useState(initial?.category ?? "Residential");
  const [cover, setCover] = useState<string | undefined>(initial?.cover);
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  
  const [description, setDescription] = useState(initial?.description ?? "");
  const [bodyJson, setBodyJson] = useState<any>(initial?.body_json ?? null);
  
  const [clientType, setClientType] = useState(initial?.clientType ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [area, setArea] = useState(initial?.area ?? "");
  
  const [selectedServices, setSelectedServices] = useState<string[]>(initial?.services ?? []);
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [submitting, setSubmitting] = useState(false);

  const toggleService = (srvTitle: string) => {
    setSelectedServices(prev => 
      prev.includes(srvTitle) ? prev.filter(t => t !== srvTitle) : [...prev, srvTitle]
    );
  };

  const handleSave = async (targetStatus?: "Draft" | "Published") => {
    const finalStatus = targetStatus ?? (status as "Draft" | "Published");
    
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Project slug is required");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(mode === "create" ? "Creating project..." : "Saving project changes...");

    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        
        const projectData = {
          title,
          slug,
          category,
          status: finalStatus.toLowerCase(),
          short_description: description,
          body_json: bodyJson,
          cover_image_url: cover || null,
          client_type: clientType || null,
          location: location || null,
          year: year ? parseInt(year) : null,
          area_sqft: area ? parseInt(area.replace(/[^0-9]/g, '')) : null,
          services_used: selectedServices,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          updated_at: new Date().toISOString()
        };

        if (mode === "create") {
          // Insert project
          const { data: newProj, error: insertError } = await supabase
            .from('projects')
            .insert({
              ...projectData,
              display_order: 9999, // default to end
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (insertError) throw insertError;

          // Insert gallery images
          if (gallery.length > 0) {
            const images = gallery.map((url, idx) => ({
              project_id: newProj.id,
              url,
              display_order: idx,
              image_type: 'gallery'
            }));
            const { error: imgError } = await supabase.from('project_images').insert(images);
            if (imgError) throw imgError;
          }
        } else {
          // Update project
          const { error: updateError } = await supabase
            .from('projects')
            .update(projectData)
            .eq('id', initial.id);

          if (updateError) throw updateError;

          // Replace gallery images
          await supabase
            .from('project_images')
            .delete()
            .eq('project_id', initial.id)
            .eq('image_type', 'gallery');

          if (gallery.length > 0) {
            const images = gallery.map((url, idx) => ({
              project_id: initial.id,
              url,
              display_order: idx,
              image_type: 'gallery'
            }));
            const { error: imgError } = await supabase.from('project_images').insert(images);
            if (imgError) throw imgError;
          }
        }
        
        toast.success(`Project ${finalStatus === "Published" ? "published" : "saved as draft"} successfully!`, { id: toastId });
        
        // Trigger On-Demand ISR revalidation
        revalidatePages({ data: ["/", "/projects", `/projects/${slug}`] }).catch(console.error);
      } else {
        toast.success(`Mock Success: Project saved locally as ${finalStatus}`, { id: toastId });
      }
      
      navigate({ to: "/admin/projects" });
    } catch (e: any) {
      console.error(e);
      const errMsg = e?.message || e?.details || JSON.stringify(e);
      toast.error(`Error saving project: ${errMsg}`, { id: toastId, duration: 8000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={mode === "create" ? "Add Project" : `Edit · ${initial?.title ?? ""}`}
        description="Fill in the details below. All uploads and fields sync directly to your database."
        action={
          <Link to="/admin/projects" className="text-xs uppercase tracking-[0.2em] link-underline">Back to projects</Link>
        }
      />

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <Section title="Basics">
            <FieldText 
              label="Title" 
              value={title} 
              onChange={(v) => { setTitle(v); if (mode === "create") setSlug(slugify(v)); }} 
              disabled={submitting}
            />
            <FieldText 
              label="Slug" 
              value={slug} 
              onChange={setSlug} 
              hint={`/projects/${slug || "your-slug"}`} 
              disabled={submitting}
            />
            <div className="grid sm:grid-cols-2 gap-6">
              <FieldSelect 
                label="Category" 
                options={categories} 
                value={category}
                onChange={setCategory}
                disabled={submitting}
              />
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Status</label>
                <div className="inline-flex border border-border">
                  {(["Draft", "Published"] as const).map((s) => (
                    <button 
                      key={s} 
                      type="button" 
                      onClick={() => setStatus(s)} 
                      disabled={submitting}
                      className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${status === s ? "bg-foreground text-background" : "hover:bg-muted"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Short Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={3} 
                disabled={submitting}
                className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none disabled:opacity-50" 
              />
            </div>

            <TipTapEditor value={bodyJson} onChange={setBodyJson} label="Body (Rich Text)" />
          </Section>

          <Section title="Media">
            <ImageDropzone label="Cover Image" value={cover} onChange={setCover} bucket="projects" />
            <MultiImageDropzone label="Gallery Images" value={gallery} onChange={setGallery} bucket="projects" />
          </Section>

          <Section title="Metadata">
            <div className="grid sm:grid-cols-2 gap-6">
              <FieldText label="Client Type" value={clientType} onChange={setClientType} disabled={submitting} />
              <FieldText label="Location" value={location} onChange={setLocation} disabled={submitting} />
              <FieldText label="Year" value={year} onChange={setYear} disabled={submitting} />
              <FieldText label="Area (sqft)" value={area} onChange={setArea} disabled={submitting} />
            </div>
          </Section>

          <Section title="Services Used">
            <div className="grid sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-3 border border-border px-4 py-3 cursor-pointer hover:border-foreground transition">
                  <input 
                    type="checkbox" 
                    checked={selectedServices.includes(s.title)} 
                    onChange={() => toggleService(s.title)}
                    disabled={submitting}
                    className="accent-foreground" 
                  />
                  <span className="text-sm">{s.title}</span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="SEO">
            <FieldText label="Meta Title" value={metaTitle} onChange={setMetaTitle} disabled={submitting} />
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Meta Description</label>
              <textarea 
                value={metaDescription} 
                onChange={(e) => setMetaDescription(e.target.value)} 
                rows={3} 
                disabled={submitting}
                className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none disabled:opacity-50" 
              />
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <div className="border border-border bg-card p-6 sticky top-6">
            <h3 className="font-serif text-lg">Actions</h3>
            <div className="mt-6 space-y-3">
              <button 
                type="button" 
                onClick={() => handleSave("Draft")}
                disabled={submitting}
                className="w-full border border-border py-3 text-xs uppercase tracking-[0.2em] hover:bg-muted transition disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button 
                type="button" 
                onClick={() => handleSave("Published")}
                disabled={submitting}
                className="w-full bg-foreground text-background py-3 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition disabled:opacity-50"
              >
                Publish Project
              </button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground leading-relaxed">Saving or publishing updates both the database and forces a revalidation of the public website.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card p-6 md:p-8 space-y-6">
      <h2 className="font-serif text-xl border-b border-border pb-3">{title}</h2>
      {children}
    </div>
  );
}

export function FieldText({ label, value, onChange, hint, disabled }: { label: string; value: string; onChange: (v: string) => void; hint?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent disabled:opacity-50"
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FieldSelect({ label, options, value, onChange, disabled }: { label: string; options: string[]; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent disabled:opacity-50"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function ImageDropzone({ label, value, onChange, bucket }: { label: string; value?: string; onChange: (v?: string) => void; bucket: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Uploading image...");
    try {
      const url = await uploadImage(file, bucket);
      onChange(url);
      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      const errorMsg = err?.message || "Upload failed.";
      toast.error(errorMsg, { id: toastId, duration: 6000 });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</label>
      {value ? (
        <div className="relative h-64 bg-muted border border-border overflow-hidden">
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button type="button" onClick={() => onChange(undefined)} className="absolute top-2 right-2 bg-background/80 p-1.5"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <label className="relative cursor-pointer w-full border border-dashed border-border h-48 flex flex-col items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition">
          <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" disabled={uploading} />
          <UploadCloud className="h-7 w-7" strokeWidth={1.25} />
          <p className="mt-3 text-sm">{uploading ? "Uploading..." : "Click to upload image"}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG up to 10MB</p>
        </label>
      )}
    </div>
  );
}

export function MultiImageDropzone({ label, value, onChange, bucket }: { label: string; value: string[]; onChange: (v: string[]) => void; bucket: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${files.length} images...`);
    try {
      const urls = await Promise.all(files.map(file => uploadImage(file, bucket)));
      onChange([...value, ...urls]);
      toast.success("Images uploaded successfully!", { id: toastId });
    } catch (err) {
      toast.error("Upload failed.", { id: toastId });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onChange(items);
  };

  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</label>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="gallery-images" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {value.map((src, i) => (
                <Draggable key={src} draggableId={src} index={i}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`relative h-28 bg-muted border border-border overflow-hidden cursor-grab active:cursor-grabbing ${snapshot.isDragging ? "shadow-lg border-foreground scale-105 z-50" : ""}`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover select-none pointer-events-none" />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); onChange(value.filter((_, k) => k !== i)); }} 
                        className="absolute top-1 right-1 bg-background/80 p-1 border border-border z-10"
                      >
                        <X className="h-3.5 w-3.5 text-foreground hover:scale-105 transition" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <label className="h-28 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition cursor-pointer">
                <input type="file" accept="image/*" multiple onChange={handleFileChange} className="sr-only" disabled={uploading} />
                <UploadCloud className="h-5 w-5" strokeWidth={1.25} />
                <span className="text-[10px] uppercase tracking-wider mt-1">{uploading ? "..." : "Add"}</span>
              </label>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

