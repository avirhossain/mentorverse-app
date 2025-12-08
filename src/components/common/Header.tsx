'use client';
import React from 'react';
import Link from 'next/link';

export const Header = () => {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-extrabold text-primary">
                    MyApp
                </Link>
            </div>
        </header>
    );
};
