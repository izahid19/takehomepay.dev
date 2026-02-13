'use client';

import { LucideZap, ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditModal({ isOpen, onClose }: CreditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <LucideZap className="w-6 h-6 text-primary fill-primary/20" />
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold tracking-tight">Credits Exhausted</h3>
          <p className="text-muted-foreground leading-relaxed">
            You&apos;ve used all your free credits. To continue generating high-converting AI proposals, please upgrade to our Pro plan.
          </p>

          <div className="bg-muted px-4 py-3 rounded-xl border border-border flex items-center gap-3">
             <ShieldAlert className="w-5 h-5 text-primary" />
             <span className="text-sm font-medium">Get unlimited proposals for $19/mo</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button className="w-full h-12 text-base font-bold" onClick={() => window.location.href = '/pricing'}>
            Upgrade to Pro
          </Button>
          <Button variant="ghost" className="w-full h-12" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
