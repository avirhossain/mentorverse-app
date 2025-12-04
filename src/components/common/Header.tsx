
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Zap, Lightbulb, User, Shield, LogIn, ArrowRight, X, LogOut } from 'lucide-react';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { doc, setDoc, getDoc } from 'firebase/firestore';


const LoginModal = ({ onClose }) => {
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();

    const handleLogin = async (role: 'admin' | 'user') => {
        if (!auth || !firestore) {
            console.error("Auth or Firestore service is not available.");
            return;
        }

        const email = role === 'admin' ? 'mazhar@admin.com' : 'azgar@mentee.com';
        const password = 'password123'; // Dummy password

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push(role === 'admin' ? '/admin' : '/');
            onClose();
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    
                    // Create a user document in Firestore
                    const userDocRef = doc(firestore, "users", user.uid);
                    
                    const userDocSnap = await getDoc(userDocRef);

                    if (!userDocSnap.exists()) {
                         await setDoc(userDocRef, {
                            id: user.uid,
                            email: user.email,
                            name: role === 'admin' ? 'Mazhar Admin' : 'Azgar Mentee',
                            balance: 0,
                            interests: [],
                            mentorshipGoal: '',
                            status: 'active',
                        });
                    }

                    if (role === 'admin') {
                        // Also create an admin role document
                        const adminRoleRef = doc(firestore, "roles_admin", user.uid);
                        await setDoc(adminRoleRef, { role: 'admin' });
                    }

                    router.push(role === 'admin' ? '/admin' : '/');
                    onClose();
                } catch (createError) {
                    console.error(`Error creating ${role} user:`, createError);
                }
            } else {
                console.error(`Error signing in as ${role}:`, error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all border-t-8 border-primary">
                 <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="px-8 pb-10 pt-0 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Choose Your Role</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">Select how you would like to proceed.</p>
                    <div className="space-y-4">
                        <Button
                            onClick={() => handleLogin('admin')}
                            className="w-full flex items-center justify-between p-6 text-lg font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition duration-150 shadow-lg transform hover:scale-[1.02]"
                        >
                            <Shield className="w-6 h-6" />
                            <span>Continue as Admin</span>
                            <ArrowRight className="w-6 h-6" />
                        </Button>
                        <Button
                            onClick={() => handleLogin('user')}
                            className="w-full flex items-center justify-between p-6 text-lg font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition duration-150 shadow-lg transform hover:scale-[1.02]"
                        >
                            <User className="w-6 h-6" />
                            <span>Continue as Mentee</span>
                            <ArrowRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Header = ({ currentView, showLoginModal: showLoginModalProp, setShowLoginModal: setShowLoginModalProp }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [internalShowLoginModal, setInternalShowLoginModal] = useState(false);

    const showLoginModal = showLoginModalProp !== undefined ? showLoginModalProp : internalShowLoginModal;
    const setShowLoginModal = setShowLoginModalProp !== undefined ? setShowLoginModalProp : setInternalShowLoginModal;

    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const isAdminView = currentView === 'admin';

    const handleLogout = () => {
        if(auth) {
            signOut(auth);
            setIsMenuOpen(false);
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
                <Link href={isAdminView ? "/admin" : "/"} className="text-2xl font-extrabold text-primary">Guidelab</Link>
                
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
                                    <Button onClick={handleLogout} variant="outline" size="sm">
                                        <LogOut className="w-4 h-4 mr-2" /> Logout
                                    </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setShowLoginModal(true)}>
                                        <LogIn className="w-5 h-5 mr-2" /> Login
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
                                     <Button onClick={handleLogout} className="w-full">
                                        <LogOut className="w-5 h-5 mr-2" /> Logout
                                    </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => { setShowLoginModal(true); setIsMenuOpen(false); }} className="w-full">
                                        <LogIn className="w-5 h-5 mr-2" /> Login
                                    </Button>
                                )
                            )}
                        </>
                     )}
                </div>
            )}
        </header>

        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </>
    );
};
