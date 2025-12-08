'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';

export const Header = () => {
  const auth = useAuth();
  const handleSignOut = () => {
    signOut(auth);
  };
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
        <Link href="/admin" className="text-2xl font-extrabold text-primary">
          MentorVerse Admin
        </Link>
        {auth.currentUser && (
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
};
