
'use client';

import * as React from 'react';
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';
import { BottomNavigation } from '@/components/mentee/BottomNavigation';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { MotivationalChat } from '@/components/common/MotivationalChat';

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenteeHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MenteeFooter />
      <BottomNavigation />
      
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-6"
        aria-label="Open motivational chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      <MotivationalChat open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}
