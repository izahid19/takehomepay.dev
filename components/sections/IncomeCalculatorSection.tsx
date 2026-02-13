"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calculator as CalcIcon,
  ArrowRight,
} from "lucide-react";

export const IncomeCalculatorSection = () => {
  return (
    <section id="income-calculator" className="relative z-10 py-20 px-4 bg-card/30">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
          Income Calculator
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
          Know Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
            True Take-Home Pay
          </span>
        </h2>

        <div className="space-y-4 mb-10">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your hourly rate is not your income. Platform fees, service charges,
            and taxes eat into every dollar you earn.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            PitchDown&apos;s income calculator shows you exactly what lands in your
            account — across any platform, any tax bracket. Use it to set rates
            that actually make financial sense.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            No spreadsheets. No guessing. Just clear numbers that help you price
            smarter and earn what you deserve.
          </p>
        </div>

        <Link href="/calculator">
          <Button
            size="lg"
            className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 border-none text-white px-8 rounded-full shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)]"
          >
            <span className="flex items-center relative z-10">
              Calculate Your Real Income
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </Link>
      </div>
    </section>
  );
};
