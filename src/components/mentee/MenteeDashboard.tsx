'use client';
import React from 'react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';

export function MenteeDashboard() {
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome, {user?.displayName || user?.email || 'Mentee'}!</h1>
        <p className="mt-4 text-lg text-muted-foreground">You are now logged in to the Mentee Dashboard.</p>
        <p className="mt-2 text-sm text-muted-foreground">UID: {user?.uid}</p>
        <Button onClick={handleSignOut} className="mt-8">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
