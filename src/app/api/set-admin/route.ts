'use server';
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Make sure to configure this with your service account credentials in a secure way
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // If you have GOOGLE_APPLICATION_CREDENTIALS set in your environment,
      // you don't need to pass the credential here.
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, admin: isAdmin } = await req.json();

    // No authorization check here for bootstrapping the first admin.
    // WARNING: In a production environment, you MUST secure this endpoint.
    // For example, by checking if the caller is already an admin,
    // or by using a secret key, or by only allowing it for a specific user ID.
    // Since this is for the initial setup of 'mmavir89@gmail.com', we are leaving it open temporarily.
    
    await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
    
    // It's also a good practice to revoke existing sessions to force re-authentication
    // with the new claims, but this might be too disruptive for this context.
    // await admin.auth().revokeRefreshTokens(uid);

    return NextResponse.json({ message: `Successfully set admin status for user ${uid}` });
  } catch (error: any) {
    console.error('Error setting custom claims:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
