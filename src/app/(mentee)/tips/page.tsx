'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import type { Tip } from "@/lib/types";

// Placeholder data - will be replaced with Firestore data
const placeholderTips: Tip[] = [
  {
    id: 'T01',
    title: 'How to Prepare for Your First Mentorship Session',
    description: 'A quick guide to get the most out of your meeting. Make a list of questions beforehand and be ready to take notes!',
    isActive: true,
    createdAt: '2024-05-15T10:00:00Z',
    adminId: 'A01',
  },
  {
    id: 'T02',
    title: 'Setting Clear Goals with Your Mentor',
    description: 'Define what you want to achieve. Use the SMART goal framework to create specific, measurable, achievable, relevant, and time-bound objectives.',
    isActive: true,
    createdAt: '2024-05-20T11:30:00Z',
    adminId: 'A01',
  },
  {
    id: 'T03',
    title: 'The Art of Following Up',
    description: 'Keep the momentum going after your session ends. Send a thank-you note and summarize the key takeaways and action items.',
    isActive: true,
    createdAt: '2024-04-10T09:00:00Z',
    adminId: 'A01',
  },
];


export default function TipsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Tips for Success</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Advice and best practices to help you on your journey.
        </p>
      </section>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {placeholderTips.map((tip) => (
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
        ))}
      </div>
    </div>
  );
}
