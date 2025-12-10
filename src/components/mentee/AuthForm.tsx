'use client';

import React, { useState } from 'react';
import {
  Auth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  UserCredential,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

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
    if (!user) return;

    try {
      // Create a human-readable display ID.
      const displayId = `U${Date.now().toString().slice(-6)}`;
      
      await MenteesAPI.createMentee(firestore, user.uid, {
        id: user.uid,
        displayId: displayId,
        name: name || user.displayName || 'Anonymous User',
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

  const handleAuthSuccess = async (userCredential: UserCredential) => {
    // 1. Check for suspension
    const isSuspended = await handleSuspensionCheck(userCredential.user);
    if (isSuspended) {
      return; // Stop the login process
    }

    // 2. If it's a new signup, create their profile
    if (activeTab === 'signup') {
      await createMenteeProfile(userCredential);
    }
    
    // 3. Show success message and redirect
    toast({
      title: activeTab === 'login' ? 'Login Successful' : 'Account Created',
      description: "Welcome to MentorVerse! You're now logged in.",
    });
    router.push('/');
  };

  const handleAuthAction = async (
    action: (auth: Auth, ...args: any[]) => Promise<UserCredential>
  ) => {
    setIsLoading(true);
    try {
      const userCredential = await action(auth, email, password);
      if (userCredential) {
        await handleAuthSuccess(userCredential);
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      toast({
        variant: 'destructive',
        title: activeTab === 'login' ? 'Login Failed' : 'Sign-up Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      handleAuthAction(signInWithEmailAndPassword);
    } else {
      handleAuthAction(createUserWithEmailAndPassword);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const isNewUser = (await MenteesAPI.getMentee(firestore, userCredential.user.uid)).exists() === false;
      if (isNewUser) {
        // Temporarily set active tab to 'signup' for profile creation logic
        setActiveTab('signup'); 
      }

      await handleAuthSuccess(userCredential);
      if (isNewUser) setActiveTab('login'); // Reset tab state

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

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      setActiveTab('signup'); // Treat as signup for profile creation
      const userCredential = await signInAnonymously(auth);
      await handleAuthSuccess(userCredential);
    } catch (error: any) {
      console.error('Anonymous Sign-In Error:', error);
      toast({
        variant: 'destructive',
        title: 'Anonymous Sign-In Failed',
        description: error.message || 'Could not sign in anonymously.',
      });
    } finally {
      setIsLoading(false);
      setActiveTab('login'); // Reset tab state
    }
  };

  return (
    <Card className="mx-4 w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">
          MentorVerse
        </CardTitle>
        <CardDescription>Your gateway to expert mentorship.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form
              onSubmit={handleEmailPasswordSubmit}
              className="space-y-4 pt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form
              onSubmit={handleEmailPasswordSubmit}
              className="space-y-4 pt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleIcon />
            Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleAnonymousSignIn}
            disabled={isLoading}
          >
            Guest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
