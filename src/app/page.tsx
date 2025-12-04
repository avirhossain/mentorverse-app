import { Header } from "@/components/common/Header";
import { MentorCard } from "@/components/mentors/MentorCard";
import { Recommendations } from "@/components/recommendations/Recommendations";
import { SessionCard } from "@/components/sessions/SessionCard";
import { mentors, sessions } from "@/lib/data";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Recommendations />
        
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Meet Our Mentors</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Browse our curated list of industry experts ready to help you achieve your goals.
              </p>
            </div>
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map(mentor => <MentorCard key={mentor.id} mentor={mentor} />)}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Unique Sessions</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Explore specialized sessions designed by our mentors to tackle specific challenges.
              </p>
            </div>
            <div className="mx-auto grid max-w-7xl gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              {sessions.map(session => <SessionCard key={session.id} session={session} />)}
            </div>
          </div>
        </section>

        <footer className="py-6 border-t">
          <div className="container px-4 text-center text-sm text-muted-foreground md:px-6">
            MentorVerse © {new Date().getFullYear()}
          </div>
        </footer>
      </main>
    </div>
  );
}
