'use client';
import React from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MentorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header currentView="mentors" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Our Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              This is where the list of mentor profiles will be displayed.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
