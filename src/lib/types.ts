export interface Mentor {
  id: number;
  name: string;
  title: string;
  company: string;
  skills: string[];
  rating: number;
  ratingsCount: number;
  avatar: string;
  intro: string;
  professionalExperience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    duration: string;
  }[];
  sessions: {
    id: string;
    name: string;
    price: number;
    currency: string;
    duration: number;
    description: string;
  }[];
  availability: {
    date: string;
    time: string;
    id: number;
  }[];
  reviews: {
    mentee: string;
    date: string;
    rating: number;
    text: string;
  }[];
}

export interface Session {
    id: number;
    title: string;
    mentorName: string;
    date: string;
    time: string;
    seats: number;
    isFree: boolean;
    durationMinutes: number;
}
