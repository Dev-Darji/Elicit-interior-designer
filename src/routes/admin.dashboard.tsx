import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderKanban, Inbox, BookOpen, Users, Plus, ArrowRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-header";
import { getMockInquiries } from "@/lib/mock-data/inquiries";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/admin/dashboard")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return {
        counts: { projects: 24, inquiries: 7, journal: 12, team: 4 },
        inquiries: getMockInquiries().slice(0, 6)
      };
    }

    try {
      const supabase = getSupabase();
      
      const [
        { count: projectCount },
        { count: inquiryCount },
        { count: journalCount },
        { count: teamCount },
        { data: inquiriesData }
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('team_members').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(6)
      ]);

      const mappedInquiries = (inquiriesData || []).map(i => ({
        id: i.id,
        name: i.name,
        email: i.email,
        phone: i.phone || '',
        projectType: i.project_type || 'Other',
        budget: i.budget || '',
        message: i.message,
        status: i.status === 'new' ? 'New' : i.status === 'read' ? 'Viewed' : i.status === 'replied' ? 'Replied' : 'Archived',
        date: new Date(i.created_at).toLocaleDateString(),
      }));

      return {
        counts: {
          projects: projectCount || 0,
          inquiries: inquiryCount || 0,
          journal: journalCount || 0,
          team: teamCount || 0,
        },
        inquiries: mappedInquiries,
      };
    } catch (e) {
      console.error("Dashboard data load error:", e);
      return {
        counts: { projects: 24, inquiries: 7, journal: 12, team: 4 },
        inquiries: getMockInquiries().slice(0, 6)
      };
    }
  },
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { counts, inquiries } = Route.useLoaderData();

  const stats = [
    { label: "Total Projects", value: counts.projects, icon: FolderKanban, to: "/admin/projects" },
    { label: "Pending Inquiries", value: counts.inquiries, icon: Inbox, to: "/admin/inquiries" },
    { label: "Published Posts", value: counts.journal, icon: BookOpen, to: "/admin/journal" },
    { label: "Team Members", value: counts.team, icon: Users, to: "/admin/team" },
  ] as const;

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of recent activity at the studio."
        action={
          <Link to="/admin/projects/new" className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition">
            <Plus className="h-4 w-4" /> Add Project
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to} className="group border border-border p-6 bg-card hover:border-foreground transition-colors">
              <Icon className="h-5 w-5 text-accent" strokeWidth={1.25} />
              <p className="mt-6 font-serif text-4xl">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 border border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-xl">Recent Inquiries</h2>
          <Link to="/admin/inquiries" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] link-underline">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 font-normal">Name</th>
                <th className="text-left px-6 py-3 font-normal">Email</th>
                <th className="text-left px-6 py-3 font-normal">Type</th>
                <th className="text-left px-6 py-3 font-normal">Date</th>
                <th className="text-left px-6 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((i: any) => (
                <tr key={i.id} className="border-b border-border/60 last:border-0 hover:bg-background">
                  <td className="px-6 py-4">{i.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{i.email}</td>
                  <td className="px-6 py-4">{i.projectType}</td>
                  <td className="px-6 py-4 text-muted-foreground">{i.date}</td>
                  <td className="px-6 py-4"><StatusBadge status={i.status} /></td>
                </tr>
              ))}
              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No inquiries yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <QuickAction to="/admin/projects/new" label="Add Project" />
        <QuickAction to="/admin/inquiries" label="View Inquiries" />
        <QuickAction to="/admin/settings" label="Edit Settings" />
      </div>
    </div>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="border border-border bg-card px-5 py-3 text-xs uppercase tracking-[0.2em] hover:border-foreground transition">
      {label}
    </Link>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: "bg-accent/15 text-accent border-accent/30",
    Viewed: "bg-secondary text-secondary-foreground border-border",
    Replied: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Archived: "bg-muted text-muted-foreground border-border",
    Published: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Draft: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] border ${map[status] ?? "border-border"}`}>{status}</span>
  );
}
