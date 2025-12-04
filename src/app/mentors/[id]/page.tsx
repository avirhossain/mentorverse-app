import { notFound } from 'next/navigation';
import { mentors } from '@/lib/data';
import { Header } from '@/components/common/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Briefcase, Calendar, Star } from 'lucide-react';
import { BookingDialog } from '@/components/mentors/BookingDialog';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export default function MentorPage({ params }: { params: { id: string } }) {
  const mentor = mentors.find((m) => m.id === params.id);

  if (!mentor) {
    notFound();
  }
  
  const fallback = mentor.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-primary/20">
                    <AvatarImage src={mentor.avatarUrl} alt={mentor.name} data-ai-hint={mentor.imageHint} />
                    <AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold font-headline">{mentor.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> {mentor.title}</p>
                    <div className="flex items-center gap-1 pt-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <Star className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />
                        <span className="ml-2 text-sm text-muted-foreground">(24 reviews)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-semibold mb-2">About Me</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{mentor.bio}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas of Expertise</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {mentor.expertise.map(skill => (
                    <Badge key={skill} variant="default" className="bg-primary/80 hover:bg-primary text-base px-3 py-1">{skill}</Badge>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" /> Session Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{formatCurrency(mentor.sessionCost)}<span className="text-lg font-normal text-muted-foreground">/session</span></p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Available Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mentor.availableTimeslots.length > 0 ? mentor.availableTimeslots.map(slot => (
                     <div key={slot} className="flex items-center justify-between p-3 rounded-md border bg-background">
                       <div>
                         <p className="font-medium">{format(new Date(slot), 'eeee, MMM d')}</p>
                         <p className="text-sm text-muted-foreground">{format(new Date(slot), 'h:mm a')}</p>
                       </div>
                       <BookingDialog mentorName={mentor.name} sessionCost={mentor.sessionCost} timeslot={slot} />
                     </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No available sessions at the moment. Please check back later.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
