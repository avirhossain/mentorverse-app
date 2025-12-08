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
  experienceYears?: number;
  ratingAvg?: number;
  ratingCount?: number;
  totalSessions?: number;
  hourlyRate?: number;
  createdAt: string; // ISO 8601 date string
  isActive: boolean;
  availability?: AvailabilitySlot[];
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
  menteeId: string;
  bookingTime: string; // ISO 8601 date string
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  bookedSlotId?: string;
  status: 'pending' | 'confirmed' | 'started' | 'completed' | 'cancelled';
  meetingUrl?: string;
  meetingStartedAt?: string; // ISO 8601 date string
  meetingEndedAt?: string; // ISO 8601 date string
  mentorNotes?: string;
  menteeReviewId?: string;
  sessionFee: number;
  adminDisbursementStatus: 'pending' | 'paid';
}

export interface Review {
  id: string; // Corresponds to document ID
  sessionId: string;
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
  sessions: string[]; // Array of session IDs
  status: 'pending' | 'paid';
  paidAt?: string; // ISO 8601 date string
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
