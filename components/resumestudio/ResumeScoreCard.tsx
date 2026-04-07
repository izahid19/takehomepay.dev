'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResumeAnalysis } from '@/lib/resumeStudio.api';

// ─────────────────────────────────────────────
// ScoreProgress – animated SVG ring
// ─────────────────────────────────────────────
const ScoreProgress = ({ score }: { score: number }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    setVal(0); // reset on new score
    let current = 0;
    const step = Math.ceil(score / 50); // ~50 frames
    const interval = setInterval(() => {
      current = Math.min(current + step, score);
      setVal(current);
      if (current >= score) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (val / 100) * circumference;

  const color =
    val >= 75
      ? '#22c55e'
      : val >= 50
      ? '#facc15'
      : '#f97316';

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#1f2937" strokeWidth="8" />
        {/* Progress */}
        <circle
          cx="50" cy="50" r={radius}
          fill="transparent"
          stroke="url(#score-ring-gradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 40ms linear' }}
        />
        <defs>
          <linearGradient id="score-ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{val}</span>
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">/ 100</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SkillTag
// ─────────────────────────────────────────────
const SkillTag = ({
  label,
  variant,
}: {
  label: string;
  variant: 'matched' | 'missing';
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border',
      variant === 'matched'
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
    )}
  >
    {variant === 'matched' ? (
      <CheckCircle2 className="w-2.5 h-2.5" />
    ) : (
      <AlertTriangle className="w-2.5 h-2.5" />
    )}
    {label}
  </span>
);

// ─────────────────────────────────────────────
// InsightList – collapsible list
// ─────────────────────────────────────────────
const InsightList = ({
  title,
  items,
  icon: Icon,
  colorClass,
  borderClass,
  bgClass,
}: {
  title: string;
  items: string[];
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:brightness-110 transition-all"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colorClass}`} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>
          <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-600" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <ul className="px-4 pb-4 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium text-zinc-400 leading-relaxed">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${colorClass} bg-current`} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────
// ScoreBreakdownBar
// ─────────────────────────────────────────────
const ScoreBreakdownBar = ({
  label,
  value,
  max,
  colorClass,
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
}) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{label}</span>
        <span className="text-[11px] font-black text-zinc-300">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Skeleton — loading shimmer
// ─────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse rounded-xl bg-zinc-800/60',
      className
    )}
  />
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Header row */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      {/* Circle */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <div className="w-full h-full rounded-full bg-zinc-800/60 animate-pulse" />
      </div>
    </div>

    {/* Skill tags row */}
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
      </div>
    </div>

    {/* Insight cards */}
    <div className="grid grid-cols-1 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-zinc-800 p-4 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>

    {/* Breakdown bars */}
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Main: ResumeScoreCard
// ─────────────────────────────────────────────

interface ResumeScoreCardProps {
  analysis: ResumeAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  hasInput: boolean;
  onAnalyze: () => void;
  jobDescriptionLength: number;
}

export const ResumeScoreCard = ({
  analysis,
  isAnalyzing,
  error,
  hasInput,
  onAnalyze,
  jobDescriptionLength,
}: ResumeScoreCardProps) => {
  // ── Show "Ready to Analyze" or "Initial" state ───────────────────────────
  if (!isAnalyzing && !analysis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[220px] gap-6"
      >
        {/* Animated Background Ring */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/40 to-orange-500/0" />
        
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner group-hover:border-zinc-700 transition-colors">
          <Zap className={cn("w-8 h-8 transition-colors", hasInput ? "text-orange-400" : "text-zinc-600")} />
        </div>
        
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">
            {hasInput ? "Ready to analyze your resume" : "Paste job description to see your match score"}
          </p>
          <p className="text-xs text-zinc-500 font-medium max-w-xs mx-auto leading-relaxed">
            {hasInput 
              ? "We'll check your skills and experience against the job requirements and suggest optimizations."
              : "We will analyze your base resume against the target role and surface gaps instantly."
            }
          </p>
        </div>

        {hasInput && (
          <button
            onClick={onAnalyze}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-black text-xs font-black rounded-xl hover:bg-orange-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
          >
            <Zap className="w-4 h-4 fill-current" />
            ANALYZE RESUME NOW
          </button>
        )}
      </motion.div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="bg-[#09090b] border border-zinc-800/80 rounded-2xl shadow-xl relative overflow-hidden"
    >
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500" />

      <div className="p-7">
        {/* Card header + analyze button */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Resume Strength Score</h2>
            <p className="text-sm font-medium text-zinc-500 mt-1">
              {isAnalyzing
                ? 'Analyzing your resume against the job…'
                : analysis
                ? 'AI-powered match analysis complete.'
                : 'Add a job description to run analysis.'}
            </p>
          </div>

          {/* Manual trigger button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || jobDescriptionLength < 50}
            className={cn(
              'shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all',
              isAnalyzing || jobDescriptionLength < 50
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500/20 via-yellow-400/10 to-green-500/20 border-orange-500/30 text-orange-400 hover:border-orange-400/60 hover:brightness-110 active:scale-95'
            )}
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isAnalyzing ? 'Analyzing…' : 'Analyze Resume'}
          </button>
        </div>

        {/* ── Loading skeleton ── */}
        {isAnalyzing && <LoadingSkeleton />}

        {/* ── Error state ── */}
        {!isAnalyzing && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-4 rounded-xl border border-red-500/25 bg-red-500/5"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-300">{error}</p>
              <button
                onClick={onAnalyze}
                className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2 mt-1 font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Result state ── */}
        <AnimatePresence mode="wait">
          {!isAnalyzing && !error && analysis && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Score ring + headline */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex flex-col items-center shrink-0">
                  <ScoreProgress score={analysis.score} />
                  <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mt-2">
                    Match Score
                  </span>
                </div>

                {/* Score message */}
                <div className="flex-1 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg shrink-0">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                      Your resume matches{' '}
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-400 to-green-500">
                        {analysis.score}%
                      </span>{' '}
                      of this role. Tailoring it can significantly improve your shortlisting chances.
                    </p>
                  </div>
                </div>
              </div>

              {/* Matched skills */}
              {analysis.matchedSkills.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                    Matched Skills ({analysis.matchedSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchedSkills.map((skill) => (
                      <SkillTag key={skill} label={skill} variant="matched" />
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords */}
              {analysis.missingKeywords.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                    Missing Keywords ({analysis.missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((kw) => (
                      <SkillTag key={kw.keyword} label={kw.keyword} variant="missing" />
                    ))}
                  </div>
                </div>
              )}

              {/* Insight lists */}
              <div className="grid grid-cols-1 gap-3">
                {analysis.strengths.length > 0 && (
                  <InsightList
                    title="Strengths"
                    items={analysis.strengths}
                    icon={CheckCircle2}
                    colorClass="text-emerald-400"
                    borderClass="border-emerald-500/20"
                    bgClass="bg-emerald-500/5"
                  />
                )}
                {analysis.improvements.length > 0 && (
                  <InsightList
                    title="Improvements"
                    items={analysis.improvements.map((item) => typeof item === 'string' ? item : item.text)}
                    icon={TrendingUp}
                    colorClass="text-orange-400"
                    borderClass="border-orange-500/20"
                    bgClass="bg-orange-500/5"
                  />
                )}
              </div>

              {/* Section feedback */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                  Section Feedback
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      { key: 'summary', label: 'Summary' },
                      { key: 'experience', label: 'Experience' },
                      { key: 'skills', label: 'Skills' },
                    ] as const
                  ).map(({ key, label }) => (
                    <div
                      key={key}
                      className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                          {label}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-zinc-400 leading-relaxed">
                        {typeof analysis.sectionFeedback[key] === 'string' ? analysis.sectionFeedback[key] : analysis.sectionFeedback[key]?.feedback || 'No feedback available.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score breakdown */}
              {analysis.scoreBreakdown && (
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-3">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                    Score Breakdown
                  </p>
                  <ScoreBreakdownBar label="Skills Match" value={analysis.scoreBreakdown.skillsMatch} max={30} colorClass="bg-emerald-500" />
                  <ScoreBreakdownBar label="Experience Relevance" value={analysis.scoreBreakdown.experienceRelevance} max={25} colorClass="bg-yellow-400" />
                  <ScoreBreakdownBar label="Keyword Optimization" value={analysis.scoreBreakdown.keywordOptimization} max={15} colorClass="bg-orange-400" />
                  <ScoreBreakdownBar label="Impact Language" value={analysis.scoreBreakdown.impactLanguage} max={10} colorClass="bg-pink-400" />
                  <ScoreBreakdownBar label="ATS Compatibility" value={analysis.scoreBreakdown.atsCompatibility} max={10} colorClass="bg-cyan-400" />
                  <ScoreBreakdownBar label="Role Alignment" value={analysis.scoreBreakdown.roleAlignment} max={10} colorClass="bg-purple-400" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
