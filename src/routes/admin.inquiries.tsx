import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { StatusBadge } from "./admin.dashboard";
import { getMockInquiries, type Inquiry, type InquiryStatus } from "@/lib/mock-data/inquiries";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/admin/inquiries")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { initialInquiries: getMockInquiries() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      const mapped = (data || []).map(i => ({
        id: i.id,
        name: i.name,
        email: i.email,
        phone: i.phone || '',
        projectType: i.project_type || 'Other',
        budget: i.budget || '',
        message: i.message,
        status: (i.status === 'new' ? 'New' : i.status === 'read' ? 'Viewed' : i.status === 'replied' ? 'Replied' : 'Archived') as InquiryStatus,
        date: new Date(i.created_at).toLocaleDateString(),
      }));
      return { initialInquiries: mapped };
    } catch (e) {
      console.error(e);
      return { initialInquiries: getMockInquiries() };
    }
  },
  head: () => ({ meta: [{ title: "Inquiries — Admin" }] }),
  component: InquiriesAdmin,
});

const statuses: InquiryStatus[] = ["New", "Viewed", "Replied", "Archived"];

function InquiriesAdmin() {
  const { initialInquiries } = Route.useLoaderData();
  const [items, setItems] = useState<Inquiry[]>(initialInquiries);
  const [open, setOpen] = useState<Inquiry | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  async function updateStatus(id: string, status: InquiryStatus) {
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
    
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const dbStatus = status === 'New' ? 'new' : status === 'Viewed' ? 'read' : status === 'Replied' ? 'replied' : 'archived';
        const { error } = await supabase
          .from('inquiries')
          .update({ status: dbStatus })
          .eq('id', id);
        if (error) throw error;
        toast.success(`Inquiry status updated to ${status}`);
      } catch (e) {
        toast.error("Failed to update status in database.");
        console.error(e);
      }
    } else {
      toast.success(`Mock: Status updated to ${status}`);
    }
  }

  async function bulkArchive() {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    setItems(items.map((i) => (selected.has(i.id) ? { ...i, status: 'Archived' as InquiryStatus } : i)));
    setSelected(new Set());
    
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('inquiries')
          .update({ status: 'archived' })
          .in('id', ids);
        if (error) throw error;
        toast.success("Selected inquiries archived");
      } catch (e) {
        toast.error("Failed to archive inquiries.");
        console.error(e);
      }
    } else {
      toast.success("Mock: Selected inquiries archived");
    }
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selected.size} inquiry/inquiries?`)) return;
    const ids = Array.from(selected);
    setItems(items.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
    
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase
          .from('inquiries')
          .delete()
          .in('id', ids);
        if (error) throw error;
        toast.success("Selected inquiries deleted");
      } catch (e) {
        toast.error("Failed to delete inquiries.");
        console.error(e);
      }
    } else {
      toast.success("Mock: Selected inquiries deleted");
    }
  }

  return (
    <div>
      <AdminPageHeader title="Inquiries" description="Manage incoming project enquiries." />

      {selected.size > 0 && (
        <div className="mb-6 flex items-center justify-between border border-border bg-card p-4">
          <p className="text-sm">{selected.size} selected</p>
          <div className="flex gap-2">
            <button onClick={bulkArchive} className="px-4 py-2 text-xs uppercase tracking-[0.2em] border border-border hover:bg-muted">Archive</button>
            <button onClick={bulkDelete} className="px-4 py-2 text-xs uppercase tracking-[0.2em] border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">Delete</button>
          </div>
        </div>
      )}

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr className="border-b border-border">
              <th className="w-10 px-4 py-3"></th>
              <th className="text-left px-6 py-3 font-normal">Name</th>
              <th className="text-left px-6 py-3 font-normal">Email</th>
              <th className="text-left px-6 py-3 font-normal">Phone</th>
              <th className="text-left px-6 py-3 font-normal">Type</th>
              <th className="text-left px-6 py-3 font-normal">Budget</th>
              <th className="text-left px-6 py-3 font-normal">Date</th>
              <th className="text-left px-6 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} onClick={() => setOpen(i)} className="border-b border-border/60 last:border-0 hover:bg-background cursor-pointer">
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(i.id)} onChange={() => toggle(i.id)} className="accent-foreground" />
                </td>
                <td className="px-6 py-4">{i.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{i.email}</td>
                <td className="px-6 py-4 text-muted-foreground">{i.phone}</td>
                <td className="px-6 py-4">{i.projectType}</td>
                <td className="px-6 py-4 text-muted-foreground">{i.budget}</td>
                <td className="px-6 py-4 text-muted-foreground">{i.date}</td>
                <td className="px-6 py-4"><StatusBadge status={i.status} /></td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">No inquiries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(null)}>
          <aside className="absolute right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-serif text-xl">Inquiry Details</h3>
              <button onClick={() => setOpen(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-5 text-sm">
              <Detail label="Name" value={open.name} />
              <Detail label="Email" value={open.email} />
              <Detail label="Phone" value={open.phone} />
              <Detail label="Project Type" value={open.projectType} />
              <Detail label="Budget" value={open.budget} />
              <Detail label="Date" value={open.date} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Message</p>
                <p className="leading-relaxed whitespace-pre-line">{open.message}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Status</p>
                <select
                  value={open.status}
                  onChange={(e) => {
                    const s = e.target.value as InquiryStatus;
                    updateStatus(open.id, s);
                    setOpen({ ...open, status: s });
                  }}
                  className="border border-border bg-background px-3 py-2"
                >
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "N/A"}</p>
    </div>
  );
}
