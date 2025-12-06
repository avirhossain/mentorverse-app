'use client';
import React from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header currentView="tips" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Mentorship Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              This page will contain useful tips and articles for both mentors and mentees.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
