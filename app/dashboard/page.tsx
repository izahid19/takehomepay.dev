'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheck, Users, Zap, FileText, ArrowRight, Loader2, TrendingUp, BarChart3, Clock, FileSearch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/analytics');
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') fetchStats();
  }, [user, authLoading, router]);

  if (authLoading || (user?.role === 'admin' && loading)) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Dashboard Hub</h1>
          <p className="text-muted-foreground mt-2 text-lg">Choose a workspace to get started.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/proposals" className="group h-full">
            <Card className="h-full border-border bg-card/40 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 hover:shadow-primary/10 hover:bg-primary/5">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Proposal Section</h3>
                  <p className="text-muted-foreground">Manage, create and track all your AI-generated proposals.</p>
                </div>
                <div className="pt-4 mt-auto">
                  <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                    Open Proposals <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/resumestudio" className="group h-full">
            <Card className="h-full border-border bg-card/40 transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 hover:bg-emerald-500/5">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                  <Users className="w-12 h-12 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Resume Studio</h3>
                  <p className="text-muted-foreground">Build, optimize, and preview your professional resumes.</p>
                </div>
                <div className="pt-4 mt-auto">
                  <span className="inline-flex items-center text-sm font-medium text-emerald-500 group-hover:underline">
                    Open Studio <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analyser" className="group h-full">
            <Card className="h-full border-border bg-card/40 transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:bg-blue-500/5">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="p-5 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                  <FileSearch className="w-12 h-12 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Resume Analyser</h3>
                  <p className="text-muted-foreground">Upload your resume and get a deep AI analysis against any job description.</p>
                </div>
                <div className="pt-4 mt-auto">
                  <span className="inline-flex items-center text-sm font-medium text-blue-400 group-hover:underline">
                    Open Analyser <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
             <ShieldCheck className="w-10 h-10 text-primary" />
             Admin Console
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            System-wide analytics and platform performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="lg" className="font-bold shadow-xl shadow-primary/20 bg-primary text-black hover:bg-primary/90">
            <Link href="/dashboard/users">
              <Users className="mr-2 w-5 h-5" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-card/40 border-border group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Users</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats?.users?.total || 0}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11.5px] font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded uppercase tracking-tighter">
                {stats?.users?.pro || 0} PRO
              </span>
              <span className="text-[11.5px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded uppercase tracking-tighter">
                {stats?.users?.elite || 0} ELITE
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border group hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Proposals</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <FileText className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats?.proposals?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              Lifetime Generations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border group hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active (24h)</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats?.proposals?.recent || 0}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              Proposals today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border group hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Health</CardTitle>
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <BarChart3 className="h-4 w-4 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">99.9%</div>
            <p className="text-xs text-muted-foreground mt-2">API Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart Placeholder */}
      <Card className="bg-card/40 border-border overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Generation Activity</CardTitle>
              <CardDescription>Daily proposal generations (Last 7 days)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               {stats?.proposals?.daily?.map((day: any) => (
                 <div key={day._id} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase">{day._id.split('-').slice(1).join('/')}</span>
                    <div 
                      className="w-8 bg-primary/40 rounded-t-sm transition-all hover:bg-primary" 
                      style={{ height: `${Math.max(day.count * 10, 4)}px` }}
                      title={`${day.count} proposals`}
                    />
                 </div>
               ))}
               {!stats?.proposals?.daily?.length && <p className="text-xs text-muted-foreground italic">No data yet</p>}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-primary/5">
         <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <ShieldCheck className="w-10 h-10 text-primary" />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">Admin Privileges Active</h2>
            <p className="text-muted-foreground mt-1">
               You are logged in with administrative access. You can override user credits, change subscription plans, and view platform metrics.
            </p>
         </div>
         <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" asChild>
            <Link href="/dashboard/users">Launch User Manager</Link>
         </Button>
      </div>
    </div>
  );
}

