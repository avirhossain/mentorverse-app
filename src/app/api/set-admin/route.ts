'use server';
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { cookies } from 'next/headers';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

export async function POST(req: NextRequest) {
  try {
    const { uid, admin: isAdmin } = await req.json();
    const sessionCookie = cookies().get('__session')?.value || '';

    // Verify the session cookie and check if the user is an admin.
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);

    if (decodedClaims.admin !== true) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Set custom user claims for the target user.
    await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });

    return NextResponse.json({ message: `Successfully set admin status for user ${uid}` });
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
