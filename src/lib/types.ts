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
  status: 'active' | 'suspended';
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

export interface Mentee {
  id: string;
  name: string;
  email: string;
  interests: string[];
  mentorshipGoal: string;
  balance: number;
  status: 'active' | 'suspended';
}


export interface Session {
    id: string; 
    title: string;
    mentorName: string;
    mentorId: string;
    date: string; // e.g., "25th November"
    time: string; // e.g., "11:00 AM"
    seats: number;
    isFree: boolean;
    durationMinutes: number;
    price?: number; // Only for paid sessions
    type: 'Free' | 'Paid';
    maxParticipants: number;
    jitsiLink: string;
    bookedBy: string[]; // Array of user IDs who have booked
    status: 'scheduled' | 'active' | 'completed';
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
