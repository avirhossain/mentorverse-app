'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import type { Tip } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TipsPage() {
  const firestore = useFirestore();

  const tipsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'tips'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
  }, [firestore]);

  const {
    data: tips,
    isLoading,
    error,
  } = useCollection<Tip>(tipsQuery);

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-60 w-full" />
      ));
    }
    if (error) {
      return (
        <p className="col-span-full text-center text-destructive">
          Error loading tips: {error.message}
        </p>
      );
    }
    if (!tips || tips.length === 0) {
      return (
        <p className="col-span-full text-center text-muted-foreground">
          No tips available yet. Check back soon!
        </p>
      );
    }
    return tips.map((tip) => (
      <Card key={tip.id} className="flex flex-col overflow-hidden">
        {tip.imageUrl && (
          <div className="relative aspect-video w-full">
            <Image
              src={tip.imageUrl}
              alt={tip.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader className={!tip.imageUrl ? '' : 'pt-4'}>
          <div className="flex items-start gap-3">
            {!tip.imageUrl && <Lightbulb className="h-6 w-6 text-primary" />}
            <CardTitle>{tip.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription>{tip.description}</CardDescription>
        </CardContent>
        {tip.linkUrl && (
          <div className="p-4 pt-0">
             <Button asChild className="w-full">
               <Link href={tip.linkUrl} target="_blank" rel="noopener noreferrer">
                 Read More
               </Link>
             </Button>
          </div>
        )}
      </Card>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Tips for Success</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Advice and best practices to help you on your journey.
        </p>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {renderContent()}
      </div>
    </div>
  );
}
