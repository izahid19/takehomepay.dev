'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Loader2, AlertCircle,
  Copy, Check, PenLine, Save, X, Mail,
  Zap, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getResumeByIdApi,
  generateEmailDraftApi,
  ResumeRecord,
  EmailDraft,
} from '@/lib/resumeStudio.api';
import api from '@/lib/axios';

// ─── Main Page ─────────────────────────────────
export default function EmailDraftPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState<EmailDraft | null>(null);

  // Copy state — separate for subject and body
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Profile data (for resumeText fallback)
  const [profileData, setProfileData] = useState<any>(null);

  const fetchRecord = useCallback(async () => {
    try {
      const data = await getResumeByIdApi(id);
      setRecord(data);
      if (data.emailDraft) {
        setEditedDraft({ ...data.emailDraft });
      }
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

  const hasEmailDraft = !!record?.emailDraft;
  const emailDraft = isEditing ? editedDraft : record?.emailDraft;

  // Auto-generate if no draft exists
  const handleGenerate = async () => {
    if (!record) return;
    setIsGenerating(true);
    setError(null);

    try {
      const resumeText = profileData?.resume?.rawText;
      const data = await generateEmailDraftApi(id, resumeText);
      setRecord(data);
      if (data.emailDraft) {
        setEditedDraft({ ...data.emailDraft });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to generate email draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const [isPreparing, setIsPreparing] = useState(true);

  // Auto-trigger generation on mount if no draft exists
  useEffect(() => {
    if (!isLoading && profileData && record && !hasEmailDraft && record.emailDraftStatus !== 'FAILED') {
      handleGenerate();
    } else if (!isLoading && profileData) {
      setIsPreparing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, !!profileData, record?._id]);

  const copySubject = () => {
    if (!emailDraft) return;
    navigator.clipboard.writeText(emailDraft.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const copyBody = () => {
    if (!emailDraft) return;
    const text = [
      emailDraft.greeting,
      '',
      ...emailDraft.body.map((p) => p + '\n'),
      emailDraft.closing,
      '',
      emailDraft.signature,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleSave = async () => {
    if (!editedDraft || !record) return;
    try {
      // Save via PATCH (we could add email draft to the PATCH handler, but for now just update locally)
      const response = await api.patch(`/resume/${id}`, {
        emailDraft: editedDraft,
      });
      setRecord(response.data.data);
      setIsEditing(false);
    } catch (err: any) {
      setError('Failed to save changes.');
    }
  };

  // ── Loading ────────────────────────────────
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

  // Removed isGenerating full-screen return


  return (
    <div className="relative pb-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8">

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
          <div className="flex items-start gap-3">
            <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20 shrink-0">
              <Mail className="w-6 h-6 text-violet-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-4xl font-black tracking-tight text-white">Email Draft</h1>
              <p className="text-base text-zinc-500 font-medium mt-1.5">
                AI-generated application email for <span className="text-zinc-400">{record.profileType}</span>
              </p>
            </div>
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
        {/* No email draft yet & Not Generating — manual generate button */}
        {!hasEmailDraft && !isGenerating && !isPreparing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-20"
          >
            <div className="w-20 h-20 bg-violet-500/10 rounded-full flex items-center justify-center border border-violet-500/20">
              <Mail className="w-10 h-10 text-violet-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-white uppercase tracking-tight">No Email Draft Generated</p>
              <p className="text-sm text-zinc-500 max-w-md">
                Generate a professional outreach email based on your resume and the job description.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-3 px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:brightness-110 shadow-lg shadow-violet-500/20 transition-all font-black uppercase tracking-wide"
            >
              <Zap className="w-5 h-5" />
              Generate Email Draft
            </button>
          </motion.div>
        )}

        {/* Full Screen Loading State (Rich Animation) */}
        {isGenerating && !hasEmailDraft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-black pt-20"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent:70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-12 w-full max-w-3xl px-6">
              {/* Visual Indicator (Large) */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-violet-500/5 flex items-center justify-center border border-violet-500/10 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)]">
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
                    <Mail className="w-14 h-14 text-violet-400" />
                  </motion.div>
                </div>
                
                {/* Orbiting particles */}
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-violet-400/40"
                    animate={{
                      rotate: [angle, angle + 360],
                    }}
                    transition={{
                      duration: 12,
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
                      key={Math.floor(Date.now() / 3000) % 6}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                      className="text-2xl font-black text-white uppercase tracking-[0.2em]"
                    >
                      {[
                        "Reading Job Details...",
                        "Analyzing Desired Tone...",
                        "Matching Your Experience...",
                        "Personalizing Hook...",
                        "Optimizing Subject Line...",
                        "Finalizing Email Draft..."
                      ][Math.floor(Date.now() / 3000) % 6]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                
                {/* Large Progress Bar */}
                <div className="w-full space-y-3">
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-600 via-violet-400 to-violet-600 bg-[length:200%_100%]"
                      animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      initial={{ width: "0%" }}
                      style={{ width: "0%" }}
                      whileInView={{ width: "95%" }}
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      AI Powered · DeepSeek Chat
                    </p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      Est. 15s
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom detail row */}
              <div className="flex items-center gap-12 pt-8 border-t border-zinc-800/30 w-full justify-center">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Natural Tone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Personalized Hook</span>
                </div>
                <div className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-violet-400/50" />
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">ATS Optimized</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Content */}
        {hasEmailDraft && emailDraft && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <div className="flex items-center gap-3">
                {!isEditing && (
                    <button
                      onClick={() => {
                        setEditedDraft(record.emailDraft ? { ...record.emailDraft } : null);
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-2.5 px-6 h-12 text-base font-bold rounded-xl bg-[#FFB800] hover:bg-[#E6A600] text-black transition-all active:scale-95 shadow-lg shadow-[#FFB800]/10"
                    >
                      <PenLine className="w-4 h-4" />
                      Edit Email
                    </button>
                )}
              </div>
            </div>

            {/* ═══ SUBJECT CARD ═══ */}
            <div className="bg-[#111111] rounded-xl border border-zinc-800/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500/0 via-violet-500/40 to-violet-500/0" />
              <div className="px-10 py-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] text-zinc-600 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-violet-500" />
                    Subject
                  </p>
                  <button
                    onClick={copySubject}
                    className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 transition-colors text-sm font-bold group"
                  >
                    {copiedSubject ? 'Copied!' : 'Copy'}
                    {copiedSubject ? <Check className="w-3.5 h-3.5 text-violet-400" /> : <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />}
                  </button>
                </div>
                {isEditing ? (
                  <input
                    value={editedDraft?.subject || ''}
                    onChange={(e) => setEditedDraft((prev) => prev ? { ...prev, subject: e.target.value } : prev)}
                    className="w-full bg-zinc-900/50 text-lg font-bold text-white focus:outline-none border border-zinc-800 rounded-lg px-4 py-3 focus:border-violet-500/50 transition-colors"
                    placeholder="Email subject..."
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white leading-snug">{emailDraft.subject}</h2>
                )}
              </div>
            </div>

            {/* ═══ BODY CARD ═══ */}
            <div className="bg-[#111111] rounded-xl border border-zinc-800/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-zinc-800/0 via-zinc-700/50 to-zinc-800/0" />

              {/* Copy Body button */}
              <div className="flex justify-end px-12 pt-6">
                <button
                  onClick={copyBody}
                  className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 transition-colors text-sm font-bold group"
                >
                  {copiedBody ? 'Copied!' : 'Copy Body'}
                  {copiedBody ? <Check className="w-3.5 h-3.5 text-violet-400" /> : <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />}
                </button>
              </div>

              <div className="p-12 pt-4 pb-8">
                {isEditing ? (
                  <textarea
                    value={(() => {
                      if (!editedDraft) return '';
                      return [
                        editedDraft.greeting,
                        '',
                        ...editedDraft.body.flatMap((p) => [p, '']),
                        editedDraft.closing,
                        '',
                        editedDraft.signature,
                      ].join('\n');
                    })()}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const lines = raw.split('\n');

                      // First non-empty line is the greeting
                      const greeting = lines[0] || '';

                      // Last two non-empty chunks are closing + signature
                      const trimmedLines = [...lines];
                      let signature = '';
                      let closing = '';

                      // Walk backwards to find signature and closing
                      let i = trimmedLines.length - 1;
                      while (i >= 0 && !trimmedLines[i].trim()) i--;
                      if (i >= 0) { signature = trimmedLines[i]; trimmedLines.splice(i, trimmedLines.length - i); }
                      while (i > 0 && !trimmedLines[i - 1].trim()) i--;
                      i = trimmedLines.length - 1;
                      while (i >= 0 && !trimmedLines[i].trim()) i--;
                      if (i >= 0) { closing = trimmedLines[i]; trimmedLines.splice(i, trimmedLines.length - i); }

                      // Everything between greeting and closing is body paragraphs (split by empty lines)
                      const bodyText = trimmedLines.slice(1).join('\n').trim();
                      const body = bodyText
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean);

                      setEditedDraft((prev) => prev ? {
                        ...prev,
                        greeting,
                        body: body.length > 0 ? body : [''],
                        closing,
                        signature,
                      } : prev);
                    }}
                    className="w-full min-h-[500px] bg-transparent text-zinc-300 font-medium text-[17px] leading-relaxed focus:outline-none resize-none"
                    placeholder="Edit your email here..."
                  />
                ) : (
                  <div className="prose prose-invert prose-lg max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:text-[17px] prose-strong:text-white">
                    <p className="font-bold text-[18px] text-white">{emailDraft.greeting}</p>

                    {emailDraft.body.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}

                    <p className="font-medium">{emailDraft.closing}</p>
                    <p className="font-black text-xl text-white">{emailDraft.signature}</p>
                  </div>
                )}
              </div>

              {/* Inline Editor Footer */}
              {isEditing && (
                <div className="border-t border-zinc-900 bg-zinc-900/30 px-10 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                    {JSON.stringify(editedDraft) !== JSON.stringify(record.emailDraft) ? (
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Sparkles className="w-3 h-3" />
                        Changes detected
                      </div>
                    ) : (
                      "No changes made"
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedDraft(record.emailDraft ? { ...record.emailDraft } : null);
                      }}
                      className="px-6 h-10 rounded-lg font-bold text-sm border border-zinc-800 text-zinc-400 hover:bg-black transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={JSON.stringify(editedDraft) === JSON.stringify(record.emailDraft)}
                      className="flex items-center gap-2 px-6 h-10 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition-all shadow-lg shadow-emerald-600/10"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Source Note */}
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-3 h-3 text-violet-500" />
              <p className="text-xs text-zinc-600 font-medium">
                Generated using {record.newResumeContent ? 'ATS-optimized resume' : 'uploaded profile resume'} · Powered by DeepSeek Chat
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
