'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Mail, Linkedin, Copy, Check,
  Zap, RefreshCw, Loader2, AlertCircle, Sparkles,
  CheckCircle2, ChevronDown, ChevronUp, Calendar, User, AtSign, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getResumeByIdApi, generateFollowUpApi, updateFollowUpApi,
  ResumeRecord, FollowUpTracker, FollowUpMeta, ApplicationStatus,
} from '@/lib/resumeStudio.api';
import { useAuth } from '@/hooks/useAuth';

// ── Urgency config ────────────────────────────
const URGENCY_CONFIG = {
  urgent:  { label: 'URGENT', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  overdue: { label: 'OVERDUE', color: 'text-amber-400', bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  },
  waiting: { label: 'WAITING', color: 'text-zinc-400',  bg: 'bg-zinc-800/40',   border: 'border-zinc-700'      },
  cold:    { label: 'COLD',    color: 'text-zinc-600',  bg: 'bg-zinc-900/40',   border: 'border-zinc-800'      },
};

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'applied',   label: 'Applied' },
  { value: 'responded', label: 'Responded' },
  { value: 'interview', label: 'Interview Scheduled' },
  { value: 'offer',     label: 'Offer Received' },
  { value: 'discarded', label: 'Discarded' },
  { value: 'cold',      label: 'Cold (no reply)' },
];

// ── Copy button ───────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700">
      {copied ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ── Urgency badge ─────────────────────────────
function UrgencyBadge({ urgency, daysAgo, nextIn }: { urgency: FollowUpMeta['urgency']; daysAgo: number; nextIn: number }) {
  const cfg = URGENCY_CONFIG[urgency];
  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold', cfg.bg, cfg.border)}>
      <span className={cfg.color}>{cfg.label}</span>
      <span className="text-zinc-500">·</span>
      <span className="text-zinc-400">{daysAgo} day{daysAgo !== 1 ? 's' : ''} since application</span>
      {nextIn > 0 && <><span className="text-zinc-500">·</span><span className="text-zinc-500">next in {nextIn}d</span></>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────
export default function FollowUpPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const userCredits = user?.credits ?? 0;

  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<FollowUpMeta | null>(null);

  // Form state
  const [channel, setChannel] = useState<'email' | 'linkedin'>('email');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('applied');

  const [markingSent, setMarkingSent] = useState(false);
  const [markedSent, setMarkedSent] = useState(false);

  const CREDIT_COST = 1;

  const fetchRecord = useCallback(async () => {
    try {
      const data = await getResumeByIdApi(id);
      setRecord(data);
      if (data.followUp) {
        setSelectedStatus(data.followUp.applicationStatus || 'applied');
        setContactName(data.followUp.contactName || '');
        setContactEmail(data.followUp.contactEmail || '');
        setChannel(data.followUp.lastDraftChannel || 'email');
      }
    } catch {
      setError('Project not found.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  const followUp: FollowUpTracker | null = record?.followUp ?? null;
  const followUpCount = followUp?.followUps?.length ?? 0;
  const hasDraft = !!followUp?.lastDraft;
  const isCold = followUpCount >= 2 && selectedStatus === 'applied';

  const handleGenerate = async () => {
    if (userCredits < CREDIT_COST) { setError('Insufficient credits.'); return; }
    setIsGenerating(true);
    setError(null);
    setMarkedSent(false);
    try {
      const { record: updated, meta: m } = await generateFollowUpApi(id, {
        channel,
        applicationStatus: selectedStatus,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
      });
      setRecord(updated);
      setMeta(m);
      refreshUser();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate follow-up.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkSent = async () => {
    if (!followUp?.lastDraft) return;
    setMarkingSent(true);
    try {
      const updated = await updateFollowUpApi(id, {
        action: 'record_sent',
        channel: followUp.lastDraftChannel as 'email' | 'linkedin',
        contactName: contactName || followUp.contactName || 'Hiring team',
        notes: notes || `Follow-up #${followUpCount + 1}`,
        draftUsed: followUp.lastDraft,
      });
      setRecord(updated);
      setMarkedSent(true);
      setNotes('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to record follow-up.');
    } finally {
      setMarkingSent(false);
    }
  };

  const handleStatusUpdate = async (status: ApplicationStatus) => {
    setSelectedStatus(status);
    try {
      const updated = await updateFollowUpApi(id, { action: 'update_status', applicationStatus: status });
      setRecord(updated);
    } catch { /* non-critical */ }
  };

  if (isLoading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  );

  if (!record) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-white font-bold">Project not found</p>
      <Link href="/dashboard/resumestudio" className="text-sm text-teal-400 hover:underline">← Back</Link>
    </div>
  );

  const urgencyCfg = meta ? URGENCY_CONFIG[meta.urgency] : null;

  return (
    <div className="relative pb-12">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-8">

        {/* Back */}
        <Link href={`/dashboard/resumestudio/${id}`}
          className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Project
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shrink-0">
            <Clock className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Follow-up Tracker</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Cadence-driven follow-up drafts — email (&lt;150 words) or LinkedIn (&lt;300 chars)
            </p>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Settings panel — status + contact + channel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
          <button onClick={() => setShowSettings(p => !p)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/40 transition-colors">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Application Setup</span>
              <span className={cn('text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                urgencyCfg ? `${urgencyCfg.bg} ${urgencyCfg.color}` : 'bg-zinc-800 text-zinc-500'
              )}>
                {STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label ?? selectedStatus}
              </span>
              {followUpCount > 0 && (
                <span className="text-[10px] font-bold text-zinc-500">{followUpCount} sent</span>
              )}
            </div>
            {showSettings ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-zinc-800 px-5 py-5 space-y-5">

                {/* Application status */}
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Application Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button key={s.value} onClick={() => handleStatusUpdate(s.value)}
                        className={cn('px-3 py-1.5 text-xs font-bold rounded-lg border transition-all',
                          selectedStatus === s.value
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-white'
                        )}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 font-bold flex items-center gap-1.5"><User className="w-3 h-3" />Contact Name</label>
                    <input type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                      placeholder="e.g. Sarah Chen (Recruiter)"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 font-bold flex items-center gap-1.5"><AtSign className="w-3 h-3" />Contact Email</label>
                    <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                      placeholder="recruiter@company.com"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                </div>

                {/* Channel */}
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">Channel</p>
                  <div className="flex gap-2">
                    {([
                      { id: 'email', label: 'Email', icon: Mail },
                      { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                    ] as const).map(c => (
                      <button key={c.id} onClick={() => setChannel(c.id)}
                        className={cn('flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all',
                          channel === c.id
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700 hover:text-white'
                        )}>
                        <c.icon className="w-3.5 h-3.5" />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Cold state */}
        {isCold && !isGenerating && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <p className="text-sm font-bold text-zinc-400">⛔ Application marked as cold</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              You've already sent {followUpCount} follow-up{followUpCount > 1 ? 's' : ''} with no response.
              Consider: updating status to "Discarded", trying a different contact via LinkedIn Outreach, or keeping it for later.
            </p>
          </div>
        )}

        {/* Generate button */}
        {!isGenerating && (
          <div className="flex flex-col items-center gap-4">
            {meta && <UrgencyBadge urgency={meta.urgency} daysAgo={meta.daysSinceApplication} nextIn={meta.nextFollowUpIn} />}
            <button
              onClick={handleGenerate}
              disabled={userCredits < CREDIT_COST || isCold}
              className={cn(
                'flex items-center gap-3 px-8 py-4 text-sm font-black rounded-xl uppercase tracking-wide transition-all shadow-lg',
                userCredits >= CREDIT_COST && !isCold
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 hover:brightness-110'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              )}
            >
              <Zap className="w-5 h-5" />
              {hasDraft ? 'Regenerate Draft' : 'Generate Follow-up'} (1 credit)
            </button>
          </div>
        )}

        {/* Generating */}
        {isGenerating && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Clock className="w-10 h-10 text-emerald-400" />
              </motion.div>
            </div>
            <p className="text-lg font-bold text-white">Crafting your follow-up...</p>
            <div className="w-48 bg-zinc-900 rounded-full h-1 border border-zinc-800 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
          </div>
        )}

        {/* Draft */}
        {hasDraft && !isGenerating && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Meta row */}
            {meta && (
              <div className="flex flex-wrap items-center gap-3">
                <UrgencyBadge urgency={meta.urgency} daysAgo={meta.daysSinceApplication} nextIn={meta.nextFollowUpIn} />
                <span className={cn('inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border',
                  followUp?.lastDraftChannel === 'email'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                )}>
                  {followUp?.lastDraftChannel === 'email' ? <Mail className="w-3 h-3" /> : <Linkedin className="w-3 h-3" />}
                  {followUp?.lastDraftChannel === 'email' ? 'Email' : 'LinkedIn'}
                </span>
              </div>
            )}

            {/* Subject line (email) */}
            {meta?.subject && (
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3">
                <span className="text-xs text-zinc-500 font-bold shrink-0">SUBJECT</span>
                <span className="text-sm text-white font-medium flex-1">{meta.subject}</span>
                <CopyButton text={meta.subject} />
              </div>
            )}

            {/* Draft body */}
            <div className={cn('rounded-2xl border p-5 space-y-4',
              urgencyCfg?.border ?? 'border-zinc-800',
              urgencyCfg?.bg ?? 'bg-zinc-900/40'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-bold text-white">
                    Follow-up #{followUpCount + 1} Draft
                  </span>
                </div>
                <CopyButton text={`${meta?.subject ? `Subject: ${meta.subject}\n\n` : ''}${followUp?.lastDraft || ''}`} />
              </div>

              <div className="bg-black/30 rounded-xl p-5 border border-zinc-800">
                <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {followUp?.lastDraft}
                </p>
              </div>

              {meta?.reasoning && (
                <p className="text-[11px] text-zinc-500 italic">💡 {meta.reasoning}</p>
              )}

              {/* Mark as sent */}
              {!markedSent ? (
                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">After you send it</p>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Optional note (e.g. 'referenced company blog post')"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors" />
                  <button onClick={handleMarkSent} disabled={markingSent}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-black rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all uppercase tracking-wide">
                    {markingSent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Mark as Sent
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Recorded! Follow-up #{followUpCount} logged.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Follow-up history */}
        {followUpCount > 0 && (
          <div className="space-y-2">
            <button onClick={() => setShowHistory(p => !p)}
              className="flex items-center gap-2 text-xs text-zinc-500 font-bold hover:text-white transition-colors">
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              History ({followUpCount} sent)
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-2">
                  {[...(followUp?.followUps ?? [])].reverse().map((fu, i) => (
                    <div key={fu._id ?? i} className="flex items-start gap-3 bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
                      <div className="p-1.5 bg-zinc-800 rounded-lg shrink-0">
                        {fu.channel === 'email' ? <Mail className="w-3 h-3 text-zinc-400" /> : <Linkedin className="w-3 h-3 text-zinc-400" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white capitalize">{fu.channel}</span>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(fu.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        {fu.notes && <p className="text-xs text-zinc-500">{fu.notes}</p>}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <p className="text-xs text-zinc-600 font-medium">
            Cadence: Applied → 7 days · Responded → 1 day · Interview → 1 day (thank-you)
          </p>
        </div>
      </div>
    </div>
  );
}
