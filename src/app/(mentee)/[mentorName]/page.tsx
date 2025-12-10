'use client';

import * as React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Mentor } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SessionBooking } from '@/components/mentee/SessionBooking';

export default function MentorPublicProfilePage({
  params,
}: {
  params: { mentorName: string };
}) {
  const { mentorName } = params;
  const firestore = useFirestore();

  const mentorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'mentors'), where('name', '==', decodeURIComponent(mentorName)));
  }, [firestore, mentorName]);

  const { data: mentors, isLoading, error } = useCollection<Mentor>(mentorsQuery);

  const mentor = mentors && mentors[0];

  const renderMentorProfile = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error.message}</div>;
    }

    if (!mentor) {
      return <div>Mentor not found</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={mentor.photoUrl} alt={mentor.name} />
              <AvatarFallback>{mentor.name[0]}</AvatarFallback>
            </Avatar>
            <div className="mt-4 flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold">
                {mentor.ratingAvg?.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({mentor.ratingCount || 0} reviews)
              </span>
            </div>
          </div>
          <div className="mt-6 w-full text-center md:mt-0 md:text-left">
            <h1 className="text-3xl font-bold">{mentor.name}</h1>
            <p className="mt-2 text-muted-foreground">{mentor.bio}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              {mentor.expertise?.map((exp) => (
                <Badge key={exp} variant="secondary">
                  {exp}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div>
          <h2 className="text-2xl font-bold">About Me</h2>
          <div className="mt-4 grid gap-6">
            <div>
              <h3 className="font-semibold">Experience</h3>
              <p className="text-muted-foreground">{mentor.experience}</p>
            </div>
            <div>
              <h3 className="font-semibold">Education</h3>
              <p className="text-muted-foreground">{mentor.education}</p>
            </div>
            <div>
              <h3 className="font-semibold">What to Expect</h3>
              <p className="text-muted-foreground">{mentor.whatToExpect}</p>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Sessions</h2>
          <SessionBooking mentorId={mentor.id} />
        </div>
      </div>
    );
  };

  return renderMentorProfile();
}
