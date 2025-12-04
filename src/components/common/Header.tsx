'use client';
import React from 'react';
import Link from 'next/link';
import { Home, Zap, Lightbulb, User, Shield } from 'lucide-react';

export const Header = ({ isMenuOpen, setIsMenuOpen, currentView, setCurrentView }) => (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-primary/10">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
            <Link href="/home" className="text-2xl font-extrabold text-primary">Guidelab</Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2 items-center text-gray-600 font-medium">
                <Link 
                    href="/home"
                    className={`flex items-center transition px-3 py-2 rounded-lg ${currentView === 'home' ? 'text-primary bg-primary/10 font-bold' : 'hover:text-primary hover:bg-gray-100'}`}
                >
                    <Home className="w-5 h-5 mr-1" /> Home
                </Link>
                <Link 
                    href="/sessions"
                    className={`flex items-center transition px-3 py-2 rounded-lg ${currentView === 'exclusive' ? 'text-primary bg-primary/10 font-bold' : 'hover:text-primary hover:bg-primary/5'}`}
                >
                    <Zap className="w-5 h-5 mr-1 text-primary fill-primary/10" /> Sessions
                </Link>
                <Link 
                    href="/tips"
                    className={`flex items-center transition px-3 py-2 rounded-lg ${currentView === 'tips' ? 'text-primary bg-primary/10 font-bold' : 'hover:text-primary hover:bg-gray-100'}`}
                >
                    <Lightbulb className="w-5 h-5 mr-1" /> Tips
                </Link>
                 <Link href="/admin" className={`flex items-center transition px-3 py-2 rounded-lg ${currentView === 'admin' ? 'text-primary bg-primary/10 font-bold' : 'hover:text-primary hover:bg-gray-100'}`}>
                    <Shield className="w-5 h-5 mr-1" />Admin
                </Link>
                <Link href="/account" className="px-3 py-2 text-white bg-primary hover:bg-primary/90 rounded-full transition shadow-md flex items-center">
                    <User className="w-5 h-5 mr-2" /> Account
                </Link>
            </nav>
            
            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                </svg>
            </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
            <div className="lg:hidden absolute w-full bg-white shadow-lg border-t border-gray-100 py-4 px-4 space-y-3">
                <Link href="/home" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Home className="w-5 h-5 mr-2" /> Home</Link>
                <Link href="/sessions" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Zap className="w-5 h-5 mr-2" /> Exclusive Sessions</Link>
                <Link href="/tips" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Lightbulb className="w-5 h-5 mr-2" /> Tips & Resources</Link>
                <Link href="/admin" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Shield className="w-5 h-5 mr-2" />Admin</Link>
                <Link href="/account" className="w-full mt-2 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-md flex items-center justify-center" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-5 h-5 mr-2" /> Account
                </Link>
            </div>
        )}
    </header>
);
