'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAnalysisByIdApi, deleteAnalysisApi, ResumeAnalyserRecord } from '@/lib/resumeAnalyser.api';

// Reuse display components from resumestudio analysis
import {
  ScoreRing, BreakdownBar, CollapsibleSection,
  SectionCard, BulletCard, KeywordChip, ATSCheckItem,
  PriorityBadge, EffortBadge,
} from '../../resumestudio/[id]/analysis/components/AnalysisDisplayComponents';
import {
  BarChart3, Zap, ShieldCheck, Sparkles, TrendingUp, TrendingDown,
  Target, Code2, Shield, Wrench, Eye, FileText, Layout, GraduationCap,
  CheckCircle2, XCircle, ArrowRight, ChevronRight,
} from 'lucide-react';

const SECTION_ICONS: Record<string, any> = {
  summary: FileText, experience: TrendingUp, skills: Code2,
  education: GraduationCap, projects: Sparkles, formatting: Layout,
};
const SECTION_LABELS: Record<string, string> = {
  summary: 'Professional Summary', experience: 'Work Experience',
  skills: 'Technical Skills', education: 'Education',
  projects: 'Projects', formatting: 'Formatting & Structure',
};
const MODEL_DISPLAY: Record<string, string> = {
  'pitchdown-pro': 'PitchDown Pro',
  'pitchdown-fast': 'PitchDown Fast',
  'pitchdown-premium-lite': 'PitchDown Premium Lite',
};

export default function AnalysisResultPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [record,          setRecord]          = useState<ResumeAnalyserRecord | null>(null);
  const [isLoading,       setIsLoading]       = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting,      setIsDeleting]      = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    try {
      const data = await getAnalysisByIdApi(id);
      setRecord(data);
    } catch {
      setError('Analysis not found or you do not have access.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAnalysisApi(id);
      router.push('/dashboard/analyser');
    } catch {
      setError('Failed to delete.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-white font-bold text-lg">Analysis not found</p>
        <p className="text-zinc-500 text-sm">{error}</p>
        <Link href="/dashboard/analyser" className="text-sm text-blue-400 hover:underline font-medium">
          ← Back to Analyser
        </Link>
      </div>
    );
  }

  const a     = record.analysis || ({} as any);
  const score = a.score ?? 0;
  const scoreLabel =
    score >= 75 ? { text: 'Excellent Match',   color: 'text-emerald-400' } :
    score >= 50 ? { text: 'Good Match',         color: 'text-amber-400'   } :
                  { text: 'Needs Improvement',  color: 'text-red-400'     };

  const atsPassCount    = a.atsChecks?.filter((c: any) => c.passed).length ?? 0;
  const atsTotalCount   = a.atsChecks?.length ?? 0;
  const weakBullets     = a.bulletAnalysis?.filter((b: any) => b.rating === 'weak')?.length ?? 0;
  const highPriorityCount = a.improvements?.filter((i: any) => i.priority === 'high')?.length ?? 0;

  return (
    <>
      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0c0c0e] border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 shrink-0">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Analysis?</h3>
                <p className="text-sm text-zinc-400 mt-1.5">This cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-zinc-700 hover:bg-zinc-800 text-zinc-300 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="relative min-h-full space-y-8 pb-20">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8">

          {/* Nav */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard/analyser"
              className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Analyses
            </Link>
            <button onClick={() => setShowDeleteModal(true)} disabled={isDeleting}
              className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">{record.title}</h1>
                <p className="text-zinc-500 text-sm font-medium mt-0.5">
                  {MODEL_DISPLAY[record.aiModel] ?? record.aiModel} · {record.resumeFileName} ·{' '}
                  {new Date(record.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* JD snippet */}
            <div className="mt-5 p-5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em] mb-2">Target Job Description</p>
              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">{record.jobDescription}</p>
            </div>
          </motion.div>

          {/* No analysis yet */}
          {!record.analysis && (
            <div className="py-20 flex flex-col items-center gap-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-white font-bold">
                {record.status === 'FAILED' ? 'Analysis failed' : 'No analysis data found'}
              </p>
              {record.error && <p className="text-sm text-zinc-500">{record.error}</p>}
            </div>
          )}

          {/* Results */}
          {record.analysis && (
            <>
              {/* Executive summary */}
              {a.executiveSummary && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="p-6 bg-gradient-to-br from-blue-500/5 via-card/60 to-purple-500/5 backdrop-blur-sm border border-blue-500/10 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em]">Executive Summary</p>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">{a.executiveSummary}</p>
                </motion.div>
              )}

              {/* Score */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-center space-y-3">
                    <ScoreRing score={score} />
                    <p className={cn('text-lg font-black', scoreLabel.color)}>{scoreLabel.text}</p>
                    <p className="text-[10px] text-zinc-600 font-medium tracking-wide">
                      {MODEL_DISPLAY[record.aiModel] ?? record.aiModel}
                    </p>
                  </div>
                  {a.scoreBreakdown && (
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <BreakdownBar label="Skills Match"        value={a.scoreBreakdown?.skillsMatch ?? 0}         max={30} color="#10B981" />
                      <BreakdownBar label="Experience"          value={a.scoreBreakdown?.experienceRelevance ?? 0} max={25} color="#3B82F6" />
                      <BreakdownBar label="Keyword Optimization" value={a.scoreBreakdown?.keywordOptimization ?? 0} max={15} color="#8B5CF6" />
                      <BreakdownBar label="Impact Language"     value={a.scoreBreakdown?.impactLanguage ?? 0}      max={10} color="#EC4899" />
                      <BreakdownBar label="ATS Compatibility"   value={a.scoreBreakdown?.atsCompatibility ?? 0}    max={10} color="#06B6D4" />
                      <BreakdownBar label="Role Alignment"      value={a.scoreBreakdown?.roleAlignment ?? 0}       max={10} color="#F59E0B" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-800/50">
                  {[
                    { val: a.matchedSkills?.length ?? 0,      label: 'Skills Matched',  color: 'text-white'     },
                    { val: a.missingKeywords?.length ?? 0,     label: 'Missing Skills',  color: 'text-red-500'   },
                    { val: `${atsPassCount}/${atsTotalCount}`, label: 'ATS Checks',      color: 'text-emerald-400' },
                    { val: highPriorityCount,                  label: 'Hot Fixes',       color: 'text-amber-400' },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="text-center border-r border-zinc-800/50 last:border-0">
                      <p className={cn('text-lg font-black', color)}>{val}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Section feedback */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <CollapsibleSection title="Section-by-Section Analysis" icon={Target} iconColor="text-blue-400" count={6}>
                  <div className="space-y-3">
                    {a.sectionFeedback && (['summary','experience','skills','education','projects','formatting'] as const).map((key) => {
                      const section = a.sectionFeedback[key];
                      if (!section) return null;
                      return <SectionCard key={key} label={SECTION_LABELS[key]} icon={SECTION_ICONS[key]} analysis={section} />;
                    })}
                  </div>
                </CollapsibleSection>
              </motion.div>

              {/* Keywords */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <CollapsibleSection title="Keyword Intelligence" icon={Code2} iconColor="text-purple-400">
                  <div className="p-5 bg-card/60 backdrop-blur-sm border border-border rounded-xl space-y-4">
                    {a.matchedSkills?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.15em] mb-2">Matched ({a.matchedSkills.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {a.matchedSkills.map((s: string) => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {a.missingKeywords?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.15em] mb-2">Missing ({a.missingKeywords.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {a.missingKeywords.map((insight: any, i: number) => (
                            <KeywordChip key={`${insight.keyword}-${i}`} insight={insight} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              </motion.div>

              {/* ATS */}
              {a.atsChecks?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <CollapsibleSection title="ATS Verification" icon={Shield} iconColor="text-cyan-400" count={atsPassCount}>
                    <div className="space-y-2">
                      {a.atsChecks.map((check: any, i: number) => <ATSCheckItem key={i} check={check} />)}
                    </div>
                  </CollapsibleSection>
                </motion.div>
              )}

              {/* Bullet analysis */}
              {a.bulletAnalysis?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <CollapsibleSection title="Bullet Impact Review" icon={FileText} iconColor="text-pink-400" count={weakBullets > 0 ? weakBullets : undefined}>
                    <div className="space-y-2">
                      {a.bulletAnalysis.map((bullet: any, i: number) => <BulletCard key={i} bullet={bullet} />)}
                    </div>
                  </CollapsibleSection>
                </motion.div>
              )}

              {/* Strengths / Weaknesses */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {a.strengths?.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" /><h2 className="text-sm font-bold text-white uppercase tracking-wider">Strengths</h2></div>
                      <div className="space-y-2">
                        {a.strengths.map((s: string, i: number) => (
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
                      <div className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-400" /><h2 className="text-sm font-bold text-white uppercase tracking-wider">Development Areas</h2></div>
                      <div className="space-y-2">
                        {a.weaknesses.map((s: string, i: number) => (
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

              {/* Action plan */}
              {a.improvements?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <CollapsibleSection title="Priority Action Plan" icon={Wrench} iconColor="text-amber-400" count={a.improvements.length} defaultOpen>
                    <div className="space-y-2">
                      {[...a.improvements]
                        .sort((a: any, b: any) => ({ high: 0, medium: 1, low: 2 }[a.priority as string] ?? 1) - ({ high: 0, medium: 1, low: 2 }[b.priority as string] ?? 1))
                        .map((item: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-card/60 backdrop-blur-sm border border-border rounded-xl shadow-lg">
                            <div className="mt-0.5">
                              {item.priority === 'high' ? <Zap className="w-4 h-4 text-red-400" /> :
                               item.priority === 'medium' ? <ArrowRight className="w-4 h-4 text-amber-400" /> :
                               <ChevronRight className="w-4 h-4 text-zinc-500" />}
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
      </div>
    </>
  );
}
