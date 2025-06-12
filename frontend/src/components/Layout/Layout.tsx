'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import { User } from '@/types';

interface LayoutProps {
  children: ReactNode;
  user?: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function Layout({ children, user, activeTab, onTabChange, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      {user && (
        <Navigation activeTab={activeTab} onTabChange={onTabChange} />
      )}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}