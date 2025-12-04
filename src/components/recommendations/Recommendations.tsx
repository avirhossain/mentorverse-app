"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getRecommendationsAction } from "@/app/actions";
import { menteeSessionHistory } from "@/lib/data";
import type { Mentor, Session } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2 } from "lucide-react";
import { MentorCard } from "@/components/mentors/MentorCard";
import { SessionCard } from "@/components/sessions/SessionCard";

const recommendationSchema = z.object({
  menteeProfile: z.string().min(10, "Please provide more details about your profile.").max(500),
  mentorshipGoal: z.string().min(10, "Please describe your mentorship goals.").max(500),
});

type RecommendationResult = {
  mentors: Mentor[];
  sessions: Session[];
  reason: string;
} | null;

export function Recommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationResult>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof recommendationSchema>>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      menteeProfile: "",
      mentorshipGoal: "",
    },
  });

  async function onSubmit(values: z.infer<typeof recommendationSchema>) {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const input = {
      ...values,
      sessionHistory: menteeSessionHistory,
    };

    const result = await getRecommendationsAction(input);

    if (result.error) {
      setError(result.error);
    } else {
      setRecommendations(result as RecommendationResult);
    }
    setIsLoading(false);
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">Personalized Path</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Find Your Perfect Mentor Match</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Tell us about your goals and experience, and our AI will suggest the best mentors and sessions to help you grow. Our AI only makes suggestions when there's a strong fit.
            </p>
             <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>Get AI Recommendations</CardTitle>
                <CardDescription>Fill out the form below to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="menteeProfile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Profile</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Junior software developer, 2 years experience" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mentorshipGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Mentorship Goal</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Prepare for senior role interviews, improve system design skills" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : "Get Recommendations"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
            {isLoading && (
               <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center border-2 border-dashed rounded-lg w-full">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Finding the best matches for you...</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {recommendations && (
              <Card className="w-full animate-in fade-in-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lightbulb className="text-accent" /> AI Recommendations</CardTitle>
                  <CardDescription>{recommendations.reason}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Recommended Mentors</h3>
                        {recommendations.mentors.length > 0 ? (
                             <div className="grid grid-cols-1 gap-4">
                                {recommendations.mentors.map(mentor => <MentorCard key={mentor.id} mentor={mentor} />)}
                             </div>
                        ) : <p className="text-sm text-muted-foreground">No specific mentors recommended at this time. Browse all mentors below!</p>}
                    </div>
                    {recommendations.sessions.length > 0 && (
                      <div>
                          <h3 className="mb-4 text-lg font-semibold">Recommended Sessions</h3>
                          <div className="grid grid-cols-1 gap-4">
                              {recommendations.sessions.map(session => <SessionCard key={session.id} session={session} />)}
                          </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
            {!isLoading && !recommendations && !error && (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center border-2 border-dashed rounded-lg w-full bg-card">
                  <Lightbulb className="w-12 h-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Your recommended mentors and sessions will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
