import { Outlet, createFileRoute, useRouterState, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSupabase } from "@/lib/supabase";

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
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden border-b border-border bg-sidebar text-sidebar-foreground px-6 py-4">
          <p className="font-serif text-lg">Elicit — Admin</p>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
