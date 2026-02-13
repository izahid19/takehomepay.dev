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
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-medium">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { label: 'Admin Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', href: '/admin', icon: ShieldCheck },
    { label: 'System Proposals', href: '/dashboard/proposals', icon: FileText },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Header */}
      <Header />

      <div className="flex flex-1 pt-12">
        {/* Sidebar - ONLY FOR ADMINS */}
        {isAdmin && (
          <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-sm flex-col hidden md:flex sticky top-20 h-[calc(100vh-5rem)]">
            <div className="p-6">
              <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-primary/70">
                Admin Console
              </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    pathname === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5",
                    pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 mt-auto border-t border-border">
              <button 
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-y-auto min-h-screen",
          isAdmin ? "md:pl-0" : "w-full"
        )}>
          <div className="p-4 md:p-8 max-w-7xl mx-auto pt-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
