'use server';

import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }
    
    // Ensure the user exists before setting a claim
    await admin.auth().getUser(uid);

    await admin.auth().setCustomUserClaims(uid, { admin: true });

    return NextResponse.json({ message: `Admin claim set for user ${uid}` }, { status: 200 });

  } catch (error: any) {
    console.error('Error in set-admin API:', error);
    // Distinguish between user not found and other errors
    if (error.code === 'auth/user-not-found') {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
