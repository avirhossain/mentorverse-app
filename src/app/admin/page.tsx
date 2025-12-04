'use client';
import Link from 'next/link';
import React from 'react';
import { Home, Zap, Lightbulb, User, FilePlus, Users as UsersIcon } from 'lucide-react';

const Header = ({ isMenuOpen, setIsMenuOpen }) => (
    <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
            <Link href="/home" className="text-2xl font-bold text-primary">Guidelab</Link>
            
            <nav className="hidden lg:flex space-x-6 items-center text-gray-600 font-medium">
                <Link href="/home" className="flex items-center hover:text-primary transition"><Home className="w-5 h-5 mr-1" /> Home Page</Link>
                <Link href="/sessions" className="flex items-center hover:text-primary transition"><Zap className="w-5 h-5 mr-1" /> Exclusive Session</Link>
                <Link href="/tips" className="flex items-center hover:text-primary transition"><Lightbulb className="w-5 h-5 mr-1" /> Tips</Link>
                <Link href="/account" className="px-3 py-1.5 text-white bg-primary hover:bg-primary/90 rounded-full transition shadow-md flex items-center">
                    <User className="w-5 h-5 mr-2" /> Account
                </Link>
            </nav>
            
            <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                </svg>
            </button>
        </div>
        
        {isMenuOpen && (
            <div className="lg:hidden absolute w-full bg-white shadow-lg border-t border-gray-100 py-4 px-4 space-y-3">
                <Link href="/home" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}><Home className="w-5 h-5 mr-2" /> Home Page</Link>
                <Link href="/sessions" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}><Zap className="w-5 h-5 mr-2" /> Exclusive Session</Link>
                <Link href="/tips" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}><Lightbulb className="w-5 h-5 mr-2" /> Tips</Link>
                <Link href="/account" className="w-full mt-2 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-md flex items-center justify-center" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-5 h-5 mr-2" /> Account
                </Link>
            </div>
        )}
    </header>
);


export default function AdminPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}/>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500">Manage Guidelab content and users.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Content Management</h2>
            <p className="text-gray-600 mb-6">
                This section is for creating and managing mentor profiles and unique sessions. The full implementation is not part of this demo.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-start gap-2 p-6 border rounded-lg bg-gray-50">
                <UsersIcon className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold">Manage Mentors</h3>
                <p className="text-sm text-gray-500">
                  Admins can create, edit, and view mentor profiles, including their expertise, availability, and session costs.
                </p>
                <button disabled className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg opacity-50 cursor-not-allowed">Create New Mentor</button>
              </div>
              <div className="flex flex-col items-start gap-2 p-6 border rounded-lg bg-gray-50">
                <FilePlus className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold">Manage Sessions</h3>
                <p className="text-sm text-gray-500">
                  Admins can create unique, bookable sessions offered by mentors, complete with descriptions and pricing.
                </p>
                <button disabled className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg opacity-50 cursor-not-allowed">Create New Session</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
