
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, useAdminUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { X, Terminal } from 'lucide-react';
import { getIdTokenResult } from 'firebase/auth';

/**
 * A floating debug console to display real-time auth state and token claims.
 * Toggle visibility with Ctrl+D.
 */
export const DebugConsole = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [tokenClaims, setTokenClaims] = useState<any>(null);
    const userState = useUser();
    const adminState = useAdminUser();
    const auth = useAuth();
    const pathname = usePathname();

    const isAdminView = pathname.startsWith('/admin');

    useEffect(() => {
        setIsMounted(true);
        const savedVisibility = localStorage.getItem('debugConsoleVisible');
        setIsVisible(savedVisibility === null ? true : JSON.parse(savedVisibility));

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                setIsVisible(prev => {
                    const newVisibility = !prev;
                    localStorage.setItem('debugConsoleVisible', JSON.stringify(newVisibility));
                    return newVisibility;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const fetchClaims = async () => {
            if (auth?.currentUser) {
                try {
                    const idTokenResult = await getIdTokenResult(auth.currentUser, true); // Force refresh
                    setTokenClaims(idTokenResult.claims);
                } catch (error) {
                    setTokenClaims({ error: 'Failed to fetch token claims.', details: error.message });
                }
            } else {
                setTokenClaims(null);
            }
        };

        // Fetch claims when the user state changes or the component mounts
        fetchClaims();
        
        // Also refetch every 30 seconds
        const interval = setInterval(fetchClaims, 30000);
        return () => clearInterval(interval);

    }, [auth, userState.user]);


    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('debugConsoleVisible', 'false');
    };

    if (!isMounted || !isVisible) {
        return null;
    }

    const formatState = (state: any) => {
        return JSON.stringify(state, null, 2);
    };
    
    return (
        <div className="fixed bottom-4 right-4 z-[200] bg-gray-900 text-white rounded-lg shadow-2xl border-2 border-primary/50 w-full max-w-sm font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-primary/30">
                <h3 className="font-bold flex items-center">
                    <Terminal className="w-4 h-4 mr-2" />
                    Debug Console
                </h3>
                <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white p-1 h-auto">
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
                {isAdminView ? (
                     <div>
                        <p className="font-bold text-cyan-400 mb-1">useAdminUser() [Admin Context]:</p>
                        <pre className="bg-black/30 p-2 rounded-md whitespace-pre-wrap">{formatState(adminState)}</pre>
                    </div>
                ) : (
                    <>
                        <div>
                            <p className="font-bold text-green-400 mb-1">useUser():</p>
                            <pre className="bg-black/30 p-2 rounded-md whitespace-pre-wrap">{formatState(userState)}</pre>
                        </div>
                    </>
                )}
                 <div className="mt-4">
                    <p className="font-bold text-yellow-400 mb-1">ID Token Claims (Refreshed):</p>
                    <pre className="bg-black/30 p-2 rounded-md whitespace-pre-wrap">{formatState(tokenClaims)}</pre>
                </div>
            </div>
             <div className="p-2 bg-gray-800/50 text-center text-gray-400 border-t border-primary/30">
                Toggle with <span className="font-bold text-primary/80">Ctrl + D</span>
            </div>
        </div>
    );
};
