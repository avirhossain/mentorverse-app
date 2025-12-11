
'use client';
import Link from 'next/link';
import {
  Home,
  Users,
  BookUser,
  Clock,
  Wallet,
  Settings,
  Lightbulb,
  Inbox,
  UserPlus,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

export function Sidebar() {
  const pathname = usePathname();

  const isCurrentPage = (href: string) => {
    if (href === '/admin/dashboard' || href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/admin"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-all group-hover:scale-110"
            >
              <path d="M12 3L2 9L12 15L22 9L12 3Z" />
              <path d="M2 9V15L12 21L22 15V9" />
            </svg>
            <span className="sr-only">Mentees</span>
          </Link>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                    isCurrentPage(item.href) && 'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
