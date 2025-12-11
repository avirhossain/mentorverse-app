'use client';
import React from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { Header } from '@/components/common/Header';
import { AdminAuthProvider } from '@/firebase/auth/admin-auth-provider';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { AdminChat } from '@/components/admin/AdminChat';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  return (
    <AdminAuthProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <Header />
          <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <AdminChat open={isChatOpen} onOpenChange={setIsChatOpen} />
      </div>
    </AdminAuthProvider>
  );
}
