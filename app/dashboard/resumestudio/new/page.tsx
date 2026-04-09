'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Sparkles, FileText, Briefcase, Save, AlertCircle, Loader2, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveProjectApi } from '@/lib/resumeStudio.api';
import api from '@/lib/axios';

const MAX_JD = 10000;

export default function NewResumeProjectPage() {
  const router = useRouter();

  const [profileType, setProfileType] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUserEditedName, setHasUserEditedName] = useState(false);

  // Check profile has resume
  const [profileData, setProfileData] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    api
      .get('/profile')
      .then((r) => setProfileData(r.data.data))
      .catch(() => setProfileData(null))
      .finally(() => setIsFetchingProfile(false));
  }, []);

  const hasResume = !!profileData?.resume?.rawText;
  const jdLength = jobDescription.length;
  const canSave = profileType.trim().length > 0 && jdLength >= 50 && jdLength <= MAX_JD && !isSaving && hasResume;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setError(null);
    try {
      const record = await saveProjectApi({
        profileType: profileType.trim(),
        jobDescription: jobDescription.trim(),
      });
      router.push(`/dashboard/resumestudio/${record._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save project.');
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-full space-y-8 pb-20">
      {/* Background Pattern — matching other dashboard pages */}
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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">New Resume Project</h1>
              <p className="text-zinc-500 text-sm font-medium mt-0.5">
                Save your project first, then generate an AI-tailored resume anytime.
              </p>
            </div>
          </div>
        </motion.div>

        {/* No resume warning */}
        {!isFetchingProfile && !hasResume && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Resume not uploaded</p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                You need to upload a resume in your{' '}
                <Link href="/dashboard/profile" className="underline hover:text-amber-300">
                  profile
                </Link>{' '}
                before generating. You can still save the project now.
              </p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-6"
        >
          {/* Project name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <FileText className="w-4 h-4 text-zinc-500" />
              Project Name
            </label>
            <input
              type="text"
              value={profileType}
              onChange={(e) => {
                setProfileType(e.target.value);
                setHasUserEditedName(true);
              }}
              placeholder="e.g. Senior Frontend Dev @ Google"
              maxLength={100}
              className={cn(
                'w-full bg-zinc-900/80 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all',
                profileType.trim() ? 'border-zinc-700' : 'border-zinc-800'
              )}
            />
            <p className="text-xs text-zinc-600 font-medium">Give this project a descriptive name so you can identify it later.</p>
          </div>

          {/* Job description */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <Briefcase className="w-4 h-4 text-zinc-500" />
                Target Job Description
              </span>
              <span
                className={cn(
                  'text-xs font-mono font-medium transition-colors',
                  jdLength > MAX_JD ? 'text-red-400' : jdLength > MAX_JD * 0.85 ? 'text-amber-400' : 'text-zinc-600'
                )}
              >
                {jdLength} / {MAX_JD}
              </span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                const val = e.target.value;
                setJobDescription(val);
                if (!hasUserEditedName) {
                  if (val.trim().length > 0) {
                    const lines = val.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    if (lines.length > 0) {
                      let title = lines[0];
                      if (title.length > 40) {
                        title = title.substring(0, 40) + '...';
                      }
                      setProfileType(title);
                    }
                  } else {
                    setProfileType('');
                  }
                }
              }}
              placeholder="Paste the full job description here..."
              rows={12}
              maxLength={MAX_JD}
              className={cn(
                'w-full bg-zinc-900/80 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all',
                'resize-none leading-relaxed',
                jdLength > MAX_JD ? 'border-red-500/50' : 'border-zinc-800'
              )}
            />
            {jdLength > 0 && jdLength < 50 && (
              <p className="text-xs text-amber-400 font-medium">At least 50 characters required.</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Save button */}
          <motion.button
            onClick={handleSave}
            disabled={!canSave}
            whileHover={canSave ? { scale: 1.01 } : {}}
            whileTap={canSave ? { scale: 0.98 } : {}}
            className={cn(
              'w-full py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all',
              canSave
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:brightness-105'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Project...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Project
              </>
            )}
          </motion.button>

          {!isFetchingProfile && (
            <div className="flex flex-col gap-1.5 pt-1">
              <div className={cn('flex items-center gap-2 text-xs font-medium', hasResume ? 'text-emerald-500' : 'text-zinc-600')}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resume uploaded {hasResume ? '✓' : '— required for generation'}
              </div>
              <div className={cn('flex items-center gap-2 text-xs font-medium', profileType.trim() ? 'text-emerald-500' : 'text-zinc-600')}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Project name {profileType.trim() ? '✓' : '— required'}
              </div>
              <div className={cn('flex items-center gap-2 text-xs font-medium', jdLength >= 50 ? 'text-emerald-500' : 'text-zinc-600')}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Job description {jdLength >= 50 ? '✓' : `— ${Math.max(0, 50 - jdLength)} more characters needed`}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
