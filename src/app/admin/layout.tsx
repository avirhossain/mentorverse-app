'use client';
import { AdminAuthProvider } from '@/firebase/auth/admin-auth-provider';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
