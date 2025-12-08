'use client';

import { AuthForm } from '@/components/mentee/AuthForm';
import { AuthListener } from '@/components/common/AuthListener';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-muted/40 py-12">
      <AuthListener>
        <AuthForm />
      </AuthListener>
    </div>
  );
}
