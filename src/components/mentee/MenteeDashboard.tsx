'use client';

import * as React from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Mentee, Booking } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';
import { MenteesAPI } from '@/lib/firebase-adapter';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Separator } from '../ui/separator';
import { Edit } from 'lucide-react';

function PersonalDetails() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const menteeRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'mentees', user.uid);
  }, [firestore, user]);

  const { data: mentee, isLoading: loadingMentee } = useDoc<Mentee>(menteeRef);

  const [name, setName] = React.useState(mentee?.name || '');
  const [phone, setPhone] = React.useState(mentee?.phone || '');
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (mentee) {
      setName(mentee.name);
      setPhone(mentee.phone || '');
    }
  }, [mentee]);

  const handleUpdate = () => {
    if (!firestore || !user) return;
    const dataToUpdate: Partial<Mentee> = {};
    if (name !== mentee?.name) dataToUpdate.name = name;
    if (phone !== mentee?.phone) dataToUpdate.phone = phone;

    if (Object.keys(dataToUpdate).length > 0) {
      MenteesAPI.updateMentee(firestore, user.uid, dataToUpdate);
      toast({ title: 'Profile Updated', description: 'Your details have been saved.' });
    }
    setIsEditing(false);
  };

  if (isUserLoading || loadingMentee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!mentee) return null;

  const getInitials = (name: string | null | undefined) => {
    return name ? name.split(' ').map((n) => n[0]).join('') : 'U';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
            <AvatarImage src={mentee.photoUrl} alt={mentee.name} />
            <AvatarFallback>{getInitials(mentee.name)}</AvatarFallback>
          </Avatar>
          <div className='w-full space-y-2 text-center'>
            <div className="grid gap-1">
              <Label htmlFor="name" className='sr-only'>Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-center text-lg font-semibold" disabled={!isEditing} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email" className='sr-only'>Email</Label>
              <Input id="email" value={mentee.email} disabled className="text-center text-muted-foreground" />
            </div>
             <div className="grid gap-1">
                <Label htmlFor="phone" className='sr-only'>Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" className="text-center" disabled={!isEditing} />
            </div>
          </div>
        </div>
      </CardContent>
       {isEditing && (
         <CardFooter className="justify-center">
            <Button onClick={handleUpdate}>Save Changes</Button>
        </CardFooter>
       )}
    </Card>
  );
}

function BalanceSection() {
    const { user } = useUser();
    const firestore = useFirestore();

    const menteeRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'mentees', user.uid);
    }, [firestore, user]);

    const { data: mentee, isLoading } = useDoc<Mentee>(menteeRef);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Balance</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-24" /> :
                <p className="text-3xl font-bold">{formatCurrency(mentee?.accountBalance || 0)}</p>
                }
            </CardContent>
            <CardFooter>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Add Balance</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Balance</DialogTitle>
                            <DialogDescription>
                                Top up your account using one of the methods below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Button variant="outline">Pay with bKash (Coming Soon)</Button>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="coupon">Coupon Code</Label>
                                <Input id="coupon" placeholder="Enter coupon code" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button>Apply Coupon</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    )
}

export function MenteeDashboard() {
  const { user } = useUser();

  if (!user) {
    return <div className="container mx-auto px-4 py-8">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
            <PersonalDetails />
        </div>
        <div className="lg:col-span-2 space-y-8">
             <BalanceSection />
        </div>
      </div>
    </div>
  );
}
