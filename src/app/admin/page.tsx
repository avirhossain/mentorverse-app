'use client';
import React from 'react';
import { FilePlus, Users as UsersIcon } from 'lucide-react';
import { Header } from '@/components/common/Header';

export default function AdminPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        currentView="admin"
      />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500">Manage Guidelab content and users.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Content Management</h2>
            <p className="text-gray-600 mb-6">
              This section is for creating and managing mentor profiles and
              unique sessions. The full implementation is not part of this
              demo.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-start gap-2 p-6 border rounded-lg bg-gray-50">
                <UsersIcon className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold">Manage Mentors</h3>
                <p className="text-sm text-gray-500">
                  Admins can create, edit, and view mentor profiles, including
                  their expertise, availability, and session costs.
                </p>
                <button
                  disabled
                  className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg opacity-50 cursor-not-allowed"
                >
                  Create New Mentor
                </button>
              </div>
              <div className="flex flex-col items-start gap-2 p-6 border rounded-lg bg-gray-50">
                <FilePlus className="w-8 h-8 text-primary" />
                <h3 className="text-lg font-semibold">Manage Sessions</h3>
                <p className="text-sm text-gray-500">
                  Admins can create unique, bookable sessions offered by
                  mentors, complete with descriptions and pricing.
                </p>
                <button
                  disabled
                  className="mt-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg opacity-50 cursor-not-allowed"
                >
                  Create New Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
