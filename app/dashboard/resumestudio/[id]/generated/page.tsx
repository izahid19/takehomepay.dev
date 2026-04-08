'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, BarChart3, Sparkles, FileText, Shield, Code2, Wrench, TrendingUp, ArrowLeft, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import {
  getResumeByIdApi,
  generateResumeForProjectApi,
  downloadResumeBlobApi,
  ResumeRecord,
} from '@/lib/resumeStudio.api';
import api from '@/lib/axios';
import ResumeEditor, { ResumeEditorData } from '@/components/resumestudio/ResumeEditor';

// ─── Main Page ─────────────────────────────────
export default function GeneratedResumePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const [isPreparing, setIsPreparing] = useState(true);

  // On mount: Fetch record, then auto-trigger generation if needed
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await fetchRecord();
      if (cancelled) return;

      // If resume doesn't exist yet, auto-trigger generation
      if (data && !data.newResumeContent) {
        try {
          const profileRes = await api.get('/profile');
          const rawText = profileRes.data?.data?.resume?.rawText;
          if (!rawText) {
            setError('Please upload a resume in your profile first.');
            setIsPreparing(false);
            return;
          }
          if (cancelled) return;

          setIsGenerating(true);
          const updated = await generateResumeForProjectApi(id, rawText);
          if (!cancelled) {
            setRecord(updated);
            setIsGenerating(false);
            setIsPreparing(false);
          }
        } catch (err: any) {
          if (!cancelled) {
            setError(err?.response?.data?.message || err?.message || 'Resume generation failed.');
            setIsGenerating(false);
            setIsPreparing(false);
          }
        }
      } else {
        setIsPreparing(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, fetchRecord]);

  // ── Loading ──────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // ── Error / No resume ────────────────────────
  if (!isGenerating && !isPreparing && (error || !record?.newResumeContent)) {
    return (
      <div className="relative min-h-full pb-20">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
        <div className="relative z-10 h-[60vh] flex flex-col items-center justify-center gap-4 p-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white font-bold text-lg">Resume not available</p>
          <p className="text-zinc-500 text-sm text-center max-w-sm">
            {error || 'Something went wrong generating the resume.'}
          </p>
          <button
            onClick={() => router.push(`/dashboard/resumestudio/${id}`)}
            className="text-sm text-primary hover:underline font-medium"
          >
            ← Back to Project
          </button>
        </div>
      </div>
    );
  }

  // ── Handling isGenerating ─────────────────────
  if (isGenerating) {
    return (
      <div className="relative min-h-screen pb-20">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8 pt-12">
          {/* Back */}
          <button
            onClick={() => router.push(`/dashboard/resumestudio/${id}`)}
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Project
          </button>

          {/* Full Screen Loading State (Rich Animation) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-black pt-20"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-3xl px-6">
              {/* Visual Indicator (Large) */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
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
                    <Sparkles className="w-14 h-14 text-emerald-400" />
                  </motion.div>
                </div>
                
                {/* Orbiting particles */}
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/40"
                    animate={{
                      rotate: [angle, angle + 360],
                    }}
                    transition={{
                      duration: 20,
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
                        "Analyzing Original Content...",
                        "Reading Job Requirements...",
                        "Tailoring Work History...",
                        "Optimizing for ATS Systems...",
                        "Rearranging Sections...",
                        "Finalizing Tailored Resume..."
                      ][Math.floor(Date.now() / 4000) % 6]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                {/* Large Progress Bar */}
                <div className="w-full space-y-3">
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 bg-[length:200%_100%]"
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
                  <Zap className="w-4 h-4 text-emerald-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Perfect Match</span>
                </div>
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">ATS Secure</span>
                </div>
                <div className="flex items-center gap-2">
                   <FileText className="w-4 h-4 text-emerald-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Standard PDF</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Convert the flat ResumeContent to ResumeEditorData ──
  const rc = record?.newResumeContent;
  const editorData: ResumeEditorData = {
    fullName: rc?.fullName ?? '',
    email: rc?.email ?? '',
    phone: rc?.phone ?? '',
    location: rc?.location ?? '',
    professionalSummary: rc?.professionalSummary ?? '',
    links: {
      github: rc?.links?.github ?? '',
      linkedin: rc?.links?.linkedin ?? '',
      leetcode: rc?.links?.leetcode ?? '',
      portfolio: rc?.links?.portfolio ?? '',
    },
    education: rc?.education ?? { degree: '', institution: '', duration: { start: '', end: '' } },
    technicalSkills: (rc?.technicalSkills ?? {}) as ResumeEditorData['technicalSkills'],
    experience: rc?.experience ?? [],
    projects: rc?.projects ?? [],
  };

  return (
    <ResumeEditor
      data={editorData}
      title={`ATS Resume — ${record?.profileType || 'Profile'}`}
      onBack={() => router.push(`/dashboard/resumestudio/${id}`)}
      backLabel="Project"
      saveLabel="Save Resume"
      onSave={async (data) => {
        try {
          const res = await api.patch(`/resume/${id}`, {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            professionalSummary: data.professionalSummary,
            links: data.links,
            education: data.education,
            technicalSkills: data.technicalSkills,
            experience: data.experience,
            projects: data.projects,
          });
          const saved = res.data.data;
          // Update local record
          setRecord(saved);
          showToast.success('Resume saved!');
          // Return the saved newResumeContent as editor data
          const src = saved.newResumeContent;
          return {
            fullName: src.fullName ?? '',
            email: src.email ?? '',
            phone: src.phone ?? '',
            location: src.location ?? '',
            professionalSummary: src.professionalSummary ?? '',
            links: src.links ?? { github: '', linkedin: '', leetcode: '', portfolio: '' },
            education: src.education ?? { degree: '', institution: '', duration: { start: '', end: '' } },
            technicalSkills: src.technicalSkills ?? {},
            experience: src.experience ?? [],
            projects: src.projects ?? [],
          };
        } catch {
          showToast.error('Failed to save');
          throw new Error('Save failed');
        }
      }}
      onDownload={async () => {
        try {
          const blob = await downloadResumeBlobApi(id);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const fullName = record?.newResumeContent?.fullName || record?.prevResumeContent?.fullName || 'Candidate';
          const personName = fullName.replace(/[^a-zA-Z0-9_\-]/g, '_');
          a.download = `${personName}_detailed_resume.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          showToast.success('Resume downloaded!');
        } catch {
          showToast.error('Download failed');
        }
      }}
    />
  );
}
