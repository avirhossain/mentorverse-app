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
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type {
  Mentee,
  Mentor,
  Session,
  Review,
  Tip,
  Disbursement,
} from './types';

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

  updateBalance: (db: Firestore, uid: string, newBalance: number) => {
    const data = { accountBalance: newBalance };
    const menteeRef = doc(db, 'mentees', uid);
    updateDoc(menteeRef, data).catch(() => {
      emitPermissionError(menteeRef.path, 'update', data);
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
    const mentorsCol = collection(db, 'mentors');
    addDoc(mentorsCol, data).catch(() => {
      emitPermissionError(mentorsCol.path, 'create', data);
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

// ------------------ SESSIONS ------------------
export const SessionsAPI = {
  bookSession: (db: Firestore, data: WithFieldValue<Session>) => {
    const sessionsCol = collection(db, 'sessions');
    addDoc(sessionsCol, data).catch(() => {
      emitPermissionError(sessionsCol.path, 'create', data);
    });
  },

  getSession: (db: Firestore, id: string) => {
    return getDoc(doc(db, 'sessions', id));
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

  listSessionsForMentee: (db: Firestore, menteeId: string) => {
    const q = query(collection(db, 'sessions'), where('menteeId', '==', menteeId));
    return getDocs(q);
  },

  listSessionsForMentor: (db: Firestore, mentorId: string) => {
    const q = query(collection(db, 'sessions'), where('mentorId', '==', mentorId));
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
    const q = query(collection(db, 'reviews'), where('mentorId', '==', mentorId));
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

  updateTip: (db: Firestore, id: string, data: Partial<WithFieldValue<Tip>>) => {
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

  listForSession: (db: Firestore, sessionId: string) => {
    const q = query(collection(db, 'disbursements'), where('sessions', 'array-contains', sessionId));
    return getDocs(q);
  },
};
