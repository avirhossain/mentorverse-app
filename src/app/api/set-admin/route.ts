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
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    // Create the user
    const userRecord = await admin.auth().createUser({
        email,
        password,
    });
    
    // Set custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    return NextResponse.json({ message: `Admin user ${email} created with UID ${userRecord.uid}` }, { status: 200 });

  } catch (error: any) {
    console.error('Error in set-admin API:', error);
    if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'This email is already in use.' }, { status: 409 });
    }
    if (error.code === 'auth/invalid-password') {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
