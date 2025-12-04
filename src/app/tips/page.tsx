'use client';
import React from 'react';
import { Home, Zap, Lightbulb, User, X, Link as LinkIcon, Video, FileText } from 'lucide-react';
import Link from 'next/link';

const MENTEE_TIPS = [
    { 
        id: 1, 
        type: 'Article', 
        title: '5 Steps to Maximize Your Mentorship Session', 
        summary: 'Learn how to prepare questions, set goals, and follow up effectively.',
        content: `A successful mentorship session begins long before the video call starts.
        
        **1. Define Your Goals:** Know exactly what you want to achieve. Is it a career pivot? Solving a specific technical problem? Write it down.
        
        **2. Prepare Specific Questions:** Avoid vague questions like "How do I succeed?". Instead, ask: "Given my experience with X, what skill should I prioritize learning next to reach a Staff Engineer role?"
        
        **3. Share Context:** Send your mentor relevant documents (resume, code samples, company context) at least 24 hours in advance. This maximizes the time spent in the session.
        
        **4. Take Notes:** Be an active listener and write down key takeaways. Don't rely on memory.
        
        **5. Create an Action Plan:** End the session by summarizing the key advice and outlining 3 actionable steps you will take before your next meeting.`,
        icon: FileText
    },
    { 
        id: 2, 
        type: 'YouTube', 
        title: 'System Design Interview - The Complete Guide', 
        link: 'https://www.youtube.com/watch?v=kYv9G_I4H7g', 
        summary: 'A 45-minute video covering the fundamentals of system design for interviews.',
        icon: Video
    },
    { 
        id: 3, 
        type: 'Website', 
        title: 'Interview Cake: Coding Interview Prep', 
        link: 'https://www.interviewcake.com/', 
        summary: 'A comprehensive resource for algorithm practice and detailed explanations.',
        icon: LinkIcon
    },
    { 
        id: 4, 
        type: 'Article', 
        title: 'Mastering the Art of Negotiation', 
        summary: 'Essential strategies for increasing your salary and benefits package.',
        content: `Salary negotiation is a skill that directly impacts your lifetime earnings.
        
        **Do Your Research:** Use tools like Glassdoor and Levels.fyi to determine the market rate for your role and location. Your number should be backed by data.
        
        **Wait for the Offer:** Never provide your desired salary range first. Let the company make the first move.
        
        **Express Enthusiasm (But Don't Commit):** When an offer comes, thank them, express excitement, but state that you need a few days to review the full compensation package.
        
        **Make a Counter-Offer:** Be confident and propose a number 10-20% higher than their initial offer, supported by your recent achievements and market research.`,
        icon: FileText
    },
    { 
        id: 5, 
        type: 'Website', 
        title: 'Tailwind CSS Documentation', 
        link: 'https://tailwindcss.com/docs', 
        summary: 'The official documentation for the utility-first CSS framework.',
        icon: LinkIcon
    },
];

const Header = ({ isMenuOpen, setIsMenuOpen }) => (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-primary/10">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-extrabold text-primary">Guidelab</Link>
            
            <nav className="hidden lg:flex space-x-6 items-center text-gray-600 font-medium">
                <Link href="/" className='flex items-center transition px-3 py-2 rounded-lg hover:text-primary hover:bg-gray-100'>
                    <Home className="w-5 h-5 mr-1" /> Home Page
                </Link>
                <Link href="/sessions" className='flex items-center transition px-3 py-2 rounded-lg hover:text-primary hover:bg-primary/5'>
                    <Zap className="w-5 h-5 mr-1 text-primary fill-primary/10" /> Exclusive Session
                </Link>
                <Link href="/tips" className="flex items-center transition px-3 py-2 rounded-lg text-primary bg-primary/10 font-bold border border-primary/20">
                    <Lightbulb className="w-5 h-5 mr-1" /> Tips & Resources
                </Link>
                <Link href="/account" className="px-3 py-2 text-white bg-primary hover:bg-primary/90 rounded-full transition shadow-md flex items-center">
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
                <Link href="/" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Home className="w-5 h-5 mr-2" /> Home Page</Link>
                <Link href="/sessions" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Zap className="w-5 h-5 mr-2" /> Exclusive Session</Link>
                <Link href="/tips" className="flex items-center p-2 text-gray-700 hover:bg-primary/5 rounded-lg" onClick={() => setIsMenuOpen(false)}><Lightbulb className="w-5 h-5 mr-2" /> Tips & Resources</Link>
                <Link href="/account" className="w-full mt-2 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-md flex items-center justify-center" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-5 h-5 mr-2" /> Account
                </Link>
            </div>
        )}
    </header>
);

const ArticleModal = ({ article, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] overflow-hidden transform transition-all flex flex-col">
                
                <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary" /> {article.title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto text-gray-700 leading-relaxed space-y-4">
                    <p className="font-semibold text-lg text-primary border-b pb-2 mb-4">{article.summary}</p>
                    {article.content.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 whitespace-pre-line">
                            {paragraph.split('**').map((part, pIndex) => 
                                pIndex % 2 === 1 ? <strong key={pIndex}>{part}</strong> : part
                            )}
                        </p>
                    ))}
                    <div className="pt-4 mt-6 border-t text-sm text-gray-500">
                        <p>This article is provided for your learning. Remember to apply the advice to your specific situation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function TipsPage() {
    const [selectedArticle, setSelectedArticle] = React.useState(null);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleResourceClick = (resource) => {
        if (resource.type === 'Article') {
            setSelectedArticle(resource);
        } else if (resource.link) {
            window.open(resource.link, '_blank');
        }
    };

    const getIconDetails = (type) => {
        switch (type) {
            case 'Article':
                return { Icon: FileText, color: 'text-blue-600', fill: 'bg-blue-100' };
            case 'YouTube':
                return { Icon: Video, color: 'text-red-600', fill: 'bg-red-100' };
            case 'Website':
                return { Icon: LinkIcon, color: 'text-green-600', fill: 'bg-green-100' };
            default:
                return { Icon: Lightbulb, color: 'text-gray-600', fill: 'bg-gray-100' };
        }
    };

    return (
        <div className="bg-background min-h-screen pb-10">
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 flex items-center border-b pb-3 border-primary/20">
                    <Lightbulb className="w-8 h-8 mr-3 text-primary" />
                    Mentees Tips & Essential Resources
                </h2>
                <p className="text-lg text-gray-600 mb-10">
                    Curated articles, videos, and websites to help you prepare for sessions, level up your skills, and accelerate your career growth.
                </p>

                <div className="space-y-6">
                    {MENTEE_TIPS.map((resource) => {
                        const { Icon, color, fill } = getIconDetails(resource.type);
                        
                        const CardElement = resource.type === 'Article' ? 'button' : 'div';
                        
                        return (
                            <CardElement 
                                key={resource.id} 
                                onClick={() => handleResourceClick(resource)}
                                className={`
                                    bg-white p-4 sm:p-6 rounded-xl shadow-lg border-l-8 border-primary
                                    flex items-center space-x-4 sm:space-x-6 
                                    transition duration-300 hover:shadow-xl transform hover:scale-[1.005] 
                                    cursor-pointer group w-full text-left
                                `}
                            >
                                <div className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center ${fill} border-2 border-primary/20`}>
                                    <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${color}`} />
                                </div>

                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition mb-1">
                                        {resource.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 mb-2">{resource.summary}</p>
                                    
                                    <div className="mt-2">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${resource.type === 'Article' ? 'bg-blue-500 text-white' : 'bg-primary/80 text-white'} flex items-center w-fit`}>
                                            {resource.type === 'Article' ? (
                                                <>
                                                    <FileText className="w-3 h-3 mr-1" /> Read Article (Pop-up)
                                                </>
                                            ) : (
                                                <>
                                                    <LinkIcon className="w-3 h-3 mr-1" /> View External Link
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardElement>
                        );
                    })}
                </div>
            </div>

            {selectedArticle && selectedArticle.type === 'Article' && (
                <ArticleModal 
                    article={selectedArticle}
                    onClose={() => setSelectedArticle(null)}
                />
            )}
        </div>
    );
};
