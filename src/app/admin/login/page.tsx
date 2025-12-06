
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function AdminLoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { user, isAdmin, isAuthCheckComplete } = useUser();

    const form = useForm<z.infer<typeof adminLoginSchema>>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        // If an admin is already logged in, redirect them to the dashboard.
        if (isAuthCheckComplete && isAdmin) {
            router.push('/admin');
        }
    }, [isAdmin, isAuthCheckComplete, router]);

    const handleAdminLogin = async (values: z.infer<typeof adminLoginSchema>) => {
        if (!auth) {
            toast({
                variant: 'destructive',
                title: 'Authentication service not available.',
            });
            return;
        }
        
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, values.email, values.password);
            // On successful sign-in, the useUser hook and useEffect will handle the redirection.
            toast({
                title: 'Login Successful',
                description: 'Verifying admin status and redirecting...',
            });
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Admin Login Failed',
                description: 'Invalid credentials or you do not have admin access.',
            });
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

                    {isAuthCheckComplete && user && !isAdmin && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md space-y-3">
                            <p className="font-bold">You are signed in as {user.email}, but do not have admin privileges.</p>
                            <Button onClick={handleLogout} className="w-full">
                                <LogOut className="mr-2 h-4 w-4" /> Log Out and Try Again
                            </Button>
                        </div>
                    )}
                    
                    {user && (
                         <Button onClick={handleLogout} variant="outline" className="w-full">
                            <LogOut className="mr-2 h-4 w-4" /> Log Out from {user.email}
                        </Button>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAdminLogin)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Admin Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@example.com" {...field} />
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
                            <Button type="submit" className="w-full" disabled={isLoading || (isAuthCheckComplete && !!user && isAdmin)}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
