
'use client';
import React from 'react';
import { Home, Zap, Lightbulb, User, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';

// --- Mock Data ---

const MENTOR_DATA = [
    {
        id: 1,
        name: "Jasmine Chen",
        title: "Staff Software Engineer",
        company: "Google",
        skills: ["React", "System Design", "Career Growth"],
        rating: 5.0,
        ratingsCount: 89,
        avatar: "https://placehold.co/100x100/4F46E5/FFFFFF?text=JC",
    },
    {
        id: 2,
        name: "Marcus Bell",
        title: "Senior Product Designer",
        company: "Meta",
        skills: ["UX/UI", "Design Strategy", "Figma"],
        rating: 4.9,
        ratingsCount: 152,
        avatar: "https://placehold.co/100x100/10B981/FFFFFF?text=MB",
    },
    {
        id: 3,
        name: "Anya Sharma",
        title: "AI/ML Scientist",
        company: "Amazon",
        skills: ["Machine Learning", "Python", "Data Science"],
        rating: 5.0,
        ratingsCount: 41,
        avatar: "https://placehold.co/100x100/EF4444/FFFFFF?text=AS",
    },
    {
        id: 4,
        name: "David Smith",
        title: "Leadership Coach",
        company: "Ex-Netflix",
        skills: ["Executive Coaching", "Team Management", "Startups"],
        rating: 4.8,
        ratingsCount: 205,
        avatar: "https://placehold.co/100x100/F59E0B/FFFFFF?text=DS",
    },
];

// --- Components ---

const Header = ({ isMenuOpen, setIsMenuOpen }) => (
    <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">Guidelab</Link>
            
            <nav className="hidden lg:flex space-x-6 items-center text-gray-600 font-medium">
                <Link href="/" className="flex items-center hover:text-primary transition"><Home className="w-5 h-5 mr-1" /> Home Page</Link>
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
                <Link href="/" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}><Home className="w-5 h-5 mr-2" /> Home Page</Link>
                <Link href="/sessions" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}><Zap className="w-5 h-5 mr-2" /> Exclusive Session</Link>
                <Link href="/tips" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsMenuOpen(false)}><Lightbulb className="w-5 h-5 mr-2" /> Tips</Link>
                <Link href="/account" className="w-full mt-2 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-md flex items-center justify-center" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-5 h-5 mr-2" /> Account
                </Link>
            </div>
        )}
    </header>
);

const MentorCard = ({ mentor }) => (
    <Link href={`/mentors/${mentor.id}`} className="group block h-full">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-5 sm:p-6 flex flex-col items-start border border-gray-100 h-full">
            <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                <img className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-violet-100" src={mentor.avatar} alt={mentor.name} />
                <div>
                    <div className="flex items-center">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mr-2">{mentor.name}</h3>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 fill-green-100" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">{mentor.title} at {mentor.company}</p>
                    <p className="text-xs text-gray-600 italic">"10 years leading teams and coaching top talent."</p>
                </div>
            </div>
            <div className="flex items-center text-sm font-medium text-yellow-500 mb-3">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span className="text-gray-800 font-bold mr-1">{mentor.rating}</span>
                <span className="text-gray-500">({mentor.ratingsCount} ratings)</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
                {mentor.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    </Link>
);


export default function HomePage() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 sm:mb-10">
                    Find Your Guide
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {MENTOR_DATA.map((mentor) => (
                        <MentorCard key={mentor.id} mentor={mentor} />
                    ))}
                </div>
            </main>
        </div>
    );
};
