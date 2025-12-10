'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import type { Tip } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function TipsPage() {
  const firestore = useFirestore();

  const tipsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tips'), where('isActive', '==', true), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: tips, isLoading, error } = useCollection<Tip>(tipsQuery);

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
         <Skeleton key={i} className="h-40 w-full" />
      ));
    }
    if (error) {
      return <p className="text-destructive text-center col-span-full">Error loading tips: {error.message}</p>;
    }
    if (!tips || tips.length === 0) {
      return <p className="text-muted-foreground text-center col-span-full">No tips available yet. Check back soon!</p>;
    }
    return tips.map((tip) => (
      <Card key={tip.id} className="flex flex-col">
           <CardHeader>
              <div className="flex items-center gap-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  <CardTitle>{tip.title}</CardTitle>
              </div>
          </CardHeader>
          <CardContent>
              <CardDescription>{tip.description}</CardDescription>
          </CardContent>
      </Card>
    ));
  }

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
