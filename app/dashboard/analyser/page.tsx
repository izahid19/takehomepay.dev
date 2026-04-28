'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, BarChart3, Loader2, Trash2, CheckCircle2,
  Clock, ChevronLeft, ChevronRight, FileSearch, Zap, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getAnalysesApi, deleteAnalysisApi,
  ResumeAnalyserRecord, PaginatedAnalysesResponse,
} from '@/lib/resumeAnalyser.api';

// ─── Score Ring mini ──────────────────────────────────────────────────────────
const MiniScore = ({ score }: { score: number }) => {
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center border-4 shrink-0"
      style={{ borderColor: color + '40', background: color + '10' }}
    >
      <span className="text-sm font-black" style={{ color }}>{score}</span>
    </div>
  );
};

// ─── Analysis Card ────────────────────────────────────────────────────────────
const AnalysisCard = ({
  record,
  onDelete,
  isDeleting,
}: {
  record: ResumeAnalyserRecord;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  const dateStr = new Date(record.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const score = record.analysis?.score ?? null;
  const scoreLabel =
    score === null ? null :
    score >= 75 ? 'Excellent Match' :
    score >= 50 ? 'Good Match' : 'Needs Work';

  const MODEL_LABELS: Record<string, string> = {
    'pitchdown-pro': 'PD Pro',
    'pitchdown-fast': 'PD Fast',
    'pitchdown-premium-lite': 'PD Premium Lite',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-xl hover:border-blue-500/20 transition-colors group flex flex-col gap-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-zinc-900 rounded-xl group-hover:bg-blue-500/10 transition-colors shrink-0">
            <FileSearch className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{record.title}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {record.status === 'SUCCESS' && (
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              )}
              {record.status === 'FAILED' && (
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Failed
                </span>
              )}
              {record.status === 'GENERATING' && (
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Generating
                </span>
              )}
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                {MODEL_LABELS[record.aiModel] || record.aiModel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {score !== null && <MiniScore score={score} />}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
          >
            {isDeleting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Score label */}
      {scoreLabel && (
        <p className={cn(
          'text-xs font-bold',
          score! >= 75 ? 'text-emerald-400' :
          score! >= 50 ? 'text-amber-400' : 'text-red-400'
        )}>
          {scoreLabel}
          {record.analysis?.executiveSummary && (
            <span className="font-normal text-zinc-500 ml-1.5">
              · {record.analysis.executiveSummary.substring(0, 80)}...
            </span>
          )}
        </p>
      )}

      {/* Meta tags */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 font-medium">
          <Clock className="w-3 h-3" /> {dateStr}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 font-medium">
          🪙 {record.creditCost} credit{record.creditCost !== 1 ? 's' : ''}
        </span>
        {record.resumeFileName && (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 font-medium truncate max-w-[160px]">
            📄 {record.resumeFileName}
          </span>
        )}
      </div>

      {/* CTA */}
      {record.status === 'SUCCESS' && (
        <Link
          href={`/dashboard/analyser/${record._id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-blue-300 border border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 rounded-xl transition-all"
        >
          <BarChart3 className="w-4 h-4" /> View Analysis Report
        </Link>
      )}
    </motion.div>
  );
};

const ITEMS_PER_PAGE = 9;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyserListPage() {
  const [records, setRecords] = useState<ResumeAnalyserRecord[]>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: ITEMS_PER_PAGE });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchRecords = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const result = await getAnalysesApi(page, ITEMS_PER_PAGE);
      setRecords(result.data);
      setPagination({ total: result.total, totalPages: result.totalPages, page, limit: result.limit });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(currentPage); }, [currentPage, fetchRecords]);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await deleteAnalysisApi(confirmDeleteId);
      const isLastOnPage = records.length === 1 && currentPage > 1;
      const nextPage = isLastOnPage ? currentPage - 1 : currentPage;
      if (isLastOnPage) setCurrentPage(nextPage);
      else fetchRecords(nextPage);
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const { totalPages, page } = pagination;
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem   = Math.min(currentPage * ITEMS_PER_PAGE, pagination.total);

  return (
    <>
      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 shrink-0">
                  <Trash2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Analysis?</h3>
                  <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
                    This will permanently remove the analysis report. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deletingId ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="relative min-h-full space-y-8 pb-20">
        {/* Background pattern */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Header */}
        <div className="relative z-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5 mb-6"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Hub
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <FileSearch className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white">Resume Analyser</h1>
                  <p className="text-zinc-500 font-medium">
                    AI-powered resume analysis against any job description.{' '}
                    {pagination.total > 0 && (
                      <span className="text-blue-400 font-semibold">{pagination.total} generated</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/analyser/new"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-black text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:brightness-105 transition-all shadow-lg shadow-blue-500/20 text-base"
            >
              <Plus className="w-5 h-5" /> New Analysis
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : records.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 border-2 border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center text-center backdrop-blur-sm"
            >
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <FileSearch className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">No Analyses Yet</h3>
              <p className="text-zinc-500 max-w-sm mt-3 mb-8 text-sm font-medium leading-relaxed">
                Upload your resume and paste a job description — get a detailed AI score, keyword gaps, and improvement plan in seconds.
              </p>
              <Link
                href="/dashboard/analyser/new"
                className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 text-base shadow-lg shadow-blue-500/20"
              >
                <Zap className="w-5 h-5" /> Run First Analysis
              </Link>
            </motion.div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {records.map((record) => (
                  <AnalysisCard
                    key={record._id}
                    record={record}
                    onDelete={() => setConfirmDeleteId(record._id)}
                    isDeleting={deletingId === record._id}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-zinc-500 font-medium">
                Showing <span className="text-zinc-300 font-bold">{startItem}–{endItem}</span> of{' '}
                <span className="text-zinc-300 font-bold">{pagination.total}</span> analyses
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span key={`e-${idx}`} className="w-10 h-10 flex items-center justify-center text-zinc-600 text-sm font-bold">…</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page as number)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all border ${
                        currentPage === page
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10'
                          : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
