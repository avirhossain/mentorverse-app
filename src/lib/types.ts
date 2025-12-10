'use client';
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
  displayId?: string; // Human-readable ID for admin panel
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
  displayId?: string; // Human-readable ID for admin panel
  mentorId: string;
  mentorName: string; // denormalized for easier display
  name: string;
  tag?: string;
  offerings?: string;
  bestSuitedFor?: string;
  requirements?: string;
  sessionType: 'Free' | 'Paid' | 'Exclusive' | 'Special Request';
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:mm
  duration?: number; // Duration in minutes
  participants?: number; // Number of participants
  bookedCount?: number; // Number of booked participants
  sessionFee: number;
  status?: 'Active' | 'Expired' | 'Draft';
  availability?: AvailabilitySlot[];
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
  mentorName: string;
  totalAmount: number;
  bookingIds: string[]; // Array of booking IDs
  status: 'pending' | 'paid';
  paidAt?: string; // ISO 8601 date string
  createdAt: string; // ISO 8601 date string
  adminId: string;
  note?: string;
}

export interface SpecialRequest {
    id: string;
    menteeId: string;
    menteeName: string;
    mentorId: string;
    mentorName: string;
    message: string;
    status: 'pending' | 'approved' | 'denied';
    createdAt: string; // ISO 8601 date string
}

export interface Notification {
    id: string;
    menteeId: string;
    message: string;
    isRead: boolean;
    createdAt: string; // ISO 8601 date string
    link?: string;
}

// Subcollection types

export interface Transaction {
  id: string; // Corresponds to document ID
  type: 'topup' | 'booking' | 'refund';
  amount: number;
  description: string;
  reference?: string; // Optional field for external transaction reference
  createdAt: string; // ISO 8601 date string
}

export interface Payout {
  id: string; // Corresponds to document ID
  disbursementId: string;
  amount: number;
  createdAt: string; // ISO 8601 date string
}

export interface Waitlist {
  menteeId: string;
  menteeName: string;
  phoneNumber?: string;
  createdAt: string; // ISO 8601 date string
}
