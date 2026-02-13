'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ShieldAlert, User, Zap, Mail, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
    
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') fetchUsers();
  }, [user, authLoading, router]);

  const updateCredits = async (userId: string, currentCredits: number) => {
    const newCredits = prompt('Enter new credit balance:', currentCredits.toString());
    if (newCredits === null) return;
    
    setUpdating(userId);
    try {
      await api.patch(`/admin/users/${userId}/credits`, { credits: parseInt(newCredits) });
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (err) {
      alert('Failed to update credits');
    } finally {
      setUpdating(null);
    }
  };

  const togglePlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'free' ? 'pro' : 'free';
    if (!confirm(`Switch user to ${newPlan.toUpperCase()} plan?`)) return;

    setUpdating(userId);
    try {
      await api.patch(`/admin/users/${userId}/plan`, { plan: newPlan });
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (err) {
      alert('Failed to update plan');
    } finally {
      setUpdating(null);
    }
  };

  if (authLoading || loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
           <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
             <ChevronLeft className="w-4 h-4" />
             Back to Dashboard
           </Link>
           <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <ShieldAlert className="text-primary w-8 h-8" />
             Admin Management
           </h1>
           <p className="text-muted-foreground mt-1">
             Manage users, credits, and subscription plans.
           </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-card/40 border-border">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>All users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Credits</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u: any) => (
                    <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground uppercase tracking-tight">{u.email.split('@')[0]}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${u.plan === 'pro' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {u.plan}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-mono font-bold text-base">
                          <Zap className="w-4 h-4 text-primary fill-primary/10" />
                          {u.credits}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {updating === u._id ? (
                          <Loader2 className="animate-spin h-5 w-5 inline" />
                        ) : (
                          <>
                            <Button variant="outline" size="sm" onClick={() => updateCredits(u._id, u.credits)}>
                              Manage Credits
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => togglePlan(u._id, u.plan)}>
                              Convert to {u.plan === 'free' ? 'PRO' : 'FREE'}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
