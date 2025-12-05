
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase'; // Use the direct auth hook
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, type User } from 'firebase/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!auth) {
        // This can happen briefly on initial load.
        // The onAuthStateChanged listener will handle it once auth is available.
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user is signed in, redirect to the admin login page.
        router.push('/admin/login');
        return;
      }

      try {
        // User is found, now force a token refresh to get the latest custom claims.
        const idTokenResult = await user.getIdTokenResult(true);

        // Check if the 'admin' claim is true.
        if (idTokenResult.claims.admin) {
          // User is an admin, allow access.
          setIsVerifying(false);
        } else {
          // User is not an admin, redirect them.
          console.log("Redirecting: User is not an admin.");
          router.push('/admin/login');
        }
      } catch (error) {
        // An error occurred while getting the token, likely a network issue.
        console.error("Error verifying admin status:", error);
        router.push('/admin/login');
      }
    });

    // Cleanup the listener when the component unmounts.
    return () => unsubscribe();
  }, [auth, router]);

  // While verification is in progress, show a loading skeleton.
  if (isVerifying) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="p-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex-1 p-8 space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // If verification is complete and successful, render the admin dashboard content.
  return <>{children}</>;
}
