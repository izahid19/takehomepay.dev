'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getResumeByIdApi,
  analyzeForProjectApi,
  ResumeRecord,
} from '@/lib/resumeStudio.api';
import api from '@/lib/axios';

// New specialized components
import { ModelSelectionView, AnalysisModel } from './components/ModelSelectionView';
import { AnalysisDashboard } from './components/AnalysisDashboard';

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const userCredits = user?.credits ?? 0;

  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Model selection state
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [pendingRawText, setPendingRawText] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AnalysisModel>('pitchdown-pro');

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

  const runAnalysis = async (rawText: string, model: AnalysisModel) => {
    setShowModelSelection(false);
    setSelectedModel(model);
    setError(null);
    setIsAnalyzing(true);
    try {
      const updated = await analyzeForProjectApi(id, rawText, model);
      setRecord(updated);
      // Refresh user so header credit count updates immediately
      refreshUser();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // On mount: Fetch record → if no analysis, load profile and show model picker
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await fetchRecord();
      if (cancelled) return;

      if (data && !data.analysis) {
        // Need to generate — load profile text then show model selection
        try {
          const profileRes = await api.get('/profile');
          const rawText = profileRes.data?.data?.resume?.rawText;
          if (!rawText) {
            setError('Please upload a resume in your profile first.');
            setIsPreparing(false);
            return;
          }
          if (cancelled) return;
          setPendingRawText(rawText);
          setShowModelSelection(true);
          setIsPreparing(false);
        } catch (err: any) {
          if (!cancelled) {
            setError(err?.response?.data?.message || err?.message || 'Failed to load profile.');
            setIsPreparing(false);
          }
        }
      } else {
        setIsPreparing(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, fetchRecord]);

  // Loading / preparing state
  if (isLoading || isPreparing) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Analysis</p>
        </div>
      </div>
    );
  }

  // Model selection view
  if (showModelSelection) {
    return (
      <ModelSelectionView
        onSelect={(model) => {
          if (pendingRawText) runAnalysis(pendingRawText, model);
        }}
        onBack={() => router.push(`/dashboard/resumestudio/${id}`)}
        userCredits={userCredits}
        userPlan={user?.plan}
      />
    );
  }

  return (
    <div className="relative min-h-full space-y-8 pb-20">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-6">
        {/* Navigation */}
        {!isAnalyzing && (
          <Link
            href={`/dashboard/resumestudio/${id}`}
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Project
          </Link>
        )}

        {/* Dashboard Content */}
        {record && (
          <AnalysisDashboard
            id={id}
            record={record}
            isAnalyzing={isAnalyzing}
            selectedModel={selectedModel}
            error={error}
            pendingRawText={pendingRawText}
            onRetry={() => {
              if (pendingRawText) setShowModelSelection(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
