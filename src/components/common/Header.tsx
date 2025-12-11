
'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft, Home, Users, BookUser, Clock, Wallet, Settings, Lightbulb, Inbox, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/admin/mentors', icon: Users, label: 'Mentors' },
  { href: '/admin/mentees', icon: BookUser, label: 'Mentees' },
  { href: '/admin/sessions', icon: Clock, label: 'Sessions' },
  { href: '/admin/disbursements', icon: Wallet, label: 'Disbursements' },
  { href: '/admin/tips', icon: Lightbulb, label: 'Tips' },
  { href: '/admin/inbox', icon: Inbox, label: 'Inbox' },
  { href: '/admin/waitlist', icon: UserPlus, label: 'Waitlist' },
];


export const Header = () => {
  const auth = useAuth();
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut(auth).then(() => {
        // This will trigger the auth listener to redirect to login
    });
  };
  
  const currentLabel = navItems.find(item => pathname.startsWith(item.href))?.label ?? 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/admin"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-all group-hover:scale-110"><path d="M12 3L2 9L12 15L22 9L12 3Z"></path><path d="M2 9V15L12 21L22 15V9"></path></svg>
                  <span className="sr-only">MenTees</span>
                </Link>
                {navItems.map(item => (
                   <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                        pathname.startsWith(item.href) && "text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
      <div className="flex-1">
        <h1 className="text-xl font-semibold">
            {currentLabel}
        </h1>
      </div>
      {auth.currentUser && (
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      )}
    </header>
  );
};
