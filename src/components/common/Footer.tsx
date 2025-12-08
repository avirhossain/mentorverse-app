'use client';

import React from 'react';

export const Footer = () => {
    return (
        <footer className="bg-gray-100 border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} MentorVerse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
