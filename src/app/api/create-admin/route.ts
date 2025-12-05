
'use server';
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// This is the hardcoded email of the first and only administrator.
const ADMIN_EMAIL = 'mmavir89@gmail.com';

// Initialize Firebase Admin SDK
// This pattern ensures that the SDK is initialized only once.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
  }
}

/**
 * A one-time setup route to create the admin user if it doesn't exist.
 */
export async function GET(req: NextRequest) {
  if (!admin.apps.length) {
    return NextResponse.json({ error: 'Firebase Admin SDK not initialized.' }, { status: 500 });
  }

  try {
    // 1. Check if the admin user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      // If user exists, we can just ensure the claim is set and exit.
      if (userRecord.customClaims?.['admin'] !== true) {
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
        return NextResponse.json({ message: `Admin claims refreshed for ${ADMIN_EMAIL}.` });
      }
      return NextResponse.json({ message: `Admin user ${ADMIN_EMAIL} already exists.` });

    } catch (error: any) {
      // Error code 'auth/user-not-found' is expected if the user doesn't exist.
      if (error.code !== 'auth/user-not-found') {
        throw error; // Re-throw other errors
      }
    }

    // 2. If user does not exist, create them
    console.log(`Admin user not found. Creating new admin: ${ADMIN_EMAIL}`);
    const temporaryPassword = Math.random().toString(36).slice(-10); // Generate a random password

    const newUserRecord = await admin.auth().createUser({
      email: ADMIN_EMAIL,
      emailVerified: true,
      password: temporaryPassword,
      displayName: "Admin",
    });

    // 3. Set the custom admin claim
    await admin.auth().setCustomUserClaims(newUserRecord.uid, { admin: true });

    console.log(`Successfully created new admin user: ${ADMIN_EMAIL} with temporary password.`);
    
    return NextResponse.json({ 
        message: `Admin user ${ADMIN_EMAIL} created successfully.`,
        // IMPORTANT: In a real production scenario, you would not return the password.
        // This is done for development convenience. The user should be prompted to change it.
        temporaryPasswordNote: `A temporary password has been set. Please use the 'Forgot Password' flow on the login page to set a new one.`
    });

  } catch (error: any) {
    console.error('Error in create-admin route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
