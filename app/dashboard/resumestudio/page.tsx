'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, FileText, Download, Loader2, Trash2,
  ChevronDown, ChevronUp, Briefcase, Code2, GraduationCap,
  User, ExternalLink, Clock, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getResumesApi, downloadResumeApi, deleteResumeApi, ResumeRecord, ResumeContent } from '@/lib/resumeStudio.api';

// ─────────────────────────────────────────────
// Resume Detail Drawer — shows newResumeContent
// ─────────────────────────────────────────────
const ResumeDetailDrawer = ({
  record,
  isOpen,
  onClose,
}: {
  record: ResumeRecord;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!record) return null;
  const c = record.newResumeContent;
  if (!c) return null;

  const skillGroups = [
    { label: 'Frontend', skills: c.technicalSkills?.frontend },
    { label: 'Backend', skills: c.technicalSkills?.backend },
    { label: 'Languages', skills: c.technicalSkills?.programmingLanguages },
    { label: 'Databases', skills: c.technicalSkills?.databases },
    { label: 'Architecture', skills: c.technicalSkills?.architecture },
    { label: 'DevOps & Tools', skills: c.technicalSkills?.devOpsAndTools },
    { label: 'AI Tools', skills: c.technicalSkills?.aiTools },
    { label: 'Services', skills: c.technicalSkills?.middlewareAndServices },
  ].filter((g) => g.skills?.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#09090b] border-l border-zinc-800 z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mb-0.5">AI-Tailored Resume</p>
                <h2 className="text-lg font-bold text-white">{c.fullName || 'Resume'}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-7">
              {/* Contact */}
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {c.email && (
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Email</p>
                      <p className="text-zinc-300 text-xs truncate">{c.email}</p>
                    </div>
                  )}
                  {c.phone && (
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Phone</p>
                      <p className="text-zinc-300 text-xs">{c.phone}</p>
                    </div>
                  )}
                  {c.location && (
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Location</p>
                      <p className="text-zinc-300 text-xs">{c.location}</p>
                    </div>
                  )}
                </div>
                {/* Links */}
                <div className="flex gap-3 mt-3 flex-wrap">
                  {c.links?.linkedin && (
                    <a href={c.links.linkedin} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                  {c.links?.github && (
                    <a href={c.links.github} target="_blank" rel="noreferrer"
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Summary */}
              {c.professionalSummary && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Summary</h3>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{c.professionalSummary}</p>
                </div>
              )}

              {/* Skills */}
              {skillGroups.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Technical Skills</h3>
                  </div>
                  <div className="space-y-2">
                    {skillGroups.map((g) => (
                      <div key={g.label} className="flex gap-2 flex-wrap items-baseline">
                        <span className="text-xs font-bold text-zinc-500 w-24 shrink-0">{g.label}:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {g.skills!.map((s) => (
                            <span key={s} className="text-[11px] px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {c.experience?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Experience</h3>
                  </div>
                  <div className="space-y-4">
                    {c.experience.map((exp, i) => (
                      <div key={i} className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="text-sm font-bold text-white">{exp.role}</p>
                            <p className="text-xs text-zinc-400">{exp.company} · {exp.employmentType}</p>
                          </div>
                          <p className="text-xs text-zinc-500 shrink-0 font-medium">
                            {exp.duration?.start} – {exp.duration?.end}
                          </p>
                        </div>
                        {exp.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 my-2">
                            {exp.technologies.map((t) => (
                              <span key={t} className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-medium">{t}</span>
                            ))}
                          </div>
                        )}
                        <ul className="space-y-1 mt-2">
                          {exp.responsibilitiesAndAchievements?.map((b, j) => (
                            <li key={j} className="text-xs text-zinc-400 leading-relaxed flex gap-2">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {c.projects?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Projects</h3>
                  </div>
                  <div className="space-y-3">
                    {c.projects.map((proj, i) => (
                      <div key={i} className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
                        <p className="text-sm font-bold text-white mb-1">{proj.title}</p>
                        {proj.technologyStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {proj.technologyStack.map((t) => (
                              <span key={t} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded">{t}</span>
                            ))}
                          </div>
                        )}
                        <ul className="space-y-1">
                          {proj.description?.map((b, j) => (
                            <li key={j} className="text-xs text-zinc-400 leading-relaxed flex gap-2">
                              <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {c.education?.degree && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Education</h3>
                  </div>
                  <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30 flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-white">{c.education.degree}</p>
                      <p className="text-xs text-zinc-400">{c.education.institution}</p>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">
                      {c.education.duration?.start} – {c.education.duration?.end}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// Resume Card (history item)
// ─────────────────────────────────────────────
const ResumeHistoryCard = ({
  record,
  onDelete,
  isDeleting,
  onView,
  onDownload,
  isDownloading,
}: {
  record: ResumeRecord;
  onDelete: () => void;
  isDeleting: boolean;
  onView: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}) => {
  const c = record.newResumeContent;
  const dateStr = new Date(record.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const skillCount =
    (c?.technicalSkills?.frontend?.length ?? 0) +
    (c?.technicalSkills?.backend?.length ?? 0) +
    (c?.technicalSkills?.programmingLanguages?.length ?? 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-xl hover:border-emerald-500/20 transition-colors group flex flex-col gap-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-zinc-900 rounded-xl group-hover:bg-emerald-500/10 transition-colors shrink-0">
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{c?.fullName || record.profileType}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {record.status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
              {record.status === 'FAILED'  && <></>}
              {record.status === 'SAVED'   && <></>}
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider',
                record.status === 'SUCCESS'    ? 'text-emerald-500' :
                record.status === 'FAILED'     ? 'text-red-400' :
                record.status === 'GENERATING' ? 'text-amber-400' :
                'text-zinc-500'
              )}>
                {record.status}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40 shrink-0"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Summary snippet */}
      {c?.professionalSummary && (
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {c.professionalSummary}
        </p>
      )}

      {/* Tags row */}
      <div className="flex flex-wrap gap-2">
        {c?.experience?.[0] && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 font-medium">
            <Briefcase className="w-2.5 h-2.5" />
            {c.experience[0].role} @ {c.experience[0].company}
          </span>
        )}
        {skillCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 font-medium">
            <Code2 className="w-2.5 h-2.5" />
            {skillCount} skills
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500">
          <Clock className="w-2.5 h-2.5" />
          {dateStr}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/dashboard/resumestudio/${record._id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 rounded-xl transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          View Project
        </Link>
        {record.status === 'SUCCESS' && (
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-black bg-gradient-to-r from-[#2DD4BF] to-[#10B981] hover:brightness-105 rounded-xl transition-all disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function ResumeStudioPage() {
  const [records, setRecords] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewRecord, setViewRecord] = useState<ResumeRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    getResumesApi()
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await deleteResumeApi(confirmDeleteId);
      setRecords((prev) => prev.filter((r) => r._id !== confirmDeleteId));
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleDownload = async (record: ResumeRecord) => {
    setDownloadingId(record._id);
    try {
      const personName = (record.newResumeContent?.fullName || record.prevResumeContent?.fullName || 'Candidate').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const name = `${personName}_detailed_resume.pdf`;
      await downloadResumeApi(record._id, name);
    } catch {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <ResumeDetailDrawer
        record={viewRecord!}
        isOpen={!!viewRecord}
        onClose={() => setViewRecord(null)}
      />

      <AnimatePresence>
        {confirmDeleteId && (
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
                  onClick={() => setConfirmDeleteId(null)} 
                  disabled={!!deletingId}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm} 
                  disabled={!!deletingId}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 shadow-lg shadow-red-500/10 transition-all disabled:opacity-50"
                >
                  {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deletingId ? 'Deleting...' : 'Delete Permanently'}
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

        {/* Header */}
        <div className="relative z-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5 mb-6"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Hub
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-white">Resume Studio</h1>
              <p className="text-zinc-500 font-medium">
                Your AI-tailored resume history.{' '}
                {records.length > 0 && (
                  <span className="text-emerald-500 font-semibold">{records.length} generated</span>
                )}
              </p>
            </div>
            <Link
              href="/dashboard/resumestudio/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-black bg-gradient-to-r from-[#2DD4BF] to-[#10B981] hover:brightness-105 transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              <Plus className="w-4 h-4" />
              Generate New Resume
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center text-center backdrop-blur-sm"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white">No Resumes Yet</h3>
            <p className="text-zinc-500 max-w-sm mt-3 mb-8 text-sm font-medium leading-relaxed">
              Generate your first AI-tailored resume in seconds. Just paste a job description and let AI do the work.
            </p>
            <Link
              href="/dashboard/resumestudio/new"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#2DD4BF] to-[#10B981] text-sm shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </Link>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {records.map((record) => (
                <ResumeHistoryCard
                  key={record._id}
                  record={record}
                  onDelete={() => setConfirmDeleteId(record._id)}
                  isDeleting={deletingId === record._id}
                  onView={() => setViewRecord(record)}
                  onDownload={() => handleDownload(record)}
                  isDownloading={downloadingId === record._id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        </div>
      </div>
    </>
  );
}
