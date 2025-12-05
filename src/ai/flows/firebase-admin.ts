'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

let adminApp: App | null = null;

export async function initFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }

  // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // or the default service account of the Cloud Run/Functions environment.
  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS))
    : undefined;


  if (getApps().length === 0) {
     adminApp = initializeApp({
       credential
     });
  } else {
    adminApp = getApps()[0];
  }
  
  return adminApp;
}
