'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
  Loader2, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Zap, 
  ChevronLeft,
  ShieldCheck,
  FileText,
  Clock,
  ExternalLink,
  Settings2,
  Save,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Form states
  const [editPlan, setEditPlan] = useState('');
  const [editCredits, setEditCredits] = useState(0);

  useEffect(() => {
    if (!authLoading && currentUser?.role !== 'admin') {
      router.push('/dashboard');
    }
    
    fetchUserDetails();
  }, [currentUser, authLoading, router, id]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      const userData = response.data.data;
      setUser(userData);
      setEditPlan(userData.plan);
      setEditCredits(userData.credits);
    } catch (err) {
      console.error('Failed to fetch user details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (ignorePlanCheck = false) => {
    if (!user) return;

    // Check if plan changed to show custom modal instead of native confirm
    if (!ignorePlanCheck && editPlan !== user.plan) {
      setIsConfirmModalOpen(true);
      return;
    }

    setUpdating(true);
    try {
      // Update plan if changed
      if (editPlan !== user.plan) {
        await api.patch(`/admin/users/${id}/plan`, { plan: editPlan });
      } else if (editCredits !== user.credits) {
        // Update credits only if plan didn't change but credits did
        await api.patch(`/admin/users/${id}/credits`, { credits: editCredits });
      }
      
      await fetchUserDetails();
      toast.success('User updated successfully');
      setIsConfirmModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold text-zinc-500">User not found</p>
        <Button asChild>
          <Link href="/dashboard/users">Back to User Management</Link>
        </Button>
      </div>
    );
  }

  const hasChanges = editPlan !== user.plan || editCredits !== user.credits;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-6">
        <Link 
          href="/dashboard/users" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-all group w-fit"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Users
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <UserIcon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-muted-foreground flex items-center gap-2">
                   <Mail className="w-4 h-4" />
                   {user.email}
                </span>
                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  user.plan === 'pro' ? 'bg-orange-500/10 text-orange-500' : 
                  user.plan === 'elite' ? 'bg-blue-500/10 text-blue-500' : 
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {user.plan} Plan
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
               disabled={!hasChanges || updating}
               onClick={() => handleUpdate()}
               className="bg-primary hover:bg-primary/90 text-black font-black px-8 h-12 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
             >
               {updating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
               Save Changes
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Cards */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="bg-card/40 border-border overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Credits Left</span>
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="text-3xl font-black text-white">{user.credits}</div>
                <div className="mt-1 text-xs text-muted-foreground">Available balance</div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proposals</span>
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-3xl font-black text-white">{user.proposalCount || 0}</div>
                <div className="mt-1 text-xs text-muted-foreground">Lifetime generations</div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</span>
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-3xl font-black text-white uppercase tracking-tighter">{user.role}</div>
                <div className="mt-1 text-xs text-muted-foreground">Access privileges</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Account Details */}
             <Card className="bg-card/40 border-border">
                <CardHeader className="border-b border-zinc-800/50 bg-muted/10">
                  <CardTitle className="text-lg font-bold">User Information</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-800/50">
                    <div className="px-6 py-4 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">Full Name</span>
                      <span className="text-sm text-white font-bold">{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="px-6 py-4 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">Email Address</span>
                      <span className="text-sm text-white font-bold">{user.email}</span>
                    </div>
                    <div className="px-6 py-4 flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">Account ID</span>
                      <code className="text-xs text-zinc-500 truncate">{user._id}</code>
                    </div>
                  </div>
                </CardContent>
             </Card>

             {/* Subscription Management */}
             <Card className="bg-zinc-900/40 border-primary/20 shadow-2xl shadow-primary/5">
                <CardHeader className="border-b border-primary/10 bg-primary/5">
                  <div className="flex items-center gap-2">
                     <Settings2 className="w-5 h-5 text-primary" />
                     <CardTitle className="text-lg font-bold text-primary">Manage Subscription</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Subscription Plan</label>
                      <Select value={editPlan} onValueChange={setEditPlan}>
                        <SelectTrigger className="w-full h-12 bg-zinc-950 border-zinc-800 rounded-xl font-bold">
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                          <SelectItem value="free" className="focus:bg-zinc-900 cursor-pointer">FREE (10 Credits)</SelectItem>
                          <SelectItem value="elite" className="focus:bg-zinc-900 cursor-pointer">ELITE (300 Credits)</SelectItem>
                          <SelectItem value="pro" className="focus:bg-zinc-900 cursor-pointer">PRO (1000 Credits)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-tight flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Plan change resets credits to default.
                      </p>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Adjust Credits</label>
                      <div className="relative">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <Input 
                          type="number" 
                          value={editCredits}
                          onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                          className="pl-11 h-12 bg-zinc-950 border-zinc-800 rounded-xl font-black text-base"
                        />
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="bg-card/40 border-border overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-zinc-800/50">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  Account Timeline
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="relative pl-8 border-l-2 border-zinc-800 space-y-8">
                 <div className="relative">
                    <div className="absolute -left-[41px] top-0 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/10" />
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Joined Date</p>
                      <p className="text-sm font-bold text-white mt-1">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A'}
                      </p>
                      <p className="text-xs font-medium text-zinc-500 mt-0.5">
                        {user.createdAt ? format(new Date(user.createdAt), 'h:mm a') : ''}
                      </p>
                    </div>
                 </div>

                 <div className="relative">
                    <div className="absolute -left-[41px] top-0 w-3 h-3 rounded-full bg-zinc-800" />
                    <div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Last Interaction</p>
                      <p className="text-sm font-bold text-white mt-1">
                        {user.updatedAt ? format(new Date(user.updatedAt), 'MMMM d, yyyy') : 'N/A'}
                      </p>
                      <p className="text-xs font-medium text-zinc-500 mt-0.5">
                         System sync update
                      </p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Plan Change Modal */}
      <AlertDialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <AlertDialogContent className="bg-[#0c0c0e] border-zinc-800 shadow-2xl rounded-2xl max-w-[400px]">
          <AlertDialogHeader className="space-y-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto sm:mx-0 border border-amber-500/20">
               <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-xl font-bold text-white">
                Change Subscription Plan?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400 font-medium leading-relaxed">
                Updating to the <span className="text-emerald-400 font-bold">{editPlan.toUpperCase()}</span> plan will reset this user's credits to <span className="text-white font-bold">{editPlan === 'pro' ? '1000' : editPlan === 'elite' ? '300' : '10'}</span>.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-row gap-3">
            <AlertDialogCancel className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold border-zinc-800 hover:border-zinc-700 m-0 rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleUpdate(true);
              }}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-none transition-all active:scale-95 rounded-xl shadow-lg shadow-emerald-500/10"
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
