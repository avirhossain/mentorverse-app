
'use client';

import React from 'react';
import { Header } from '@/components/common/Header';
import { Target, Eye, Feather } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, children }) => (
    <div className="bg-primary/5 dark:bg-gray-800/50 p-6 rounded-lg text-center transform transition duration-300 hover:scale-105">
        <div className="inline-block p-4 bg-primary text-white rounded-full mb-4">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{children}</p>
    </div>
);

export default function AboutUsPage() {
    return (
        <div className="bg-background dark:bg-gray-900 min-h-screen">
            <Header />
            <main className="max-w-4xl mx-auto p-4 sm:p-8">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">About Mentees</h1>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">Empowering the Next Generation of Leaders and Innovators.</p>
                </header>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-xl shadow-xl border-t-4 border-primary mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Our Mission & Vision</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <FeatureCard icon={Target} title="Our Mission">
                            To bridge the gap between ambition and achievement by providing accessible, high-quality mentorship to every young mind eager to learn and grow.
                        </FeatureCard>
                        <FeatureCard icon={Eye} title="Our Vision">
                            To cultivate a global community where knowledge is shared freely, potential is nurtured tirelessly, and the leaders of tomorrow are built today.
                        </FeatureCard>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-xl shadow-xl border-t-4 border-accent">
                     <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center flex items-center justify-center">
                        <Feather className="w-8 h-8 mr-3 text-accent" />
                        A Message from Our Founder
                    </h2>
                    <div className="text-center mb-6">
                        <img 
                            src="https://placehold.co/150x150/7c3aed/ffffff?text=MH" 
                            alt="Md. Mazharul Hossain"
                            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-accent shadow-lg"
                        />
                        <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Md. Mazharul Hossain</h3>
                        <p className="text-md text-gray-500 dark:text-gray-400">Founder & CEO, Mentees</p>
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-full text-gray-700 dark:text-gray-300 space-y-4 text-justify">
                        <p>
                            "To the young minds of today, the architects of tomorrow: Your journey is filled with boundless potential. You stand at a unique intersection of unprecedented challenges and unparalleled opportunities. The path ahead may seem daunting, but it is your curiosity, your passion, and your resilience that will forge the future.
                        </p>
                        <p>
                            We built Mentees on a simple, powerful belief: that guidance is the spark that ignites greatness. No successful journey is walked alone. Behind every great innovator, leader, and artist is a network of mentors who offered a word of advice, a helping hand, or a new perspective. Our mission is to make that transformative power of mentorship accessible to you, right now.
                        </p>
                        <p>
                            Never underestimate the power of a question. Never hesitate to seek guidance. Embrace your ambitions, learn from those who have walked the path before you, and have the courage to build the future you envision. Your journey starts today, and we are here to walk it with you."
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
