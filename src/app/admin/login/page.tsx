'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { grantAdminRights } from '@/ai/flows/grant-admin-rights';


export default function AdminLoginPage() {
    const router = useRouter();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isGranting, setIsGranting] = useState(false);
    const { user, isAdmin, isAuthCheckComplete, refreshToken } = useUser();


    useEffect(() => {
        if (isAuthCheckComplete && user && isAdmin) {
            router.push('/admin');
        }
    }, [isAdmin, isAuthCheckComplete, user, router]);

    const handleAdminLogin = async () => {
        if (!auth) {
            toast({
                variant: 'destructive',
                title: 'Authentication service not available.',
            });
            return;
        }
        
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, 'mmavir89@gmail.com', '123456');
            console.log('[AdminLogin] signInWithEmailAndPassword successful. Waiting for auth state change.');
            toast({
                title: 'Login Successful',
                description: 'Verifying admin status and redirecting...',
            });
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
            if (result.status === 'SUCCESS') {
                toast({ title: 'Admin Rights Granted!', description: 'Please wait a moment while we refresh your session.' });
                // Force a token refresh to get the new claim, then the useEffect will redirect.
                await refreshToken();

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
                    
                    {isAuthCheckComplete && user && (
                         <div className="space-y-4">
                            <p className="text-center text-sm">Logged in as: <br/> <span className="font-bold">{user.email}</span></p>
                            {isAdmin ? (
                                <p className="text-center font-semibold text-green-600">Admin status confirmed. Redirecting...</p>
                            ) : (
                                <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg">
                                    <p className="font-bold">Admin Access Not Detected</p>
                                    <p className="text-sm">Click the button below to grant yourself admin rights. You only need to do this once.</p>
                                </div>
                            )}
                             <Button onClick={handleLogout} variant="outline" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" /> Log Out
                            </Button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <Button onClick={handleAdminLogin} className="w-full" disabled={isLoading || (isAuthCheckComplete && !!user) }>
                            {isLoading ? 'Signing In...' : 'Sign in as Admin'}
                        </Button>

                         {user && !isAdmin && (
                            <Button onClick={handleGrantAdmin} variant="secondary" className="w-full" disabled={isGranting}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                {isGranting ? 'Granting...' : 'Grant Admin Rights'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
