
'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useAdminUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { X, Terminal } from 'lucide-react';

/**
 * A floating debug console to display real-time auth state.
 * Toggle visibility with Ctrl+D.
 */
export const DebugConsole = () => {
    const [isVisible, setIsVisible] = useState(true);
    const userState = useUser();
    const adminState = useAdminUser();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                setIsVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    const formatState = (state: any) => {
        const { user, ...rest } = state;
        const userDisplay = user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null;
        return JSON.stringify({ user: userDisplay, ...rest }, null, 2);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[200] bg-gray-900 text-white rounded-lg shadow-2xl border-2 border-primary/50 w-full max-w-sm font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-primary/30">
                <h3 className="font-bold flex items-center">
                    <Terminal className="w-4 h-4 mr-2" />
                    Debug Console
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white p-1 h-auto">
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
                <div>
                    <p className="font-bold text-green-400 mb-1">useUser():</p>
                    <pre className="bg-black/30 p-2 rounded-md whitespace-pre-wrap">{formatState(userState)}</pre>
                </div>
                <div className="mt-4">
                    <p className="font-bold text-cyan-400 mb-1">useAdminUser():</p>
                    <pre className="bg-black/30 p-2 rounded-md whitespace-pre-wrap">{formatState(adminState)}</pre>
                </div>
            </div>
             <div className="p-2 bg-gray-800/50 text-center text-gray-400 border-t border-primary/30">
                Toggle with <span className="font-bold text-primary/80">Ctrl + D</span>
            </div>
        </div>
    );
};
