import Link from 'next/link';
import { Users } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Users className="h-6 w-6 text-primary" />
          <span className="text-lg font-headline">MentorVerse</span>
        </Link>
        <nav className="ml-auto">
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Admin Panel
          </Link>
        </nav>
      </div>
    </header>
  );
}
