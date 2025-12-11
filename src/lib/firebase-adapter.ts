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
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
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
  Waitlist,
  Payout,
  Notification,
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

  addBalance: (
    db: Firestore,
    uid: string,
    amount: number,
    description: string,
    reference?: string
  ) => {
    if (amount <= 0) return;

    const batch = writeBatch(db);
    const menteeRef = doc(db, 'mentees', uid);
    const transactionRef = doc(
      collection(db, `mentees/${uid}/transactions`),
      uuidv4()
    );

    const transactionData: Transaction = {
      id: transactionRef.id,
      type: 'topup',
      amount: amount,
      description: description,
      reference: reference,
      createdAt: new Date().toISOString(),
    };

    // Add both operations to the batch
    batch.update(menteeRef, { accountBalance: increment(amount) });
    batch.set(transactionRef, transactionData);

    // Commit the batch and handle potential errors
    batch.commit().catch(() => {
      // If the batch fails, it's likely a permission error on one of the writes.
      // We can emit errors for both potential points of failure to aid debugging.
      emitPermissionError(menteeRef.path, 'update', {
        accountBalance: `increment(${amount})`,
      });
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
    const sessionRef = doc(db, 'sessions', data.id);
    setDoc(sessionRef, data).catch(() => {
      emitPermissionError(sessionRef.path, 'create', data);
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

  joinWaitlist: (
    db: Firestore,
    sessionId: string,
    mentee: Mentee,
    phoneNumber?: string
  ) => {
    const waitlistRef = doc(db, 'sessions', sessionId, 'waitlist', mentee.id);
    const data: Waitlist = {
      menteeId: mentee.id,
      menteeName: mentee.name,
      phoneNumber: phoneNumber || mentee.phone,
      createdAt: new Date().toISOString(),
    };
    setDoc(waitlistRef, data).catch(() => {
      emitPermissionError(waitlistRef.path, 'create', data);
    });
  },

  startMeetingForSession: async (db: Firestore, sessionId: string) => {
    const batch = writeBatch(db);
    const meetingUrl = `https://meet.jit.si/mentorverse-session-${sessionId}-${uuidv4()}`;

    // 1. Find all confirmed bookings for the session
    const bookingsQuery = query(
      collection(db, 'sessionBookings'),
      where('sessionId', '==', sessionId),
      where('status', '==', 'confirmed')
    );

    try {
      const bookingSnapshots = await getDocs(bookingsQuery);
      if (bookingSnapshots.empty) {
        throw new Error('No confirmed bookings to start a meeting for.');
      }

      bookingSnapshots.forEach((bookingDoc) => {
        const bookingData = bookingDoc.data() as Booking;

        // 2. For each booking, update its status and add the meeting URL
        const bookingRef = doc(db, 'sessionBookings', bookingDoc.id);
        batch.update(bookingRef, { status: 'started' as const, meetingUrl });

        // 3. For each booking, create a notification for the mentee
        const notificationRef = doc(
          collection(db, 'mentees', bookingData.menteeId, 'notifications')
        );
        const notificationData: Notification = {
          id: notificationRef.id,
          menteeId: bookingData.menteeId,
          message: `Your session "${bookingData.sessionName}" has started!`,
          isRead: false,
          createdAt: new Date().toISOString(),
          link: meetingUrl,
        };
        batch.set(notificationRef, notificationData);
      });

      // 4. Commit all the updates and creations at once
      await batch.commit();
    } catch (error) {
      console.error(
        'Failed to start meeting for session and send notifications:',
        error
      );
      // Emit a generic error, as the specific failure point is hard to determine in a batch
      emitPermissionError(`/sessions/${sessionId}/sessionBookings`, 'update');
      emitPermissionError(`/mentees/.../notifications`, 'create');
    }
  },
};

// ------------------ SESSION BOOKINGS ------------------
export const SessionBookingsAPI = {
  createBooking: async (
    db: Firestore,
    bookingData: WithFieldValue<Booking>
  ) => {
    const sessionRef = doc(db, 'sessions', bookingData.sessionId);
    const bookingRef = doc(db, 'sessionBookings', bookingData.id);

    try {
      await runTransaction(db, async (transaction) => {
        const sessionDoc = await transaction.get(sessionRef);
        if (!sessionDoc.exists()) {
          throw 'Session does not exist!';
        }

        const sessionData = sessionDoc.data() as Session;
        const currentBookedCount = sessionData.bookedCount || 0;
        const maxParticipants = sessionData.participants || 1;

        if (currentBookedCount >= maxParticipants) {
          throw 'Session is already full!';
        }

        // Perform the writes within the transaction
        transaction.set(bookingRef, bookingData);
        transaction.update(sessionRef, { bookedCount: increment(1) });
      });
    } catch (error) {
      console.error('Booking transaction failed: ', error);
      // Determine which permission error to emit based on the likely failure point
      if (typeof error === 'string' && error.includes('full')) {
        // This is a custom error, not a permission error. The UI should handle this.
        throw error;
      } else {
        // It's likely a Firestore permission error
        emitPermissionError(bookingRef.path, 'create', bookingData);
        emitPermissionError(sessionRef.path, 'update', {
          bookedCount: 'increment(1)',
        });
      }
    }
  },

  getBooking: (db: Firestore, id: string) => {
    return getDoc(doc(db, 'sessionBookings', id));
  },

  updateBooking: (
    db: Firestore,
    id: string,
    data: Partial<WithFieldValue<Booking>>
  ) => {
    const bookingRef = doc(db, 'sessionBookings', id);
    updateDoc(bookingRef, data).catch(() => {
      emitPermissionError(bookingRef.path, 'update', data);
    });
  },

  startMeeting: async (db: Firestore, bookingId: string) => {
    const batch = writeBatch(db);
    const bookingRef = doc(db, 'sessionBookings', bookingId);
    let bookingData: Booking;

    try {
      // First, get the booking document to retrieve menteeId and sessionName
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) {
        throw new Error('Booking not found!');
      }
      bookingData = bookingSnap.data() as Booking;

      // 1. Prepare booking update
      const meetingUrl = `https://meet.jit.si/mentorverse-booking-${bookingId}`;
      const bookingUpdateData = {
        status: 'started' as const,
        meetingUrl: meetingUrl,
      };
      batch.update(bookingRef, bookingUpdateData);

      // 2. Prepare notification creation
      const notificationRef = doc(
        collection(db, 'mentees', bookingData.menteeId, 'notifications')
      );
      const notificationData: Notification = {
        id: notificationRef.id,
        menteeId: bookingData.menteeId,
        message: `Your session "${bookingData.sessionName}" has started!`,
        isRead: false,
        createdAt: new Date().toISOString(),
        link: meetingUrl,
      };
      batch.set(notificationRef, notificationData);

      // 3. Atomically commit both operations
      await batch.commit();
    } catch (error) {
      // If anything fails (getting doc, or committing batch), emit permission errors
      console.error('Failed to start meeting and send notification:', error);
      emitPermissionError(bookingRef.path, 'update', { status: 'started' });
      // We don't know the notification ID, but we can signal the intent
      if (bookingData!) {
        emitPermissionError(
          `/mentees/${bookingData.menteeId}/notifications`,
          'create'
        );
      }
    }
  },

  createInstantMeeting: async (
    db: Firestore,
    options: {
      mentor?: Mentor;
      menteeId?: string;
      subject: string;
      isShareable: boolean;
      admin: User;
    }
  ): Promise<string> => {
    const { mentor, menteeId, subject, isShareable, admin } = options;
    const batch = writeBatch(db);
    const now = new Date();
    const sessionId = uuidv4();
    
    const adminDisplayName = admin.displayName ? encodeURIComponent(admin.displayName) : '';
    const adminEmail = admin.email ? encodeURIComponent(admin.email) : '';
    const meetingUrl = `https://meet.jit.si/mentorverse-instant-${sessionId}#userInfo.displayName="${adminDisplayName}"&userInfo.email="${adminEmail}"`;

    // 1. Create the session document
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionData: Session = {
      id: sessionId,
      mentorId: mentor?.id || 'admin',
      mentorName: mentor?.name || 'Admin',
      name: subject,
      sessionType: 'Special Request',
      status: 'Active',
      sessionFee: 0,
      scheduledDate: now.toISOString().split('T')[0],
      scheduledTime: now.toTimeString().substring(0, 5),
      duration: 60,
      participants: isShareable ? 50 : 1, // High limit for shareable link
      bookedCount: menteeId ? 1 : 0,
    };
    batch.set(sessionRef, sessionData);

    // 2. If a specific mentee is targeted, create their booking and notification
    if (menteeId) {
      const menteeSnap = await getDoc(doc(db, 'mentees', menteeId));
      if (!menteeSnap.exists()) {
        throw new Error('Mentee with the provided ID does not exist.');
      }
      const menteeData = menteeSnap.data() as Mentee;

      // Create booking
      const bookingId = uuidv4();
      const bookingRef = doc(db, 'sessionBookings', bookingId);
      const bookingData: Booking = {
        id: bookingId,
        sessionId: sessionId,
        sessionName: subject,
        mentorId: mentor?.id || 'admin',
        mentorName: mentor?.name || 'Admin',
        menteeId: menteeId,
        menteeName: menteeData.name,
        bookingTime: now.toISOString(),
        scheduledDate: sessionData.scheduledDate!,
        scheduledTime: sessionData.scheduledTime!,
        status: 'started',
        meetingUrl: meetingUrl,
        sessionFee: 0,
        adminDisbursementStatus: 'pending',
      };
      batch.set(bookingRef, bookingData);

      // Create notification
      const notificationRef = doc(
        collection(db, 'mentees', menteeId, 'notifications')
      );
      const notificationData: Notification = {
        id: notificationRef.id,
        menteeId: menteeId,
        message: `An instant meeting "${subject}" has started!`,
        isRead: false,
        createdAt: now.toISOString(),
        link: meetingUrl,
      };
      batch.set(notificationRef, notificationData);
    }

    try {
      await batch.commit();
      return meetingUrl; // Return the URL on success
    } catch (error) {
      console.error('Failed to create instant meeting:', error);
      emitPermissionError(sessionRef.path, 'create', sessionData);
      if (menteeId) {
        emitPermissionError(`/sessionBookings`, 'create');
        emitPermissionError(`/mentees/${menteeId}/notifications`, 'create');
      }
      throw error; // Re-throw the error to be caught by the caller
    }
  },

  listBookingsForMentee: (db: Firestore, menteeId: string) => {
    const q = query(
      collection(db, 'sessionBookings'),
      where('menteeId', '==', menteeId)
    );
    return getDocs(q);
  },

  listBookingsForMentor: (db: Firestore, mentorId: string) => {
    const q = query(
      collection(db, 'sessionBookings'),
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
  createDisbursement: (
    db: Firestore,
    data: WithFieldValue<Disbursement>
  ) => {
    const batch = writeBatch(db);

    // 1. Create the main disbursement record
    const disbursementRef = doc(db, 'disbursements', data.id);
    batch.set(disbursementRef, data);

    // 2. Create the payout record in the mentor's subcollection
    const payoutRef = doc(
      collection(db, 'mentors', data.mentorId, 'payouts'),
      uuidv4()
    );
    const payoutData: Payout = {
      id: payoutRef.id,
      disbursementId: data.id,
      amount: data.totalAmount,
      createdAt: data.createdAt,
    };
    batch.set(payoutRef, payoutData);

    // Atomically commit both writes
    batch.commit().catch(() => {
      emitPermissionError(disbursementRef.path, 'create', data);
      emitPermissionError(payoutRef.path, 'create', payoutData);
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
