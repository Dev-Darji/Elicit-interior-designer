import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, Inbox, Sparkles, Users, MessageSquareQuote, BookOpen, Settings, LogOut } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/team", label: "Team", icon: Users },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/journal", label: "Journal", icon: BookOpen },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-6 py-6 border-b border-sidebar-border">
        <Link to="/" className="font-serif text-xl text-sidebar-foreground">
          Elicit
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/50">Studio Admin</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm">AN</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">Anaya Mehra</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">Founder</p>
          </div>
          <button 
            onClick={async () => {
              const supabase = getSupabase();
              await supabase.auth.signOut();
              navigate({ to: "/admin/login" });
            }}
            aria-label="Logout" 
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground cursor-pointer bg-transparent border-0 p-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
