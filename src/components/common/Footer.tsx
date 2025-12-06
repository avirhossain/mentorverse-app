'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Info } from 'lucide-react';

const footerLinks = [
    { href: '/terms', text: 'Terms', icon: FileText },
    { href: '/privacy', text: 'Privacy', icon: ShieldCheck },
    { href: '/about', text: 'About', icon: Info },
];

export const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center">
                     <div className="mb-4 md:mb-0">
                        <h2 className="text-2xl font-extrabold text-white">Mentees</h2>
                        <p className="mt-1 text-gray-300">A Next.js Starter Project</p>
                    </div>
                    <ul className="flex items-center space-x-6">
                        {footerLinks.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className="flex items-center text-gray-200 hover:text-white transition">
                                     <link.icon className="w-4 h-4 mr-2" />
                                    {link.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-8 pt-8 border-t border-primary/50 text-center text-gray-300">
                    <p>&copy; {new Date().getFullYear()} Mentees. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
