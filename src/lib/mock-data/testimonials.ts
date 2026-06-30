export interface Testimonial {
  id: string;
  name: string;
  projectType: string;
  rating: number;
  quote: string;
  photo: string;
  published: boolean;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;

export const mockTestimonials: Testimonial[] = [
  {
    id: "tm1",
    name: "Priya & Arjun Whitfield",
    projectType: "Residential — Bangalore",
    rating: 5,
    quote:
      "They listened, really listened, and then they made something far better than we knew how to ask for. Two years in, the house still feels new and somehow also like it has always been ours.",
    photo: img("photo-1438761681033-6461ffad8d80"),
    published: true,
  },
  {
    id: "tm2",
    name: "Nikhil Sharma",
    projectType: "Hospitality — The Oberoi",
    rating: 5,
    quote:
      "The suite has become one of the most requested rooms in the hotel. The level of craft and the calm of the space are exactly what our guests want.",
    photo: img("photo-1472099645785-5658abf4ff4e"),
    published: true,
  },
  {
    id: "tm3",
    name: "Elena Costa",
    projectType: "Commercial — Luminary Café",
    rating: 5,
    quote: "A team that understands that good design is, in the end, good thinking. Our café opened on time, on budget, and people now plan their day around it.",
    photo: img("photo-1494790108377-be9c29b29330"),
    published: true,
  },
  {
    id: "tm4",
    name: "Marcus Ashford",
    projectType: "Residential — London",
    rating: 5,
    quote:
      "We have worked with three studios over twenty years. This is the only one I would call again. Restraint, precision, and a real point of view.",
    photo: img("photo-1500648767791-00dcc994a43e"),
    published: true,
  },
];

export function getMockTestimonials() {
  return mockTestimonials;
}
