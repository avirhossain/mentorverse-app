
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { Footer } from '@/components/common/Footer';
import { DebugConsole } from '@/components/common/DebugConsole';

export const metadata: Metadata = {
  title: 'Mentees',
  description: 'Find your perfect mentor match with AI-powered recommendations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased flex flex-col min-h-screen">
        <FirebaseClientProvider>
          <div className="flex-grow">
            {children}
          </div>
          <Toaster />
          <Footer />
          <DebugConsole />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
