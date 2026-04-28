'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileSearch, FileText, Briefcase, Upload, X,
  Sparkles, Zap, Cpu, Coins, AlertCircle, Loader2, ChevronRight,
  CheckCircle2, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createAnalysisApi, AnalyserModel } from '@/lib/resumeAnalyser.api';
import { useAuth } from '@/hooks/useAuth';

const MAX_JD = 10_000;

// ─── Model options ────────────────────────────────────────────────────────────
const MODEL_OPTIONS: {
  id: AnalyserModel;
  name: string;
  label: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  borderColor: string;
  gradient: string;
  time: string;
  credits: number;
}[] = [
  {
    id: 'pitchdown-pro',
    name: 'PitchDown Pro',
    label: 'Deep Reasoning',
    description: 'Slow but thorough. Applies deep strategic logic to deliver the most accurate and comprehensive ATS analysis.',
    badge: 'Best Quality',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
    borderColor: 'border-emerald-500/30',
    gradient: 'from-emerald-500/10 to-teal-500/5',
    time: '~60s',
    credits: 2,
  },
  {
    id: 'pitchdown-fast',
    name: 'PitchDown Fast',
    label: 'Standard V3',
    description: 'Powerful and balanced. High-performance model with significantly faster response times.',
    badge: 'Balanced',
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    icon: <Zap className="w-6 h-6 text-violet-400" />,
    borderColor: 'border-violet-500/30',
    gradient: 'from-violet-500/10 to-purple-500/5',
    time: '~30s',
    credits: 1,
  },
  {
    id: 'pitchdown-premium-lite',
    name: 'PitchDown Premium Lite',
    label: 'Fast & Smart',
    description: 'Blazing-quick resume analysis with high accuracy — great for rapid feedback.',
    badge: 'Fastest',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    icon: <Cpu className="w-6 h-6 text-sky-400" />,
    borderColor: 'border-sky-500/30',
    gradient: 'from-sky-500/10 to-cyan-500/5',
    time: '~20s',
    credits: 5,
  },
];

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepDot = ({ active, done, label }: { active: boolean; done: boolean; label: string }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className={cn(
      'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
      done  ? 'bg-blue-500 border-blue-500' :
      active ? 'bg-blue-500/20 border-blue-500' :
      'bg-zinc-900 border-zinc-700'
    )}>
      {done
        ? <CheckCircle2 className="w-4 h-4 text-white" />
        : <span className={cn('text-xs font-black', active ? 'text-blue-400' : 'text-zinc-600')}>
            {active ? '•' : ''}
          </span>
      }
    </div>
    <span className={cn('text-[10px] font-bold uppercase tracking-wider', active || done ? 'text-zinc-300' : 'text-zinc-600')}>
      {label}
    </span>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewAnalysisPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userCredits = user?.credits ?? 0;
  const userPlan    = user?.plan;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 — Details
  const [title,          setTitle]          = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile,     setResumeFile]     = useState<File | null>(null);
  const [hasEditedTitle, setHasEditedTitle] = useState(false);

  // Step 2 — Model
  const [selectedModel,  setSelectedModel]  = useState<AnalyserModel>('pitchdown-pro');

  // Step 3 — Running
  const [step,      setStep]      = useState<1 | 2 | 3>(1);
  const [isRunning, setIsRunning] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const jdLength   = jobDescription.length;
  const step1Valid = title.trim().length > 0 && jdLength >= 50 && jdLength <= MAX_JD && !!resumeFile;

  const filteredModels = MODEL_OPTIONS.filter(opt => {
    if (opt.id === 'pitchdown-premium-lite') return userPlan === 'superpro';
    return true;
  });

  const selectedModelObj   = filteredModels.find(m => m.id === selectedModel) ?? filteredModels[0];
  const canAffordSelected  = userCredits >= (selectedModelObj?.credits ?? 2);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return;
    }
    setError(null);
    setResumeFile(f);
    if (!hasEditedTitle && title === '') {
      setTitle(f.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '));
    }
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange({ target: { files: [f] } } as any);
  };

  const handleRunAnalysis = async () => {
    if (!resumeFile || !canAffordSelected) return;
    setIsRunning(true);
    setError(null);
    setStep(3);
    try {
      const record = await createAnalysisApi({
        title: title.trim(),
        jobDescription: jobDescription.trim(),
        model: selectedModel,
        resumeFile,
      });
      router.push(`/dashboard/analyser/${record._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Analysis failed. Please try again.');
      setIsRunning(false);
      setStep(2);
    }
  };

  return (
    <div className="relative min-h-full space-y-8 pb-20">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 space-y-8">

        {/* Back link */}
        <Link
          href="/dashboard/analyser"
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Analyses
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <FileSearch className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">New Analysis</h1>
              <p className="text-zinc-500 text-sm font-medium mt-0.5">
                Upload your resume + paste a job description to get an AI-powered match report.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          <StepDot active={step === 1} done={step > 1} label="Details" />
          <div className="flex-1 h-px bg-zinc-800" />
          <StepDot active={step === 2} done={step > 2} label="Model" />
          <div className="flex-1 h-px bg-zinc-800" />
          <StepDot active={step === 3} done={false} label="Analysing" />
        </div>

        {/* ═══ STEP 1 — Details ═══════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="space-y-6"
            >
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <FileText className="w-4 h-4 text-zinc-500" /> Analysis Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setHasEditedTitle(true); }}
                  placeholder="e.g. Senior Frontend Dev @ Stripe"
                  maxLength={100}
                  className={cn(
                    'w-full bg-zinc-900/80 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all',
                    title.trim() ? 'border-zinc-700' : 'border-zinc-800'
                  )}
                />
                <p className="text-xs text-zinc-600 font-medium">Name this analysis so you can find it later.</p>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                    <Briefcase className="w-4 h-4 text-zinc-500" /> Target Job Description
                  </span>
                  <span className={cn(
                    'text-xs font-mono font-medium transition-colors',
                    jdLength > MAX_JD ? 'text-red-400' :
                    jdLength > MAX_JD * 0.85 ? 'text-amber-400' : 'text-zinc-600'
                  )}>
                    {jdLength} / {MAX_JD}
                  </span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    const val = e.target.value;
                    setJobDescription(val);
                    if (!hasEditedTitle && title === '') {
                      const lines = val.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                      if (lines.length > 0) {
                        let t = lines[0];
                        if (t.length > 50) t = t.substring(0, 50) + '...';
                        setTitle(t);
                      }
                    }
                  }}
                  placeholder="Paste the full job description here..."
                  rows={10}
                  maxLength={MAX_JD}
                  className={cn(
                    'w-full bg-zinc-900/80 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all',
                    'resize-none leading-relaxed',
                    jdLength > MAX_JD ? 'border-red-500/50' : 'border-zinc-800'
                  )}
                />
                {jdLength > 0 && jdLength < 50 && (
                  <p className="text-xs text-amber-400 font-medium">At least 50 characters required.</p>
                )}
              </div>

              {/* Resume upload */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                  <Upload className="w-4 h-4 text-zinc-500" /> Upload Resume (PDF)
                </label>

                {resumeFile ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                  >
                    <FileText className="w-8 h-8 text-blue-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{resumeFile.name}</p>
                      <p className="text-xs text-zinc-500">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div
                    onDrop={handleDropFile}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all',
                      'border-zinc-800 hover:border-blue-500/40 hover:bg-blue-500/5'
                    )}
                  >
                    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                      <Upload className="w-7 h-7 text-zinc-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-zinc-300">Drop your resume here</p>
                      <p className="text-xs text-zinc-600 mt-1">PDF only · Max 5 MB</p>
                    </div>
                    <span className="text-xs font-bold text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3 py-1 rounded-full">
                      Browse Files
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              {/* Checklist */}
              <div className="flex flex-col gap-1.5 pt-1">
                {[
                  { ok: title.trim().length > 0,   label: `Title${title.trim() ? ' ✓' : ' — required'}` },
                  { ok: jdLength >= 50,             label: `Job description${jdLength >= 50 ? ' ✓' : ` — ${50 - jdLength} more chars`}` },
                  { ok: !!resumeFile,               label: `Resume PDF${resumeFile ? ' ✓' : ' — required'}` },
                ].map(({ ok, label }) => (
                  <div key={label} className={cn('flex items-center gap-2 text-xs font-medium', ok ? 'text-emerald-500' : 'text-zinc-600')}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {label}
                  </div>
                ))}
              </div>

              {/* Next button */}
              <motion.button
                onClick={() => step1Valid && setStep(2)}
                disabled={!step1Valid}
                whileHover={step1Valid ? { scale: 1.01 } : {}}
                whileTap={step1Valid ? { scale: 0.98 } : {}}
                className={cn(
                  'w-full py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all',
                  step1Valid
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:brightness-105'
                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                )}
              >
                Choose AI Model <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ═══ STEP 2 — Model selection ══════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 pb-2">
                <h2 className="text-2xl font-black text-white">Choose Your AI Analyst</h2>
                <p className="text-zinc-500 text-sm font-medium">
                  Select the model that will power your analysis.
                </p>
              </div>

              {/* Model cards */}
              <div className="space-y-3">
                {filteredModels.map((opt) => {
                  const canAfford = userCredits >= opt.credits;
                  const isSelected = selectedModel === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      onClick={() => canAfford && setSelectedModel(opt.id)}
                      whileHover={canAfford ? { scale: 1.01 } : {}}
                      whileTap={canAfford ? { scale: 0.99 } : {}}
                      className={cn(
                        'relative w-full text-left p-5 rounded-2xl border transition-all duration-300',
                        isSelected
                          ? `bg-zinc-900/60 ${opt.borderColor} shadow-lg`
                          : 'border-zinc-800/60 bg-zinc-900/20 hover:border-zinc-700',
                        !canAfford && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                          {opt.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-base font-black text-white">{opt.name}</p>
                            <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest', opt.badgeColor)}>
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{opt.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] text-zinc-500 font-bold">⏱ {opt.time}</span>
                            <span className={cn(
                              'flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border',
                              canAfford
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                : 'text-red-400 bg-red-500/10 border-red-500/20'
                            )}>
                              <Coins className="w-3 h-3" />
                              {opt.credits} {opt.credits === 1 ? 'credit' : 'credits'}
                              {!canAfford && ' — not enough'}
                            </span>
                          </div>
                        </div>

                        {/* Radio */}
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                          isSelected ? 'bg-white border-white' : 'border-zinc-700'
                        )}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Credits warning */}
              {!canAffordSelected && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-300 font-medium">
                    You need <strong>{selectedModelObj?.credits} credits</strong> but only have{' '}
                    <strong>{userCredits}</strong>.{' '}
                    <Link href="/pricing" className="underline hover:text-red-200">Upgrade →</Link>
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl font-bold text-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all"
                >
                  ← Back
                </button>
                <motion.button
                  onClick={handleRunAnalysis}
                  disabled={!canAffordSelected || isRunning}
                  whileHover={canAffordSelected ? { scale: 1.01 } : {}}
                  whileTap={canAffordSelected ? { scale: 0.98 } : {}}
                  className={cn(
                    'flex-[2] py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all',
                    canAffordSelected
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:brightness-105'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  )}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analyse My Resume · {selectedModelObj?.credits ?? 2} credit{(selectedModelObj?.credits ?? 2) !== 1 ? 's' : ''}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 3 — Running ══════════════════════════════════════════════ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-10 py-16"
            >
              {/* Animated icon */}
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500/20 border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-[8px] rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <BarChart3 className="w-9 h-9 text-blue-400 animate-pulse" />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-2xl font-black text-white">Analysing Your Resume</h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={Math.floor(Date.now() / 5000) % 6}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-blue-400 font-medium text-sm"
                  >
                    {[
                      'Parsing resume content...',
                      'Matching job requirements...',
                      'Running deep AI analysis...',
                      'Checking ATS compatibility...',
                      'Identifying keyword gaps...',
                      'Generating improvement plan...',
                    ][Math.floor(Date.now() / 5000) % 6]}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-zinc-600">This usually takes 30–90 seconds. Please don't close this tab.</p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-sm bg-zinc-800 rounded-full h-1.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  initial={{ width: '5%' }}
                  animate={{ width: '92%' }}
                  transition={{ duration: 80, ease: 'easeInOut' }}
                />
              </div>

              {/* Skeleton lines */}
              <div className="w-full max-w-sm space-y-2">
                {[80, 65, 72, 55, 75].map((w, i) => (
                  <div
                    key={i}
                    className="h-2 bg-zinc-800 rounded-full animate-pulse"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
