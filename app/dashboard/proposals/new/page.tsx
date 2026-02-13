'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Wand2, DollarSign, ListTodo, Info, AlertTriangle } from 'lucide-react';
import { CreditModal } from '@/components/CreditModal';
import { ProfileCompletionBar } from '@/components/ProfileCompletionBar';
import { MissingFieldsList, ProfileData } from '@/components/MissingFieldsList';
import Link from 'next/link';
import { ProposalMode, proposalModeLabels } from '@/types/proposal';

import { CurrencySelect } from '@/components/CurrencySelect';
import { CurrencyCode } from '@/lib/utils';

export default function NewProposalPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    clientName: '',
    title: '',
    description: '',
    length: 'medium',
    mode: ProposalMode.DIRECT_CLIENT,
    budget: '',
    currency: 'USD' as CurrencyCode,
    deadline: '',
    instructions: '',
    includeMilestones: false,
    addStructure: true,
    includeQuestions: false,
    useCompetitiveEdge: false,
    useCTA: false
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        setProfileData(response.data.data);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setFetchingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user && user.credits <= 0) {
      setShowCreditModal(true);
      return;
    }

    // Store form data in sessionStorage for the generating page
    const proposalData = {
      mode: formData.mode,
      projectInput: {
        clientName: formData.clientName,
        title: formData.title,
        description: formData.description,
        length: formData.length,
        budget: `${formData.currency} ${formData.budget}`,
        deadline: formData.deadline,
        instructions: formData.instructions,
        includeMilestones: formData.includeMilestones,
        addStructure: formData.addStructure,
        includeQuestions: formData.includeQuestions,
        useCompetitiveEdge: formData.useCompetitiveEdge,
        useCTA: formData.useCTA
      }
    };

    sessionStorage.setItem('proposalFormData', JSON.stringify(proposalData));

    // Immediately redirect to generating page
    router.push('/dashboard/proposals/generating');
  };

  const profileCompletion = profileData?.professionalInfo?.profileCompletion || 0;
  const canGenerateProposal = profileCompletion >= 80;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20">
      {/* Background Pattern from Homepage */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 space-y-6">
        <CreditModal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Generate{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                New Proposal
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Craft a world-class proposal that wins your next project.
            </p>
          </div>
          <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-sm">
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Available Credits</p>
              <p className="text-lg font-bold text-primary">{user?.credits}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive-foreground rounded-xl font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Profile Completion Warning */}
        {!fetchingProfile && !canGenerateProposal && (
          <div className="p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  Complete Your Profile
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  You need at least <strong>80% profile completion</strong> to generate AI proposals. 
                </p>
                <div className="pt-2">
                  <ProfileCompletionBar completion={profileCompletion} size="md" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Proposal Type - Chip Selector */}
          <div className="space-y-3">
            <Label className="text-muted-foreground font-medium">Proposal Type:</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(proposalModeLabels).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFormData({...formData, mode: mode as ProposalMode})}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    formData.mode === mode
                      ? 'bg-gradient-to-r from-[#2DD4BF] to-[#10B981] text-black shadow-[0_0_15px_rgba(45,212,191,0.3)]' 
                      : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-muted-foreground font-medium">Client Name:</Label>
            <Input
              id="clientName"
              placeholder="e.g. Acme Corp or John Doe"
              value={formData.clientName}
              onChange={e => setFormData({...formData, clientName: e.target.value})}
              className="h-12 bg-card/60 border-border hover:border-primary/30 focus-visible:ring-primary/20 text-foreground rounded-xl backdrop-blur-sm transition-all shadow-sm"
            />
          </div>

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-muted-foreground font-medium">Project Title:</Label>
            <Input
              id="title"
              placeholder="Webflow + Airtable Integration Expert - for Top 1% Upwork Partner"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="h-12 bg-card/60 border-border hover:border-primary/30 focus-visible:ring-primary/20 text-foreground rounded-xl backdrop-blur-sm transition-all shadow-sm"
              required
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-muted-foreground font-medium">Project Description:</Label>
            <textarea
              id="description"
              className="flex min-h-[250px] w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-primary/30 backdrop-blur-sm transition-all shadow-sm"
              placeholder="Provide a detailed project description..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          {/* Budget and Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-muted-foreground font-medium">Budget</Label>
              <div className="flex gap-2">
                <div className="w-[120px] shrink-0">
                  <CurrencySelect
                    value={formData.currency}
                    onChange={(val) => setFormData({...formData, currency: val})}
                    label=""
                  />
                </div>
                <Input
                  id="budget"
                  placeholder="2000"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                  className="h-12 bg-card/60 border-border hover:border-primary/30 text-foreground rounded-xl backdrop-blur-sm transition-all flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-muted-foreground font-medium">Deadline</Label>
              <Input
                id="deadline"
                type="text"
                placeholder="dd/mm/yyyy"
                value={formData.deadline}
                onChange={e => setFormData({...formData, deadline: e.target.value})}
                className="h-12 bg-card/60 border-border hover:border-primary/30 text-foreground rounded-xl backdrop-blur-sm transition-all"
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <textarea
              id="instructions"
              placeholder="Special Instructions"
              className="flex min-h-[80px] w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-primary/30 backdrop-blur-sm transition-all shadow-sm"
              value={formData.instructions}
              onChange={e => setFormData({...formData, instructions: e.target.value})}
            />
          </div>

          {/* Upload Documents placeholder to match screenshot */}
          <div className="space-y-2">
            <Label className="text-muted-foreground font-medium">Upload documents</Label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="px-4 py-1.5 bg-secondary/50 border border-border text-xs text-foreground rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all font-medium"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Choose File
                </button>
                <span className="text-xs text-muted-foreground">
                  {selectedFile ? selectedFile.name : 'No file chosen'}
                </span>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic pl-1 uppercase tracking-wider font-bold">PDF only.</p>
            </div>
          </div>

          {/* Detailing Section */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="text-2xl font-serif text-foreground italic flex items-center gap-2">
              Detailing:
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Include Milestones', key: 'includeMilestones' },
                { label: 'Add Structure', key: 'addStructure' },
                { label: 'Include Questions', key: 'includeQuestions' },
                { label: 'Competitive Edge', key: 'useCompetitiveEdge' },
                { label: 'Strong CTA', key: 'useCTA' },
              ].map(toggle => (
                <button
                  key={toggle.key}
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, [toggle.key]: !prev[toggle.key as keyof typeof prev]}))}
                  className={`px-5 py-2 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                    formData[toggle.key as keyof typeof formData] 
                      ? 'bg-[#FFB800] text-black shadow-[0_0_15px_rgba(250,184,0,0.3)]' 
                      : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {toggle.label}
                </button>
              ))}
              {[
                { label: 'Short(max 150 words)', val: 'short' },
                { label: 'Medium(max 200 words)', val: 'medium' },
                { label: 'Long(max 300 words)', val: 'long' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setFormData({...formData, length: opt.val})}
                  className={`px-5 py-2 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                    formData.length === opt.val 
                      ? 'bg-[#FFB800] text-black shadow-[0_0_15px_rgba(250,184,0,0.3)]' 
                      : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-10">
            <div className="flex items-center gap-6">
              <Button
                onClick={handleSubmit}
                disabled={loading || !canGenerateProposal}
                className="h-12 px-10 text-black font-bold tracking-tight rounded-lg bg-gradient-to-r from-[#2DD4BF] to-[#10B981] hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 relative overflow-hidden group border border-emerald-400/20"
              >
                <div className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  )}
                  {loading ? 'WRITING...' : 'WRITE PROPOSAL'}
                </div>
              </Button>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold tracking-[0.15em] flex items-center gap-2">
                  (1 <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> FOR SHORT & MEDIUM, 2 FOR LONG)
                </span>
                <p className="text-[10px] text-zinc-500 italic mt-1 uppercase tracking-widest font-medium">Instant High-Impact Generation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
