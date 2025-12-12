// IMPORTANT: This file is for SERVER-SIDE Firebase initialization ONLY.
// It is NOT meant to be used on the client.

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Auth, signInWithCustomToken } from 'firebase/auth';
import { sha256 } from 'js-sha256';

let firebaseApp: FirebaseApp;
if (!getApps().length) {
  if (process.env.NODE_ENV === 'production') {
    // In production, App Hosting provides the configuration automatically.
    firebaseApp = initializeApp();
  } else {
    // In development, we use the local config file.
    firebaseApp = initializeApp(firebaseConfig);
  }
} else {
  firebaseApp = getApp();
}

const firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

async function getAuthenticatedAuth(): Promise<Auth> {
  if (auth.currentUser) {
    return auth;
  }
  // This is a simplified example. In a real-world scenario, you would use a secure
  // way to authenticate your server, like a service account.
  // For this context, we create a "server user" to perform reads.
  const serverUserId = `server_${sha256(firebaseApp.options.apiKey || 'default')}`;
  try {
    // This custom token would typically be minted by a secure backend service
    // with access to a service account private key. For this example, we assume
    // a pre-minted token is available for the server user in an environment variable.
    // As a fallback for local dev, you'd need to generate this token.
    // For now, this part will likely fail without a proper token minting setup.
    // The principle is to authenticate the server so it can bypass security rules.
    const customToken = process.env.FIREBASE_SERVER_CUSTOM_TOKEN;
    if (customToken) {
      await signInWithCustomToken(auth, customToken);
    }
    // If no token, the 'auth' object is unauthenticated and will rely on public security rules.
  } catch (error) {
    console.error("Server authentication failed:", error);
    // Proceed with unauthenticated access, relying on public security rules.
  }
  return auth;
}

// Function to be called from Server Components
export async function initializeFirebaseOnServer() {
  const authenticatedAuth = await getAuthenticatedAuth();
  return {
    firestore,
    auth: authenticatedAuth
  };
}

// Re-exporting the original getSdks for consistency, though it's less needed here.
export function getSdks(app: FirebaseApp) {
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app)
  };
}

// A simple export for direct use in server files.
export { firestore, auth };
