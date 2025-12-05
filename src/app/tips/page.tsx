
'use client';
import React from 'react';
import { Lightbulb, X, Link as LinkIcon, Video, FileText } from 'lucide-react';
import { Header } from '@/components/common/Header';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Tip } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


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

const TipCardSkeleton = () => (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-l-8 border-gray-200 flex items-center space-x-4 sm:space-x-6">
        <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0" />
        <div className="flex-grow space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-32 rounded-full mt-2" />
        </div>
    </div>
);


export default function TipsPage() {
    const [selectedArticle, setSelectedArticle] = React.useState(null);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const firestore = useFirestore();
    const { isAuthCheckComplete } = useUser();

    const tipsQuery = useMemoFirebase(() => {
        if (!firestore || !isAuthCheckComplete) return null;
        return query(collection(firestore, 'tips'), orderBy('title'));
    }, [firestore, isAuthCheckComplete]);

    const { data: tips, isLoading } = useCollection<Tip>(tipsQuery);


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
            <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} currentView="tips"/>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 flex items-center border-b pb-3 border-primary/20">
                    <Lightbulb className="w-8 h-8 mr-3 text-primary" />
                    Mentees Tips & Essential Resources
                </h2>
                <p className="text-lg text-gray-600 mb-10">
                    Curated articles, videos, and websites to help you prepare for sessions, level up your skills, and accelerate your career growth.
                </p>

                <div className="space-y-6">
                    {isLoading || !isAuthCheckComplete ? (
                        Array.from({length: 4}).map((_, i) => <TipCardSkeleton key={i} />)
                    ) : (
                        tips?.map((resource) => {
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
                        })
                    )}
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
