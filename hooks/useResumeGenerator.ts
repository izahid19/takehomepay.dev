'use client';

// NOTE: The new Resume Studio flow (Save → Project Page → Generate) does NOT use this hook.
// Generation is handled directly in /dashboard/resumestudio/[id]/page.tsx via generateForProjectApi.
// This hook is kept for backward compat only.

import { useState, useCallback } from 'react';
import api from '@/lib/axios';

interface UseResumeGeneratorReturn {
  pdfUrl: string | null;
  isLoading: boolean;
  error: string | null;
  generate: (payload: { resumeText: string; jobDescription: string; profileType?: string }) => Promise<void>;
  reset: () => void;
}

export function useResumeGenerator(): UseResumeGeneratorReturn {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (payload: { resumeText: string; jobDescription: string; profileType?: string }) => {
    setIsLoading(true);
    setError(null);
    setPdfUrl(null);

    try {
      const response = await api.post('/resume/create', payload, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to generate resume. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPdfUrl(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { pdfUrl, isLoading, error, generate, reset };
}
