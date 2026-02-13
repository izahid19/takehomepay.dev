"use client";

import { Header } from "@/components/Header";
import { Calculator } from "@/components/Calculator";
import { Calculator as CalcIcon } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Simple Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="hsl(160, 84%, 39%)" />

      {/* Shared Header */}
      <Header />

      {/* Calculator Section */}
      <main className="relative z-10 pt-32 pb-20 px-4 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
              Calculator
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                Real Earnings
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enter your hourly rate, hours worked, and deductions to see your real income instantly.
            </p>
          </div>

          <Calculator />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2">
              <CalcIcon className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-foreground">takehomepay.dev</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md text-center sm:text-left">
              The free calculator for freelancers to know their real income after platform fees and taxes.
            </p>
            <div className="text-muted-foreground text-xs flex items-center gap-1.5 mt-2">
              Built with{" "}
              <span className="text-red-500 animate-pulse">❤️</span> by{" "}
              <a
                href="https://devzahid.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Zahid Mushtaq
              </a>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} takehomepay.dev. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
