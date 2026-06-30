export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
  cover: string;
  author: string;
  date: string;
  readTime: string;
  status: "Published" | "Draft";
}

const img = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const mockPosts: BlogPost[] = [
  {
    id: "b1",
    slug: "on-restraint",
    title: "On Restraint: Why the Best Interiors Whisper",
    excerpt: "A short essay on the discipline of leaving things out, and why a quiet room can be the loudest design statement of all.",
    body: "There is a kind of interior — you have been in one — that announces itself the moment you walk in.\n\nIt is full of choices: bold colour, complex pattern, layered styling. It impresses on first arrival, and then, slowly, it tires. By the second visit, you notice the seams. By the third, you start to wish for a corner without an idea in it.\n\nThe rooms we return to, year after year, are usually the opposite. They are quiet. They contain fewer things, but the things they do contain are extraordinary — a single sofa worth a year of saving, a painting by a friend, a table that has been in the family for three generations. The walls are calm. The light has room to move.\n\nWe think a lot about restraint at the studio. Every project begins with a long list of ideas, and the work of design is, in many ways, the work of removing most of them.",
    category: "Essays",
    tags: ["philosophy", "minimalism"],
    cover: img("photo-1615874959474-d609969a20ed"),
    author: "Anaya Mehra",
    date: "2025-06-12",
    readTime: "5 min read",
    status: "Published",
  },
  {
    id: "b2",
    slug: "material-diary-lime-plaster",
    title: "Material Diary: Lime Plaster",
    excerpt: "The oldest wall finish we still use, and why we keep coming back to it. A short field guide to specifying lime in 2025.",
    body: "Lime plaster has been on walls for at least eight thousand years. We started using it again ten years ago, and it has been on almost every residential project since.",
    category: "Material",
    tags: ["finishes", "lime"],
    cover: img("photo-1616137466211-f939a420be84"),
    author: "Sara Kapoor",
    date: "2025-05-28",
    readTime: "7 min read",
    status: "Published",
  },
  {
    id: "b3",
    slug: "lessons-from-the-villa",
    title: "Lessons from the Villa: Luminary Café, Two Years On",
    excerpt: "We revisited a project we completed two years ago. Here is what aged well, what we would change, and what we learned.",
    body: "Two years is the moment a project starts to tell the truth about itself.",
    category: "Field Notes",
    tags: ["case-study", "commercial"],
    cover: img("photo-1554118811-1e0d58224f24"),
    author: "Rohan Iyer",
    date: "2025-05-04",
    readTime: "6 min read",
    status: "Published",
  },
  {
    id: "b4",
    slug: "how-to-brief-a-designer",
    title: "How to Brief an Interior Designer",
    excerpt: "A short, practical guide for anyone about to start their first interior project. The questions that matter, and the ones that don't.",
    body: "A good brief is not a Pinterest board.",
    category: "Guides",
    tags: ["clients", "process"],
    cover: img("photo-1486718448742-163732cd1544"),
    author: "Anaya Mehra",
    date: "2025-04-18",
    readTime: "8 min read",
    status: "Published",
  },
  {
    id: "b5",
    slug: "the-case-for-bespoke-joinery",
    title: "The Case for Bespoke Joinery",
    excerpt: "Why we draw our own cabinets. A look at the economics, the craft, and the small daily pleasures of a drawer that closes properly.",
    body: "Bespoke joinery is one of the most expensive things you can put in a house. It is also, in our view, the most worthwhile.",
    category: "Craft",
    tags: ["joinery", "craft"],
    cover: img("photo-1600210492486-724fe5c67fb0"),
    author: "Daniel Park",
    date: "2025-03-30",
    readTime: "9 min read",
    status: "Published",
  },
  {
    id: "b6",
    slug: "a-week-in-udaipur",
    title: "A Week in Udaipur",
    excerpt: "Photographs from a recent visit to the workshop of one of our oldest collaborators, a third-generation marble carver in Rajasthan.",
    body: "Most weeks we are in the office. Once or twice a year, we go to visit the people who make the things we draw.",
    category: "Travel",
    tags: ["craft", "india"],
    cover: img("photo-1616594039964-ae9021a400a0"),
    author: "Anaya Mehra",
    date: "2025-03-10",
    readTime: "4 min read",
    status: "Published",
  },
  {
    id: "b7",
    slug: "lighting-101",
    title: "Lighting 101: The Three Layers Every Room Needs",
    excerpt: "Ambient, task, accent. A short primer on the most-overlooked element of a beautiful interior.",
    body: "Most rooms are lit badly.",
    category: "Guides",
    tags: ["lighting"],
    cover: img("photo-1631049307264-da0ec9d70304"),
    author: "Sara Kapoor",
    date: "2025-02-22",
    readTime: "6 min read",
    status: "Draft",
  },
];

export function getMockPosts() { return mockPosts.filter((p) => p.status === "Published"); }
export function getAllMockPosts() { return mockPosts; }
export function getMockPostBySlug(slug: string) { return mockPosts.find((p) => p.slug === slug); }
