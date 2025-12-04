'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Import compat libraries
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!firebase.apps.length) {
    // We use the compat `initializeApp` here to make sure both APIs are available.
    firebase.initializeApp(firebaseConfig);
  }

  // We are returning the modular SDKs for use throughout the app,
  // but the compat initialization above makes the v8 APIs available for libraries like FirebaseUI.
  const app = getApp();
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    // Export the compat auth specifically for FirebaseUI
    authCompat: firebase.auth(),
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