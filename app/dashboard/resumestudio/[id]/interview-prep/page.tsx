'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, BrainCircuit, Loader2, AlertCircle, Zap, Sparkles, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getResumeByIdApi, generateInterviewPrepApi, ResumeRecord } from '@/lib/resumeStudio.api';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

type PrepModel = 'pitchdown-fast' | 'pitchdown-pro' | 'pitchdown-premium-lite';

const MODELS: { id: PrepModel; label: string; tag: string; credits: number; desc: string }[] = [
  { id: 'pitchdown-fast',         label: 'PitchDown Fast',         tag: 'Fastest',  credits: 1, desc: 'DeepSeek Chat — quick, solid prep report. Best for most roles.' },
  { id: 'pitchdown-pro',          label: 'PitchDown Pro',          tag: 'Deepest',  credits: 2, desc: 'DeepSeek R1 reasoning — deeper analysis and sharper answers.' },
  { id: 'pitchdown-premium-lite', label: 'PitchDown Premium Lite', tag: 'Balanced', credits: 5, desc: 'Claude Haiku — sharp, concise, well-structured report.' },
];

// ── Generating overlay ────────────────────────
function GeneratingOverlay({ model }: { model: PrepModel }) {
  const steps = [
    'Reading your resume...',
    'Analyzing job description...',
    'Mapping interview rounds...',
    'Drafting round-by-round Q&A...',
    'Building story bank...',
    'Finalizing prep report...',
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => Math.min(i + 1, steps.length - 1)), 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08)_0%,transparent_70%)]" />
      <div className="relative z-10 flex flex-col items-center gap-10 max-w-lg w-full px-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center shadow-[0_0_60px_-12px_rgba(20,184,166,0.4)]">
          <motion.div animate={{ scale: [1,1.1,1], rotate: [0,5,-5,0] }} transition={{ duration: 3, repeat: Infinity }}>
            <BrainCircuit className="w-12 h-12 text-teal-400" />
          </motion.div>
        </div>
        <div className="space-y-4 w-full">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Generating Prep Report</h3>
          <AnimatePresence mode="wait">
            <motion.p key={idx} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
              className="text-sm font-bold text-teal-400 uppercase tracking-widest">
              {steps[idx]}
            </motion.p>
          </AnimatePresence>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 border border-zinc-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 bg-[length:200%_100%]"
              animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: `${((idx + 1) / steps.length) * 95}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 font-medium">
            {model === 'pitchdown-pro' ? 'Est. 2–3 min with reasoning model' : 'Est. 45–90 seconds'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Markdown Renderer ─────────────────────────
function MarkdownReport({ md }: { md: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:font-black prose-headings:tracking-tight
      prose-h1:text-2xl prose-h1:text-white prose-h1:border-b prose-h1:border-zinc-800 prose-h1:pb-3
      prose-h2:text-lg prose-h2:text-white prose-h2:mt-8 prose-h2:mb-3
      prose-h3:text-base prose-h3:text-teal-400 prose-h3:mt-6 prose-h3:mb-2
      prose-h4:text-sm prose-h4:text-zinc-300 prose-h4:mt-4 prose-h4:mb-1
      prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-sm
      prose-strong:text-white prose-strong:font-bold
      prose-code:text-teal-400 prose-code:bg-teal-500/10 prose-code:rounded prose-code:px-1
      prose-blockquote:border-l-teal-500 prose-blockquote:bg-teal-500/5 prose-blockquote:rounded-r-xl
      prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic
      prose-blockquote:text-zinc-300 prose-blockquote:text-sm prose-blockquote:leading-relaxed
      prose-ul:text-zinc-400 prose-li:text-zinc-400 prose-li:text-sm
      prose-ol:text-zinc-400
      prose-table:text-xs prose-th:text-zinc-400 prose-th:font-bold prose-td:text-zinc-400
      prose-hr:border-zinc-800
      [&_blockquote_p]:m-0 [&_blockquote_strong]:text-teal-300
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {md}
      </ReactMarkdown>
    </div>
  );
}

// ── Main Page ─────────────────────────────────
export default function InterviewPrepPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const userCredits = user?.credits ?? 0;
  const isSuperPro = user?.plan === 'superpro';
  const availableModels = MODELS.filter(m => m.id !== 'pitchdown-premium-lite' || isSuperPro);

  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<PrepModel>('pitchdown-fast');

  const fetchRecord = useCallback(async () => {
    try {
      const data = await getResumeByIdApi(id);
      setRecord(data);
    } catch {
      setError('Project not found or you do not have access.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
    api.get('/profile').then(r => setProfileData(r.data.data)).catch(() => {});
  }, [fetchRecord]);

  const hasPrep = !!record?.interviewPrep?.reportMd;
  // Old format or missing reportMd — treat as needing (re)generation
  const needsGeneration = !hasPrep;
  const isRegeneration = needsGeneration && record?.interviewPrepStatus === 'SUCCESS';
  const creditCost = selectedModel === 'pitchdown-premium-lite' ? 5 : selectedModel === 'pitchdown-pro' ? 2 : 1;

  const handleGenerate = async (regenerate = false) => {
    if (!record) return;
    if (userCredits < creditCost) {
      setError(`You need ${creditCost} credits for this model.`);
      return;
    }
    if (regenerate) setIsRegenerating(true);
    else setIsGenerating(true);
    setError(null);
    try {
      const resumeText = profileData?.resume?.rawText;
      const data = await generateInterviewPrepApi(id, resumeText, selectedModel, regenerate);
      setRecord(data);
      setShowRegeneratePanel(false);
      refreshUser();
    } catch (err: any) {
      if (err?.response?.status === 402) {
        setError('Insufficient credits. Please top up your balance.');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Failed to generate prep report.');
      }
    } finally {
      setIsGenerating(false);
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = () => setShowRegeneratePanel(p => !p);

  // ── Loading ──────────────────────────────────
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

      {isGenerating && <GeneratingOverlay model={selectedModel} />}
      {isRegenerating && <GeneratingOverlay model={selectedModel} />}

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8">

        {/* Back */}
        <Link href={`/dashboard/resumestudio/${id}`}
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Project
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
          <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 shrink-0">
            <BrainCircuit className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Interview Prep</h1>
            <p className="text-sm text-zinc-500 mt-1">
              AI-generated prep report for <span className="text-zinc-400">{record.profileType}</span>
              {record.interviewPrep?.model && (
                <span className="ml-2 text-[10px] font-black text-teal-500 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {record.interviewPrep.model}
                </span>
              )}
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

        {/* Old format / stale data — prompt to regenerate */}

        {/* Not yet generated — model selector + generate button */}
        {needsGeneration && !isGenerating && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Model selector */}
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Choose AI Model</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableModels.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={cn(
                      'p-4 rounded-2xl border text-left transition-all space-y-2',
                      selectedModel === m.id
                        ? 'border-teal-500/40 bg-teal-500/5 shadow-lg shadow-teal-500/10'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{m.label}</span>
                      <span className="text-[10px] font-black text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{m.tag}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-snug">{m.desc}</p>
                    <p className={cn('text-xs font-bold', userCredits >= m.credits ? 'text-teal-400' : 'text-red-400')}>
                      🪙 {m.credits} credit{m.credits > 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20">
                <BrainCircuit className="w-10 h-10 text-teal-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-white">No Prep Report Yet</p>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Generate your personalised interview intelligence — round-by-round Q&amp;A with answers, story bank, and company signals.
                </p>
              </div>
              <button
                onClick={() => handleGenerate(isRegeneration)}
                disabled={userCredits < creditCost}
                className={cn(
                  'flex items-center gap-3 px-8 py-4 text-sm font-black rounded-xl uppercase tracking-wide transition-all shadow-lg',
                  userCredits >= creditCost
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-teal-500/20 hover:brightness-110'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                )}
              >
                <Zap className="w-5 h-5" />
                {userCredits >= creditCost
                  ? `${isRegeneration ? 'Regenerate' : 'Generate'} Prep Report (${creditCost} credit${creditCost > 1 ? 's' : ''})`
                  : `Need ${creditCost} Credit${creditCost > 1 ? 's' : ''}`}
              </button>
            </div>
          </motion.div>
        )}

        {/* Report — rendered markdown */}
        {hasPrep && record.interviewPrep?.reportMd && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Regenerate button */}
            <div className="flex justify-end">
              <button
                onClick={handleRegenerate}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 rounded-xl transition-all"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', showRegeneratePanel && 'text-teal-400')} />
                Regenerate
              </button>
            </div>

            {/* Regenerate panel */}
            <AnimatePresence>
              {showRegeneratePanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-4">
                    <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      ⚠ Regenerating will replace your current report and cost credits
                    </p>

                    {/* Model selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {availableModels.map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          className={cn(
                            'p-3 rounded-xl border text-left transition-all space-y-1',
                            selectedModel === m.id
                              ? 'border-teal-500/40 bg-teal-500/5'
                              : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{m.label}</span>
                            <span className="text-[9px] font-black text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{m.tag}</span>
                          </div>
                          <p className={cn('text-[10px] font-bold', userCredits >= m.credits ? 'text-teal-400' : 'text-red-400')}>
                            🪙 {m.credits} credit{m.credits > 1 ? 's' : ''}
                          </p>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleGenerate(true)}
                        disabled={userCredits < creditCost}
                        className={cn(
                          'flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl uppercase tracking-wide transition-all',
                          userCredits >= creditCost
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:brightness-110'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                        )}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Confirm Regenerate ({creditCost} credit{creditCost > 1 ? 's' : ''})
                      </button>
                      <button
                        onClick={() => setShowRegeneratePanel(false)}
                        className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-[#0e0e10] border border-zinc-800/60 rounded-2xl p-8 shadow-2xl">
              <MarkdownReport md={record.interviewPrep.reportMd} />
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Sparkles className="w-3 h-3 text-teal-500" />
          <p className="text-xs text-zinc-600 font-medium">
            Generated by PitchDown AI · Based on your resume and job description
          </p>
        </div>
      </div>
    </div>
  );
}
