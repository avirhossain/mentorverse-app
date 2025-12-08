'use client';

import React from 'react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
