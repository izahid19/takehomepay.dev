'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Linkedin, Copy, Check, Zap, RefreshCw,
  Loader2, AlertCircle, Sparkles, UserCheck, Briefcase, Users, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getResumeByIdApi, generateOutreachApi,
  ResumeRecord, OutreachMessage, ContactType,
} from '@/lib/resumeStudio.api';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

// ── Contact type config ────────────────────────
const CONTACT_TYPES: {
  id: ContactType;
  label: string;
  icon: React.ElementType;
  color: string;
  border: string;
  bg: string;
  desc: string;
}[] = [
  {
    id: 'recruiter',
    label: 'Recruiter',
    icon: UserCheck,
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    desc: 'Fit + proof + CV offer',
  },
  {
    id: 'hiring_manager',
    label: 'Hiring Manager',
    icon: Briefcase,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    desc: 'Hook with their challenge + your proof',
  },
  {
    id: 'peer',
    label: 'Peer / Team Member',
    icon: Users,
    color: 'text-teal-400',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/5',
    desc: 'Build rapport — no job ask',
  },
  {
    id: 'interviewer',
    label: 'Interviewer',
    icon: MessageSquare,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    desc: 'Pre-interview — show you prepared',
  },
];

// ── Char counter bar ──────────────────────────
function CharBar({ count }: { count: number }) {
  const pct = Math.min((count / 300) * 100, 100);
  const color = count > 300 ? 'bg-red-500' : count > 260 ? 'bg-amber-500' : 'bg-teal-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn('text-[10px] font-bold tabular-nums', count > 300 ? 'text-red-400' : 'text-zinc-500')}>
        {count}/300
      </span>
    </div>
  );
}

// ── Message card ──────────────────────────────
function MessageCard({ msg }: { msg: OutreachMessage }) {
  const [copied, setCopied] = useState(false);
  const type = CONTACT_TYPES.find(t => t.id === msg.contactType)!;
  const Icon = type?.icon ?? Linkedin;

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl border p-5 space-y-4', type?.border ?? 'border-zinc-800', type?.bg ?? '')}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', type?.color ?? 'text-zinc-400')} />
          <span className="text-sm font-bold text-white">{type?.label}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700"
        >
          {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Message */}
      <div className="bg-black/30 rounded-xl p-4 border border-zinc-800">
        <p className="text-sm text-zinc-200 leading-relaxed font-medium">{msg.message}</p>
      </div>

      {/* Char count */}
      <CharBar count={msg.message.length} />

      {/* Reasoning */}
      {msg.reasoning && (
        <p className="text-[11px] text-zinc-500 italic leading-relaxed">
          💡 {msg.reasoning}
        </p>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────
export default function OutreachPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const userCredits = user?.credits ?? 0;

  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedTypes, setSelectedTypes] = useState<ContactType[]>(['recruiter', 'hiring_manager', 'peer']);
  const [interviewDate, setInterviewDate] = useState('');
  const [showRegenPanel, setShowRegenPanel] = useState(false);

  const CREDIT_COST = 1;

  const fetchRecord = useCallback(async () => {
    try {
      const data = await getResumeByIdApi(id);
      setRecord(data);
    } catch {
      setError('Project not found.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
    api.get('/profile').then(r => setProfileData(r.data.data)).catch(() => {});
  }, [fetchRecord]);

  const toggleType = (type: ContactType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async (regenerate = false) => {
    if (selectedTypes.length === 0) {
      setError('Select at least one contact type.');
      return;
    }
    if (userCredits < CREDIT_COST) {
      setError('Insufficient credits.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const resumeText = profileData?.resume?.rawText;
      const date = selectedTypes.includes('interviewer') ? interviewDate || undefined : undefined;
      const data = await generateOutreachApi(id, selectedTypes, date, regenerate, resumeText);
      setRecord(data);
      setShowRegenPanel(false);
      refreshUser();
    } catch (err: any) {
      if (err?.response?.status === 402) {
        setError('Insufficient credits.');
      } else {
        setError(err?.response?.data?.message || 'Failed to generate messages.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const hasMessages = (record?.linkedinOutreach?.messages?.length ?? 0) > 0;

  if (isLoading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
    </div>
  );

  if (!record) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-white font-bold">Project not found</p>
      <Link href="/dashboard/resumestudio" className="text-sm text-teal-400 hover:underline">← Back to Resume Studio</Link>
    </div>
  );

  return (
    <div className="relative pb-12">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8">

        {/* Back */}
        <Link href={`/dashboard/resumestudio/${id}`}
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Project
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shrink-0">
            <Linkedin className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">LinkedIn Outreach</h1>
            <p className="text-sm text-zinc-500 mt-1">
              3-sentence messages ≤300 chars — tailored per contact type
            </p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Generate UI */}
        {!hasMessages && !isGenerating && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Contact type selector */}
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Who do you want to reach?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CONTACT_TYPES.map(t => {
                  const Icon = t.icon;
                  const selected = selectedTypes.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleType(t.id)}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all space-y-2',
                        selected ? `${t.border} ${t.bg}` : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      )}
                    >
                      <Icon className={cn('w-5 h-5', selected ? t.color : 'text-zinc-600')} />
                      <p className="text-xs font-bold text-white leading-snug">{t.label}</p>
                      <p className="text-[10px] text-zinc-500 leading-snug">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interview date (if interviewer selected) */}
            {selectedTypes.includes('interviewer') && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Interview Date (optional)</p>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            )}

            {/* Generate button */}
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                <Linkedin className="w-10 h-10 text-blue-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-white">Ready to reach out</p>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Generate personalised LinkedIn messages for each selected contact type. Max 300 characters each.
                </p>
              </div>
              <button
                onClick={() => handleGenerate(false)}
                disabled={userCredits < CREDIT_COST || selectedTypes.length === 0}
                className={cn(
                  'flex items-center gap-3 px-8 py-4 text-sm font-black rounded-xl uppercase tracking-wide transition-all shadow-lg',
                  userCredits >= CREDIT_COST && selectedTypes.length > 0
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/20 hover:brightness-110'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                )}
              >
                <Zap className="w-5 h-5" />
                Generate Messages (1 credit)
              </button>
            </div>
          </motion.div>
        )}

        {/* Generating state */}
        {isGenerating && (
          <div className="flex flex-col items-center gap-6 py-16">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Linkedin className="w-10 h-10 text-blue-400" />
              </motion.div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">Crafting your messages...</p>
              <p className="text-sm text-zinc-500 mt-1">Applying the 3-sentence framework per contact type</p>
            </div>
            <div className="w-48 bg-zinc-900 rounded-full h-1 border border-zinc-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}

        {/* Messages */}
        {hasMessages && !isGenerating && (
          <div className="space-y-4">
            {/* Regenerate header */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">
                {record!.linkedinOutreach!.messages.length} Message{record!.linkedinOutreach!.messages.length > 1 ? 's' : ''} Generated
              </p>
              <button
                onClick={() => setShowRegenPanel(p => !p)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 rounded-xl transition-all"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', showRegenPanel && 'text-teal-400')} />
                Regenerate
              </button>
            </div>

            {/* Regenerate panel */}
            <AnimatePresence>
              {showRegenPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Select contact types</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CONTACT_TYPES.map(t => {
                        const Icon = t.icon;
                        const selected = selectedTypes.includes(t.id);
                        return (
                          <button key={t.id} onClick={() => toggleType(t.id)}
                            className={cn('p-3 rounded-xl border text-left transition-all space-y-1',
                              selected ? `${t.border} ${t.bg}` : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                            )}>
                            <Icon className={cn('w-4 h-4', selected ? t.color : 'text-zinc-600')} />
                            <p className="text-[11px] font-bold text-white">{t.label}</p>
                          </button>
                        );
                      })}
                    </div>
                    {selectedTypes.includes('interviewer') && (
                      <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => handleGenerate(true)} disabled={userCredits < CREDIT_COST || selectedTypes.length === 0}
                        className={cn('flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl uppercase tracking-wide transition-all',
                          userCredits >= CREDIT_COST && selectedTypes.length > 0
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:brightness-110'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                        )}>
                        <RefreshCw className="w-3.5 h-3.5" />
                        Confirm Regenerate (1 credit)
                      </button>
                      <button onClick={() => setShowRegenPanel(false)}
                        className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-xl transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {record!.linkedinOutreach!.messages.map((msg, i) => (
                <MessageCard key={i} msg={msg} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <p className="text-xs text-zinc-600 font-medium">
            Based on contacto.md · Max 300 characters per message · Never sends automatically
          </p>
        </div>
      </div>
    </div>
  );
}
