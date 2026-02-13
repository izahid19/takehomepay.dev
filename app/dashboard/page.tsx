'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheck, Users, Zap, FileText, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.push('/dashboard/profile');
    }
  }, [user, loading, router]);

  if (loading || user?.role !== 'admin') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
             <ShieldCheck className="w-10 h-10 text-primary" />
             Admin Console
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            System-wide overview and user management control center.
          </p>
        </div>
        <Button asChild size="lg" className="font-bold shadow-xl shadow-primary/20">
          <Link href="/admin">
            Manage All Users
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card/40 border-border group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Action</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">User Credits</div>
            <p className="text-xs text-muted-foreground mt-1">Manual credit updates & overrides</p>
            <Button variant="ghost" size="sm" className="mt-4 text-primary p-0" asChild>
              <Link href="/admin">Manage →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Revenue</CardTitle>
            <Zap className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">Subscribers</div>
            <p className="text-xs text-muted-foreground mt-1">Free vs Pro distribution</p>
            <Button variant="ghost" size="sm" className="mt-4 text-primary p-0" asChild>
              <Link href="/admin">View List →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border group hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Content</CardTitle>
            <FileText className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">All Proposals</div>
            <p className="text-xs text-muted-foreground mt-1">Monitor system generation health</p>
            <Button variant="ghost" size="sm" className="mt-4 text-primary p-0" asChild>
              <Link href="/dashboard/proposals">Audit logs →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
         <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <ShieldCheck className="w-10 h-10 text-primary" />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">Admin Privileges Active</h2>
            <p className="text-muted-foreground mt-1">
               You are logged in with administrative access. You can override user credits, change subscription plans, and view all generated content across the platform.
            </p>
         </div>
         <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" asChild>
            <Link href="/admin">Launch User Manager</Link>
         </Button>
      </div>
    </div>
  );
}
