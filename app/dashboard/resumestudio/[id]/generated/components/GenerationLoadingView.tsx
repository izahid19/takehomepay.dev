'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Zap, ShieldCheck, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResumeModel, MODEL_OPTIONS } from './GenerationModelSelection';

export function GenerationLoadingView({
  selectedModel
}: {
  selectedModel: ResumeModel;
}) {
  const selectedOpt = MODEL_OPTIONS.find(m => m.id === selectedModel);
  const modelLabel = selectedOpt?.name || 'AI Architect';

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={cn(
          "absolute inset-0 opacity-20",
          selectedModel === 'pitchdown-pro' ? "bg-emerald-500/10" : 
          selectedModel === 'pitchdown-fast' ? "bg-amber-500/10" :
          selectedModel === 'pitchdown-premium-lite' ? "bg-sky-500/10" : "bg-violet-500/10"
        )} />
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:40px_40px] opacity-40" />
        
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] bg-emerald-500/10"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[120px] bg-violet-500/10"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        <div className="relative mb-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-60px] border border-white/[0.03] rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[-30px] border border-white/[0.05] rounded-full"
          />
          
          <div className="w-36 h-36 rounded-[48px] bg-zinc-900 border border-zinc-800/50 flex items-center justify-center shadow-[0_0_80px_-20px_rgba(16,185,129,0.2)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-16 h-16 text-emerald-400 filter drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-6 mb-16">
          <div className="h-12 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={Math.floor(Date.now() / 4000) % 6}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                className="text-4xl font-black text-white uppercase tracking-[0.25em]"
              >
                {[
                  'Analyzing Context',
                  'Reading Nuance',
                  'Tailoring Assets',
                  'Polishing Text',
                  'Drafting Sections',
                  'Finalizing'
                ][Math.floor(Date.now() / 4000) % 6]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">
              Studio Engine
            </span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white font-black text-[10px] uppercase tracking-widest">{modelLabel}</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80 p-[2px]">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '98%' }}
              transition={{ duration: 45, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_30px_rgba(52,211,153,0.4)]"
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
            <span className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              Neural Processing
            </span>
            <span>Estimated Delivery: {selectedOpt?.time || '...'}</span>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-16 left-0 right-0 flex justify-center opacity-40">
        <div className="flex items-center gap-12 border-t border-white/[0.05] pt-12 px-20">
          <div className="flex items-center gap-3 group text-zinc-500 hover:text-emerald-400 transition-colors cursor-default">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Perfect Fit Output</span>
          </div>
          <div className="flex items-center gap-3 group text-zinc-500 hover:text-sky-400 transition-colors cursor-default">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">ATS Optimization</span>
          </div>
          <div className="flex items-center gap-3 group text-zinc-500 hover:text-violet-400 transition-colors cursor-default">
            <FileText className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Validated Schema</span>
          </div>
        </div>
      </div>
    </div>
  );
}
