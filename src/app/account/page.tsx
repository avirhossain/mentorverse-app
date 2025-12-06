'use client';

import React from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountPage() {
  const { user, isUserLoading, isAuthCheckComplete } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthCheckComplete && !user) {
      router.push('/login');
    }
  }, [user, isAuthCheckComplete, router]);

  if (isUserLoading || !isAuthCheckComplete) {
    return (
      <div>
        <Header currentView="account" />
        <div className="flex justify-center items-center h-screen">
          <div className="p-8 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // or a login prompt
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView="account" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="bg-primary/10 p-8 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-3xl font-bold text-gray-800">{user.displayName || 'User'}</CardTitle>
              <p className="text-md text-gray-600 mt-1">{user.email}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">User ID:</span>
                <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded-md">{user.uid}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">Email Verified:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">Last Sign In:</span>
                <span className="text-gray-600 text-sm">{new Date(user.metadata.lastSignInTime!).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-32">Account Created:</span>
                <span className="text-gray-600 text-sm">{new Date(user.metadata.creationTime!).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
