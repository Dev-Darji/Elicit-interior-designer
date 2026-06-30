import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Elicit" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Successfully logged in.");
        navigate({ to: "/admin/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground text-center">Elicit</p>
        <h1 className="mt-3 font-serif text-3xl text-center">Studio Admin</h1>
        <div className="mt-10 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              placeholder="admin@yourstudio.com"
              required
              className="w-full border-b border-border bg-transparent py-3 focus:outline-none focus:border-accent" 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••"
              required
              className="w-full border-b border-border bg-transparent py-3 focus:outline-none focus:border-accent" 
            />
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="mt-10 w-full border border-foreground py-4 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
