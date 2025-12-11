
'use client';

import React, { useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  signOut,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { MenteesAPI } from '@/lib/firebase-adapter';
import type { Mentee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleSuspensionCheck = async (user: UserCredential['user']) => {
    if (!user) return false;

    const menteeRef = doc(firestore, 'mentees', user.uid);
    const menteeDoc = await getDoc(menteeRef);

    if (menteeDoc.exists()) {
      const menteeData = menteeDoc.data() as Mentee;
      if (!menteeData.isActive) {
        // Account is suspended
        await signOut(auth); // Sign the user out immediately
        toast({
          variant: 'destructive',
          title: 'Account Suspended',
          description:
            'Your account has been suspended. Please contact support for more information.',
          duration: 10000,
        });
        return true; // Indicates suspension
      }
    }
    return false; // Not suspended
  };

  const createMenteeProfile = async (userCred: UserCredential) => {
    const { user } = userCred;
    if (!user || !firestore) return;

    try {
      // Get the current count of mentees to generate the next ID
      const menteesCollection = collection(firestore, 'mentees');
      const collectionSnapshot = await getDocs(menteesCollection);
      const menteeCount = collectionSnapshot.size;

      // Create a human-readable display ID starting from U10001
      const displayId = `U${10001 + menteeCount}`;

      await MenteesAPI.createMentee(firestore, user.uid, {
        id: user.uid,
        displayId: displayId,
        name: user.displayName || 'Anonymous User',
        email: user.email || '',
        createdAt: new Date().toISOString(),
        isActive: true,
        accountBalance: 0,
        totalSessionsBooked: 0,
      });
    } catch (error: any) {
      console.error('Failed to create mentee profile:', error);
      toast({
        variant: 'destructive',
        title: 'Profile Creation Failed',
        description:
          'Could not save your user profile. Please contact support.',
      });
    }
  };

  const handleAuthSuccess = async (userCredential: UserCredential, isNewUser: boolean) => {
    const { user } = userCredential;
    const isSuspended = await handleSuspensionCheck(user);
    if (isSuspended) {
      return; // Stop the process
    }

    if (isNewUser) {
      await createMenteeProfile(userCredential);
    }
    
    toast({
      title: isNewUser ? 'Account Created' : 'Login Successful',
      description: "Welcome to MenTees! You're now logged in.",
    });
    router.push('/');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const menteeDoc = await MenteesAPI.getMentee(firestore, userCredential.user.uid);
      const isNewUser = !menteeDoc.exists();

      await handleAuthSuccess(userCredential, isNewUser);

    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message || 'Could not sign in with Google.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-4 w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">
          Join MenTees
        </CardTitle>
        <CardDescription>
          Sign in or create an account with your Google account to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : (
                <>
                    <GoogleIcon />
                    Sign in/up with Google
                </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
