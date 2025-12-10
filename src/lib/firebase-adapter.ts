'use client';
// Shared Firestore Data Access Layer for Admin + Mentee apps
// Adapted to use non-blocking writes and contextual error handling.

import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
  WithFieldValue,
  increment,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type {
  Mentee,
  Mentor,
  Session,
  Booking,
  Review,
  Tip,
  Disbursement,
  Transaction,
} from './types';
import { v4 as uuidv4 } from 'uuid';

const emitPermissionError = (
  path: string,
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write',
  data?: any
) => {
  const permissionError = new FirestorePermissionError({
    path,
    operation,
    requestResourceData: data,
  });
  errorEmitter.emit('permission-error', permissionError);
};

// ------------------ MENTEES (Replaces UsersAPI) ------------------
export const MenteesAPI = {
  getMentee: (db: Firestore, uid: string) => {
    return getDoc(doc(db, 'mentees', uid));
  },

  createMentee: (
    db: Firestore,
    uid: string,
    data: WithFieldValue<Mentee>
  ) => {
    const menteeRef = doc(db, 'mentees', uid);
    setDoc(menteeRef, data, { merge: true }).catch(() => {
      emitPermissionError(menteeRef.path, 'create', data);
    });
  },

  updateMentee: (
    db: Firestore,
    uid: string,
    data: Partial<WithFieldValue<Mentee>>
  ) => {
    const menteeRef = doc(db, 'mentees', uid);
    updateDoc(menteeRef, data).catch(() => {
      emitPermissionError(menteeRef.path, 'update', data);
    });
  },

  deleteMentee: (db: Firestore, uid: string) => {
    const menteeRef = doc(db, 'mentees', uid);
    deleteDoc(menteeRef).catch(() => {
      emitPermissionError(menteeRef.path, 'delete');
    });
  },

  addBalance: (db: Firestore, uid: string, amount: number) => {
    if (amount <= 0) return;

    const menteeRef = doc(db, 'mentees', uid);
    const transactionRef = doc(
      collection(db, `mentees/${uid}/transactions`),
      uuidv4()
    );

    const transactionData: Transaction = {
      id: transactionRef.id,
      type: 'topup',
      amount: amount,
      description: 'Admin top-up',
      createdAt: new Date().toISOString(),
    };

    // Non-blocking update for mentee balance
    updateDoc(menteeRef, { accountBalance: increment(amount) }).catch(() => {
      emitPermissionError(menteeRef.path, 'update', {
        accountBalance: `increment(${amount})`,
      });
    });

    // Non-blocking creation of transaction record
    setDoc(transactionRef, transactionData).catch(() => {
      emitPermissionError(transactionRef.path, 'create', transactionData);
    });
  },

  listMentees: (db: Firestore) => {
    return getDocs(collection(db, 'mentees'));
  },
};

// ------------------ MENTORS (Admin Managed Only) ------------------
export const MentorsAPI = {
  listMentors: (db: Firestore) => {
    return getDocs(collection(db, 'mentors'));
  },

  getMentor: (db: Firestore, id: string) => {
    return getDoc(doc(db, 'mentors', id));
  },

  createMentor: (db: Firestore, data: WithFieldValue<Mentor>) => {
    // This assumes the ID is pre-generated (e.g., with uuid) before calling this function
    const mentorRef = doc(db, 'mentors', data.id);
    setDoc(mentorRef, data).catch(() => {
      emitPermissionError(mentorRef.path, 'create', data);
    });
  },

  updateMentor: (
    db: Firestore,
    id: string,
    data: Partial<WithFieldValue<Mentor>>
  ) => {
    const mentorRef = doc(db, 'mentors', id);
    updateDoc(mentorRef, data).catch(() => {
      emitPermissionError(mentorRef.path, 'update', data);
    });
  },

  deleteMentor: (db: Firestore, id: string) => {
    const mentorRef = doc(db, 'mentors', id);
    deleteDoc(mentorRef).catch(() => {
      emitPermissionError(mentorRef.path, 'delete');
    });
  },
};

// ------------------ SESSIONS (Templates managed by Admin) ------------------
export const SessionsAPI = {
  getSession: (db: Firestore, id: string) => {
    return getDoc(doc(db, 'sessions', id));
  },

  listSessions: (db: Firestore) => {
    return getDocs(collection(db, 'sessions'));
  },

  createSession: (db: Firestore, data: WithFieldValue<Session>) => {
    const sessionsCol = collection(db, 'sessions');
    addDoc(sessionsCol, data).catch(() => {
      emitPermissionError(sessionsCol.path, 'create', data);
    });
  },

  updateSession: (
    db: Firestore,
    id: string,
    data: Partial<WithFieldValue<Session>>
  ) => {
    const sessionRef = doc(db, 'sessions', id);
    updateDoc(sessionRef, data).catch(() => {
      emitPermissionError(sessionRef.path, 'update', data);
    });
  },

  deleteSession: (db: Firestore, id: string) => {
    const sessionRef = doc(db, 'sessions', id);
    deleteDoc(sessionRef).catch(() => {
      emitPermissionError(sessionRef.path, 'delete');
    });
  },
};

// ------------------ BOOKINGS ------------------
export const BookingsAPI = {
  createBooking: (db: Firestore, data: WithFieldValue<Booking>) => {
    const bookingRef = doc(db, 'bookings', data.id);
    setDoc(bookingRef, data).catch(() => {
      emitPermissionError(bookingRef.path, 'create', data);
    });
  },

  getBooking: (db: Firestore, id: string) => {
    return getDoc(doc(db, 'bookings', id));
  },

  updateBooking: (
    db: Firestore,
    id: string,
    data: Partial<WithFieldValue<Booking>>
  ) => {
    const bookingRef = doc(db, 'bookings', id);
    updateDoc(bookingRef, data).catch(() => {
      emitPermissionError(bookingRef.path, 'update', data);
    });
  },

  listBookingsForMentee: (db: Firestore, menteeId: string) => {
    const q = query(
      collection(db, 'bookings'),
      where('menteeId', '==', menteeId)
    );
    return getDocs(q);
  },

  listBookingsForMentor: (db: Firestore, mentorId: string) => {
    const q = query(
      collection(db, 'bookings'),
      where('mentorId', '==', mentorId)
    );
    return getDocs(q);
  },
};

// ------------------ REVIEWS ------------------
export const ReviewsAPI = {
  createReview: (db: Firestore, data: WithFieldValue<Review>) => {
    const reviewsCol = collection(db, 'reviews');
    addDoc(reviewsCol, data).catch(() => {
      emitPermissionError(reviewsCol.path, 'create', data);
    });
  },

  listReviewsForMentor: (db: Firestore, mentorId: string) => {
    const q = query(
      collection(db, 'reviews'),
      where('mentorId', '==', mentorId)
    );
    return getDocs(q);
  },
};

// ------------------ TIPS ------------------
export const TipsAPI = {
  listTips: (db: Firestore) => {
    return getDocs(collection(db, 'tips'));
  },

  createTip: (db: Firestore, data: WithFieldValue<Tip>) => {
    const tipsCol = collection(db, 'tips');
    addDoc(tipsCol, data).catch(() => {
      emitPermissionError(tipsCol.path, 'create', data);
    });
  },

  updateTip: (
    db: Firestore,
    id: string,
    data: Partial<WithFieldValue<Tip>>
  ) => {
    const tipRef = doc(db, 'tips', id);
    updateDoc(tipRef, data).catch(() => {
      emitPermissionError(tipRef.path, 'update', data);
    });
  },

  deleteTip: (db: Firestore, id: string) => {
    const tipRef = doc(db, 'tips', id);
    deleteDoc(tipRef).catch(() => {
      emitPermissionError(tipRef.path, 'delete');
    });
  },
};

// ------------------ DISBURSEMENTS ------------------
export const DisbursementAPI = {
  createDisbursement: (db: Firestore, data: WithFieldValue<Disbursement>) => {
    const disbursementsCol = collection(db, 'disbursements');
    addDoc(disbursementsCol, data).catch(() => {
      emitPermissionError(disbursementsCol.path, 'create', data);
    });
  },

  listForBooking: (db: Firestore, bookingId: string) => {
    const q = query(
      collection(db, 'disbursements'),
      where('bookingIds', 'array-contains', bookingId)
    );
    return getDocs(q);
  },
};
