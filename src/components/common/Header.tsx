
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Lightbulb, User, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';

export const Header = ({ currentView }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            user.getIdTokenResult().then(idTokenResult => {
                const isAdminClaim = !!idTokenResult.claims.admin;
                setIsAdmin(isAdminClaim);
            });
        } else {
            setIsAdmin(false);
        }
    }, [user]);

    const isAdminView = currentView === 'admin';

    const handleLogout = () => {
        if(auth) {
            signOut(auth).then(() => {
                setIsMenuOpen(false);
                router.push('/');
            });
        }
    };

    const NavLink = ({ href, view, icon: Icon, text }) => (
        <Link 
            href={href}
            className={`flex items-center transition px-3 py-2 rounded-lg ${currentView === view ? 'text-primary bg-primary/10 font-bold' : 'hover:text-primary hover:bg-gray-100'}`}
        >
            <Icon className="w-5 h-5 mr-1" /> {text}
        </Link>
    );

    return (
    <>
        <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-primary/10">
            <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
                <Link href={isAdmin ? "/admin" : "/"} className="text-2xl font-extrabold text-primary">Guidelab</Link>
                
                <nav className="hidden lg:flex space-x-2 items-center text-gray-600 font-medium">
                    {isAdminView ? (
                         <Button onClick={handleLogout} variant="outline">
                            <LogOut className="w-5 h-5 mr-2" /> Logout
                        </Button>
                    ) : (
                        <>
                            <NavLink href="/" view="home" icon={Home} text="Home" />
                            <NavLink href="/tips" view="tips" icon={Lightbulb} text="Tips" />

                            {!isUserLoading && (
                                user ? (
                                    <>
                                    <Link href="/account" className={`flex items-center transition px-3 py-2 rounded-lg ${currentView === 'account' ? 'text-primary bg-primary/10 font-bold' : 'hover:text-primary hover:bg-gray-100'}`}>
                                        <User className="w-5 h-5 mr-1" /> Account
                                    </Link>
                                    {isAdmin && (
                                         <Link href="/admin" className={`flex items-center transition px-3 py-2 rounded-lg ${currentView === 'admin' ? 'text-primary bg-primary/10 font-bold' : 'hover:text-primary hover:bg-gray-100'}`}>
                                            <Shield className="w-5 h-5 mr-1" /> Admin
                                        </Link>
                                    )}
                                    </>
                                ) : (
                                    <Button asChild>
                                        <Link href="/login">
                                            <LogIn className="w-5 h-5 mr-2" /> Login
                                        </Link>
                                    </Button>
                                )
                            )}
                        </>
                    )}
                </nav>
                
                <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                    </svg>
                </button>
            </div>
            
            {isMenuOpen && (
                <div className="lg:hidden absolute w-full bg-white shadow-lg border-t border-gray-100 py-4 px-4 space-y-3">
                     {isAdminView ? (
                         <Button onClick={handleLogout} className="w-full">
                            <LogOut className="w-5 h-5 mr-2" /> Logout
                        </Button>
                     ) : (
                        <>
                            <Link href="/" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Home className="w-5 h-5 mr-2" /> Home</Link>
                            <Link href="/tips" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Lightbulb className="w-5 h-5 mr-2" /> Tips & Resources</Link>
                            
                            {!isUserLoading && (
                                user ? (
                                    <>
                                    <Link href="/account" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                        <User className="w-5 h-5 mr-2" /> Account
                                    </Link>
                                    {isAdmin && (
                                         <Link href="/admin" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                            <Shield className="w-5 h-5 mr-2" /> Admin
                                        </Link>
                                    )}
                                     <Button onClick={handleLogout} className="w-full">
                                        <LogOut className="w-5 h-5 mr-2" /> Logout
                                    </Button>
                                    </>
                                ) : (
                                    <Button asChild className="w-full">
                                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                            <LogIn className="w-5 h-5 mr-2" /> Login
                                        </Link>
                                    </Button>
                                )
                            )}
                        </>
                     )}
                </div>
            )}
        </header>
    </>
    );
};
