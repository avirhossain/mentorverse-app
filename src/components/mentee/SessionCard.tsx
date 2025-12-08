import { Clock, Calendar, Tag } from 'lucide-react';
import type { Session } from '@/lib/types';
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
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface SessionCardProps {
  session: Session & { mentorName: string };
}

const getTypeBadgeVariant = (type: Session['sessionType']) => {
  switch (type) {
    case 'Paid':
      return 'default';
    case 'Free':
      return 'secondary';
    case 'Exclusive':
      return 'outline';
    default:
      return 'secondary';
  }
};

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <CardTitle className="pr-4 text-lg">{session.name}</CardTitle>
          <Badge variant={getTypeBadgeVariant(session.sessionType)}>
            {session.sessionType}
          </Badge>
        </div>
        <CardDescription>By {session.mentorName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(session.scheduledDate), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{session.scheduledTime}</span>
          </div>
          {session.tag && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>{session.tag}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch p-4 pt-0">
        <div className="mb-4 text-center text-2xl font-bold">
          {session.sessionType === 'Free'
            ? 'Free'
            : formatCurrency(session.sessionFee)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full">
            See More
          </Button>
          <Button className="w-full">Book Session</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
