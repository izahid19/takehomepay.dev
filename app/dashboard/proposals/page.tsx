'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle, Trash2, ArrowRight, Sparkles, Clock, LayoutGrid, List, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { proposalModeLabels } from '@/types/proposal';
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

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProposals = async () => {
    try {
      const response = await api.get('/proposals');
      setProposals(response.data.data);
    } catch (err) {
      console.error('Failed to fetch proposals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      console.log('Attempting to delete proposal:', deleteId);
      const response = await api.delete(`/proposals/${deleteId}`);
      if (response.status === 204 || response.data?.status === 'success') {
        setProposals((prev) => prev.filter((p: any) => p._id !== deleteId));
        toast.success('Proposal deleted successfully');
        setDeleteId(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete proposal');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to strip markdown for preview
  const getCleanSnippet = (text: string) => {
    return text
      .replace(/[#*`_~]/g, '') // Remove common markdown chars
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="h-10 bg-zinc-900 w-64 rounded-xl" />
            <div className="h-4 bg-zinc-900 w-48 rounded-lg" />
          </div>
          <div className="h-12 bg-zinc-900 w-40 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl border border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full space-y-10 pb-20">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
            My Proposals
          </h1>
          <p className="text-zinc-500 font-medium">
            Manage and view your generated proposal intelligence.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl backdrop-blur-sm">
            <button 
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-zinc-800 text-emerald-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Card View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-zinc-800 text-emerald-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Table View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <Button asChild className="h-12 px-6 bg-gradient-to-r from-[#2DD4BF] to-[#10B981] hover:brightness-105 active:scale-95 text-black font-extrabold border-none shadow-lg shadow-emerald-500/20 rounded-xl transition-all">
            <Link href="/dashboard/proposals/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Proposal
            </Link>
          </Button>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="relative z-10 bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center text-center backdrop-blur-sm">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">No proposals yet</h3>
          <p className="text-zinc-500 max-w-sm mt-3 font-medium leading-relaxed">
            Your high-converting AI proposals will appear here once generated.
          </p>
          <Button asChild className="mt-8 h-12 px-8 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl border border-zinc-700 transition-all">
            <Link href="/dashboard/proposals/new">Create First Proposal</Link>
          </Button>
        </div>
      ) : viewMode === 'card' ? (
        <div className="relative z-10 grid gap-6 md:grid-cols-2">
          {proposals.map((proposal: any) => (
            <div 
              key={proposal._id} 
              className="group relative bg-[#09090b] border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1"
            >
              {/* Card Accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/40 transition-all duration-500" />
              
              <div className="p-7 space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white line-clamp-1 leading-tight group-hover:text-emerald-400 transition-colors">
                      {proposal.projectInput.title}
                    </h3>
                    <div className="flex items-center gap-3 text-zinc-500">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        {format(new Date(proposal.createdAt), 'MMM d, yyyy')}
                      </div>
                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                      <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
                        {proposalModeLabels[proposal.mode as keyof typeof proposalModeLabels] || proposal.mode}
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500 shadow-inner">
                    {proposal.projectInput.length}
                  </div>
                </div>

                <div className="relative">
                  <p className="text-[15px] text-zinc-400 leading-relaxed font-medium line-clamp-3">
                    {getCleanSnippet(proposal.generatedText)}
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#09090b]/40 pointer-events-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all group/btn" 
                    asChild
                  >
                    <Link href={`/dashboard/proposals/${proposal._id}`}>
                      View Intelligence
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteId(proposal._id);
                    }} 
                    className="relative z-20 h-11 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold flex items-center gap-2 shadow-lg shadow-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>

              {/* Sparkle background element on hover */}
              <div className="absolute bottom-[-10px] right-[-10px] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Sparkles className="w-24 h-24 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="relative z-10 bg-[#09090b] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/50 border-b border-zinc-800/80">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Project Title</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Mode</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Length</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Created</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {proposals.map((proposal: any) => (
                  <tr key={proposal._id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <Link 
                        href={`/dashboard/proposals/${proposal._id}`}
                        className="text-[15px] font-bold text-white hover:text-emerald-400 transition-colors line-clamp-1"
                      >
                        {proposal.projectInput.title}
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        {proposalModeLabels[proposal.mode as keyof typeof proposalModeLabels] || proposal.mode}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500">
                        {proposal.projectInput.length}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-600" />
                        {format(new Date(proposal.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="h-8 px-3 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg group/btn"
                        >
                          <Link href={`/dashboard/proposals/${proposal._id}`}>
                            View Intelligence
                            <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteId(proposal._id);
                          }} 
                          className="relative z-10 h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-bold flex items-center gap-2 shadow-sm shadow-red-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#0c0c0e] border-zinc-800 shadow-2xl rounded-2xl max-w-[400px]">
          <AlertDialogHeader className="space-y-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto sm:mx-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-xl font-bold text-white">
                Delete Proposal?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400 font-medium leading-relaxed">
                This action cannot be undone. This will permanently delete the generated proposal and release its associated resources.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-row gap-3">
            <AlertDialogCancel className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold border-zinc-800 hover:border-zinc-700 m-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="flex-1 h-11 bg-red-600 hover:bg-red-500 text-white font-bold border-none transition-all active:scale-95"
            >
              {isDeleting ? 'Deleting...' : 'Delete Proposal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
