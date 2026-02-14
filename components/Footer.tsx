import React from "react";
import Link from "next/link";
import { Sparkles, Calculator as CalcIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 py-12 px-4 border-t border-border bg-background/50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="Pitchdown logo" 
              className="h-8 w-auto transition-transform group-hover:scale-105"
            />
          </Link>
          <p className="text-muted-foreground text-sm max-w-xs text-center md:text-left leading-relaxed">
            AI-powered proposal generator and freelance income intelligence. 
            Win more projects. Earn what you deserve.
          </p>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full md:w-auto">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Product</h4>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link href="/calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Income Calculator</Link>
            <Link href="/dashboard/proposals/new" className="text-sm text-muted-foreground hover:text-primary transition-colors">Proposal Generator</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Account</h4>
            <Link href="/dashboard/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Profile</Link>
            <Link href="/dashboard/proposals" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Proposals</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign In</Link>
          </div>

          <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Legal</h4>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} Pitchdown. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
           <a href="#" className="text-muted-foreground hover:text-white transition-colors">
             <span className="sr-only">Twitter</span>
             <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
           </a>
           <a href="https://www.linkedin.com/company/pitchdown-in" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
             <span className="sr-only">LinkedIn</span>
             <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
           </a>
        </div>
      </div>
    </footer>
  );
}
