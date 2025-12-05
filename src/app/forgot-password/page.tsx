'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

export default function ForgotPasswordPage() {
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const handlePasswordReset = async (values: z.infer<typeof forgotPasswordSchema>) => {
        if (!auth) return;
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, values.email);
            setIsSubmitted(true);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl border-t-4 border-primary">
                    {isSubmitted ? (
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900">
                                Reset Link Sent
                            </h1>
                            <p className="mt-2 text-gray-600">
                                If an account exists for that email, a password reset link has been sent. Please check your inbox.
                            </p>
                             <Button asChild className="w-full mt-6">
                                <Link href="/login">Return to Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <h1 className="text-3xl font-extrabold text-gray-900">
                                    Forgot Password
                                </h1>
                                <p className="mt-2 text-gray-500">
                                    Enter your email to receive a reset link.
                                </p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                                    </Button>
                                </form>
                            </Form>
                            
                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Remembered your password?{' '}
                                    <Link href="/login" className="font-medium text-primary hover:underline">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
