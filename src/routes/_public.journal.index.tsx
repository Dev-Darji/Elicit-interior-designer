import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getMockPosts } from "@/lib/mock-data/blog-posts";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/_public/journal/")({
  loader: async () => {
    if (!isSupabaseConfigured()) {
      return { posts: getMockPosts() };
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (data && data.length > 0) {
        const posts = data.map(p => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.meta_description || 'Notes from the studio.',
          body: '',
          category: p.category || 'Journal',
          tags: p.tags || [],
          cover: p.cover_image_url || 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80',
          author: p.author || 'Elicit',
          date: p.published_at ? new Date(p.published_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString(),
          readTime: p.read_time_minutes ? `${p.read_time_minutes} min read` : '5 min read',
          status: (p.status === 'published' ? 'Published' : 'Draft') as "Published" | "Draft",
        }));
        return { posts };
      } else {
        return { posts: getMockPosts() };
      }
    } catch (e) {
      console.error("Journal page fetch error:", e);
      return { posts: getMockPosts() };
    }
  },
  head: () => ({
    meta: [
      { title: "Journal — Elicit" },
      { name: "description", content: "Essays, field notes and material studies from the studio at Elicit." },
      { property: "og:title", content: "Journal — Elicit" },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const { posts } = Route.useLoaderData();
  
  const categories = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? posts : posts.filter((p) => p.category === filter);
  const [hero, ...rest] = filtered;

  return (
    <>
      <section className="pt-40 pb-12 border-b border-border">
        <div className="container-editorial">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Journal</p>
          <h1 className="mt-6 font-serif text-5xl md:text-7xl">Notes from the studio.</h1>
        </div>
      </section>

      {hero && (
        <section className="section-y border-b border-border">
          <div className="container-editorial">
            <Link to="/journal/$slug" params={{ slug: hero.slug }} className="group grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative overflow-hidden h-[560px] bg-muted">
                <img src={hero.cover} alt={hero.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-accent">{hero.category} · Featured</p>
                <h2 className="mt-6 font-serif text-4xl md:text-5xl leading-[1.1]">{hero.title}</h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">{hero.excerpt}</p>
                <div className="mt-8 flex items-center gap-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span>{hero.author}</span>
                  <span>{hero.readTime}</span>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] link-underline">
                  Read Article <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="sticky top-20 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="container-editorial flex flex-wrap items-center gap-2 py-4">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${filter === c ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="section-y">
        <div className="container-editorial grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
          {rest.map((p) => (
            <Link key={p.id} to="/journal/$slug" params={{ slug: p.slug }} className="group">
              <div className="relative overflow-hidden h-[360px] bg-muted">
                <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-accent">{p.category}</p>
              <h3 className="mt-3 font-serif text-2xl leading-tight">{p.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">{p.author} · {p.readTime}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
