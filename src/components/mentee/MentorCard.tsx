import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Mentor } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MentorCardProps {
  mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="flex-row items-start gap-4 p-4">
        <div className="relative h-20 w-20 flex-shrink-0">
          <Image
            src={mentor.photoUrl || 'https://i.pravatar.cc/150'}
            alt={`Profile of ${mentor.name}`}
            fill
            className="rounded-full object-cover"
            data-ai-hint="person portrait"
          />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl">{mentor.name}</CardTitle>
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{mentor.ratingAvg?.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({mentor.ratingCount || 0} reviews)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <CardDescription className="line-clamp-3">
          {mentor.bio}
        </CardDescription>
        <div className="mt-3 flex flex-wrap gap-2">
          {mentor.expertise?.slice(0, 3).map((exp) => (
            <Badge key={exp} variant="secondary">
              {exp}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">View Profile</Button>
      </CardFooter>
    </Card>
  );
}
