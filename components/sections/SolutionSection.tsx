"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  UserCircle,
  Target,
  Layers,
  Calculator as CalcIcon,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const SolutionSection = () => {
  const solutionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(solutionRef.current?.querySelectorAll(".solution-item") || [], {
        scrollTrigger: {
          trigger: solutionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          once: true
        },
        opacity: 0,
        x: -20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  const solutions = [
    {
      icon: UserCircle,
      title: "Built From Your Profile",
      description:
        "PitchDown reads your skills, experience, and past projects. Every proposal it generates is specific to you — not a fill-in-the-blanks template.",
    },
    {
      icon: Target,
      title: "Adapts to Every Platform",
      description:
        "Upwork, LinkedIn, direct client outreach. Different platforms need different proposal formats. PitchDown handles each one.",
    },
    {
      icon: Layers,
      title: "Sales-Focused Structure",
      description:
        "Each proposal follows a proven structure — attention, relevance, proof, offer. Written to persuade, not just inform.",
    },
    {
      icon: CalcIcon,
      title: "Income Calculator Built In",
      description:
        "Know your exact take-home before quoting a rate. Factor in platform fees, taxes, and expenses. Stop guessing what you actually earn.",
    },
  ];

  return (
    <section ref={solutionRef} id="solution" className="relative z-10 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
            The Solution
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            PitchDown Writes Proposals{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              That Actually Win Work
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your profile. Your experience. Your pricing — backed by real math.
            PitchDown turns all of it into targeted, client-ready proposals in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {solutions.map((item, index) => (
            <div
              key={index}
              className="solution-item flex flex-col items-start gap-4 p-6 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="p-3 bg-primary/10 rounded-xl">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
