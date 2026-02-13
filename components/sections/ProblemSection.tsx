"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  Clock,
  ShieldAlert,
  PenLine,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const ProblemSection = () => {
  const problemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(problemRef.current?.querySelectorAll(".problem-card") || [], {
        scrollTrigger: {
          trigger: problemRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          once: true
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={problemRef} id="problem" className="relative z-10 py-20 px-4 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
            The Real Problem
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            You&apos;re Great at Your Work.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              Terrible at Selling It.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Most freelancers lose projects not because they lack skill
            — but because their proposals don&apos;t land. And the projects they do win?
            They&apos;re priced too low to sustain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="problem-card p-6 bg-card/80 border-border/50 hover:border-red-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/10 rounded-lg mt-0.5 shrink-0">
                <Clock className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">Hours Wasted Rewriting Proposals</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You spend more time writing proposals than doing actual work. Copy-pasting templates that sound like everyone else&apos;s.
                </p>
              </div>
            </div>
          </Card>

          <Card className="problem-card p-6 bg-card/80 border-border/50 hover:border-red-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/10 rounded-lg mt-0.5 shrink-0">
                <ShieldAlert className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">Underpricing Because You Can&apos;t See the Math</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Platform fees take 10-20%. Taxes take another 25-40%. You quote $100/hour and keep $50. But you never actually ran the numbers.
                </p>
              </div>
            </div>
          </Card>

          <Card className="problem-card p-6 bg-card/80 border-border/50 hover:border-red-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/10 rounded-lg mt-0.5 shrink-0">
                <PenLine className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">Losing to Freelancers Who Pitch Better</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The project goes to someone who wrote a sharper, more targeted proposal. Not because they were better at the job — they were better at selling it.
                </p>
              </div>
            </div>
          </Card>

          <Card className="problem-card p-6 bg-card/80 border-border/50 hover:border-red-500/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/10 rounded-lg mt-0.5 shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">Burnout from the Proposal Grind</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The cycle is exhausting. Find a project. Write a proposal. Get rejected. Repeat. Your energy drains before your account fills.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
