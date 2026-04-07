'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, BarChart3, Sparkles, FileText, Shield, Code2, Wrench, TrendingUp } from 'lucide-react';
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

// ─── Generating State (inline, full page) ──────
function GeneratingState() {
  const steps = [
    'Reading your resume and job description...',
    'Analyzing role requirements with DeepSeek...',
    'Tailoring bullet points for ATS keywords...',
    'Optimizing professional summary...',
    'Restructuring skills section...',
    'Generating before → after versions...',
    'Finalizing ATS-optimized resume...',
  ];

  const [stepIdx, setStepIdx] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setStepIdx((i) => Math.min(i + 1, steps.length - 1)), 15000);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <div className="relative min-h-full pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">ATS Resume</h1>
            <p className="text-zinc-500 text-sm font-medium mt-0.5">Generating your tailored resume...</p>
          </div>
        </div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/60 backdrop-blur-sm border border-emerald-500/10 rounded-2xl p-10 shadow-2xl"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Spinner */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-4 animate-spin border-t-emerald-500 border-r-emerald-500/20 border-b-transparent border-l-transparent" />
              <div className="absolute inset-[8px] rounded-full bg-zinc-900 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Step text */}
            <div className="text-center space-y-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-bold text-emerald-400"
                >
                  {steps[stepIdx]}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-zinc-600 font-medium">
                AI resume generation takes 1–2 minutes with the reasoning model
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-sm">
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: '5%' }}
                  animate={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <p className="text-[10px] text-zinc-600 font-medium text-center mt-2">
                Step {stepIdx + 1} of {steps.length}
              </p>
            </div>

            {/* Shimmer lines */}
            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[75, 60, 85, 50, 70, 65].map((w, i) => (
                  <div
                    key={i}
                    className="h-2 bg-zinc-800 rounded-full animate-pulse"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* What you'll get */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: FileText, label: 'Tailored Summary', color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Optimized Bullets', color: 'text-pink-400' },
            { icon: Code2, label: 'Skills Alignment', color: 'text-purple-400' },
            { icon: Shield, label: 'ATS Formatting', color: 'text-cyan-400' },
            { icon: Wrench, label: 'Edit & Refine', color: 'text-amber-400' },
            { icon: Sparkles, label: 'PDF Download', color: 'text-emerald-400' },
          ].map(({ icon: I, label, color }, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-zinc-900/40 border border-zinc-800/50 rounded-xl">
              <I className={cn('w-4 h-4', color)} />
              <span className="text-xs text-zinc-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
            return;
          }
          if (cancelled) return;

          setIsGenerating(true);
          const updated = await generateResumeForProjectApi(id, rawText);
          if (!cancelled) {
            setRecord(updated);
            setIsGenerating(false);
          }
        } catch (err: any) {
          if (!cancelled) {
            setError(err?.response?.data?.message || err?.message || 'Resume generation failed.');
            setIsGenerating(false);
          }
        }
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

  // ── Generating ───────────────────────────────
  if (isGenerating) {
    return <GeneratingState />;
  }

  // ── Error / No resume ────────────────────────
  if (error || !record?.newResumeContent) {
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

  // ── Convert the flat ResumeContent to ResumeEditorData ──
  const rc = record.newResumeContent;
  const editorData: ResumeEditorData = {
    fullName: rc.fullName ?? '',
    email: rc.email ?? '',
    phone: rc.phone ?? '',
    location: rc.location ?? '',
    professionalSummary: rc.professionalSummary ?? '',
    links: {
      github: rc.links?.github ?? '',
      linkedin: rc.links?.linkedin ?? '',
      leetcode: rc.links?.leetcode ?? '',
      portfolio: rc.links?.portfolio ?? '',
    },
    education: rc.education ?? { degree: '', institution: '', duration: { start: '', end: '' } },
    technicalSkills: (rc.technicalSkills ?? {}) as ResumeEditorData['technicalSkills'],
    experience: rc.experience ?? [],
    projects: rc.projects ?? [],
  };

  return (
    <ResumeEditor
      data={editorData}
      title={`ATS Resume — ${record.profileType}`}
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
          const fullName = record.newResumeContent?.fullName || record.prevResumeContent?.fullName || 'Candidate';
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
