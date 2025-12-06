'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

let adminApp: App | null = null;

export async function initFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable if it exists,
  // otherwise, it will use the default service account of the App Hosting environment.
  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS))
    : undefined;

  // If credentials are provided, use them. Otherwise, initialize without arguments
  // to use the application's default credentials.
  adminApp = credential ? initializeApp({ credential }) : initializeApp();
  
  return adminApp;
}
