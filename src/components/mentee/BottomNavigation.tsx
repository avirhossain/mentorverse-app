'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Lightbulb, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useUser();

  const navLinks = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/tips', icon: Lightbulb, label: 'Tips' },
    { href: user ? '/dashboard' : '/login', icon: user ? LayoutDashboard : User, label: user ? 'Dashboard' : 'Login' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <nav className="grid h-16 grid-cols-3 items-center justify-around">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary',
              pathname === link.href ? 'text-primary' : ''
            )}
          >
            <link.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
