import { Header } from '@/components/common/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, Users } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-muted/40 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage MentorVerse content and users.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                This section is for creating and managing mentor profiles and unique sessions. The full implementation is not part of this demo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-start gap-2 p-6 border rounded-lg bg-card">
                <Users className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold">Manage Mentors</h3>
                <p className="text-sm text-muted-foreground">
                  Admins can create, edit, and view mentor profiles, including their expertise, availability, and session costs.
                </p>
                <Button variant="outline" disabled className="mt-2">Create New Mentor</Button>
              </div>
              <div className="flex flex-col items-start gap-2 p-6 border rounded-lg bg-card">
                <FilePlus className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold">Manage Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Admins can create unique, bookable sessions offered by mentors, complete with descriptions and pricing.
                </p>
                <Button variant="outline" disabled className="mt-2">Create New Session</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
