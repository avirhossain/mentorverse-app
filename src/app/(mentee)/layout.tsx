import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';
import { BottomNavigation } from '@/components/mentee/BottomNavigation';

export default function MenteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenteeHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MenteeFooter />
      <BottomNavigation />
    </div>
  );
}
