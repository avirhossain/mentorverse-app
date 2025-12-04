'use client';
import React from 'react';
import { Home, Zap, Lightbulb, User, Star, CheckCircle, Briefcase, GraduationCap, Clock, Calendar, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

// --- Consolidated Mock Data for Details Page ---

const MENTOR_DETAILS = {
    id: 1,
    name: "Jasmine Chen",
    title: "Staff Software Engineer",
    company: "Google",
    intro: "A dedicated Staff Software Engineer at Google with over 10 years of experience in building scalable, high-performance web applications using React and modern system architecture. I specialize in career growth, interview preparation, and navigating the transition to senior engineering roles. Let's map your success story.",
    skills: ["React", "System Design", "Career Growth", "GoLang", "Microservices"],
    rating: 5.0,
    ratingsCount: 89,
    avatar: "https://placehold.co/150x150/4F46E5/FFFFFF?text=JC",
    professionalExperience: [
        { title: "Staff Software Engineer", company: "Google", duration: "2020 - Present", description: "Led a team of 5 engineers in redesigning the core user authentication flow, resulting in a 15% latency reduction and 99.99% uptime." },
        { title: "Senior Software Engineer", company: "Spotify", duration: "2016 - 2020", description: "Developed features for the desktop application, improving user engagement metrics by 20% over two years." },
    ],
    education: [
        { degree: "M.S. Computer Science", institution: "Stanford University", duration: "2014 - 2016" },
        { degree: "B.S. Electrical Engineering", institution: "MIT", duration: "2010 - 2014" },
    ],
    sessions: [
        { id: 'qna', name: "30 min General Q&A", price: 300, currency: "৳", duration: 30, description: "Quick advice, roadmap checks, or simple technical questions." },
        { id: 'interview', name: "60 min Interview Prep (Technical)", price: 1000, currency: "৳", duration: 60, description: "Focused mock interviews, system design walkthroughs, and detailed feedback." },
    ],
    availability: [
        { date: "18th November", time: "7:00 PM - 8:00 PM", id: 1 },
        { date: "19th November", time: "10:00 AM - 11:00 AM", id: 2 },
        { date: "20th November", time: "4:00 PM - 5:00 PM", id: 3 },
    ],
    reviews: [
        { mentee: "Rohan K.", date: "Nov 1, 2025", rating: 5, text: "Jasmine's system design breakdown was crystal clear. Highly recommend for FAANG interview prep!" },
        { mentee: "Lina M.", date: "Oct 25, 2025", rating: 5, text: "Extremely valuable career advice. She helped me negotiate a 15% higher salary." },
        { mentee: "Sam D.", date: "Oct 15, 2025", rating: 4, text: "Great session, though I wish we had more time to cover my resume fully." },
    ]
};

// --- Helper Components ---

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

const ExperienceItem = ({ item }) => (
    <div className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
        <h4 className="text-base font-semibold text-gray-800">{item.title} at {item.company}</h4>
        <p className="text-sm text-primary font-medium mb-1">{item.duration}</p>
        <p className="text-sm text-gray-600">{item.description}</p>
    </div>
);

const EducationItem = ({ item }) => (
    <div className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
        <h4 className="text-base font-semibold text-gray-800">{item.degree}</h4>
        <p className="text-sm text-gray-600">{item.institution}</p>
        <p className="text-xs text-primary/80 font-medium">{item.duration}</p>
    </div>
);

const ReviewCard = ({ review }) => (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" />
                <span className="font-bold text-sm text-gray-800">{review.rating}.0</span>
            </div>
            <p className="text-xs text-gray-500">{review.date}</p>
        </div>
        <p className="text-sm text-gray-700 mb-2 italic">"{review.text}"</p>
        <p className="text-xs font-semibold text-primary">— {review.mentee}</p>
    </div>
);

const CheckoutModal = ({ session, timeSlot, mentor, onClose }) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [showThankYou, setShowThankYou] = React.useState(false);

    const startTimeFull = timeSlot.time.split(' - ')[0];
    const displayTime = startTimeFull.replace(':00', '').trim();

    const handlePayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setShowThankYou(true); 
        }, 300); 
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                
                <div className="p-4 flex justify-end">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-6 pb-6 pt-0">
                    {showThankYou ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                            <p className="text-gray-600">
                                Thank you for booking your session with **{mentor.name}**. 
                                A confirmation email and calendar invite have been sent to you.
                            </p>
                            <button 
                                onClick={onClose} 
                                className="mt-6 w-full py-2 font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition"
                            >
                                Finish
                            </button>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Confirm Your Booking</h3>

                            <div className="border border-primary/20 rounded-lg p-4 bg-primary/10 mb-6 space-y-2">
                                <p className="flex justify-between text-gray-700">
                                    <span className="font-medium">Mentor:</span>
                                    <span className="font-semibold">{mentor.name}</span>
                                </p>
                                <p className="flex justify-between text-gray-700">
                                    <span className="font-medium">Session:</span>
                                    <span className="font-semibold text-primary">{session.name}</span>
                                </p>
                                <p className="flex justify-between text-gray-700">
                                    <span className="font-medium">Time Slot:</span>
                                    <span className="font-semibold">{timeSlot.date} @ {displayTime}</span>
                                </p>
                                <div className="pt-2 border-t mt-2 flex justify-between items-center text-lg font-bold">
                                    <span>Total Due:</span>
                                    <span className="text-green-600">{session.price} {session.currency}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handlePayment} 
                                className="w-full py-3 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-md flex items-center justify-center disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : `Pay Now ${session.price} ${session.currency}`}
                            </button>
                            <button 
                                onClick={onClose} 
                                className="w-full mt-2 py-2 text-gray-600 hover:text-gray-900 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MentorDetailsPage = ({ mentor }) => {
    const [selectedSession, setSelectedSession] = React.useState(mentor.sessions[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState(mentor.availability[0]);
    const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);

    const handleConfirmPayment = () => {
        if (!selectedSession || !selectedTimeSlot) {
            console.error("Please select both a session and an availability slot.");
            return;
        }
        setShowCheckoutModal(true);
    };

    return (
        <div className="bg-background min-h-screen pb-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
                
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8 flex flex-col items-center border-t-4 border-primary">
                    
                    <img 
                        src={mentor.avatar} 
                        alt={mentor.name} 
                        className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover ring-4 ring-primary/20 mb-6"
                    />
                    
                    <div className="flex-grow text-center">
                        <div className="flex items-center justify-center mb-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mr-3">{mentor.name}</h1>
                            <CheckCircle className="w-5 h-5 text-green-500 fill-green-100" />
                        </div>
                        <h2 className="text-lg sm:text-xl text-primary font-medium mb-2">{mentor.title} at {mentor.company}</h2>
                        
                        <div className="flex items-center justify-center text-base font-medium text-yellow-500 mb-4">
                            <Star className="w-5 h-5 mr-1 fill-current" />
                            <span className="text-gray-800 font-bold mr-2">{mentor.rating}</span>
                            <span className="text-gray-500">({mentor.ratingsCount} ratings)</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                            {mentor.skills.map(skill => (
                                <span key={skill} className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><MessageSquare className="w-6 h-6 mr-2 text-primary" /> Mentor Introduction</h3>
                        <p className="text-gray-700 leading-relaxed">{mentor.intro}</p>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center"><Briefcase className="w-6 h-6 mr-2 text-primary" /> Professional Experience</h3>
                        {mentor.professionalExperience.map((item, index) => (
                            <ExperienceItem key={index} item={item} />
                        ))}
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center"><GraduationCap className="w-6 h-6 mr-2 text-primary" /> Education</h3>
                        {mentor.education.map((item, index) => (
                            <EducationItem key={index} item={item} />
                        ))}
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-t-4 border-green-500">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><Zap className="w-6 h-6 mr-2 text-green-600" /> Book Your Session</h3>
                        
                        <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center"><Clock className="w-4 h-4 mr-2 text-primary" /> Select Session Tier</h4>
                        <div className="space-y-3 mb-6">
                            {mentor.sessions.map((session) => (
                                <label 
                                    key={session.id}
                                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition ${selectedSession.id === session.id 
                                        ? 'border-primary bg-primary/10 ring-2 ring-primary' 
                                        : 'border-gray-200 hover:border-primary/50'}`}
                                    onClick={() => setSelectedSession(session)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-800 text-base">{session.name}</span>
                                        <span className="text-xl font-extrabold text-primary">
                                            {session.price}<span className="text-sm font-normal"> {session.currency}</span>
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">{session.description}</p>
                                </label>
                            ))}
                        </div>

                        <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" /> Choose Available Time</h4>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {mentor.availability.map((slot) => {
                                const startTimeFull = slot.time.split(' - ')[0];
                                const startTime = startTimeFull.replace(':00', '').trim();

                                return (
                                    <button
                                        key={slot.id}
                                        className={`py-2 px-4 border rounded-full text-sm font-medium transition ${selectedTimeSlot.id === slot.id
                                            ? 'bg-primary text-white border-primary shadow-md'
                                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary/10 hover:border-primary/40'}`}
                                        onClick={() => setSelectedTimeSlot(slot)}
                                    >
                                        {slot.date} {startTime}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={handleConfirmPayment}
                            className="w-full py-3 text-lg font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-xl transform hover:scale-[1.01]"
                            disabled={!selectedSession || !selectedTimeSlot}
                        >
                            Confirm Payment ({selectedSession.price} {selectedSession.currency})
                        </button>
                    </div>


                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center"><Star className="w-6 h-6 mr-2 text-primary fill-primary/10" /> Mentees Reviews ({mentor.reviews.length})</h3>
                        <div className="space-y-4">
                            {mentor.reviews.map((review, index) => (
                                <ReviewCard key={index} review={review} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
            
            {showCheckoutModal && selectedSession && selectedTimeSlot && (
                <CheckoutModal
                    session={selectedSession}
                    timeSlot={selectedTimeSlot}
                    mentor={mentor}
                    onClose={() => setShowCheckoutModal(false)}
                />
            )}
        </div>
    );
};

export default function MentorPage() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const mentor = MENTOR_DETAILS; 

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <main>
                <MentorDetailsPage mentor={mentor} />
            </main>
        </div>
    );
};
