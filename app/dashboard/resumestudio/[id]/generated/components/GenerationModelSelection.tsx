'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, Brain, Cpu, Wand2, Coins, 
  AlertCircle, ArrowLeft, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ResumeModel = 'pitchdown-pro' | 'pitchdown-fast' | 'pitchdown-premium-lite' | 'pitchdown-premium';

const MODEL_CREDIT_COST: Record<ResumeModel, number> = {
  'pitchdown-fast':          1,
  'pitchdown-pro':           2,
  'pitchdown-premium-lite':  5,
  'pitchdown-premium':       5,
};

export const MODEL_OPTIONS: {
  id: ResumeModel;
  name: string;
  label: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  time: string;
  credits: number;
}[] = [
  {
    id: 'pitchdown-pro',
    name: 'PitchDown Pro',
    label: 'Deep Reasoning',
    description: "Slow but thorough. Applies deep strategic reasoning to craft the most accurate and complete ATS resume.",
    badge: 'Best Quality',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: <Brain className="w-6 h-6 text-emerald-400" />,
    gradient: 'from-emerald-500/10 to-teal-500/5',
    borderColor: 'border-emerald-500/30',
    time: '~90s',
    credits: 2,
  },
  {
    id: 'pitchdown-fast',
    name: 'PitchDown Fast',
    label: 'Fast & Versatile',
    description: "A flagship high-performance model. Excellent balance of speed and intelligence for rapid high-quality tailoring.",
    badge: 'Efficient',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: <Wand2 className="w-6 h-6 text-amber-400" />,
    gradient: 'from-amber-500/10 to-orange-500/5',
    borderColor: 'border-amber-500/30',
    time: '~30s',
    credits: 1,
  },
  {
    id: 'pitchdown-premium-lite',
    name: 'PitchDown Premium Lite',
    label: 'Fast & Smart',
    description: "Our most agile intelligent model. Blazing-quick resume tailoring with high accuracy — great for quick iterations.",
    badge: 'Fastest',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    icon: <Cpu className="w-6 h-6 text-sky-400" />,
    gradient: 'from-sky-500/10 to-cyan-500/5',
    borderColor: 'border-sky-500/30',
    time: '~20s',
    credits: 5,
  },
  {
    id: 'pitchdown-premium',
    name: 'PitchDown Premium',
    label: 'Balanced Power',
    description: "Our flagship balanced model. Excellent writing quality with strong instruction-following for polished resumes.",
    badge: 'Recommended',
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    icon: <Wand2 className="w-6 h-6 text-violet-400" />,
    gradient: 'from-violet-500/10 to-purple-500/5',
    borderColor: 'border-violet-500/30',
    time: '~45s',
    credits: 5,
  },
];

export function ModelSelectionView({
  onSelect,
  onBack,
  userCredits,
  userPlan,
}: {
  onSelect: (model: ResumeModel) => void;
  onBack: () => void;
  userCredits: number;
  userPlan?: string;
}) {
  const [selected, setSelected] = useState<ResumeModel>('pitchdown-pro');

  // Filter options based on user plan
  const filteredOptions = MODEL_OPTIONS.filter(opt => {
    if (opt.id === 'pitchdown-premium' || opt.id === 'pitchdown-premium-lite') {
      return userPlan === 'superpro';
    }
    return true;
  });

  const selectedCredits = MODEL_CREDIT_COST[selected] ?? 2;
  const canAffordSelected = userCredits >= selectedCredits;

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center py-20 px-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:32px_32px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-all text-[10px] font-bold uppercase tracking-wider mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Project
        </motion.button>

        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Resume Intelligence Stage
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight"
          >
            Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400">AI Architect</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium"
          >
            Choose the model that best fits your needs. From deep reasoning to blazing-fast iterations.
          </motion.p>
        </div>

        {/* Selection Cards Grid */}
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-6 mb-16",
          filteredOptions.length > 2 ? "lg:grid-cols-4" : "lg:grid-cols-2 max-w-2xl mx-auto"
        )}>
          {filteredOptions.map((opt, idx) => {
            const canAfford = userCredits >= opt.credits;
            return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 3), type: 'spring', damping: 20 }}
              onClick={() => setSelected(opt.id)}
              className={cn(
                'relative group p-8 rounded-[40px] border transition-all duration-500 text-left h-full flex flex-col overflow-hidden',
                selected === opt.id
                  ? `bg-zinc-900/40 ${opt.borderColor} shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] scale-[1.02]`
                  : 'border-zinc-800/50 bg-zinc-900/20 hover:border-zinc-700/80 hover:bg-zinc-900/40 grayscale-[0.5] hover:grayscale-0'
              )}
            >
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                opt.gradient
              )} />
              
              <div className={cn(
                "absolute top-8 right-8 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                selected === opt.id 
                  ? "bg-white border-white scale-110" 
                  : "border-zinc-800 scale-100"
              )}>
                {selected === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-black shadow-sm" />}
              </div>

              <div className={cn(
                "w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 relative z-10 transition-transform duration-500 group-hover:scale-110",
                "bg-[#0e0e10] border border-zinc-800/80 shadow-2xl"
              )}>
                {opt.icon}
              </div>

              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-black text-white">{opt.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2 items-center mb-6">
                  <span className={cn('text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest leading-none', opt.badgeColor)}>
                    {opt.badge}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{opt.label}</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                  {opt.description}
                </p>
              </div>

              <div className="relative z-10 mt-10 pt-6 border-t border-white/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Cpu className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">Processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-black text-white/90">{opt.time}</span>
                  <span className={cn(
                    'flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border',
                    canAfford
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  )}>
                    <Coins className="w-3 h-3" />
                    {opt.credits} {opt.credits === 1 ? 'credit' : 'credits'}
                  </span>
                </div>
              </div>

              {!canAfford && (
                <div className="absolute inset-0 rounded-[40px] bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="text-center px-4">
                    <AlertCircle className="w-7 h-7 text-red-400 mx-auto mb-2" />
                    <p className="text-xs font-black text-red-300 uppercase tracking-wider">Not enough credits</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Need {opt.credits}, have {userCredits}</p>
                  </div>
                </div>
              )}
            </motion.button>
            );
          })}
        </div>

        {!canAffordSelected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-xl mx-auto"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-300">Insufficient Credits</p>
              <p className="text-xs text-red-400/80 mt-0.5">
                You need <strong>{selectedCredits} credits</strong> but only have <strong>{userCredits}</strong>.
                <Link href="/pricing" className="ml-1 underline hover:text-red-200">Upgrade your plan →</Link>
              </p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col items-center gap-8 relative z-10">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => canAffordSelected && onSelect(selected)}
            disabled={!canAffordSelected}
            className={cn(
              "w-full max-w-xl py-6 px-10 rounded-[28px] font-black text-xl shadow-[0_20px_50px_-10px_rgba(255,255,255,0.15)] transition-all flex items-center justify-between group overflow-hidden relative",
              canAffordSelected
                ? "bg-white text-black hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <span className="flex items-center gap-3 relative z-10">
              <Wand2 className="w-6 h-6 fill-black" />
              Tailor My Resume
            </span>
            <div className="flex items-center gap-3 relative z-10">
              <span className={cn('flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest', canAffordSelected ? 'text-zinc-400 group-hover:text-black transition-colors' : 'text-zinc-600')}>
                <Coins className="w-3.5 h-3.5" />
                {selectedCredits} {selectedCredits === 1 ? 'credit' : 'credits'}
              </span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
