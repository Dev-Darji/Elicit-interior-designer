# Interior Designer Website — PROMPT 2: IDE + Supabase Integration
### This is Phase 2. The UI is already built (from Lovable). Now we wire up Supabase to make everything dynamic.

---

## 🧠 Context

The Next.js 14 (App Router) project has been exported from Lovable and is now open locally in VS Code / Cursor. The entire UI is already complete — all pages, admin panel screens, and components exist with mock data in `/lib/mock-data/`. 

**Your job in this phase:**
1. Set up Supabase (DB schema, storage, auth, RLS)
2. Replace every mock data source with real Supabase queries
3. Wire up the admin panel to perform real CRUD operations
4. Set up auth so the admin panel is properly protected
5. Wire up the contact form to save to DB and send email
6. Set up on-demand ISR so publishing content updates the live site instantly
7. Make the codebase mobile-ready so the same Supabase logic can be reused in React Native / Expo

---

## ⚙️ Step 1 — Environment Setup

Install required packages:
```bash
npm install @supabase/supabase-js @supabase/ssr resend react-hot-toast
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
npm install @hello-pangea/dnd
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
NOTIFICATION_EMAIL=owner@studioemail.com
```

Create Supabase client helpers:

**`lib/supabase/client.ts`** — browser client (for client components)
```ts
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**`lib/supabase/server.ts`** — server client (for server components & route handlers)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

**`middleware.ts`** — session refresh + admin route protection
```ts
// Refresh session on all routes
// Redirect unauthenticated users away from /admin/* to /admin/login
// Redirect authenticated users away from /admin/login to /admin/dashboard
```

---

## 🗄️ Step 2 — Supabase Database Schema

Run these migrations in the Supabase SQL editor in order:

### Projects Table
```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT CHECK (category IN ('Residential','Commercial','Hospitality','Retail')) NOT NULL,
  status TEXT CHECK (status IN ('draft','published')) DEFAULT 'draft',
  short_description TEXT,
  body_json JSONB,
  cover_image_url TEXT,
  year INT,
  location TEXT,
  client_type TEXT,
  area_sqft INT,
  services_used TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Project Images
```sql
CREATE TABLE project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  display_order INT DEFAULT 0,
  image_type TEXT CHECK (image_type IN ('gallery','before','after')) DEFAULT 'gallery'
);
```

### Services
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  short_description TEXT,
  full_description_json JSONB,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Team Members
```sql
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);
```

### Testimonials
```sql
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  project_type TEXT,
  quote TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  photo_url TEXT,
  is_published BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0
);
```

### Inquiries
```sql
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  project_type TEXT,
  budget_range TEXT,
  message TEXT,
  status TEXT CHECK (status IN ('new','viewed','replied','archived')) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Blog Posts
```sql
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cover_image_url TEXT,
  category TEXT,
  tags TEXT[],
  author TEXT,
  body_json JSONB,
  status TEXT CHECK (status IN ('draft','published')) DEFAULT 'draft',
  read_time_minutes INT,
  meta_title TEXT,
  meta_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Site Settings (key-value config)
```sql
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
('contact_info', '{"phone":"+91 98765 43210","email":"hello@studioanvita.com","address":"204, Design House, Linking Road, Bandra West, Mumbai 400050","whatsapp":"+919876543210","maps_url":"","business_hours":{"mon_fri":"9:00 AM – 7:00 PM","sat":"10:00 AM – 5:00 PM","sun":"Closed"}}'),
('social_links', '{"instagram":"","pinterest":"","linkedin":"","facebook":"","houzz":""}'),
('homepage', '{"hero_title":"We Design Spaces That Tell Your Story","hero_tagline":"Award-winning interior design studio based in Mumbai","cta_text":"View Our Work","stats":[{"label":"Years Experience","value":"15+"},{"label":"Projects Completed","value":"320+"},{"label":"Happy Clients","value":"200+"},{"label":"Design Awards","value":"12"}]}'),
('seo', '{"site_name":"Studio Anvita","default_meta_description":"Mumbai-based luxury interior design studio specializing in residential, commercial, and hospitality projects.","og_image_url":""}'),
('notification_email', '"hello@studioanvita.com"');
```

### Updated_at Trigger (apply to projects, blog_posts, site_settings)
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 🔒 Step 3 — Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: projects, services, team, testimonials, blog_posts, site_settings
CREATE POLICY "Public can read published projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read services" ON services FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read team" ON team_members FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read published posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read project_images" ON project_images FOR SELECT USING (true);

-- PUBLIC INSERT: inquiries only (contact form)
CREATE POLICY "Anyone can submit inquiry" ON inquiries FOR INSERT WITH CHECK (true);

-- ADMIN FULL ACCESS: authenticated users can do everything
CREATE POLICY "Admin full access projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access project_images" ON project_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access team" ON team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access inquiries" ON inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access blog_posts" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
```

---

## 🪣 Step 4 — Supabase Storage Buckets

Create the following buckets in Supabase Dashboard → Storage (all public):

| Bucket Name | Purpose |
|---|---|
| `project-images` | Project cover + gallery images |
| `team-photos` | Team member portraits |
| `site-media` | Hero images/videos, OG images, service images |
| `blog-covers` | Blog post cover images |
| `testimonial-photos` | Client photos for testimonials |

Set each bucket to **public** so image URLs work directly in `<Image>` tags.

Add storage policies for each bucket:
```sql
-- Public can view all files
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id IN ('project-images','team-photos','site-media','blog-covers','testimonial-photos'));
-- Only authenticated users can upload/delete
CREATE POLICY "Admin upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin delete" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');
```

---

## 🔑 Step 5 — Admin Authentication

### Create Admin User
In Supabase Dashboard → Authentication → Users → Add user:
- Email: `admin@yourstudio.com`
- Password: (set a strong password)

### Update Admin Login Page (`/admin/login/page.tsx`)
Replace the mock bypass with real Supabase auth:
```ts
const supabase = createClient()
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (!error) router.push('/admin/dashboard')
```

### Update Middleware (`middleware.ts`)
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
// Check session for all /admin/* routes (except /admin/login)
// If no session → redirect to /admin/login
// If session on /admin/login → redirect to /admin/dashboard
```

### Add Logout to Admin Sidebar
```ts
await supabase.auth.signOut()
router.push('/admin/login')
```

---

## 🔄 Step 6 — Replace Mock Data with Supabase Queries

For each module, delete the mock import and replace with a Supabase query. Follow this pattern:

### Public Pages (Server Components — use server client)

**Projects listing (`app/(public)/projects/page.tsx`):**
```ts
const supabase = createClient() // server client
const { data: projects } = await supabase
  .from('projects')
  .select('id, title, slug, category, cover_image_url, year')
  .eq('status', 'published')
  .order('display_order')
```

**Project detail (`app/(public)/projects/[slug]/page.tsx`):**
```ts
const { data: project } = await supabase
  .from('projects')
  .select('*, project_images(*)')
  .eq('slug', slug)
  .eq('status', 'published')
  .single()
```

**Home page — fetch everything in parallel:**
```ts
const [projects, services, testimonials, settings] = await Promise.all([
  supabase.from('projects').select('...').eq('status','published').limit(6),
  supabase.from('services').select('*').eq('is_visible',true).order('display_order'),
  supabase.from('testimonials').select('*').eq('is_published',true).order('display_order'),
  supabase.from('site_settings').select('key, value')
])
```

**Site Settings helper (`lib/supabase/settings.ts`):**
```ts
export async function getSiteSettings() {
  const supabase = createClient()
  const { data } = await supabase.from('site_settings').select('key, value')
  return Object.fromEntries(data?.map(r => [r.key, r.value]) ?? [])
}
// Usage: const settings = await getSiteSettings()
// settings.contact_info.phone, settings.homepage.hero_title, etc.
```

### Admin Pages (Client Components — use browser client + React state)

For all admin CRUD, create a custom hook per resource. Example:

**`lib/hooks/use-projects.ts`:**
```ts
export function useProjects() {
  const supabase = createClient() // browser client
  const getAll = async () => supabase.from('projects').select('*').order('created_at', { ascending: false })
  const create = async (data: ProjectInsert) => supabase.from('projects').insert(data).select().single()
  const update = async (id: string, data: Partial<ProjectInsert>) => supabase.from('projects').update(data).eq('id', id)
  const remove = async (id: string) => supabase.from('projects').delete().eq('id', id)
  return { getAll, create, update, remove }
}
```

Create similar hooks: `use-services.ts`, `use-team.ts`, `use-testimonials.ts`, `use-inquiries.ts`, `use-blog-posts.ts`, `use-site-settings.ts`

> **⚠️ MOBILE COMPATIBILITY:** These hooks use only `@supabase/supabase-js` methods — they can be copied directly into a React Native / Expo project. The only change needed is swapping `createBrowserClient` for a Supabase client initialized with `AsyncStorage`.

---

## 🖼️ Step 7 — Image Upload in Admin Forms

Replace the static upload zone UI with real Supabase Storage uploads:

```ts
async function uploadImage(file: File, bucket: string, folder: string): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(filename, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

// Usage in project form:
const coverUrl = await uploadImage(coverFile, 'project-images', 'covers')
const galleryUrls = await Promise.all(galleryFiles.map(f => uploadImage(f, 'project-images', 'gallery')))
```

Apply this pattern in: project form, services form, team form, testimonials form, settings tabs.

---

## ✉️ Step 8 — Contact Form → Save + Email

**`app/api/contact/route.ts`:**
```ts
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createClient()
  
  // 1. Save to inquiries table
  const { error } = await supabase.from('inquiries').insert({
    name: body.name, email: body.email, phone: body.phone,
    project_type: body.projectType, budget_range: body.budgetRange, message: body.message
  })
  if (error) return Response.json({ error: 'Failed to save' }, { status: 500 })

  // 2. Send notification email
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: process.env.NOTIFICATION_EMAIL!,
    subject: `New Inquiry from ${body.name}`,
    html: `<h2>New Inquiry</h2><p><b>Name:</b> ${body.name}</p><p><b>Email:</b> ${body.email}</p><p><b>Project:</b> ${body.projectType}</p><p><b>Budget:</b> ${body.budgetRange}</p><p><b>Message:</b> ${body.message}</p>`
  })

  return Response.json({ success: true })
}
```

Update the contact form component to POST to `/api/contact` instead of showing mock success.

---

## ♻️ Step 9 — On-Demand ISR (Instant Publish)

Add `revalidatePath` calls after any admin publish/update action:

**`app/api/revalidate/route.ts`:**
```ts
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { path, secret } = await req.json()
  if (secret !== process.env.REVALIDATE_SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  revalidatePath(path)
  return Response.json({ revalidated: true })
}
```

In admin project form, after publishing:
```ts
await fetch('/api/revalidate', {
  method: 'POST',
  body: JSON.stringify({ path: `/projects/${slug}`, secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET })
})
// Also revalidate /projects and / (home page)
```

---

## ✏️ Step 10 — Replace Textarea with TipTap Rich Text Editor

In admin forms (project body, blog body, service description), replace the styled textarea with a real TipTap editor:

```tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

const editor = useEditor({
  extensions: [StarterKit, Image, Link],
  content: initialContent, // pass existing body_json
  onUpdate: ({ editor }) => onChange(editor.getJSON()) // save JSON to form state
})
```

On public pages, render stored JSON:
```tsx
import { generateHTML } from '@tiptap/html'
const html = generateHTML(bodyJson, [StarterKit, Image, Link])
return <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: html }} />
```

---

## 🔢 Step 11 — Drag-and-Drop Reorder

For services, team, testimonials, and project gallery:
```tsx
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

// On drag end, update display_order in Supabase
const onDragEnd = async (result) => {
  // Reorder local state array
  // Update each item's display_order in Supabase via upsert
  const updates = reorderedItems.map((item, index) => ({ id: item.id, display_order: index }))
  await supabase.from('services').upsert(updates)
}
```

---

## 📱 Step 12 — Mobile App Readiness Notes

The following makes Supabase integration portable to React Native / Expo with zero backend changes:

1. **All hooks** in `/lib/hooks/` use only `supabase-js` — copy them to Expo as-is
2. **Supabase client** in Expo: replace `createBrowserClient` with:
   ```ts
   import AsyncStorage from '@react-native-async-storage/async-storage'
   import { createClient } from '@supabase/supabase-js'
   const supabase = createClient(url, anonKey, {
     auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }
   })
   ```
3. **Storage URLs** are plain HTTPS — work directly with React Native `<Image>` component
4. **RLS policies** already support the same anon/authenticated roles the mobile app will use
5. **No changes to DB schema needed** — mobile app reads from the same tables

---

## ✅ Phase 2 Completion Checklist

- [ ] Supabase project created, env vars set
- [ ] All 8 DB tables migrated with correct schema
- [ ] RLS policies applied to all tables
- [ ] Storage buckets created and policies set
- [ ] Admin auth wired (login, logout, middleware protection)
- [ ] All public pages fetch from Supabase (no mock imports remain)
- [ ] All admin CRUD operations work (create, edit, delete, reorder)
- [ ] Image uploads working for all forms
- [ ] Contact form saves to DB + sends email via Resend
- [ ] TipTap rich text editor in project + blog + service forms
- [ ] On-demand ISR revalidation on publish
- [ ] Site Settings admin saves to DB and reflects on public site
- [ ] Drag-and-drop reorder working and persisting to DB
- [ ] Tested on mobile (responsive)
- [ ] Deploy to Vercel with env vars set

---

*Phase 2 complete → Full production-ready interior design website with live admin panel.*
*Next: Build the React Native / Expo mobile app using the same Supabase backend.*
