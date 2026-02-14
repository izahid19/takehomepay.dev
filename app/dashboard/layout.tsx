'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  BarChart2, 
  FileText, 
  PlusCircle, 
  User, 
  LogOut, 
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If a regular user tries to access the root /dashboard, send them to their profile or proposals
    if (!loading && user && user.role !== 'admin' && pathname === '/dashboard') {
      router.push('/dashboard/proposals');
    }

    // If an admin tries to access user-specific pages, send them back to admin dashboard
    if (!loading && user && user.role === 'admin' && (pathname === '/dashboard/proposals' || pathname.startsWith('/dashboard/proposals/new'))) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-medium">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { label: 'Analytics Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', href: '/dashboard/users', icon: ShieldCheck },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Header */}
      <Header />

      <div className="flex flex-1 pt-12">
        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
