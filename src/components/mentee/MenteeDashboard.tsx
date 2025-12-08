'use client';

import { useUser } from '@/firebase';
import { MySessions } from './MySessions';
import { FeaturedMentors } from './FeaturedMentors';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function MenteeDashboard() {
  const { user } = useUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">
        Welcome, {user?.displayName || 'Mentee'}!
      </h1>
      <p className="text-muted-foreground mb-8">
        Here's a quick overview of your mentorship journey.
      </p>

      <div className="grid gap-8">
        <MySessions />
        <Card>
           <CardHeader>
             <CardTitle>Discover New Mentors</CardTitle>
           </CardHeader>
           <CardContent>
            <FeaturedMentors />
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
