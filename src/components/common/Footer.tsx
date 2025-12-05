
'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Users, Info, Phone } from 'lucide-react';

const footerLinks = [
    { href: '/terms', text: 'Terms and Conditions', icon: FileText },
    { href: '/privacy', text: 'Privacy Policy', icon: ShieldCheck },
    { href: '/support', text: 'Support', icon: Phone },
    { href: '/become-a-mentor', text: 'Want to be a Mentor', icon: Users },
    { href: '/about', text: 'About Us', icon: Info },
];

export const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    <div className="col-span-2 lg:col-span-2">
                        <h2 className="text-2xl font-extrabold text-white">Mentees</h2>
                        <p className="mt-2 text-gray-300">Your journey to mastery starts here.</p>
                    </div>

                    <div className="col-span-2 lg:col-span-3">
                         <h3 className="text-lg font-semibold text-gray-200 mb-4">Quick Links</h3>
                        <div className="grid grid-cols-2 gap-4">
                           
                            <ul className="space-y-3">
                                {footerLinks.slice(0, 3).map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="flex items-center text-gray-200 hover:text-white transition">
                                             <link.icon className="w-4 h-4 mr-2" />
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-3">
                                {footerLinks.slice(3).map(link => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="flex items-center text-gray-200 hover:text-white transition">
                                            <link.icon className="w-4 h-4 mr-2" />
                                            {link.text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-primary/50 text-center text-gray-300">
                    <p>&copy; {new Date().getFullYear()} Mentees. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
