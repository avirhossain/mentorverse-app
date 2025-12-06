
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { grantAdminRights } from '@/ai/flows/grant-admin-rights';
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
    const [isGranting, setIsGranting] = useState(false);
    const { user, isAdmin, isAuthCheckComplete, refreshToken } = useUser();

    const form = useForm<z.infer<typeof adminLoginSchema>>({
        resolver: zodResolver(adminLoginSchema),
        defaultValues: {
            email: 'mmavir89@gmail.com',
            password: '123456',
        },
    });


    useEffect(() => {
        // This effect now controls the redirect AFTER successful admin verification.
        if (isAuthCheckComplete && user && isAdmin) {
            console.log("[AdminLogin] useEffect detected user is admin. Redirecting to /admin");
            router.push('/admin');
        }
    }, [isAdmin, isAuthCheckComplete, user, router]);

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
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            console.log("[AdminLogin] Login successful. Forcing ID token refresh...");
            await user.getIdToken(true); 
            console.log("[AdminLogin] Token refreshed. Calling refreshToken to update UI state.");
            await refreshToken();
            
            toast({
                title: 'Login Successful',
                description: 'Redirecting to dashboard...',
            });
            
            // The useEffect will handle the redirect once the state is updated
            // Forcing a direct push as a fallback.
            router.push('/admin');

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Admin Login Failed',
                description: 'Invalid credentials. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGrantAdmin = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to grant admin rights.' });
            return;
        }
        setIsGranting(true);
        try {
            const result = await grantAdminRights();
            if (result.status === 'SUCCESS' || result.status === 'ALREADY_ADMIN') {
                toast({ title: 'Admin Rights Confirmed!', description: 'Refreshing session... You should be redirected shortly.' });
                await refreshToken(); // This is the key step to update the client state
            } else {
                 toast({ variant: 'destructive', title: 'Failed to Grant Admin', description: result.message || 'An unknown error occurred.' });
            }
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message || 'An error occurred.' });
        } finally {
            setIsGranting(false);
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
    
    // While checking, or if user is admin, show minimal UI to avoid flashes
    if (!isAuthCheckComplete || (user && isAdmin)) {
        return (
             <div className="flex flex-col min-h-screen bg-background">
                <Header currentView="admin" />
                <div className="flex-1 flex items-center justify-center">
                    <p>Verifying authentication...</p>
                </div>
            </div>
        );
    }

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
                           {user ? "Manage your session" : "Sign in to the admin dashboard."}
                        </p>
                    </div>
                    
                    {user && !isAdmin ? (
                         <div className="space-y-4">
                            <p className="text-center text-sm">Logged in as: <br/> <span className="font-bold">{user.email}</span></p>
                           
                            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg space-y-3">
                                <p className="font-bold">Admin Access Not Detected</p>
                                <p className="text-sm">Click the button below to grant yourself admin rights. You only need to do this once.</p>
                                 <Button onClick={handleGrantAdmin} variant="secondary" className="w-full" disabled={isGranting}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    {isGranting ? 'Granting...' : 'Grant Admin Rights'}
                                </Button>
                            </div>
                            
                             <Button onClick={handleLogout} variant="outline" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" /> Log Out & Try Again
                            </Button>
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}
