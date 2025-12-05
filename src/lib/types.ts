

export interface Mentor {
  id: string; // Changed from number to string to align with Firestore document IDs
  name: string;
  email?: string;
  bio?: string;
  expertise?: string[];
  title: string;
  company: string;
  skills: string[];
  rating: number;
  ratingsCount: number;
  avatar: string;
  intro: string;
  status: 'active' | 'suspended';
  createdAt?: string; // Added for sorting
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
  reviews: {
    mentee: string;
    date: string;
    rating: number;
    text: string;
  }[];
  sessionCost?: number;
}

export interface Mentee {
  id: string;
  name: string;
  email: string;
  interests: string[];
  mentorshipGoal: string;
  balance: number;
  status: 'active' | 'suspended';
  createdAt?: string; // Added for sorting
  isAdmin?: boolean;
  phone?: string;
  sex?: string;
  birthDate?: string;
  institution?: string;
  job?: string;
  profileImageUrl?: string;
}


export interface Session {
    id: string; 
    title: string;
    mentorName: string;
    mentorId: string;
    date: string; // e.g., "25th November"
    time: string; // e.g., "11:00 AM"
    isFree: boolean;
    durationMinutes: number;
    price: number; // Only for paid sessions
    type: 'Free' | 'Paid';
    maxParticipants: number;
    jitsiLink: string;
    bookedBy: string[]; // Array of user IDs who have booked
    status: 'scheduled' | 'active' | 'completed';
    createdAt?: string; // Added for sorting
    learningObjectives?: string[];
    whoIsItFor?: string;
    setupRequirements?: string;
    specialRequests?: {
        userId: string;
        userName: string;
        request: string;
        createdAt: string;
    }[];
}

export interface Tip {
  id: string;
  type: 'Article' | 'YouTube' | 'Website';
  title: string;
  summary: string;
  content?: string;
  link?: string;
  createdAt?: string; // Added for sorting
}

export interface Coupon {
    id: string; // The coupon code itself
    amount: number;
    expiresAt?: string; // ISO Date string
    isUsed: boolean;
    usedBy?: string; // ID of the user who redeemed it
    usedAt?: string; // ISO Date string of when it was redeemed
    createdAt?: string; // Added for sorting
}

export interface PendingPayment {
    id:string;
    userId: string;
    transactionId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; // ISO Date string
}

export interface BalanceTransaction {
    id: string;
    userId: string;
    amount: number;
    source: 'coupon' | 'bkash' | 'session_payment';
    description: string; // e.g., Coupon code 'GUIDE500' or 'bKash TrxID: XXXXX'
    createdAt: string; // ISO Date string
}

export interface MentorApplication {
    id: string;
    name: string;
    phone: string;
    summary: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; // ISO Date string
}

export interface SupportRequest {
    id: string;
    name: string;
    phone: string;
    details: string;
    status: 'new' | 'in-progress' | 'resolved';
    createdAt: string; // ISO Date string
}
