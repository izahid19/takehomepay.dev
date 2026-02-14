'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Zap, 
  ChevronRight,
  Search,
  User as UserIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function UserManagementPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && currentUser?.role !== 'admin') {
      router.push('/dashboard');
    }
    
    fetchUsers();
  }, [currentUser, authLoading, router]);

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

  const handleUserClick = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || (loading && users.length === 0)) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
             <ShieldCheck className="w-10 h-10 text-primary" />
             User Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            System-wide audience control and subscriber management.
          </p>
        </div>
      </div>

      <Card className="bg-card/40 border-border overflow-hidden">
        <CardHeader className="border-b border-zinc-800/50 bg-muted/20 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <CardTitle className="text-xl font-bold">Registered Users</CardTitle>
                <CardDescription>View all platform participants (Click for details)</CardDescription>
             </div>
             <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by email or name..." 
                  className="pl-10 bg-zinc-900/50 border-zinc-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/30 border-b border-zinc-800/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">User</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Plan Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Credits</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Created At</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredUsers.map((u: any) => (
                  <tr 
                    key={u._id} 
                    className="group hover:bg-primary/[0.02] transition-colors cursor-pointer"
                    onClick={() => handleUserClick(u._id)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-primary/50 transition-colors">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white truncate max-w-[200px]">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3" />
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.plan === 'pro' ? 'bg-orange-500/10 text-orange-500' : 
                        u.plan === 'elite' ? 'bg-blue-500/10 text-blue-500' : 
                        'bg-zinc-800 text-zinc-400'
                      }`}>
                        {u.plan}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-white">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        {u.credits}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy, h:mm a') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                  <Search className="w-8 h-8 text-zinc-700" />
               </div>
               <p className="text-muted-foreground font-medium">No users found matching "{searchTerm}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
