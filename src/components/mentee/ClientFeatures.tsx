
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { MotivationalChat } from '@/components/common/MotivationalChat';

export function ClientFeatures() {
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  
  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
        aria-label="Open motivational chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
      <MotivationalChat open={isChatOpen} onOpenChange={setIsChatOpen} />
    </>
  );
}
