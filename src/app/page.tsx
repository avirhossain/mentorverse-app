'use client';
import React from 'react';
import { Header } from '@/components/common/Header';

export default function HomePage() {

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header currentView="home" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        Welcome to Your Next.js App
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        This is your starting point. Begin by editing this page.
                    </p>
                </div>
            </main>
        </div>
    );
};
