import type { LucideIcon } from "lucide-react";
import { Compass, PenTool, Hammer, RefreshCw, Building2, Sparkles } from "lucide-react";

export interface Service {
  id: string;
  title: string;
  short: string;
  description: string;
  deliverables: string[];
  icon: LucideIcon;
  iconName: string;
  image: string;
  visible: boolean;
  order: number;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const mockServices: Service[] = [
  {
    id: "s1",
    title: "Space Planning",
    short: "Considered layouts that resolve how a home or workspace truly lives, day to day.",
    description:
      "We begin every project by understanding how a space is used — and how it could be used better. Our planning work resolves circulation, light, sightlines and storage long before a single finish is chosen.",
    deliverables: ["Site survey and measured drawings", "Furniture layouts and circulation studies", "Lighting and joinery planning", "Coordination with architects and engineers"],
    icon: Compass,
    iconName: "Compass",
    image: img("photo-1497366216548-37526070297c"),
    visible: true,
    order: 1,
  },
  {
    id: "s2",
    title: "Interior Design",
    short: "Full interior concepts, from material palettes to bespoke joinery and custom furniture.",
    description:
      "A complete interior design service that develops the look, feel and detail of every space. We work through mood, material, colour, lighting and bespoke joinery — presented in clear, considered packages you can live with for years.",
    deliverables: ["Concept design and mood direction", "Material and finish palettes", "Bespoke joinery and furniture design", "Lighting design and specification"],
    icon: PenTool,
    iconName: "PenTool",
    image: img("photo-1600210492486-724fe5c67fb0"),
    visible: true,
    order: 2,
  },
  {
    id: "s3",
    title: "Turnkey Execution",
    short: "We deliver the project on site, end to end — from first demolition to final handover.",
    description:
      "Our in-house execution team manages every contractor, every delivery and every detail on site. You receive a single point of contact, a transparent budget and a beautifully finished space, on the agreed date.",
    deliverables: ["Contractor procurement and management", "On-site quality supervision", "Procurement and logistics", "Snagging and handover"],
    icon: Hammer,
    iconName: "Hammer",
    image: img("photo-1503387762-592deb58ef4e"),
    visible: true,
    order: 3,
  },
  {
    id: "s4",
    title: "Renovation",
    short: "Sensitive renovation work that respects what is already there and adds what is missing.",
    description:
      "Whether reworking a heritage property or refreshing a tired apartment, our renovation work is led by restraint. We preserve original detail wherever possible, and add new layers that feel inevitable.",
    deliverables: ["Existing condition assessment", "Heritage-sensitive design", "Phased construction planning", "Restoration of original detail"],
    icon: RefreshCw,
    iconName: "RefreshCw",
    image: img("photo-1600566753190-17f0baa2a6c3"),
    visible: true,
    order: 4,
  },
  {
    id: "s5",
    title: "Commercial Design",
    short: "Hospitality, retail and workplace interiors that perform as well as they photograph.",
    description:
      "For hotels, restaurants, offices and stores. We design commercial spaces around the experience of being in them — and the realities of running them.",
    deliverables: ["Brand-aligned concept development", "Operational flow planning", "Specification for commercial wear", "FF&E procurement"],
    icon: Building2,
    iconName: "Building2",
    image: img("photo-1582719478250-c89cae4dc85b"),
    visible: true,
    order: 5,
  },
  {
    id: "s6",
    title: "Styling & Decor",
    short: "The final, careful layer — art, objects, textiles and the small things that make a home.",
    description:
      "A standalone styling service for finished spaces. We source art, objects, textiles and accessories from our network of makers, and install everything ourselves.",
    deliverables: ["Art curation and sourcing", "Textile and accessory styling", "Bookshelf and table styling", "On-site install"],
    icon: Sparkles,
    iconName: "Sparkles",
    image: img("photo-1616486338812-3dadae4b4ace"),
    visible: true,
    order: 6,
  },
];

export function getMockServices() {
  return mockServices;
}
