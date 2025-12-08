'use client';

import React from 'react';
import { AuthForm } from '@/components/mentee/AuthForm';
import { AuthListener } from '@/components/common/AuthListener';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
       <AuthListener>
        <AuthForm />
      </AuthListener>
    </div>
  );
}
