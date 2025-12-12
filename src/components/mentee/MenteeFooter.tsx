
'use client';

import Link from 'next/link';

export const MenteeFooter = () => {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row md:px-6">
        <div className="flex items-center gap-2">
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
            className="h-6 w-6 text-primary"
          >
            <path d="M12 3L2 9L12 15L22 9L12 3Z" />
            <path d="M2 9V15L12 21L22 15V9" />
          </svg>
          <span className="font-bold">MenTees</span>
        </div>
        <p className="text-center text-sm text-muted-foreground sm:order-first sm:text-left">
          © {new Date().getFullYear()} MenTees. All rights reserved.
        </p>
        <nav className="flex flex-wrap justify-center gap-4 sm:ml-auto sm:gap-6">
          <Link
            href="/terms-and-conditions"
            className="text-sm hover:underline"
            prefetch={false}
          >
            Terms & Conditions
          </Link>
          <Link
            href="/privacy-policy"
            className="text-sm hover:underline"
            prefetch={false}
          >
            Privacy Policy
          </Link>
           <Link
            href="mailto:support@mentees.com"
            className="text-sm hover:underline"
            prefetch={false}
          >
            Contact Us
          </Link>
           <Link
            href="mailto:mentors@mentees.com"
            className="text-sm hover:underline"
            prefetch={false}
          >
            Want to be a Mentor
          </Link>
        </nav>
      </div>
    </footer>
  );
};
