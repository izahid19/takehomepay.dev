'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeResumeApi, ResumeAnalysis } from '@/lib/resumeStudio.api';

interface AnalyzeResumePayload {
  resumeText: string;
  jobDescription: string;
}

const DEBOUNCE_MS = 800;
const MIN_JD_LENGTH = 50;

interface UseResumeAnalyzerOptions {
  payload: AnalyzeResumePayload | null;
}

interface UseResumeAnalyzerReturn {
  analysis: ResumeAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  /** Manually trigger analysis (bypass debounce) */
  triggerAnalysis: () => void;
}

export function useResumeAnalyzer({
  payload,
}: UseResumeAnalyzerOptions): UseResumeAnalyzerReturn {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to hold the latest payload so the debounced callback can access it
  const payloadRef = useRef<AnalyzeResumePayload | null>(payload);
  payloadRef.current = payload;

  // Abort controller ref to cancel in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  const runAnalysis = useCallback(async () => {
    const current = payloadRef.current;
    if (!current || current.jobDescription.trim().length < MIN_JD_LENGTH) return;
    if (!current.resumeText) return;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeResumeApi(current);
      setAnalysis(result);
    } catch (err: any) {
      // Ignore aborted requests
      if (err?.code === 'ERR_CANCELED' || err?.name === 'AbortError') return;
      setError('Unable to analyze resume. Please try again.');
      console.error('[ResumeAnalyzer]', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Auto-trigger disabled as per user request to only trigger manually via button


  return {
    analysis,
    isAnalyzing,
    error,
    triggerAnalysis: runAnalysis,
  };
}
