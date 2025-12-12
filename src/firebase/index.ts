'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    // If already initialized, return the SDKs with the already initialized App
    return getSdks(getApp());
  }

  // When in a production environment, Firebase App Hosting automatically provides
  // the necessary environment variables to initialize the app without a config object.
  if (process.env.NODE_ENV === 'production') {
    // Important! initializeApp() is called without any arguments in production.
    const firebaseApp = initializeApp();
    return getSdks(firebaseApp);
  } else {
    // In a non-production environment (like local development),
    // we fall back to using the explicit firebaseConfig object.
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './auth/use-user';
