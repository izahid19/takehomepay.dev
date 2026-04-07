'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, BarChart3, FileText, Loader2, AlertCircle,
  CheckCircle2, Download, Trash2, ChevronRight, Zap, Target, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getResumeByIdApi,
  downloadResumeApi,
  deleteResumeApi,
  analyzeForProjectApi,
  generateResumeForProjectApi,
  ResumeRecord,
} from '@/lib/resumeStudio.api';
import api from '@/lib/axios';

// ─── Generating overlay ────────────────────────
function GeneratingOverlay({
  mode,
}: {
  mode: 'analysis' | 'resume';
}) {
  const analysisSteps = [
    'Reading your resume...',
    'Running deep analysis with DeepSeek R1...',
    'Extracting ATS keywords...',
    'Scoring your resume against the job...',
    'Generating improvement suggestions...',
    'Finalizing analysis report...',
  ];
  const resumeSteps = [
    'Reading your resume...',
    'Analyzing job requirements...',
    'Tailoring experience & summary...',
    'Optimizing skills for the role...',
    'Structuring ATS-friendly format...',
    'Finalizing your tailored resume...',
  ];

  const steps = mode === 'analysis' ? analysisSteps : resumeSteps;
  const title = mode === 'analysis' ? 'Analyzing Resume' : 'Generating ATS Resume';
  const accent = mode === 'analysis' ? 'blue' : 'emerald';

  const [stepIdx, setStepIdx] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setStepIdx((i) => Math.min(i + 1, steps.length - 1)), 12000);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="relative min-h-full pb-20 pt-16 flex flex-col items-center justify-center">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "relative z-10 bg-[#0c0c0e] border rounded-3xl p-12 max-w-xl w-full flex flex-col items-center gap-8 text-center shadow-2xl",
          accent === 'blue' ? 'border-blue-500/20' : 'border-emerald-500/20'
        )}
      >
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
          <div className={cn(
            'absolute inset-0 rounded-full border-4 animate-spin',
            accent === 'blue'
              ? 'border-t-blue-500 border-r-blue-500/20 border-b-transparent border-l-transparent'
              : 'border-t-emerald-500 border-r-emerald-500/20 border-b-transparent border-l-transparent'
          )} />
          <div className="absolute inset-[6px] rounded-full bg-zinc-900 flex items-center justify-center">
            {mode === 'analysis' ? (
              <BarChart3 className="w-7 h-7 text-blue-400 animate-pulse" />
            ) : (
              <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className={cn(
                'text-sm font-medium',
                accent === 'blue' ? 'text-blue-400' : 'text-emerald-400'
              )}
            >
              {steps[stepIdx]}
            </motion.p>
          </AnimatePresence>
          <p className="text-xs text-zinc-600">This usually takes 1–2 minutes with the reasoning model</p>
        </div>

        <div className="w-full bg-zinc-800 rounded-full h-1.5">
          <motion.div
            className={cn(
              'h-full rounded-full',
              accent === 'blue'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            )}
            initial={{ width: '5%' }}
            animate={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="w-full space-y-2">
          {[80, 65, 72, 55, 75].map((w, i) => (
            <div
              key={i}
              className="h-2 bg-zinc-800 rounded-full animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────
export default function ResumeProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingMode, setGeneratingMode] = useState<'analysis' | 'resume' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [regenerateTarget, setRegenerateTarget] = useState<'analysis' | 'resume' | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile (for resumeText)
  const [profileData, setProfileData] = useState<any>(null);

  const fetchRecord = useCallback(async () => {
    try {
      const data = await getResumeByIdApi(id);
      setRecord(data);
    } catch (err: any) {
      setError('Project not found or you do not have access.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
    api.get('/profile').then((r) => setProfileData(r.data.data)).catch(() => {});
  }, [fetchRecord]);

  const hasResume = !!profileData?.resume?.rawText;

  // Derived state for each card
  const analysisStatus = record?.analysisStatus || 'IDLE';
  const resumeStatus = record?.resumeStatus || 'IDLE';
  const hasAnalysis = !!record?.analysis;
  const hasGeneratedResume = !!record?.newResumeContent;

  const handleAnalyze = () => {
    if (!hasResume) {
      setError('Please upload a resume in your profile first.');
      return;
    }
    // Navigate to analysis page — it handles generation itself
    router.push(`/dashboard/resumestudio/${id}/analysis`);
  };

  const handleGenerateResume = () => {
    if (!hasResume) {
      setError('Please upload a resume in your profile first.');
      return;
    }
    router.push(`/dashboard/resumestudio/${id}/generated`);
  };

  const handleRegenerateConfirm = async () => {
    const target = regenerateTarget;
    setRegenerateTarget(null);
    if (!target) return;
    
    if (!hasResume) {
      setError('Please upload a resume in your profile first.');
      return;
    }

    setGeneratingMode(target);
    setError(null);
    
    try {
      if (target === 'analysis') {
        await analyzeForProjectApi(id, profileData.resume.rawText);
        router.push(`/dashboard/resumestudio/${id}/analysis`);
      } else {
        await generateResumeForProjectApi(id, profileData.resume.rawText);
        router.push(`/dashboard/resumestudio/${id}/generated`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || `Failed to regenerate ${target}`);
      setGeneratingMode(null);
    }
  };

  const handleDownload = async () => {
    if (!record) return;
    setIsDownloading(true);
    try {
      const fullName = record.newResumeContent?.fullName || record.prevResumeContent?.fullName || 'Candidate';
      const personName = fullName.replace(/[^a-zA-Z0-9_\-]/g, '_');
      await downloadResumeApi(id, `${personName}_detailed_resume.pdf`);
    } catch {
      setError('Failed to download PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteResumeApi(id);
      router.push('/dashboard/resumestudio');
    } catch {
      setError('Failed to delete project.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Loading ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-white font-bold text-lg">Project not found</p>
        <p className="text-zinc-500 text-sm">{error}</p>
        <Link href="/dashboard/resumestudio" className="text-sm text-primary hover:underline font-medium">
          ← Back to Resume Studio
        </Link>
      </div>
    );
  }

  const createdDate = new Date(record.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  if (generatingMode) {
    return <GeneratingOverlay mode={generatingMode} />;
  }

  return (
    <>
      <AnimatePresence>
        {regenerateTarget && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 shrink-0">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Regenerate {regenerateTarget === 'analysis' ? 'Analysis' : 'Resume'}?</h3>
                  <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">Are you sure you want to regenerate it? The old data will be permanently overwritten.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button 
                  onClick={() => setRegenerateTarget(null)} 
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRegenerateConfirm} 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:brightness-105 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 shrink-0">
                  <Trash2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Project?</h3>
                  <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">Are you sure you want to delete this project permanently? This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm} 
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 shadow-lg shadow-red-500/10 transition-all disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative min-h-full space-y-8 pb-20">
        {/* Background Pattern — matching proposals page */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8">

          {/* Back */}
          <Link
            href="/dashboard/resumestudio"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Projects
          </Link>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shrink-0">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl font-black tracking-tight text-white truncate">{record.profileType}</h1>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className={cn(
                      'flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border',
                      record.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      record.status === 'FAILED' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                      'text-zinc-500 bg-zinc-800/50 border-zinc-700'
                    )}>
                      {record.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : record.status === 'FAILED' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {record.status === 'SUCCESS' ? 'Completed' : record.status === 'FAILED' ? 'Failed' : 'Saved'}
                    </div>
                    <span className="text-xs text-zinc-600 font-medium">{createdDate}</span>
                  </div>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting || !!generatingMode}
                className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40 shrink-0 border border-transparent hover:border-red-500/20"
                title="Delete project"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>

            {/* JD snippet */}
            <div className="mt-5 p-5 bg-zinc-900/40 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.15em] mb-2">Target Job Description</p>
              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">{record.jobDescription}</p>
            </div>
          </motion.div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-300">Error</p>
                <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          {/* No resume warning */}
          {!hasResume && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-300 font-medium">
                Upload a resume in your{' '}
                <Link href="/dashboard/profile" className="underline hover:text-amber-200">profile</Link>
                {' '}to enable generation.
              </p>
            </motion.div>
          )}

          {/* ══════ Two Feature Cards ══════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-5"
          >
            {/* ── ANALYSIS CARD ── */}
            <div className={cn(
              'group relative bg-card/60 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 shadow-2xl hover:-translate-y-1',
              hasAnalysis
                ? 'border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/5'
                : 'border-border hover:border-zinc-700'
            )}>
              {/* Blue gradient accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/40 transition-all duration-500" />

              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0 group-hover:bg-blue-500/15 transition-colors">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">{hasAnalysis ? 'Resume Analysis' : 'Resume Analysis'}</h3>
                        {hasAnalysis && record.analysis && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/20 uppercase tracking-wider">
                            {record.analysis.score}% Match
                          </span>
                        )}
                        {analysisStatus === 'FAILED' && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full border text-red-400 bg-red-500/10 border-red-500/20 uppercase tracking-wider">
                            Failed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        AI-powered match score, skill gap analysis, strengths, and actionable improvements tailored to this job description.
                      </p>
                    </div>
                  </div>

                  {hasAnalysis && (
                    <Link href={`/dashboard/resumestudio/${id}/analysis`}>
                      <ChevronRight className="w-5 h-5 text-zinc-600 hover:text-blue-400 transition-colors shrink-0 mt-1" />
                    </Link>
                  )}
                </div>

                {/* Action area */}
                <div className="mt-6">
                  {hasAnalysis ? (
                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/resumestudio/${id}/analysis`}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                      >
                        <BarChart3 className="w-4 h-4" />
                        View Analysis Report
                      </Link>
                      <button
                        onClick={() => setRegenerateTarget('analysis')}
                        title="Regenerate Analysis"
                        className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 transition-all shrink-0"
                      >
                        <Zap className="w-4 h-4" />
                        Regenerate
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleAnalyze}
                      disabled={!hasResume}
                      className={cn(
                        'w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all',
                        hasResume
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-black shadow-lg shadow-blue-500/20 hover:brightness-105'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      )}
                    >
                      <Zap className="w-4 h-4" />
                      Generate Analysis
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── ATS RESUME CARD ── */}
            <div className={cn(
              'group relative bg-card/60 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 shadow-2xl hover:-translate-y-1',
              hasGeneratedResume
                ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-emerald-500/5'
                : 'border-border hover:border-zinc-700'
            )}>
              {/* Green gradient accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/40 transition-all duration-500" />

              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0 group-hover:bg-emerald-500/15 transition-colors">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">ATS-Optimized Resume</h3>
                        {hasGeneratedResume && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 uppercase tracking-wider">
                            Ready
                          </span>
                        )}
                        {resumeStatus === 'FAILED' && (
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full border text-red-400 bg-red-500/10 border-red-500/20 uppercase tracking-wider">
                            Failed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                        Your resume rewritten by DeepSeek R1 reasoning model — tailored for ATS systems and the specific role. Download as PDF.
                      </p>
                    </div>
                  </div>

                  {hasGeneratedResume && (
                    <Link href={`/dashboard/resumestudio/${id}/generated`}>
                      <ChevronRight className="w-5 h-5 text-zinc-600 hover:text-emerald-400 transition-colors shrink-0 mt-1" />
                    </Link>
                  )}
                </div>

                {/* Action area */}
                <div className="mt-6">
                  {hasGeneratedResume ? (
                    <div className="flex gap-3">
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:brightness-105 transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20"
                      >
                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                      </button>
                      <Link
                        href={`/dashboard/resumestudio/${id}/generated`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 transition-all"
                      >
                        <Target className="w-4 h-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => setRegenerateTarget('resume')}
                        title="Regenerate ATS Resume"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        Regenerate
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateResume}
                      disabled={!hasResume}
                      className={cn(
                        'w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all',
                        hasResume
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg shadow-emerald-500/20 hover:brightness-105'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      )}
                    >
                      <Zap className="w-4 h-4" />
                      Generate ATS Resume
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info note */}
          {(!hasAnalysis || !hasGeneratedResume) && (
            <p className="text-center text-xs text-zinc-600 font-medium">
              Powered by DeepSeek R1 reasoning model. Each generation takes 1–2 minutes.
              <br />Generate analysis and resume independently — use only what you need.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
