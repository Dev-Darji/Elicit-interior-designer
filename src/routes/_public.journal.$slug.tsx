import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getMockPostBySlug, getMockPosts } from "@/lib/mock-data/blog-posts";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { TipTapRenderer } from "@/components/public/tiptap-renderer";

export const Route = createFileRoute("/_public/journal/$slug")({
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    return {
      meta: [
        { title: p ? `${p.title} — Elicit Journal` : "Article" },
        { name: "description", content: p?.excerpt ?? "" },
        { property: "og:title", content: p?.title ?? "" },
        { property: "og:image", content: p?.cover ?? "" },
      ],
    };
  },
  loader: async ({ params }) => {
    if (!isSupabaseConfigured()) {
      const post = getMockPostBySlug(params.slug);
      if (!post) throw notFound();
      const more = getMockPosts().filter((p) => p.slug !== post.slug).slice(0, 3);
      return { post, more };
    }

    try {
      const supabase = getSupabase();
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single();

      if (error || !post) {
        // Fallback to mock
        const mockPost = getMockPostBySlug(params.slug);
        if (mockPost) {
          const more = getMockPosts().filter((p) => p.slug !== mockPost.slug).slice(0, 3);
          return { post: mockPost, more };
        }
        throw notFound();
      }

      // Fetch more articles from Supabase
      const { data: moreData } = await supabase
        .from('blog_posts')
        .select('id, title, slug, cover_image_url, category')
        .eq('status', 'published')
        .neq('id', post.id)
        .limit(3);

      const more = (moreData || []).map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        cover: p.cover_image_url || 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=800&q=80',
        category: p.category || 'Journal',
      }));

      const mappedPost = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        category: post.category || 'Journal',
        excerpt: post.meta_description || 'Notes from the studio.',
        cover: post.cover_image_url || 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80',
        author: post.author || 'Elicit',
        date: post.published_at || post.created_at,
        readTime: post.read_time_minutes ? `${post.read_time_minutes} min read` : '5 min read',
        body: '',
        body_json: post.body_json,
        tags: post.tags || [],
        status: post.status === 'published' ? 'Published' : 'Draft',
      };

      return { post: mappedPost, more };
    } catch (e) {
      console.error("Journal detail load error:", e);
      const mockPost = getMockPostBySlug(params.slug);
      if (!mockPost) throw notFound();
      const more = getMockPosts().filter((p) => p.slug !== mockPost.slug).slice(0, 3);
      return { post: mockPost, more };
    }
  },
  notFoundComponent: () => (
    <div className="container-editorial pt-40 pb-32 text-center">
      <h1 className="font-serif text-4xl">Article not found</h1>
      <Link to="/journal" className="mt-6 inline-block link-underline text-sm uppercase tracking-[0.2em]">Back to journal</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-editorial pt-40 pb-32 text-center">
      <h1 className="font-serif text-3xl">Couldn't load this article</h1>
      <button onClick={reset} className="mt-6 link-underline text-sm uppercase tracking-[0.2em]">Try again</button>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { post, more } = Route.useLoaderData();

  return (
    <>
      <article className="pt-40">
        <div className="container-editorial max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">{post.category}</p>
          <h1 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.1]">{post.title}</h1>
          <p className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {post.author} · {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {post.readTime}
          </p>
        </div>

        <div className="container-editorial mt-16">
          <div className="relative overflow-hidden h-[60vh] min-h-[460px] bg-muted">
            <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="container-editorial max-w-2xl section-y prose-editorial">
          {post.body_json ? (
            <TipTapRenderer content={post.body_json} />
          ) : (
            post.body?.split("\n\n").map((para: string, i: number) => (
              <p key={i} className={`${i === 0 ? "font-serif text-2xl md:text-3xl leading-[1.45]" : "text-lg leading-[1.75] mt-7 text-foreground/85"}`}>
                {para}
              </p>
            ))
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-16 flex flex-wrap gap-2 border-t border-border pt-8">
              {post.tags.map((t: string) => (
                <span key={t} className="px-3 py-1 text-xs uppercase tracking-[0.2em] border border-border text-muted-foreground">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-border section-y bg-card">
          <div className="container-editorial">
            <p className="text-xs uppercase tracking-[0.3em] text-accent mb-10">More Articles</p>
            <div className="grid md:grid-cols-3 gap-8">
              {more.map((p) => (
                <Link key={p.id} to="/journal/$slug" params={{ slug: p.slug }} className="group">
                  <div className="relative overflow-hidden h-[300px] bg-muted">
                    <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-accent">{p.category}</p>
                  <h3 className="mt-2 font-serif text-2xl">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
