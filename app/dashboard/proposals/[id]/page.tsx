'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Check, Download, FileText, Sparkles, PenLine, Save, X, Loader2 } from 'lucide-react';
import { proposalModeLabels } from '@/types/proposal';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

import Link from 'next/link';

export default function ViewProposalPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await api.get(`/proposals/${params.id}`);
        setProposal(response.data.data);
        setEditedText(response.data.data.generatedText);
      } catch (err) {
        console.error('Failed to fetch proposal', err);
        router.push('/dashboard/proposals');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchProposal();
  }, [params.id, router]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal.generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.patch(`/proposals/${params.id}`, {
        generatedText: editedText
      });
      setProposal(response.data.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save proposal', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-muted-foreground animate-pulse font-medium tracking-widest uppercase text-xs">Loading Proposal...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-zinc-300 pb-20 selection:bg-[#FFB800]/30">
      <div className="max-w-6xl mx-auto px-6 pt-10 space-y-12">
        {/* Back Button */}
        <Link 
          href="/dashboard/proposals" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-all group text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Proposals
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
                {proposal.projectInput.title}
              </h1>
              <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] text-[11px] font-bold rounded-md border border-[#10B981]/20 uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps Section */}
        <div className="flex justify-between items-center text-[13px] text-zinc-500 font-medium">
          <div>
            <p className="uppercase tracking-[0.1em] mb-1">Created At:</p>
            <p className="text-zinc-400">{format(new Date(proposal.createdAt), 'M/d/yyyy, h:mm:ss a')}</p>
          </div>
          <div className="text-right">
            <p className="uppercase tracking-[0.1em] mb-1">Updated At:</p>
            <p className="text-zinc-400">{format(new Date(proposal.updatedAt), 'M/d/yyyy, h:mm:ss a')}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-3">
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-[#FFB800] hover:bg-[#E6A600] text-black font-bold rounded-md px-5 h-11 transition-all active:scale-95 shadow-lg shadow-[#FFB800]/10"
              >
                <PenLine className="w-4 h-4 mr-2" />
                Edit Proposal
              </Button>
            )}
            <Button 
              className="bg-[#D97706] hover:bg-[#C26A05] text-white font-bold rounded-md px-5 h-11 transition-all active:scale-95 shadow-lg shadow-[#D97706]/10"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
          
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-bold group"
          >
            {copied ? 'Copied to clipboard' : 'Copy to Clipboard'}
            {copied ? <Check className="w-4 h-4 text-[#FFB800]" /> : <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />}
          </button>
        </div>

        {/* Main Proposal Content */}
        <div className="bg-[#111111] rounded-xl border border-zinc-800/50 min-h-[500px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFB800]/0 via-[#FFB800]/20 to-[#FFB800]/0 opacity-50" />
          
          <div className="p-12 pb-8">
            {isEditing ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full min-h-[500px] bg-transparent text-zinc-300 font-medium text-lg leading-relaxed focus:outline-none resize-none"
                placeholder="Edit your proposal here..."
              />
            ) : (
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-white prose-li:text-zinc-300 prose-ul:text-zinc-300 prose-ol:text-zinc-300 prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-hr:border-zinc-800">
                <ReactMarkdown>{proposal.generatedText}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Inline Editor Footer */}
          {isEditing && (
            <div className="border-t border-zinc-900 bg-zinc-900/30 px-12 py-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                {editedText !== proposal.generatedText ? (
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Sparkles className="w-3 h-3" />
                    Changes detected
                  </div>
                ) : (
                  "No changes made"
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedText(proposal.generatedText);
                  }}
                  disabled={saving}
                  variant="outline"
                  className="bg-transparent border-zinc-800 text-zinc-400 hover:bg-black transition-all font-bold h-10 px-6 rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving || editedText === proposal.generatedText}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-zinc-700 text-white font-bold h-10 px-6 rounded-lg transition-all shadow-lg shadow-emerald-600/10"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Mode & Details Footer */}
        <div className="flex items-center gap-6 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-1">Type</span>
            <span className="text-sm font-bold text-zinc-400 capitalize">
              {proposalModeLabels[proposal.mode as keyof typeof proposalModeLabels] || proposal.mode}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-zinc-900" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-1">Length</span>
            <span className="text-sm font-bold text-zinc-400 capitalize">{proposal.projectInput.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
