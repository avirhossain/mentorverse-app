'use client';
import { useUser, useAuth } from '@/firebase';
import React, { useState, useEffect } from 'react';
import { IdTokenResult } from 'firebase/auth';

export const DebugConsole = () => {
    const { user, isUserLoading, isAuthCheckComplete } = useUser();
    const auth = useAuth();
    const [tokenResult, setTokenResult] = useState<IdTokenResult | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            if (auth?.currentUser) {
                try {
                    const idTokenResult = await auth.currentUser.getIdTokenResult(true);
                    setTokenResult(idTokenResult);
                } catch (error) {
                    console.error("Error fetching token:", error);
                    setTokenResult(null);
                }
            } else {
                setTokenResult(null);
            }
        };

        fetchToken();
    }, [user, auth]);

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-0 right-0 bg-gray-800 text-white p-4 rounded-tl-lg shadow-lg max-w-md w-full text-xs z-50">
            <h3 className="font-bold text-sm mb-2 border-b border-gray-600 pb-1">Debug Console</h3>
            <div className="space-y-1">
                <p><span className="font-semibold">User:</span> {user ? user.email : 'Not logged in'}</p>
                <p><span className="font-semibold">Loading:</span> {isUserLoading.toString()}</p>
                <p><span className="font-semibold">Auth Check Complete:</span> {isAuthCheckComplete.toString()}</p>
                
                {tokenResult && (
                    <div className="mt-2 pt-2 border-t border-gray-600">
                        <p className="font-bold">Token Claims:</p>
                        <pre className="bg-gray-700 p-2 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(tokenResult.claims, null, 2)}
                        </pre>
                        <p className="mt-1"><span className="font-semibold">Is Admin Claim Present:</span> {tokenResult.claims.admin ? 'true' : 'false'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
