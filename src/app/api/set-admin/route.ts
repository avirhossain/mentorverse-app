
'use server';
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// This is the hardcoded email of the first and only administrator.
const ADMIN_EMAIL = 'mmavir89@gmail.com';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // In a deployed environment (like App Hosting), service account credentials
    // are often discovered automatically. For local development,
    // you might need to set GOOGLE_APPLICATION_CREDENTIALS.
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
    // We'll return a server error response if initialization fails.
    // This can be handled by the client to show a generic error.
  }
}

export async function POST(req: NextRequest) {
  // Check if the SDK was initialized
  if (!admin.apps.length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized.' }, { status: 500 });
  }

  try {
    const { uid } = await req.json();

    if (!uid) {
        return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    const userRecord = await admin.auth().getUser(uid);

    if (userRecord.email === ADMIN_EMAIL) {
        if (userRecord.customClaims?.['admin'] === true) {
            return NextResponse.json({ message: `User ${uid} is already an admin.` });
        }
        
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        
        return NextResponse.json({ message: `Successfully set admin status for user ${uid}` });
    } else {
        // If the UID does not belong to the admin email, deny the request.
        return NextResponse.json({ error: 'Forbidden: User is not authorized to be an admin.' }, { status: 403 });
    }
    
  } catch (error: any) {
    console.error('Error setting custom claims:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
