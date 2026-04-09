'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, CheckCircle2, AlertTriangle, XCircle, 
  AlertCircle, Lightbulb, FileText, TrendingUp, Code2, 
  GraduationCap, Sparkles, Layout 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionAnalysis, BulletAnalysis, KeywordInsight, ATSCheck } from '@/lib/resumeStudio.api';

// ─── Score Ring ────────────────────────────────
export function ScoreRing({ score, size = 'lg' }: { score: number; size?: 'lg' | 'sm' }) {
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
export function BreakdownBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
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
export function RatingBadge({ rating }: { rating: string }) {
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
export function PriorityBadge({ priority }: { priority: string }) {
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
export function EffortBadge({ effort }: { effort: string }) {
  const labels: Record<string, string> = { quick_fix: '⚡ Quick Fix', moderate: '🔧 Moderate', significant: '🏗️ Significant' };
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 font-medium">
      {labels[effort] || effort}
    </span>
  );
}

// ─── Collapsible Section ───────────────────────
export function CollapsibleSection({
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
export function SectionCard({ label, icon: Icon, analysis }: {
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
              <p className="text-sm text-zinc-300 leading-relaxed font-medium">{analysis.feedback}</p>
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
export function BulletCard({ bullet }: { bullet: BulletAnalysis }) {
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
export function KeywordChip({ insight }: { insight: KeywordInsight }) {
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
export function ATSCheckItem({ check }: { check: ATSCheck }) {
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
