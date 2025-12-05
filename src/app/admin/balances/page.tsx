
'use client';
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { useFirestore } from '@/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Mentee, BalanceTransaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Wallet, GitCommit, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DataListView = ({ title, data, isLoading, icon: Icon, renderItem, emptyMessage = "No data available." }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Icon className="w-6 h-6 mr-3 text-primary" />
            {title}
        </h2>
        {isLoading ? (
             <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-t-4 border-primary/50 space-y-3">
                {data && data.length > 0 ? (
                    data.map((item, index) => renderItem(item, index))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">{emptyMessage}</p>
                )}
            </div>
        )}
    </div>
);

const getSourceIcon = (source) => {
    switch (source) {
        case 'coupon':
            return { Icon: FileText, color: 'text-green-600' };
        case 'bkash':
            return { Icon: Wallet, color: 'text-pink-600' };
        case 'session_payment':
            return { Icon: GitCommit, color: 'text-red-600' };
        default:
            return { Icon: GitCommit, color: 'text-gray-500' };
    }
};

export default function BalancesPage() {
    const [mentees, setMentees] = useState<Mentee[]>([]);
    const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
    const [isLoadingMentees, setIsLoadingMentees] = useState(true);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        if (!firestore) return;

        const fetchMentees = async () => {
            setIsLoadingMentees(true);
            try {
                const menteesSnap = await getDocs(query(collection(firestore, 'users'), orderBy('name')));
                setMentees(menteesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentee)));
            } catch (error) {
                console.error("Error fetching mentees:", error);
            } finally {
                setIsLoadingMentees(false);
            }
        };

        const fetchTransactions = async () => {
            setIsLoadingTransactions(true);
            try {
                const transSnap = await getDocs(query(collection(firestore, 'balance_transactions'), orderBy('createdAt', 'desc')));
                setTransactions(transSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BalanceTransaction)));
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setIsLoadingTransactions(false);
            }
        };

        fetchMentees();
        fetchTransactions();
    }, [firestore]);
    
    const menteeDataWithNames = transactions.map(tx => ({
        ...tx,
        menteeName: mentees.find(m => m.id === tx.userId)?.name || 'Unknown User'
    }));

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header currentView="admin" />
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-2 mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Balances & Transactions</h1>
                        <p className="text-gray-500 dark:text-gray-400">Monitor mentee balances and track all financial activities.</p>
                    </div>

                    <Tabs defaultValue="balances">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="balances">All Balances</TabsTrigger>
                            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="balances" className="mt-8">
                             <DataListView
                                title="Mentees Balances"
                                data={mentees}
                                isLoading={isLoadingMentees}
                                icon={Users}
                                renderItem={(mentee) => (
                                    <div key={mentee.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{mentee.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{mentee.email}</p>
                                        </div>
                                        <p className="text-lg font-bold text-primary text-left sm:text-right">৳{(mentee.balance || 0).toLocaleString()}</p>
                                    </div>
                                )}
                                emptyMessage="No mentees found."
                            />
                        </TabsContent>

                        <TabsContent value="transactions" className="mt-8">
                            <DataListView
                                title="Balance Transactions"
                                data={menteeDataWithNames}
                                isLoading={isLoadingTransactions}
                                icon={Wallet}
                                renderItem={(tx) => {
                                    const { Icon, color } = getSourceIcon(tx.source);
                                    return (
                                        <div key={tx.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                            <div className="flex items-center gap-4">
                                                <Icon className={`w-6 h-6 ${color}`} />
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-white">{tx.menteeName}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{tx.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                 <p className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {tx.amount > 0 ? '+' : ''}৳{tx.amount.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                }}
                                emptyMessage="No transactions found."
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}

    