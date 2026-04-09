'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Zap, ShieldCheck, Sparkles, TrendingUp, TrendingDown,
  Target, Code2, Shield, Wrench, Eye, FileText, Layout, GraduationCap,
  AlertCircle, CheckCircle2, XCircle, ArrowRight, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ResumeRecord, ResumeAnalysis 
} from '@/lib/resumeStudio.api';
import { 
  ScoreRing, BreakdownBar, CollapsibleSection, 
  SectionCard, BulletCard, KeywordChip, ATSCheckItem,
  PriorityBadge, EffortBadge
} from './AnalysisDisplayComponents';
import { AnalysisModel } from './ModelSelectionView';

interface AnalysisDashboardProps {
  id: string;
  record: ResumeRecord;
  isAnalyzing: boolean;
  selectedModel: AnalysisModel;
  error: string | null;
  pendingRawText: string | null;
  onRetry: () => void;
}

const MODEL_OPTIONS = [
  { id: 'deepseek-reasoner', name: 'DeepSeek R1', time: '~60s' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', time: '~30s' },
  { id: 'claude-haiku', name: 'Claude Haiku', time: '~20s' },
];

const SECTION_ICONS: Record<string, any> = {
  summary: FileText, experience: TrendingUp, skills: Code2,
  education: GraduationCap, projects: Sparkles, formatting: Layout,
};

const SECTION_LABELS: Record<string, string> = {
  summary: 'Professional Summary', experience: 'Work Experience',
  skills: 'Technical Skills', education: 'Education',
  projects: 'Projects', formatting: 'Formatting & Structure',
};

export function AnalysisDashboard({
  id,
  record,
  isAnalyzing,
  selectedModel,
  error,
  pendingRawText,
  onRetry
}: AnalysisDashboardProps) {
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

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-6">
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

      {/* Full Screen Loading State */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-black pt-20"
        >
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-3xl px-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-blue-500/5 flex items-center justify-center border border-blue-500/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BarChart3 className="w-14 h-14 text-blue-400" />
                </motion.div>
              </div>
              {[0, 72, 144, 216, 288].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/40"
                  animate={{ rotate: [angle, angle + 360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: '70px 70px', left: 'calc(50% - 70px)', top: 'calc(50% - 70px)' }}
                />
              ))}
            </div>

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
                    {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name ?? 'AI Analyst'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    Est. {MODEL_OPTIONS.find(m => m.id === selectedModel)?.time ?? '...'}
                  </p>
                </div>
              </div>
            </div>

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
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all font-bold text-sm"
          >
            <Zap className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Results Content */}
      {!isAnalyzing && record?.analysis && (
        <>
          {/* Executive Summary */}
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

          {/* Score + Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center space-y-3">
                <ScoreRing score={score} />
                <p className={cn('text-lg font-black', scoreLabel.color)}>{scoreLabel.text}</p>
                <p className="text-[10px] text-zinc-600 font-medium tracking-wide">
                  Analysis Engine: {MODEL_OPTIONS.find(m => m.id === selectedModel)?.name ?? 'AI Analyst'}
                </p>
              </div>

              {a.scoreBreakdown && (
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <BreakdownBar label="Skills Match"       value={(a as any).scoreBreakdown?.skillsMatch ?? 0}         max={30} color="#10B981" />
                  <BreakdownBar label="Experience"          value={(a as any).scoreBreakdown?.experienceRelevance ?? 0} max={25} color="#3B82F6" />
                  <BreakdownBar label="Keyword Optimization" value={(a as any).scoreBreakdown?.keywordOptimization ?? 0} max={15} color="#8B5CF6" />
                  <BreakdownBar label="Impact Language"     value={(a as any).scoreBreakdown?.impactLanguage ?? 0}      max={10} color="#EC4899" />
                  <BreakdownBar label="ATS Compatibility"   value={(a as any).scoreBreakdown?.atsCompatibility ?? 0}    max={10} color="#06B6D4" />
                  <BreakdownBar label="Role Alignment"      value={(a as any).scoreBreakdown?.roleAlignment ?? 0}       max={10} color="#F59E0B" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/50">
              <div className="text-center border-r border-zinc-800/50 last:border-0 sm:last:border-r">
                <p className="text-lg font-black text-white">{a.matchedSkills?.length ?? 0}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Skills Matched</p>
              </div>
              <div className="text-center border-r border-zinc-800/50 last:border-0">
                <p className="text-lg font-black text-red-500">{(a as any).missingKeywords?.length ?? 0}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Missing Skills</p>
              </div>
              <div className="text-center border-r border-zinc-800/50 last:border-0 sm:last:border-r">
                <p className="text-lg font-black text-emerald-400">{atsPassCount}/{atsTotalCount}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">ATS Checks</p>
              </div>
              <div className="text-center last:border-0">
                <p className="text-lg font-black text-amber-400">{highPriorityCount}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Hot Fixes</p>
              </div>
            </div>
          </motion.div>

          {/* Section Analysis */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <CollapsibleSection title="Section-by-Section Analysis" icon={Target} iconColor="text-blue-400" count={6}>
              <div className="space-y-3">
                {a.sectionFeedback && (['summary', 'experience', 'skills', 'education', 'projects', 'formatting'] as const).map((key) => {
                  const section = a.sectionFeedback[key];
                  if (!section) return null;
                  return (
                    <SectionCard
                      key={key}
                      label={SECTION_LABELS[key]}
                      icon={SECTION_ICONS[key]}
                      analysis={section}
                    />
                  );
                })}
              </div>
            </CollapsibleSection>
          </motion.div>

          {/* Keywords */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <CollapsibleSection title="Keyword Intelligence" icon={Code2} iconColor="text-purple-400">
              <div className="p-5 bg-card/60 backdrop-blur-sm border border-border rounded-xl shadow-xl space-y-4">
                {a.matchedSkills?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em] mb-2">
                       Matched Skills ({a.matchedSkills.length})
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
                {a.missingKeywords?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.15em] mb-2">
                      Missing Keywords ({a.missingKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.missingKeywords.map((insight, i) => (
                        <KeywordChip key={`${insight.keyword}-${i}`} insight={insight} />
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-2 font-medium">💡 Hover over keywords to see optimization tips</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </motion.div>

          {/* ATS Checks */}
          {a.atsChecks?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <CollapsibleSection title="ATS Verification" icon={Shield} iconColor="text-cyan-400" count={atsPassCount}>
                <div className="space-y-2">
                  {a.atsChecks.map((check, i) => (
                    <ATSCheckItem key={i} check={check} />
                  ))}
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {/* Bullets */}
          {a.bulletAnalysis?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <CollapsibleSection title="Bullet Impact Review" icon={FileText} iconColor="text-pink-400" count={weakBullets > 0 ? weakBullets : undefined}>
                <div className="space-y-2">
                  {a.bulletAnalysis.map((bullet, i) => (
                    <BulletCard key={i} bullet={bullet} />
                  ))}
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {/* Strengths/Weaknesses */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {a.weaknesses?.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Development Areas</h2>
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

          {/* Action Plan */}
          {a.improvements?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <CollapsibleSection title="Priority Action Plan" icon={Wrench} iconColor="text-amber-400" count={a.improvements.length} defaultOpen>
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
        </>
      )}
    </div>
  );
}
