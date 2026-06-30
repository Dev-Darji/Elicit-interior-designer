export type InquiryStatus = "New" | "Viewed" | "Replied" | "Archived";

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  message: string;
  date: string;
  status: InquiryStatus;
}

export const mockInquiries: Inquiry[] = [
  { id: "i1", name: "Aanya Reddy", email: "aanya.r@example.com", phone: "+91 98201 11234", projectType: "Residential", budget: "₹40L – ₹75L", message: "Looking to redesign our 3BHK apartment in Bandra. Move-in ready in 6 months.", date: "2025-06-28", status: "New" },
  { id: "i2", name: "Vikram Singh", email: "vsingh@northblock.vc", phone: "+91 99020 33421", projectType: "Commercial", budget: "₹1Cr – ₹2Cr", message: "Office fit-out for our new fund headquarters. 9,000 sqft.", date: "2025-06-26", status: "New" },
  { id: "i3", name: "Sophia Laurent", email: "sophia@luxehospitality.com", phone: "+33 6 12 34 56 78", projectType: "Hospitality", budget: "€500K – €1M", message: "Boutique hotel renovation in Provence. 12 keys.", date: "2025-06-24", status: "Viewed" },
  { id: "i4", name: "Rahul Verma", email: "rahul.v@gmail.com", phone: "+91 98765 43210", projectType: "Residential", budget: "₹25L – ₹40L", message: "Renovation of a 2BHK flat in Pune.", date: "2025-06-22", status: "Replied" },
  { id: "i5", name: "Megan O'Brien", email: "megan@bloomflorist.fr", phone: "+33 6 98 76 54 32", projectType: "Retail", budget: "€50K – €100K", message: "Florist boutique fit-out in the 6th arrondissement.", date: "2025-06-20", status: "Replied" },
  { id: "i6", name: "Imran Khan", email: "imran@khan.co", phone: "+92 300 1234567", projectType: "Residential", budget: "$200K – $500K", message: "Family home, full interior design.", date: "2025-06-18", status: "New" },
  { id: "i7", name: "Lara Mehta", email: "lara.m@example.com", phone: "+91 90909 09090", projectType: "Hospitality", budget: "₹2Cr+", message: "Heritage hotel restoration in Jodhpur.", date: "2025-06-15", status: "Archived" },
];

export function getMockInquiries() { return mockInquiries; }
