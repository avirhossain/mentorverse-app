'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/firebase';
import { useAdminUser } from '@/firebase/auth/use-admin-user';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});


export default function AdminLoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { user, isAdmin, isAuthCheckComplete } = useAdminUser();

    const form = useForm<z.infer<typeof adminLoginSchema>>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: 'mmavir89@gmail.com',
            password: '123456',
        },
    });
    
    // This effect will handle redirection if a user is ALREADY an admin when they land on this page.
    useEffect(() => {
        if (isAuthCheckComplete && user && isAdmin) {
            router.push('/admin');
        }
    }, [isAdmin, isAuthCheckComplete, user, router]);

    const handleAdminLogin = async (values: z.infer<typeof adminLoginSchema>) => {
        if (!auth) {
            toast({ variant: 'destructive', title: 'Authentication service not available.' });
            return;
        }
        
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            
            // CRITICAL: Force a token refresh right after login to get custom claims.
            // This ensures the `useAdminUser` hook gets the `admin:true` claim immediately.
            await userCredential.user.getIdTokenResult(true); 
            
            // After the refresh, the `useAdminUser` hook will update, and the `useEffect` above
            // will handle the redirection to the admin dashboard.
            
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Admin Login Failed',
                description: 'Invalid credentials or permissions. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogout = () => {
        if (auth) {
            signOut(auth);
            toast({
                title: 'Logged Out',
                description: 'You have been successfully signed out.',
            });
        }
    };
    
    if (!isAuthCheckComplete) {
         return (
             <div className="flex flex-col min-h-screen bg-background">
                <Header currentView="admin" />
                <div className="flex-1 flex items-center justify-center">
                    <p>Verifying authentication...</p>
                </div>
            </div>
        );
    }
    
    // If the user is logged in, but not an admin, show the error message.
    if (isAuthCheckComplete && user && !isAdmin) {
         return (
            <div className="min-h-screen bg-background">
                <Header currentView="admin" />
                 <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                     <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                        <div className="text-center">
                            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                Admin Access
                            </h1>
                        </div>
                        <div className="space-y-4">
                            <p className="text-center text-sm">Logged in as: <br/> <span className="font-bold">{user.email}</span></p>
                           
                            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg space-y-3">
                                <p className="font-bold">Admin Access Not Detected</p>
                                <p className="text-sm">You are logged in, but not as an administrator. Please log out and sign in with an admin account.</p>
                            </div>
                            
                             <Button onClick={handleLogout} variant="outline" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" /> Log Out & Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If no user is logged in, show the login form.
    return (
        <div className="min-h-screen bg-background">
            <Header currentView="admin" />
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    <div className="text-center">
                        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Admin Access
                        </h1>
                        <p className="mt-2 text-gray-500">
                           Sign in to the admin dashboard.
                        </p>
                    </div>
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAdminLogin)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="admin@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Signing In...' : 'Sign in as Admin'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
