export type ProjectCategory = "Residential" | "Commercial" | "Hospitality" | "Retail";

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  location: string;
  year: number;
  area: string;
  clientType: string;
  cover: string;
  gallery: string[];
  description: string;
  services: string[];
  status: "Published" | "Draft";
  createdAt: string;
  featured?: boolean;
}

const img = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const mockProjects: Project[] = [
  {
    id: "1",
    slug: "whitfield-residence",
    title: "Whitfield Residence",
    category: "Residential",
    location: "Bangalore, India",
    year: 2024,
    area: "4,200 sqft",
    clientType: "Private Family",
    cover: img("photo-1600585154340-be6161a56a0c"),
    gallery: [
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600210492486-724fe5c67fb0"),
      img("photo-1616486338812-3dadae4b4ace"),
      img("photo-1556909114-f6e7ad7d3136"),
      img("photo-1600566753190-17f0baa2a6c3"),
      img("photo-1615874959474-d609969a20ed"),
      img("photo-1618221195710-dd6b41faaea6"),
      img("photo-1600121848594-d8644e57abab"),
    ],
    description:
      "A four-bedroom family home reimagined around natural light and tactile materials. Lime-washed walls, reclaimed teak and unlacquered brass frame quiet, considered spaces. The brief was for a home that would age gracefully — a refuge from a busy city, designed to feel collected rather than decorated.",
    services: ["Interior Design", "Space Planning", "Turnkey Execution"],
    status: "Published",
    createdAt: "2024-09-12",
    featured: true,
  },
  {
    id: "2",
    slug: "oberoi-suite-redesign",
    title: "The Oberoi Suite Redesign",
    category: "Hospitality",
    location: "Mumbai, India",
    year: 2024,
    area: "2,800 sqft",
    clientType: "Luxury Hotel",
    cover: img("photo-1582719478250-c89cae4dc85b"),
    gallery: [
      img("photo-1582719478250-c89cae4dc85b"),
      img("photo-1611892440504-42a792e24d32"),
      img("photo-1590490360182-c33d57733427"),
      img("photo-1564540583246-934409427776"),
      img("photo-1631049307264-da0ec9d70304"),
      img("photo-1578683010236-d716f9a3f461"),
    ],
    description:
      "A presidential suite at a heritage hotel, reimagined with a contemporary Indian sensibility. Hand-blocked silks, carved teak headboards and a custom marble bar set the tone for a layered, immersive guest experience.",
    services: ["Interior Design", "Styling & Decor"],
    status: "Published",
    createdAt: "2024-07-22",
    featured: true,
  },
  {
    id: "3",
    slug: "luminary-cafe",
    title: "Luminary Café",
    category: "Commercial",
    location: "Goa, India",
    year: 2023,
    area: "1,650 sqft",
    clientType: "Restaurant Group",
    cover: img("photo-1554118811-1e0d58224f24"),
    gallery: [
      img("photo-1554118811-1e0d58224f24"),
      img("photo-1559925393-8be0ec4767c8"),
      img("photo-1521017432531-fbd92d768814"),
      img("photo-1559496417-e7f25cb247f3"),
      img("photo-1525610553991-2bede1a236e2"),
    ],
    description:
      "An all-day café set inside a restored Portuguese villa. The design layers limewashed lime plaster, terracotta tile and rattan against a backdrop of original azulejo. Every detail — from the brass coffee bar to the hand-thrown ceramics — was made within 100 km of the site.",
    services: ["Interior Design", "Turnkey Execution", "Styling & Decor"],
    status: "Published",
    createdAt: "2023-11-04",
    featured: true,
  },
  {
    id: "4",
    slug: "ashford-penthouse",
    title: "Ashford Penthouse",
    category: "Residential",
    location: "London, UK",
    year: 2023,
    area: "5,400 sqft",
    clientType: "Private Collector",
    cover: img("photo-1600607687939-ce8a6c25118c"),
    gallery: [
      img("photo-1600607687939-ce8a6c25118c"),
      img("photo-1600566753086-00f18fb6b3ea"),
      img("photo-1600210491892-03d54c0aaf87"),
      img("photo-1616137466211-f939a420be84"),
      img("photo-1600210492493-0946911123ea"),
    ],
    description:
      "A two-storey penthouse for an art collector, built around a permanent rotating gallery wall. Material palette: rift-cut oak, travertine and patinated bronze. The home doubles as a quiet salon for private viewings.",
    services: ["Interior Design", "Renovation", "Space Planning"],
    status: "Published",
    createdAt: "2023-06-18",
    featured: true,
  },
  {
    id: "5",
    slug: "north-block-offices",
    title: "North Block Offices",
    category: "Commercial",
    location: "Bangalore, India",
    year: 2023,
    area: "12,000 sqft",
    clientType: "Venture Capital Firm",
    cover: img("photo-1497366216548-37526070297c"),
    gallery: [
      img("photo-1497366216548-37526070297c"),
      img("photo-1497366754035-f200968a6e72"),
      img("photo-1604328698692-f76ea9498e76"),
      img("photo-1631679706909-1844bbd07221"),
    ],
    description:
      "A studio-style headquarters for a young venture capital firm. The space rejects the open-plan cliché in favour of a series of intimate rooms — library, lounge, boardroom — connected by a long oak-floored gallery.",
    services: ["Interior Design", "Commercial Design", "Space Planning"],
    status: "Published",
    createdAt: "2023-04-02",
    featured: true,
  },
  {
    id: "6",
    slug: "amber-house",
    title: "Amber House",
    category: "Residential",
    location: "Udaipur, India",
    year: 2022,
    area: "6,800 sqft",
    clientType: "Private Family",
    cover: img("photo-1616594039964-ae9021a400a0"),
    gallery: [
      img("photo-1616594039964-ae9021a400a0"),
      img("photo-1616137466211-f939a420be84"),
      img("photo-1600566753190-17f0baa2a6c3"),
    ],
    description:
      "A weekend home overlooking Lake Pichola, designed as a contemporary haveli. Carved jaali screens, lime plaster walls and a central courtyard pool anchor the plan.",
    services: ["Interior Design", "Space Planning", "Turnkey Execution"],
    status: "Published",
    createdAt: "2022-12-01",
    featured: true,
  },
  {
    id: "7",
    slug: "fern-and-folk",
    title: "Fern & Folk Boutique",
    category: "Retail",
    location: "Mumbai, India",
    year: 2024,
    area: "900 sqft",
    clientType: "Independent Brand",
    cover: img("photo-1604014237800-1c9102c219da"),
    gallery: [img("photo-1604014237800-1c9102c219da"), img("photo-1582582621959-48d27397dc69")],
    description: "A small-batch homeware boutique with a quiet, gallery-like feel. Hand-trowelled walls and reclaimed teak shelving let the products take centre stage.",
    services: ["Interior Design", "Styling & Decor"],
    status: "Published",
    createdAt: "2024-02-14",
  },
  {
    id: "8",
    slug: "harbour-house",
    title: "Harbour House",
    category: "Hospitality",
    location: "Cochin, India",
    year: 2022,
    area: "9,200 sqft",
    clientType: "Boutique Hotel",
    cover: img("photo-1566073771259-6a8506099945"),
    gallery: [img("photo-1566073771259-6a8506099945"), img("photo-1582719508461-905c673771fd")],
    description: "An eight-room boutique hotel on the Cochin backwaters, set inside a restored spice warehouse.",
    services: ["Interior Design", "Renovation", "Turnkey Execution"],
    status: "Published",
    createdAt: "2022-08-19",
  },
  {
    id: "9",
    slug: "linden-loft",
    title: "Linden Loft",
    category: "Residential",
    location: "New York, USA",
    year: 2023,
    area: "2,100 sqft",
    clientType: "Private Family",
    cover: img("photo-1615874694520-474822394e73"),
    gallery: [img("photo-1615874694520-474822394e73")],
    description: "A Tribeca loft reworked as a quiet retreat — soft white plaster, blackened steel and a single, monumental linen sofa.",
    services: ["Interior Design", "Renovation"],
    status: "Published",
    createdAt: "2023-09-08",
  },
  {
    id: "10",
    slug: "saffron-spa",
    title: "Saffron Spa",
    category: "Hospitality",
    location: "Jaipur, India",
    year: 2022,
    area: "3,400 sqft",
    clientType: "Wellness Brand",
    cover: img("photo-1540555700478-4be289fbecef"),
    gallery: [img("photo-1540555700478-4be289fbecef")],
    description: "A subterranean spa carved into a heritage haveli. Warm stone, low light and the scent of saffron.",
    services: ["Interior Design", "Turnkey Execution"],
    status: "Published",
    createdAt: "2022-05-30",
  },
  {
    id: "11",
    slug: "atelier-bloom",
    title: "Atelier Bloom",
    category: "Retail",
    location: "Paris, France",
    year: 2024,
    area: "650 sqft",
    clientType: "Florist",
    cover: img("photo-1567696911980-2eed69a46042"),
    gallery: [img("photo-1567696911980-2eed69a46042")],
    description: "A florist's studio with a working flower wall and a pale, painterly palette.",
    services: ["Interior Design", "Styling & Decor"],
    status: "Draft",
    createdAt: "2024-10-01",
  },
  {
    id: "12",
    slug: "meridian-club",
    title: "Meridian Club",
    category: "Commercial",
    location: "Singapore",
    year: 2023,
    area: "8,500 sqft",
    clientType: "Members Club",
    cover: img("photo-1559329007-40df8a9345d8"),
    gallery: [img("photo-1559329007-40df8a9345d8")],
    description: "A private members' club designed around long, slow evenings. Burled walnut, dim brass and a velvet-lined library.",
    services: ["Interior Design", "Commercial Design", "Space Planning"],
    status: "Published",
    createdAt: "2023-02-22",
  },
];

export function getMockProjects() {
  return mockProjects;
}

export function getMockProjectBySlug(slug: string) {
  return mockProjects.find((p) => p.slug === slug);
}
