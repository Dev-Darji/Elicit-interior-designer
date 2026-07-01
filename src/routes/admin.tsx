import { useState } from "react";
import { Link, Outlet, createFileRoute, useRouterState, redirect, useNavigate } from "@tanstack/react-router";
import { AdminSidebar, navItems } from "@/components/admin/admin-sidebar";
import { getSupabase } from "@/lib/supabase";
import { Menu, X, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    const isLoginPath = location.pathname === "/admin/login";
    
    if (!session && !isLoginPath) {
      throw redirect({
        to: "/admin/login",
      });
    }
    
    if (session && isLoginPath) {
      throw redirect({
        to: "/admin/dashboard",
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLogin = pathname === "/admin/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLogin) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden relative">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-serif text-xl text-sidebar-foreground">
              Elicit
            </Link>
            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/50">Studio Admin</p>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
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
                setMobileMenuOpen(false);
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

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between border-b border-border bg-sidebar text-sidebar-foreground px-6 py-4">
          <p className="font-serif text-lg">Elicit — Admin</p>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="flex-1 px-6 md:px-10 pb-6 md:pb-10 pt-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
