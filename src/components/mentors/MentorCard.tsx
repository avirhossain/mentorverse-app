import Link from "next/link";
import { Mentor } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function MentorCard({ mentor }: { mentor: Mentor }) {
  const fallback = mentor.name.split(' ').map(n => n[0]).join('');
  return (
    <Link href={`/mentors/${mentor.id}`} className="group block h-full">
      <Card className="h-full transition-all duration-300 hover:shadow-accent/20 hover:shadow-lg hover:-translate-y-1 flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={mentor.avatarUrl} alt={mentor.name} data-ai-hint={mentor.imageHint} />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{mentor.name}</CardTitle>
              <CardDescription>{mentor.title}</CardDescription>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto transition-transform duration-300 opacity-0 text-primary group-hover:opacity-100 group-hover:translate-x-1" />
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
            {mentor.expertise.length > 3 && <Badge variant="outline">+{mentor.expertise.length - 3} more</Badge>}
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          <div className="text-lg font-semibold text-primary">{formatCurrency(mentor.sessionCost)}<span className="text-sm font-normal text-muted-foreground">/session</span></div>
        </div>
      </Card>
    </Link>
  );
}
