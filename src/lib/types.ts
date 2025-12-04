export interface Mentor {
  id: string; // Changed from number to string to align with Firestore document IDs
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
    id: number; // Kept as number as it's for local key mapping
  }[];
  reviews: {
    mentee: string;
    date: string;
    rating: number;
    text: string;
  }[];
}

export interface Session {
    id: string; // Changed from number to string
    title: string;
    mentorName: string;
    date: string;
    time: string;
    seats: number;
    isFree: boolean;
    durationMinutes: number;
}

export interface Tip {
  id: string;
  type: 'Article' | 'YouTube' | 'Website';
  title: string;
  summary: string;
  content?: string;
  link?: string;
}

export interface Coupon {
    id: string; // The coupon code itself
    amount: number;
    expiresAt?: string; // ISO Date string
    isUsed: boolean;
}

export interface PendingPayment {
    id: string;
    userId: string;
    transactionId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; // ISO Date string
}
