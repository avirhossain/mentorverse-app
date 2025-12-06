
'use client';
import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, X, Trash2, User, Briefcase, Lightbulb, Ticket, Banknote, Edit, Check, ThumbsDown, Eye, Phone, PlayCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, doc, runTransaction, deleteDoc, setDoc, updateDoc, query } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Mentor, Mentee, Session, Tip, Coupon, PendingPayment, MentorApplication, SupportRequest, AdminUser } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { MessageSquare, CreditCard, Inbox, FilePlus } from 'lucide-react';
import { Calendar } from 'lucide-react';

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl transform transition-all">
      <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start">
        <Icon className="w-5 h-5 mr-3 text-primary flex-shrink-0 mt-1" />
        <div>
            <p className="font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const MentorApplicationDetails = ({ application }) => (
    <div className="space-y-4">
        <DetailItem icon={User} label="Applicant Name" value={application.name} />
        <DetailItem icon={Phone} label="Phone Number" value={application.phone} />
        <DetailItem icon={MessageSquare} label="Profile Summary" value={application.summary} />
    </div>
);

const SupportRequestDetails = ({ request }) => (
    <div className="space-y-4">
        <DetailItem icon={User} label="User Name" value={request.name} />
        <DetailItem icon={Phone} label="Phone Number" value={request.phone} />
        <DetailItem icon={MessageSquare} label="Support Details" value={request.details} />
    </div>
);

const PendingPaymentDetails = ({ payment }) => (
     <div className="space-y-4">
        <DetailItem icon={User} label="User ID" value={payment.userId} />
        <DetailItem icon={Ticket} label="bKash Transaction ID" value={payment.transactionId} />
        <DetailItem icon={Banknote} label="Amount" value={`৳${payment.amount.toLocaleString()}`} />
    </div>
);

const MenteeForm = ({ mentee, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        interests: '',
        balance: 0,
        status: 'active',
        ...mentee,
        interests: mentee?.interests?.join(', ') || '',
    });
    
    const { toast } = useToast();
    
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };
    
    const handleStatusChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const processedData = {
                ...formData,
                interests: formData.interests.split(',').map(i => i.trim()),
            };
            await onSave(processedData);
            toast({ title: "Success!", description: "Mentee profile updated." });
            onClose();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to update mentee: ${error.message}` });
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
            <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required readOnly />
            <Input name="interests" placeholder="Interests (comma-separated)" value={formData.interests} onChange={handleChange} />
            <Input name="balance" type="number" placeholder="Account Balance" value={formData.balance} onChange={handleChange} required />

            <div className="grid grid-cols-1 gap-4">
                <Select onValueChange={(value) => handleStatusChange('status', value)} value={formData.status}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select account status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    );
};

const DataListView = ({ title, data, isLoading, icon: Icon, columns, emptyMessage = "No data available.", renderActions, idPrefix, onSeeAll }) => (
    <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <Icon className="w-6 h-6 mr-3 text-primary" />
                {title}
            </h2>
             {onSeeAll && <Button variant="outline" onClick={onSeeAll}>See All</Button>}
        </div>
        
        {isLoading ? (
             <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-t-4 border-primary/50 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="hidden md:table-header-group">
                        <tr className="border-b">
                            {columns.map((col, index) => (
                                <th key={index} className={`p-2 text-left font-bold text-gray-500 uppercase ${col.className}`}>{col.header}</th>
                            ))}
                            <th className="p-2 text-right font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data && data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={item.id} className="block md:table-row hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-2 block md:table-cell"><span className="md:hidden font-bold">SL: </span>{index + 1}</td>
                                    <td className="p-2 block md:table-cell"><span className="md:hidden font-bold">Date: </span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                                    <td className="p-2 block md:table-cell font-mono text-primary"><span className="md:hidden font-bold">ID: </span>{idPrefix}{index + 1}</td>
                                    <td className="p-2 block md:table-cell font-semibold text-gray-800 dark:text-white"><span className="md:hidden font-bold">Name: </span>{item.name || item.title || item.phone || item.transactionId || item.id || item.email}</td>
                                    <td className="p-2 block md:table-cell text-left md:text-right">
                                        <div className="flex justify-start md:justify-end items-center gap-2">
                                            {renderActions(item)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-gray-500 dark:text-gray-400 text-center py-4">{emptyMessage}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);


const PaymentApprovalList = ({ payments, onApprove, isLoading, onDetails, canWrite }) => (
    <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Banknote className="w-6 h-6 mr-3 text-primary" />
            Pending bKash Payments
        </h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border-t-4 border-primary/50 space-y-3">
             {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : payments && payments.length > 0 ? (
                payments.map((payment) => (
                    <div key={payment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-800 dark:text-white">TrxID: <span className="font-bold text-primary">{payment.transactionId}</span></p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Amount: ৳{payment.amount}</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button variant="ghost" size="sm" onClick={() => onDetails(payment)} className="flex-1 sm:flex-none"><Eye className="w-4 h-4 mr-2 sm:mr-0"/></Button>
                            {canWrite && <Button onClick={() => onApprove(payment)} className="flex-1 sm:flex-none">Approve</Button>}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending payments.</p>
            )}
        </div>
    </div>
);


export default function AdminPage() {
  const { user, isUserLoading, isAdmin } = useUser();
  const router = useRouter();
  const [modalState, setModalState] = useState({ type: null, data: null });
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [mentorApps, setMentorApps] = useState<MentorApplication[]>([]);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const [isLoadingMentors, setIsLoadingMentors] = useState(true);
  const [isLoadingMentees, setIsLoadingMentees] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingTips, setIsLoadingTips] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [isLoadingMentorApps, setIsLoadingMentorApps] = useState(true);
  const [isLoadingSupport, setIsLoadingSupport] = useState(true);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  
  const canWrite = isAdmin;
  const canDelete = isAdmin;


  const firestore = useFirestore();
  const { toast } = useToast();

  const fetchData = async () => {
    if (!firestore) return;
    setIsLoadingMentors(true);
    setIsLoadingMentees(true);
    setIsLoadingSessions(true);
    setIsLoadingTips(true);
    setIsLoadingPayments(true);
    setIsLoadingCoupons(true);
    setIsLoadingMentorApps(true);
    setIsLoadingSupport(true);
    setIsLoadingAdmins(true);

    try {
        const [mentorsSnap, menteesSnap, sessionsSnap, tipsSnap, paymentsSnap, couponsSnap, mentorAppsSnap, supportRequestsSnap, adminsSnap] = await Promise.all([
            getDocs(collection(firestore, 'mentors')),
            getDocs(collection(firestore, 'users')),
            getDocs(collection(firestore, 'sessions')),
            getDocs(collection(firestore, 'tips')),
            getDocs(query(collection(firestore, 'pending_payments'))),
            getDocs(collection(firestore, 'coupons')),
            getDocs(collection(firestore, 'mentor_applications')),
            getDocs(collection(firestore, 'support_requests')),
            getDocs(collection(firestore, 'admins')),
        ]);

        setMentors(mentorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentor)));
        setMentees(menteesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentee)));
        setSessions(sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session)));
        setTips(tipsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tip)));
        setPendingPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingPayment)));
        setCoupons(couponsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
        setMentorApps(mentorAppsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MentorApplication)));
        setSupportRequests(supportRequestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportRequest)));
        setAdmins(adminsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AdminUser)));

    } catch (error) {
        toast({ variant: 'destructive', title: 'Error fetching data', description: error.message });
        console.error("Error fetching data:", error);
    } finally {
        setIsLoadingMentors(false);
        setIsLoadingMentees(false);
        setIsLoadingSessions(false);
        setIsLoadingTips(false);
        setIsLoadingPayments(false);
        setIsLoadingCoupons(false);
        setIsLoadingMentorApps(false);
        setIsLoadingSupport(false);
        setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (firestore && isAdmin) {
      fetchData();
    }
  }, [firestore, isUserLoading, user, isAdmin, router]);

  
  const handleSaveMentee = async (menteeData) => {
    if (!firestore) return;
    const menteeRef = doc(firestore, 'users', menteeData.id);
    await updateDoc(menteeRef, menteeData);
    fetchData(); // Refresh data
  };
  
  const handleDelete = async (collectionName: string, docId: string, name: string) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
      return;
    }
    try {
      await deleteDoc(doc(firestore, collectionName, docId));
      toast({ title: 'Success!', description: `${name} has been deleted.` });
      fetchData(); // Refresh data after deletion
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to delete ${name}: ${error.message}` });
      console.error(`Failed to delete ${name}:`, error);
    }
  };

  const handleUpdateSessionStatus = async (session: Session, status: 'active' | 'completed') => {
      if (!firestore) return;
      const sessionRef = doc(firestore, 'sessions', session.id);
      try {
          await updateDoc(sessionRef, { status: status });
          toast({ title: 'Success!', description: `Session "${session.title}" is now ${status}.` });
          fetchData();
      } catch (error) {
          toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
      }
  };
  
  const handleApprovePayment = async (payment) => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Services not available.' });
        return;
    }

    const userRef = doc(firestore, 'users', payment.userId);
    const paymentRef = doc(firestore, 'pending_payments', payment.id);
    const transactionRef = doc(collection(firestore, 'balance_transactions'));

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error("User does not exist!");
            
            const currentBalance = userDoc.data().balance || 0;
            const newBalance = currentBalance + payment.amount;
            
            transaction.update(userRef, { balance: newBalance });
            transaction.delete(paymentRef);
            transaction.set(transactionRef, {
                id: transactionRef.id,
                userId: payment.userId,
                amount: payment.amount,
                source: 'bkash',
                description: `bKash TrxID: ${payment.transactionId}`,
                createdAt: new Date().toISOString(),
            });
        });

        toast({ title: 'Success!', description: `Payment approved. User balance updated.` });
        fetchData();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Transaction Failed', description: error.message });
    }
  };

    const handleUpdateApplicationStatus = async (application: MentorApplication, status: 'approved' | 'rejected') => {
        if (!firestore) return;
        const appRef = doc(firestore, 'mentor_applications', application.id);
        try {
            await updateDoc(appRef, { status: status });
            toast({
                title: 'Application Updated!',
                description: `Application from ${application.name} has been ${status}.`,
            });
            fetchData();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message,
            });
        }
    };
    

  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = () => setModalState({ type: null, data: null });
  
  if (isUserLoading) {
    return (
      <>
        <div className="p-8">
            <Skeleton className="h-8 w-1/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex-1 p-8 space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }
  
  return (
    <>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">View and manage Mentees content and users.</p>
            </div>
            <Button asChild>
                <Link href="/admin/create">
                    <FilePlus className="w-4 h-4 mr-2" /> Create Content
                </Link>
            </Button>
          </div>

          
          <PaymentApprovalList 
            payments={pendingPayments}
            onApprove={handleApprovePayment} 
            isLoading={isLoadingPayments}
            onDetails={(payment) => openModal('payment_details', payment)}
            canWrite={canWrite}
          />

          <DataListView
                title="Mentor Applications"
                data={mentorApps}
                isLoading={isLoadingMentorApps}
                icon={Inbox}
                idPrefix="MA"
                columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Name', span: 5 },
                ]}
                renderActions={(app) => {
                    switch (app.status) {
                        case 'pending':
                            return (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => openModal('mentor_app_details', app)}><Eye className="w-4 h-4"/></Button>
                                    {canWrite && <>
                                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleUpdateApplicationStatus(app, 'approved')}>
                                        <Check className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleUpdateApplicationStatus(app, 'rejected')}>
                                        <ThumbsDown className="w-4 h-4" />
                                    </Button>
                                    </>}
                                </>
                            );
                        case 'approved':
                            return <span className="text-sm font-semibold text-green-600">Approved</span>;
                        case 'rejected':
                            return <span className="text-sm font-semibold text-red-600">Rejected</span>;
                        default:
                            return null;
                    }
                }}
                 emptyMessage="No new mentor applications."
            />
            
            <DataListView
                title="Support Requests"
                data={supportRequests}
                isLoading={isLoadingSupport}
                icon={MessageSquare}
                idPrefix="SR"
                columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Name', span: 5 },
                ]}
                renderActions={(req) => (
                     <>
                        <Button variant="ghost" size="sm" onClick={() => openModal('support_details', req)}><Eye className="w-4 h-4"/></Button>
                        {canDelete && <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will delete the support request from {req.name}. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete('support_requests', req.id, `request from ${req.name}`)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>}
                    </>
                )}
                emptyMessage="No new support requests."
            />
          
          <DataListView
            title="All Mentors"
            data={mentors}
            isLoading={isLoadingMentors}
            icon={Briefcase}
            idPrefix="M"
            columns={[
                { header: 'SL', span: 1 },
                { header: 'Date', span: 2 },
                { header: 'ID', span: 2 },
                { header: 'Name', span: 5 },
            ]}
            renderActions={(mentor) => (
                <>
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/mentors/${mentor.id}`}><Eye className="w-4 h-4" /></Link>
                    </Button>
                    {canWrite && <Button variant="ghost" size="sm" onClick={() => openModal('mentor_edit', mentor)}><Edit className="w-4 h-4" /></Button>}
                    {canDelete && <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the mentor profile for {mentor.name}.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete('mentors', mentor.id, mentor.name)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>}
                </>
            )}
           />

            <DataListView
                title="All Sessions"
                data={sessions}
                isLoading={isLoadingSessions}
                icon={Calendar}
                idPrefix="S"
                columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Title', span: 5 },
                ]}
                renderActions={(session) => (
                     <>
                        <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/sessions/${session.id}`}><Eye className="w-4 h-4" /></Link>
                        </Button>
                        {session.status === 'scheduled' && canWrite && (
                            <Button size="sm" onClick={() => handleUpdateSessionStatus(session, 'active')}>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Start
                            </Button>
                        )}
                        {session.status === 'active' && canWrite && (
                             <Button size="sm" variant="destructive" onClick={() => handleUpdateSessionStatus(session, 'completed')}>
                                End
                            </Button>
                        )}
                        {session.status === 'completed' && (
                            <span className="text-sm font-semibold text-gray-500">Completed</span>
                        )}
                    </>
                )}
            />

            <DataListView
              title="All Tips"
              data={tips}
              isLoading={isLoadingTips}
              icon={Lightbulb}
              idPrefix="T"
              columns={[
                { header: 'SL', span: 1 },
                { header: 'Date', span: 2 },
                { header: 'ID', span: 2 },
                { header: 'Title', span: 5 },
              ]}
              renderActions={(tip) => (
                <>
                    {canWrite && <Button variant="ghost" size="sm" onClick={() => openModal('tip_edit', tip)}><Edit className="w-4 h-4" /></Button>}
                    {canDelete && <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tip: {tip.title}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete('tips', tip.id, tip.title)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>}
                </>
              )}
            />
            
            <DataListView
                title="All Coupons"
                data={coupons}
                isLoading={isLoadingCoupons}
                icon={Ticket}
                idPrefix="C"
                 columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Code', span: 5 },
                ]}
                renderActions={(coupon) => (
                    <p className={`text-sm font-semibold ${coupon.isUsed ? 'text-red-500' : 'text-green-600'}`}>
                        {coupon.isUsed ? 'Redeemed' : 'Available'}
                    </p>
                )}
            />

            <DataListView
                title="All Admins"
                data={admins}
                isLoading={isLoadingAdmins}
                icon={Shield}
                idPrefix="A"
                columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'UID', span: 2 },
                    { header: 'Email', span: 5 },
                ]}
                renderActions={(admin) => (
                    <>
                        {/* Future actions for admins can go here */}
                    </>
                )}
            />

            <DataListView
                title="All Mentees (Users)"
                data={mentees}
                isLoading={isLoadingMentees}
                icon={User}
                idPrefix="U"
                 columns={[
                    { header: 'SL', span: 1 },
                    { header: 'Date', span: 2 },
                    { header: 'ID', span: 2 },
                    { header: 'Name', span: 5 },
                ]}
                renderActions={(mentee) => (
                    <>
                        <Button asChild variant="ghost" size="sm">
                           <Link href={`/account?userId=${mentee.id}`}><Eye className="w-4 h-4" /></Link>
                        </Button>
                        {canWrite && <Button variant="ghost" size="sm" onClick={() => openModal('mentee_edit', mentee)}><Edit className="w-4 h-4" /></Button>}
                        {canDelete && <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the account for {mentee.name || mentee.id}.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete('users', mentee.id, mentee.name || mentee.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>}
                    </>
                )}
            />
        </div>
      </main>

      {modalState.type === 'mentee_edit' && canWrite && (
          <Modal title="Edit Mentee" onClose={closeModal}>
              <MenteeForm 
                  mentee={modalState.data} 
                  onSave={handleSaveMentee} 
                  onClose={closeModal}
              />
          </Modal>
      )}
      
      {modalState.type === 'mentor_app_details' && (
           <Modal title="Mentor Application Details" onClose={closeModal}>
              <MentorApplicationDetails application={modalState.data} />
          </Modal>
      )}
      {modalState.type === 'support_details' && (
           <Modal title="Support Request Details" onClose={closeModal}>
              <SupportRequestDetails request={modalState.data} />
          </Modal>
      )}
      {modalState.type === 'payment_details' && (
           <Modal title="Payment Details" onClose={closeModal}>
              <PendingPaymentDetails payment={modalState.data} />
          </Modal>
      )}
    </>
  );
}
