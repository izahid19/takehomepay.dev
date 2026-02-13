'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { ProposalGeneratingSkeleton } from '@/components/ProposalGeneratingSkeleton';
import { Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AI_STATUS_STEPS = [
  "Analyzing client requirements...",
  "Reviewing your profile and experience...",
  "Matching relevant skills...",
  "Optimizing for selected platform...",
  "Structuring high-converting proposal..."
];

export default function GeneratingProposalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  // Cycle through AI status messages
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % AI_STATUS_STEPS.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Generate proposal on mount
  useEffect(() => {
    const generateProposal = async () => {
      try {
        // Get the form data from sessionStorage (set by the form page)
        const formDataStr = sessionStorage.getItem('proposalFormData');
        if (!formDataStr) {
          setError('No proposal data found. Please try again.');
          setIsGenerating(false);
          return;
        }

        const formData = JSON.parse(formDataStr);

        const response = await api.post('/proposals/generate', formData);

        // Clear the temp data
        sessionStorage.removeItem('proposalFormData');

        // Auto-redirect to the generated proposal
        router.replace(`/dashboard/proposals/${response.data.data._id}`);
      } catch (err: any) {
        console.error('Proposal generation error:', err);
        setError(err.response?.data?.message || 'Failed to generate proposal. Please try again.');
        setIsGenerating(false);
      }
    };

    generateProposal();
  }, [router]);

  const handleRetry = () => {
    router.push('/dashboard/proposals/new');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-[#1a1a1a] border border-red-900/30 rounded-2xl p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-900/20 rounded-full">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Generation Failed</h2>
              <p className="text-zinc-400 leading-relaxed">{error}</p>
            </div>

            <Button
              onClick={handleRetry}
              className="w-full h-12 bg-gradient-to-r from-[#2DD4BF] to-[#10B981] hover:brightness-105 text-black font-bold rounded-xl transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-zinc-300 pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-16 space-y-12">
        {/* AI Status Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-[#FFB800] animate-pulse" />
              <div className="absolute inset-0 bg-[#FFB800]/20 blur-2xl rounded-full animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              AI is crafting your proposal
            </h1>
            
            {/* Animated Status Text with Fade Transition */}
            <div className="flex items-center justify-center gap-2 h-8">
              <p
                key={currentStep}
                className="text-zinc-400 font-medium text-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                {AI_STATUS_STEPS[currentStep]}
              </p>
              <span 
                className="inline-block w-1 h-5 bg-[#FFB800] ml-1"
                style={{ animation: 'blink 1s step-start infinite' }}
              />
            </div>
          </div>
        </div>

        {/* Skeleton Proposal Preview */}
        <ProposalGeneratingSkeleton />

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            {AI_STATUS_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-[#FFB800]'
                    : index < currentStep
                    ? 'w-2 bg-[#FFB800]/50'
                    : 'w-2 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
