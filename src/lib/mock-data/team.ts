export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  visible: boolean;
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const mockTeam: TeamMember[] = [
  {
    id: "t1",
    name: "Anaya Mehra",
    role: "Founder & Principal Designer",
    bio: "Anaya founded the studio in 2010 after a decade with practices in London and Mumbai. She leads concept and material direction on every project.",
    photo: img("photo-1573496359142-b8d87734a5a2"),
    visible: true,
  },
  {
    id: "t2",
    name: "Rohan Iyer",
    role: "Design Director",
    bio: "Rohan oversees the studio's hospitality and commercial portfolio. His work has been recognised by Wallpaper* and Dezeen.",
    photo: img("photo-1500648767791-00dcc994a43e"),
    visible: true,
  },
  {
    id: "t3",
    name: "Sara Kapoor",
    role: "Senior Interior Architect",
    bio: "Sara leads the studio's residential work. She is happiest in the messy middle of a project — joinery drawings spread across the desk.",
    photo: img("photo-1487412720507-e7ab37603c6f"),
    visible: true,
  },
  {
    id: "t4",
    name: "Daniel Park",
    role: "Head of Execution",
    bio: "Daniel runs the on-site team. He is the reason every project hands over on time, and looking exactly like it should.",
    photo: img("photo-1472099645785-5658abf4ff4e"),
    visible: true,
  },
];

export function getMockTeam() {
  return mockTeam;
}
