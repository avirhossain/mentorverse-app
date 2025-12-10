// Defines the core data structures for the MentorVerse application, ensuring type safety.

export interface Mentor {
  id: string; // Corresponds to document ID
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  expertise?: string[];
  education?: string;
  experience?: string;
  awards?: string[];
  whatToExpect?: string;
  ratingAvg?: number;
  ratingCount?: number;
  totalSessions?: number;
  createdAt: string; // ISO 8601 date string
  availability?: AvailabilitySlot[];
  isActive: boolean;
}

export interface AvailabilitySlot {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  slots: string[]; // e.g., ["10:00", "13:00"]
}

export interface Mentee {
  id: string; // Matches Firebase Auth UID
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  accountBalance?: number;
  createdAt: string; // ISO 8601 date string
  isActive: boolean;
  totalSessionsBooked?: number;
}

export interface Session {
  id: string; // Corresponds to document ID
  mentorId: string;
  mentorName: string; // denormalized for easier display
  name: string;
  tag?: string;
  offerings?: string;
  bestSuitedFor?: string;
  requirements?: string;
  sessionType: 'Free' | 'Paid' | 'Exclusive';
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  sessionFee: number;
  status?: 'Active' | 'Expired' | 'Draft';
}

export interface Booking {
  id: string; // Corresponds to document ID
  sessionId: string;
  sessionName: string; // Denormalized name of the session.
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  bookingTime: string; // ISO 8601 date string
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: 'confirmed' | 'started' | 'completed' | 'cancelled';
  meetingUrl?: string;
  sessionFee: number;
  adminDisbursementStatus: 'pending' | 'paid';
}


export interface Review {
  id: string; // Corresponds to document ID
  bookingId: string;
  mentorId: string;
  menteeId: string;
  rating: number;
  reviewText?: string;
  createdAt: string; // ISO 8601 date string
}

export interface Tip {
  id: string; // Corresponds to document ID
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string; // ISO 8601 date string
  adminId: string;
  isActive: boolean;
}

export interface Disbursement {
  id: string; // Corresponds to document ID
  mentorId: string;
  totalAmount: number;
  bookingIds: string[]; // Array of booking IDs
  status: 'pending' | 'paid';
  paidAt?: string; // ISO 8601 date string
  createdAt: string; // ISO 8601 date string
  adminId: string;
}

// Subcollection types

export interface Transaction {
  id: string; // Corresponds to document ID
  type: 'topup' | 'booking' | 'refund';
  amount: number;
  description: string;
  createdAt: string; // ISO 8601 date string
}

export interface Payout {
  id: string; // Corresponds to document ID
  disbursementId: string;
  amount: number;
  createdAt: string; // ISO 8601 date string
}
