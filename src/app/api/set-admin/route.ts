
'use server';
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// This is the hardcoded email of the first and only administrator.
const ADMIN_EMAIL = 'mmavir89@gmail.com';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check for GOOGLE_APPLICATION_CREDENTIALS environment variable
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // In a deployed environment (like App Hosting), service account credentials
      // are often discovered automatically. For local development,
      // you might need to set GOOGLE_APPLICATION_CREDENTIALS.
      // We'll let initializeApp try to find them.
      console.log("GOOGLE_APPLICATION_CREDENTIALS not set, attempting to initialize with default credentials.");
    }
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
    // Return a server error response if initialization fails, as the endpoint cannot function.
    return NextResponse.json({ error: 'Firebase Admin SDK initialization failed.', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();

    if (!uid) {
        return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    // This endpoint is now only for bootstrapping the first admin.
    // We get the user record to verify the email address before granting claims.
    const userRecord = await admin.auth().getUser(uid);

    if (userRecord.email === ADMIN_EMAIL) {
        // Check if the user already has the admin claim
        if (userRecord.customClaims?.['admin'] === true) {
            return NextResponse.json({ message: `User ${uid} is already an admin.` });
        }
        
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        
        // It's good practice to revoke refresh tokens to force re-authentication with new claims.
        // However, the client-side will handle token refresh for a smoother UX.
        // await admin.auth().revokeRefreshTokens(uid); 
        
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
