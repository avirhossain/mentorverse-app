'use server';
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Make sure to configure this with your service account credentials in a secure way
if (!admin.apps.length) {
  try {
    // When running in a Google Cloud environment, the SDK can auto-discover credentials.
    // For local development, you would set the GOOGLE_APPLICATION_CREDENTIALS env var.
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, admin: isAdmin } = await req.json();

    if (!uid) {
        return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }
    
    // This endpoint is now only for bootstrapping the first admin or for future admin management.
    // For now, we allow any authenticated user to make another user an admin.
    // In a real production app, you would lock this down to only be callable by existing admins.
    // For example:
    // const authorization = req.headers.get('Authorization');
    // const idToken = authorization?.split('Bearer ')[1];
    // if (!idToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // if (!decodedToken.admin) {
    //    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
    
    // It's good practice to revoke refresh tokens to force re-authentication with new claims,
    // but the client-side will handle token refresh for a smoother UX.
    // await admin.auth().revokeRefreshTokens(uid);

    return NextResponse.json({ message: `Successfully set admin status for user ${uid}` });
  } catch (error: any) {
    console.error('Error setting custom claims:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
