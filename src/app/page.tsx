'use client';
import * as React from 'react';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';
import { PublicDashboard } from '@/components/mentee/PublicDashboard';
import { MotivationalChat } from '@/components/common/MotivationalChat';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenteeHeader />
      <main className="flex-1">
        <PublicDashboard />
      </main>
      <MenteeFooter />
      
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
        aria-label="Open motivational chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      <MotivationalChat open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
