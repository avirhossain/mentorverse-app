
'use server';
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// This is the hardcoded email of the first and only administrator.
const ADMIN_EMAIL = 'mmavir89@gmail.com';

// Initialize Firebase Admin SDK
// This pattern ensures that the SDK is initialized only once.
if (!admin.apps.length) {
  try {
    // In a deployed environment (like App Hosting), service account credentials
    // are often discovered automatically if the service account has the right permissions.
    // For local development, you might need to set GOOGLE_APPLICATION_CREDENTIALS.
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
    // If initialization fails, the app can't function correctly.
    // We'll return a server error response if any requests come in.
  }
}

export async function POST(req: NextRequest) {
  // Check if the SDK was initialized. If not, initialization failed earlier.
  if (!admin.apps.length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized. Check server logs for details.' }, { status: 500 });
  }

  try {
    const { uid } = await req.json();

    if (!uid) {
        return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    const userRecord = await admin.auth().getUser(uid);

    // This is the bootstrapping logic: only the specified email can become an admin.
    if (userRecord.email === ADMIN_EMAIL) {
        // Check if the user is already an admin to avoid unnecessary updates.
        if (userRecord.customClaims?.['admin'] === true) {
            return NextResponse.json({ message: `User ${uid} is already an admin.` });
        }
        
        // Set the custom claim.
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        
        return NextResponse.json({ message: `Successfully set admin status for user ${uid}` });
    } else {
        // For any other user, deny the request. This is a security measure.
        return NextResponse.json({ error: 'Forbidden: User is not authorized to be an admin.' }, { status: 403 });
    }
    
  } catch (error: any) {
    console.error('Error setting custom claims:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
