import Image from "next/image";
import { Session } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export function SessionCard({ session }: { session: Session }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-accent/20 hover:shadow-lg hover:-translate-y-1 flex flex-col">
      <div className="relative h-40 w-full">
         <Image src={session.imageUrl} alt={session.title} fill style={{objectFit: 'cover'}} data-ai-hint={session.imageHint} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
      </div>
      <CardHeader className="flex-grow">
        <CardTitle>{session.title}</CardTitle>
        <CardDescription className="line-clamp-2">{session.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {session.mentorId && session.mentorName && (
          <p className="text-sm text-muted-foreground">
            With <Link href={`/mentors/${session.mentorId}`} className="font-medium text-primary hover:underline">{session.mentorName}</Link>
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Badge variant="outline" className="text-lg font-semibold">{formatCurrency(session.cost)}</Badge>
      </CardFooter>
    </Card>
  );
}
