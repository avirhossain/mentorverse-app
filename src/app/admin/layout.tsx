'use client';
import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { isAdmin, isUserLoading, isAuthCheckComplete } = useAdminAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthCheckComplete && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isAuthCheckComplete, router]);

  if (isUserLoading || !isAuthCheckComplete || !isAdmin) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Verifying administrator access...
            </p>
        </div>
        <p className="mt-2 text-sm text-gray-500">
            This may take a moment.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminLayout;
