'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';

export function GenerationErrorView({
  error,
  onBack
}: {
  error: string | null;
  onBack: () => void;
}) {
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-2xl"
        >
          <Sparkles className="w-10 h-10 text-red-400" />
        </motion.div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight uppercase">
            Resume Intelligence Offline
          </h2>
          <p className="text-zinc-500 font-medium leading-relaxed">
            {error || 'We encountered an unexpected hurdle while preparing your tailored resume content.'}
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-8 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center gap-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
