'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BarChart3, CheckCircle2, XCircle, TrendingUp, TrendingDown,
  Lightbulb, Target, Loader2, AlertCircle, Zap, Shield, ShieldCheck, ShieldAlert,
  ChevronDown, ChevronRight, ArrowRight, Star, FileText, Layout, GraduationCap,
  Code2, Sparkles, AlertTriangle, Clock, Wrench, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getResumeByIdApi,
  analyzeForProjectApi,
  ResumeRecord,
  ResumeAnalysis,
  SectionAnalysis,
  BulletAnalysis,
  KeywordInsight,
  ATSCheck,
  ImprovementItem,
  ScoreBreakdown,
} from '@/lib/resumeStudio.api';
import api from '@/lib/axios';

// ─── Score Ring ────────────────────────────────
function ScoreRing({ score, size = 'lg' }: { score: number; size?: 'lg' | 'sm' }) {
  const isLg = size === 'lg';
  const radius = isLg ? 54 : 28;
  const viewBox = isLg ? '0 0 128 128' : '0 0 68 68';
  const cx = isLg ? 64 : 34;
  const cy = isLg ? 64 : 34;
  const strokeW = isLg ? 10 : 5;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  const color =
    score >= 75 ? '#10B981' :
    score >= 50 ? '#F59E0B' :
    '#EF4444';

  return (
    <div className={cn('relative mx-auto', isLg ? 'w-36 h-36' : 'w-16 h-16')}>
      <svg className="w-full h-full -rotate-90" viewBox={viewBox}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1f2937" strokeWidth={strokeW} />
        <motion.circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn('font-black text-white', isLg ? 'text-3xl' : 'text-sm')}
        >
          {score}
        </motion.span>
        {isLg && <span className="text-xs text-zinc-500 font-medium">/ 100</span>}
      </div>
    </div>
  );
}

// ─── Breakdown bar ─────────────────────────────
function BreakdownBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400 font-medium">{label}</span>
        <span className="text-xs font-bold text-white">{value}<span className="text-zinc-600">/{max}</span></span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Rating badge ──────────────────────────────
function RatingBadge({ rating }: { rating: string }) {
  const styles: Record<string, string> = {
    excellent:  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    good:       'bg-blue-500/10    border-blue-500/20    text-blue-400',
    needs_work: 'bg-amber-500/10   border-amber-500/20   text-amber-400',
    poor:       'bg-red-500/10     border-red-500/20     text-red-400',
    missing:    'bg-zinc-700/50    border-zinc-600       text-zinc-500',
  };
  const labels: Record<string, string> = {
    excellent: 'Excellent', good: 'Good', needs_work: 'Needs Work', poor: 'Poor', missing: 'Missing',
  };
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider', styles[rating] || styles.needs_work)}>
      {labels[rating] || rating}
    </span>
  );
}

// ─── Priority badge ────────────────────────────
function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high:   'bg-red-500/10    border-red-500/20    text-red-400',
    medium: 'bg-amber-500/10  border-amber-500/20  text-amber-400',
    low:    'bg-zinc-700/50   border-zinc-600      text-zinc-500',
  };
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider', styles[priority] || styles.medium)}>
      {priority}
    </span>
  );
}

// ─── Effort badge ──────────────────────────────
function EffortBadge({ effort }: { effort: string }) {
  const labels: Record<string, string> = { quick_fix: '⚡ Quick Fix', moderate: '🔧 Moderate', significant: '🏗️ Significant' };
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 font-medium">
      {labels[effort] || effort}
    </span>
  );
}

// ─── Collapsible Section ───────────────────────
function CollapsibleSection({
  title, icon: Icon, iconColor, count, defaultOpen = false, children,
}: {
  title: string; icon: any; iconColor: string; count?: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left group"
      >
        <Icon className={cn('w-4 h-4', iconColor)} />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex-1">{title}</h2>
        {count !== undefined && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 font-bold">{count}</span>
        )}
        <ChevronDown className={cn('w-4 h-4 text-zinc-600 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Analysis Card ─────────────────────
function SectionCard({ label, icon: Icon, analysis }: {
  label: string; icon: any; analysis: SectionAnalysis;
}) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor =
    analysis.score >= 75 ? 'text-emerald-400' :
    analysis.score >= 50 ? 'text-amber-400' :
    'text-red-400';

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl shadow-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start gap-4 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <div className="p-2 rounded-lg bg-zinc-800 shrink-0">
          <Icon className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-white">{label}</p>
            <RatingBadge rating={analysis.rating} />
          </div>
          <p className="text-xs text-zinc-500 line-clamp-2 font-medium">{analysis.feedback}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-lg font-black', scoreColor)}>{analysis.score}</span>
          <ChevronDown className={cn('w-4 h-4 text-zinc-600 transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-zinc-800/50 pt-4">
              {/* Full feedback */}
              <p className="text-sm text-zinc-300 leading-relaxed font-medium">{analysis.feedback}</p>

              {/* Suggestions */}
              {analysis.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">Suggestions</p>
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-zinc-300 leading-relaxed font-medium">{s}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Before → After Examples */}
              {analysis.examples?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">Before → After</p>
                  {analysis.examples.map((ex, i) => (
                    <div key={i} className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                      <p className="text-xs text-blue-300 leading-relaxed font-medium italic">{ex}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Bullet Analysis Card ──────────────────────
function BulletCard({ bullet }: { bullet: BulletAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const ratingStyles: Record<string, string> = {
    strong:   'border-l-emerald-500',
    moderate: 'border-l-amber-500',
    weak:     'border-l-red-500',
  };
  const ratingIcons: Record<string, typeof CheckCircle2> = {
    strong: CheckCircle2, moderate: AlertTriangle, weak: XCircle,
  };
  const RatingIcon = ratingIcons[bullet.rating] || AlertTriangle;
  const ratingColors: Record<string, string> = {
    strong: 'text-emerald-400', moderate: 'text-amber-400', weak: 'text-red-400',
  };

  return (
    <div className={cn(
      'bg-card/60 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden border-l-2',
      ratingStyles[bullet.rating]
    )}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-zinc-800/30 transition-colors"
      >
        <RatingIcon className={cn('w-4 h-4 mt-0.5 shrink-0', ratingColors[bullet.rating])} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500 font-bold mb-1 uppercase">
            {bullet.section === 'experience' ? 'Experience' : 'Project'} • Bullet #{bullet.bulletIndex + 1}
          </p>
          <p className="text-sm text-zinc-300 font-medium line-clamp-2">&ldquo;{bullet.originalText}&rdquo;</p>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-zinc-600 transition-transform shrink-0', expanded && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/50 pt-3">
              {bullet.issue && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] mb-0.5">Issue</p>
                    <p className="text-xs text-zinc-400 font-medium">{bullet.issue}</p>
                  </div>
                </div>
              )}
              {bullet.suggestion && (
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] mb-0.5">How to Fix</p>
                    <p className="text-xs text-zinc-400 font-medium">{bullet.suggestion}</p>
                  </div>
                </div>
              )}
              {bullet.rewrittenText && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.15em] mb-1">✨ Suggested Rewrite</p>
                  <p className="text-sm text-emerald-200 font-medium leading-relaxed">&ldquo;{bullet.rewrittenText}&rdquo;</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Keyword Chip ──────────────────────────────
function KeywordChip({ insight }: { insight: KeywordInsight }) {
  const statusStyles: Record<string, string> = {
    matched: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    missing: 'bg-red-500/10     border-red-500/20     text-red-400',
    partial: 'bg-amber-500/10   border-amber-500/20   text-amber-400',
  };
  const importanceIcons: Record<string, string> = {
    critical: '🔴', important: '🟡', nice_to_have: '🟢',
  };
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className={cn('text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all hover:brightness-125', statusStyles[insight.status])}
      >
        <span className="text-[10px]">{importanceIcons[insight.importance]}</span>
        {insight.keyword}
      </button>
      {showTip && (insight.suggestion || insight.context) && (
        <div className="absolute z-30 bottom-full left-0 mb-1.5 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl">
          {insight.context && <p className="text-[10px] text-zinc-500 font-medium mb-1">{insight.context}</p>}
          {insight.suggestion && <p className="text-xs text-zinc-300 font-medium">{insight.suggestion}</p>}
          <div className="absolute bottom-0 left-4 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45 translate-y-1" />
        </div>
      )}
    </div>
  );
}

// ─── ATS Check Item ────────────────────────────
function ATSCheckItem({ check }: { check: ATSCheck }) {
  const icon = check.passed ? CheckCircle2 : check.severity === 'critical' ? XCircle : AlertTriangle;
  const Icon = icon;
  const color = check.passed ? 'text-emerald-400' : check.severity === 'critical' ? 'text-red-400' : 'text-amber-400';
  const bg = check.passed ? 'bg-emerald-500/5 border-emerald-500/10' : check.severity === 'critical' ? 'bg-red-500/5 border-red-500/10' : 'bg-amber-500/5 border-amber-500/10';

  return (
    <div className={cn('flex items-start gap-3 p-3 border rounded-lg', bg)}>
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{check.check}</p>
        <p className="text-xs text-zinc-400 mt-0.5 font-medium">{check.detail}</p>
      </div>
      {!check.passed && (
        <span className={cn(
          'text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider shrink-0',
          check.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        )}>
          {check.severity}
        </span>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────
export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the project record
  const fetchRecord = useCallback(async () => {
    try {
      const data = await getResumeByIdApi(id);
      setRecord(data);
      return data;
    } catch {
      setError('Failed to load project.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // On mount: Fetch record, then auto-trigger analysis if needed
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await fetchRecord();
      if (cancelled) return;

      // If analysis doesn't exist yet, auto-trigger it
      if (data && !data.analysis) {
        // Need the user's resume rawText from profile
        try {
          const profileRes = await api.get('/profile');
          const rawText = profileRes.data?.data?.resume?.rawText;
          if (!rawText) {
            setError('Please upload a resume in your profile first.');
            return;
          }
          if (cancelled) return;

          setIsAnalyzing(true);
          const updated = await analyzeForProjectApi(id, rawText);
          if (!cancelled) {
            setRecord(updated);
            setIsAnalyzing(false);
          }
        } catch (err: any) {
          if (!cancelled) {
            setError(err?.response?.data?.message || err?.message || 'Analysis failed. Please try again.');
            setIsAnalyzing(false);
          }
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id, fetchRecord]);

  // ── Loading state ────────────────────────────
  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const a = record?.analysis || {} as ResumeAnalysis;
  const score = (a as any).score ?? 0;
  const scoreLabel =
    score >= 75 ? { text: 'Excellent Match', color: 'text-emerald-400' } :
    score >= 50 ? { text: 'Good Match', color: 'text-amber-400' } :
    { text: 'Needs Improvement', color: 'text-red-400' };

  const atsPassCount = (a as any).atsChecks?.filter((c: any) => c.passed).length ?? 0;
  const atsTotalCount = (a as any).atsChecks?.length ?? 0;
  const weakBullets = (a as any).bulletAnalysis?.filter((b: any) => b.rating === 'weak')?.length ?? 0;
  const highPriorityCount = (a as any).improvements?.filter((i: any) => i.priority === 'high')?.length ?? 0;

  const sectionIcons: Record<string, any> = {
    summary: FileText, experience: TrendingUp, skills: Code2,
    education: GraduationCap, projects: Sparkles, formatting: Layout,
  };
  const sectionLabels: Record<string, string> = {
    summary: 'Professional Summary', experience: 'Work Experience',
    skills: 'Technical Skills', education: 'Education',
    projects: 'Projects', formatting: 'Formatting & Structure',
  };

  return (
    <div className="relative min-h-full space-y-8 pb-20">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-6">

        {/* Back */}
        <Link
          href={`/dashboard/resumestudio/${id}`}
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Project
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Resume Analysis</h1>
              <p className="text-zinc-500 text-sm font-medium mt-0.5">{record?.profileType || 'Profile'} • Premium Report</p>
            </div>
          </div>
        </motion.div>

        {/* Full Screen Loading State (Rich Animation) */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-black pt-20"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-3xl px-6">
              {/* Visual Indicator (Large) */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-blue-500/5 flex items-center justify-center border border-blue-500/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <BarChart3 className="w-14 h-14 text-blue-400" />
                  </motion.div>
                </div>
                
                {/* Orbiting particles */}
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/40"
                    animate={{
                      rotate: [angle, angle + 360],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      transformOrigin: '70px 70px',
                      left: 'calc(50% - 70px)',
                      top: 'calc(50% - 70px)',
                    }}
                  />
                ))}
              </div>

              {/* Status Steps */}
              <div className="text-center space-y-6 w-full">
                <div className="h-8 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={Math.floor(Date.now() / 4000) % 6}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                      className="text-2xl font-black text-white uppercase tracking-[0.2em]"
                    >
                      {[
                        "Scanning Resume Structure...",
                        "Matching Job Requirements...",
                        "Calculating Match Score...",
                        "Analyzing Bullet Points...",
                        "Identifying Missing Keywords...",
                        "Generating Improvements..."
                      ][Math.floor(Date.now() / 4000) % 6]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                {/* Large Progress Bar */}
                <div className="w-full space-y-3">
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-[length:200%_100%]"
                      animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      initial={{ width: "0%" }}
                      style={{ width: "0%" }}
                      whileInView={{ width: "95%" }}
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      Deep Reasoning · DeepSeek R1
                    </p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      Est. 60s
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom detail row */}
              <div className="flex items-center gap-12 pt-8 border-t border-zinc-800/30 w-full justify-center">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">High Precision</span>
                </div>
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-blue-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">ATS Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">AI Tailored</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error / Empty State */}
        {!isAnalyzing && (error || !record?.analysis) && (
          <div className="py-20 flex flex-col items-center justify-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
              <div className="absolute inset-[4px] rounded-full bg-zinc-900 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            
            <div className="text-center space-y-1.5">
              <p className="text-lg font-bold text-white">
                {error ? 'Analysis Failed' : 'No Analysis Found'}
              </p>
              <p className="text-sm text-zinc-500 max-w-sm">
                {error || 'Please try regenerating your analysis.'}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all font-bold text-sm"
            >
              <Zap className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* ═══ EXECUTIVE SUMMARY ═══ */}
        {!isAnalyzing && record?.analysis && (
          <>
            {a.executiveSummary && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-6 bg-gradient-to-br from-blue-500/5 via-card/60 to-purple-500/5 backdrop-blur-sm border border-blue-500/10 rounded-2xl shadow-2xl"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em]">Executive Summary</p>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">{a.executiveSummary}</p>
              </motion.div>
            )}
          </>
        )}

        {/* ═══ SCORE + BREAKDOWN ═══ */}
        {!isAnalyzing && record?.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score Ring */}
              <div className="text-center space-y-3">
                <ScoreRing score={score} />
                <p className={cn('text-lg font-black', scoreLabel.color)}>{scoreLabel.text}</p>
                <p className="text-[10px] text-zinc-600 font-medium">Powered by DeepSeek R1</p>
              </div>

              {/* 6-Component Breakdown */}
              {a.scoreBreakdown && (
                <div className="flex-1 w-full grid grid-cols-2 gap-x-6 gap-y-3">
                  <BreakdownBar label="Skills Match"       value={(a as any).scoreBreakdown?.skillsMatch ?? 0}         max={30} color="#10B981" />
                  <BreakdownBar label="Experience"          value={(a as any).scoreBreakdown?.experienceRelevance ?? 0} max={25} color="#3B82F6" />
                  <BreakdownBar label="Keyword Optimization" value={(a as any).scoreBreakdown?.keywordOptimization ?? 0} max={15} color="#8B5CF6" />
                  <BreakdownBar label="Impact Language"     value={(a as any).scoreBreakdown?.impactLanguage ?? 0}      max={10} color="#EC4899" />
                  <BreakdownBar label="ATS Compatibility"   value={(a as any).scoreBreakdown?.atsCompatibility ?? 0}    max={10} color="#06B6D4" />
                  <BreakdownBar label="Role Alignment"      value={(a as any).scoreBreakdown?.roleAlignment ?? 0}       max={10} color="#F59E0B" />
                </div>
              )}
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/50">
              <div className="text-center">
                <p className="text-lg font-black text-white">{a.matchedSkills?.length ?? 0}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Skills Matched</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-red-400">{(a as any).missingKeywords?.length ?? 0}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Missing</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-emerald-400">{atsPassCount}/{atsTotalCount}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">ATS Checks</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-amber-400">{highPriorityCount}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">High Priority</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ SECTION-BY-SECTION ANALYSIS ═══ */}
        {!isAnalyzing && record?.analysis && (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <CollapsibleSection title="Section-by-Section Analysis" icon={Target} iconColor="text-blue-400" count={6} defaultOpen>
                <div className="space-y-3">
                  {a.sectionFeedback && (['summary', 'experience', 'skills', 'education', 'projects', 'formatting'] as const).map((key) => {
                    const section = a.sectionFeedback[key];
                    if (!section) return null;
                    return (
                      <SectionCard
                        key={key}
                        label={sectionLabels[key]}
                        icon={sectionIcons[key]}
                        analysis={section}
                      />
                    );
                  })}
                </div>
              </CollapsibleSection>
            </motion.div>

            {/* ═══ KEYWORD MAP ═══ */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <CollapsibleSection title="Keyword Analysis" icon={Code2} iconColor="text-purple-400" defaultOpen>
                <div className="p-5 bg-card/60 backdrop-blur-sm border border-border rounded-xl shadow-xl space-y-4">
                  {/* Matched skills */}
                  {a.matchedSkills?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em] mb-2">
                        ✅ Matched Skills ({a.matchedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {a.matchedSkills.map((s) => (
                          <span key={s} className="text-xs px-2.5 py-1 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing/Partial keywords with insights */}
                  {a.missingKeywords?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.15em] mb-2">
                        ❌ Missing Keywords ({a.missingKeywords.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {a.missingKeywords.map((insight, i) => (
                          <KeywordChip key={`${insight.keyword}-${i}`} insight={insight} />
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-2 font-medium">💡 Hover over keywords to see where to add them</p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </motion.div>

            {/* ═══ ATS COMPATIBILITY ═══ */}
            {a.atsChecks?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <CollapsibleSection
                  title="ATS Compatibility"
                  icon={Shield}
                  iconColor="text-cyan-400"
                  count={atsPassCount}
                  defaultOpen
                >
                  <div className="space-y-2">
                    {a.atsChecks.map((check, i) => (
                      <ATSCheckItem key={i} check={check} />
                    ))}
                  </div>
                </CollapsibleSection>
              </motion.div>
            )}
          </>
        )}

        {/* ═══ BULLET-LEVEL ANALYSIS ═══ */}
        {!isAnalyzing && record?.analysis && a.bulletAnalysis?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <CollapsibleSection
              title="Bullet-by-Bullet Review"
              icon={FileText}
              iconColor="text-pink-400"
              count={weakBullets > 0 ? weakBullets : undefined}
              defaultOpen={weakBullets > 0}
            >
              <div className="space-y-2">
                {a.bulletAnalysis.map((bullet, i) => (
                  <BulletCard key={i} bullet={bullet} />
                ))}
              </div>
            </CollapsibleSection>
          </motion.div>
        )}

        {/* ═══ STRENGTHS & WEAKNESSES ═══ */}
        {!isAnalyzing && record?.analysis && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {a.strengths?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Strengths</h2>
                  </div>
                  <div className="space-y-2">
                    {a.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {a.weaknesses?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Weaknesses</h2>
                  </div>
                  <div className="space-y-2">
                    {a.weaknesses.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                        <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ PRIORITIZED ACTION PLAN ═══ */}
        {!isAnalyzing && record?.analysis && a.improvements?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <CollapsibleSection
              title="Action Plan"
              icon={Wrench}
              iconColor="text-amber-400"
              count={a.improvements.length}
              defaultOpen
            >
              <div className="space-y-2">
                {[...a.improvements]
                  .sort((a, b) => {
                    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
                    return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
                  })
                  .map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-card/60 backdrop-blur-sm border border-border rounded-xl shadow-lg">
                      <div className="mt-0.5">
                        {item.priority === 'high' ? (
                          <Zap className="w-4 h-4 text-red-400" />
                        ) : item.priority === 'medium' ? (
                          <ArrowRight className="w-4 h-4 text-amber-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-white">{item.text}</p>
                          <PriorityBadge priority={item.priority} />
                          <EffortBadge effort={item.effort} />
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">{item.category}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CollapsibleSection>
          </motion.div>
        )}
      </div>
    </div>
  );
}
