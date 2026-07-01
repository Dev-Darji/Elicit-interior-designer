import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { Section, FieldText, FieldSelect, ImageDropzone } from "@/components/admin/project-form";
import { TipTapEditor } from "@/components/admin/tiptap-editor";
import { StatusBadge } from "./admin.dashboard";
import { getAllMockPosts } from "@/lib/mock-data/blog-posts";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { revalidatePages } from "@/lib/actions/revalidate";


export const Route = createFileRoute("/admin/journal")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { initialPosts: getAllMockPosts() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      const mapped = (data || []).map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.meta_description || 'Notes from the studio.',
        body: '',
        body_json: p.body_json,
        category: p.category || 'Journal',
        tags: p.tags || [],
        cover: p.cover_image_url || 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=800&q=80',
        author: p.author || 'Elicit',
        date: p.published_at ? new Date(p.published_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString(),
        readTime: p.read_time_minutes ? `${p.read_time_minutes} min read` : '5 min read',
        status: (p.status === 'published' ? 'Published' : 'Draft') as "Published" | "Draft",
        meta_title: p.meta_title || '',
        meta_description: p.meta_description || '',
        read_time_minutes: p.read_time_minutes || 5,
      }));
      return { initialPosts: mapped };
    } catch (e) {
      console.error(e);
      return { initialPosts: getAllMockPosts() };
    }
  },
  head: () => ({ meta: [{ title: "Journal — Admin" }] }),
  component: JournalAdmin,
});

function JournalAdmin() {
  const { initialPosts } = Route.useLoaderData();
  const navigate = useNavigate();
  const [items, setItems] = useState(initialPosts);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [cover, setCover] = useState<string | undefined>("");
  const [category, setCategory] = useState("Essays");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("Elicit");
  const [readTime, setReadTime] = useState("5");
  const [bodyJson, setBodyJson] = useState<any>(null);
  const [status, setStatus] = useState<"Draft" | "Published">("Draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setItems(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    if (!editing) return;
    setErrors({});

    if (editing === "new") {
      setTitle("");
      setSlug("");
      setCover(undefined);
      setCategory("Essays");
      setTags("");
      setAuthor("Elicit");
      setReadTime("5");
      setBodyJson(null);
      setStatus("Draft");
      setMetaTitle("");
      setMetaDescription("");
    } else {
      const p = items.find((x) => x.id === editing);
      if (p) {
        setTitle(p.title);
        setSlug(p.slug);
        setCover(p.cover);
        setCategory(p.category);
        setTags(p.tags?.join(", ") ?? "");
        setAuthor(p.author);
        setReadTime(String(p.read_time_minutes || 5));
        setBodyJson(p.body_json);
        setStatus(p.status);
        setMetaTitle(p.meta_title || "");
        setMetaDescription(p.meta_description || "");
      }
    }
  }, [editing, items]);

  const slugify = (s: string) => {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Perform validation
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!slug.trim()) {
      newErrors.slug = "Slug is required";
    }
    if (!cover) {
      newErrors.cover = "Cover image is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Find first error and scroll to it
      const firstErrorKey = Object.keys(newErrors)[0];
      setTimeout(() => {
        const element = document.getElementById(firstErrorKey);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          const input = element.tagName === "INPUT" || element.tagName === "TEXTAREA"
            ? element
            : element.querySelector("input, textarea, select, button");
          if (input) {
            (input as HTMLElement).focus();
          }
        }
      }, 50);
      return;
    }

    setErrors({});

    const postData = {
      title,
      slug,
      cover_image_url: cover || null,
      category,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      author,
      read_time_minutes: parseInt(readTime) || 5,
      body_json: bodyJson,
      status: status.toLowerCase(),
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      published_at: status === "Published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const toastId = toast.loading("Saving article...");
    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        if (editing === "new") {
          const { error } = await supabase
            .from('blog_posts')
            .insert({
              ...postData,
              created_at: new Date().toISOString(),
            });
          if (error) throw error;
          toast.success("Article created successfully!", { id: toastId });
        } else {
          const { error } = await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', editing);
          if (error) throw error;
          toast.success("Article updated successfully!", { id: toastId });
        }

        // Trigger On-Demand ISR revalidation
        revalidatePages({ data: ["/", "/journal", `/journal/${slug}`] }).catch(console.error);
      } else {
        toast.success("Mock Success: Article saved locally.", { id: toastId });
      }

      setEditing(null);
      navigate({ to: "." });
    } catch (e) {
      console.error(e);
      toast.error("Failed to save article.", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    setItems(items.filter((x) => x.id !== confirmDeleteId));
    
    if (isSupabaseConfigured()) {
      const toastId = toast.loading("Deleting article...");
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', confirmDeleteId);
          
        if (error) throw error;
        toast.success("Article deleted successfully!", { id: toastId });

        const target = items.find(x => x.id === confirmDeleteId);
        if (target) {
          revalidatePages({ data: ["/", "/journal", `/journal/${target.slug}`] }).catch(console.error);
        }
      } catch (e) {
        toast.error("Failed to delete article.", { id: toastId });
        console.error(e);
      }
    } else {
      toast.success("Mock: Article deleted locally.");
    }
    
    setConfirmDeleteId(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Journal"
        description="Manage articles and essays."
        action={
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-[0.2em]">
            <Plus className="h-4 w-4" /> Add Article
          </button>
        }
      />

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr className="border-b border-border">
              <th className="w-20 text-left px-6 py-3 font-normal">Cover</th>
              <th className="text-left px-6 py-3 font-normal">Title</th>
              <th className="text-left px-6 py-3 font-normal">Category</th>
              <th className="text-left px-6 py-3 font-normal">Status</th>
              <th className="text-left px-6 py-3 font-normal">Published</th>
              <th className="text-right px-6 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-background">
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
                    <p className="text-xs text-muted-foreground">by {p.author}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground align-middle">{p.category}</td>
                <td className="px-6 py-4 align-middle"><StatusBadge status={p.status} /></td>
                <td className="px-6 py-4 text-muted-foreground align-middle">{p.date}</td>
                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing(p.id)} className="p-2 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setConfirmDeleteId(p.id)} className="p-2 hover:bg-muted text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No articles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setEditing(null)}>
          <aside className="h-full w-full max-w-3xl bg-background border-l border-border flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <h3 className="font-serif text-xl">{editing === "new" ? "New Article" : "Edit Article"}</h3>
              <button onClick={() => setEditing(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <form className="flex-1 overflow-y-auto p-6 space-y-6" onSubmit={handleSave}>
              <Section title="Article">
                <FieldText id="title" label="Title" value={title} onChange={(v) => { setTitle(v); if (editing === "new") setSlug(slugify(v)); }} error={errors.title} />
                <FieldText id="slug" label="Slug" value={slug} onChange={setSlug} hint={`/journal/${slug || "slug"}`} error={errors.slug} />
                <ImageDropzone id="cover" label="Cover Image" value={cover} onChange={setCover} bucket="journal" error={errors.cover} />
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <FieldSelect 
                    label="Category" 
                    options={["Essays", "Material", "Field Notes", "Guides", "Craft", "Travel"]} 
                    value={category}
                    onChange={setCategory}
                  />
                  <FieldText label="Tags (comma separated)" value={tags} onChange={setTags} />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <FieldText label="Author" value={author} onChange={setAuthor} />
                  <FieldText label="Read Time (minutes)" value={readTime} onChange={setReadTime} />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Status</label>
                  <div className="inline-flex border border-border">
                    {(["Draft", "Published"] as const).map((s) => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setStatus(s)} 
                        className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${status === s ? "bg-foreground text-background" : "hover:bg-muted"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <TipTapEditor value={bodyJson} onChange={setBodyJson} label="Content Body" />
              </Section>

              <Section title="SEO">
                <FieldText label="Meta Title" value={metaTitle} onChange={setMetaTitle} />
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Meta Description</label>
                  <textarea 
                    value={metaDescription} 
                    onChange={(e) => setMetaDescription(e.target.value)} 
                    rows={3} 
                    className="w-full border border-border bg-background px-3 py-2.5 focus:outline-none focus:border-accent resize-none" 
                  />
                </div>
              </Section>
              
              <button type="submit" className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition">
                {editing === "new" ? "Create Article" : "Save Changes"}
              </button>
            </form>
          </aside>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setConfirmDeleteId(null)}>
          <div className="bg-card border border-border max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-2xl">Delete article?</h3>
            <p className="mt-3 text-sm text-muted-foreground">This action cannot be undone. The article will be removed from the public website.</p>
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
