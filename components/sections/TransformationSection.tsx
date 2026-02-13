"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Check } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const TransformationSection = () => {
  const transformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(transformRef.current?.querySelectorAll(".transform-col") || [], {
        scrollTrigger: {
          trigger: transformRef.current,
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

  const beforeItems = [
    "Low response rate on proposals",
    "Hours wasted rewriting the same pitch",
    "Guessing what to charge",
    "Burnout from the apply-reject cycle",
  ];

  const afterItems = [
    "Confident, targeted proposals every time",
    "Clear pricing backed by real income data",
    "Faster responses — apply to more projects",
    "More income with less wasted effort",
  ];

  return (
    <section ref={transformRef} id="transformation" className="relative z-10 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
            The Shift
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Before PitchDown vs.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              After PitchDown
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Before Column */}
          <div className="transform-col rounded-xl border border-red-500/20 bg-red-500/5 p-8">
            <h3 className="text-xl font-bold text-red-400 mb-6 text-center">Before</h3>
            <ul className="space-y-4">
              {beforeItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="p-1 bg-red-500/10 rounded-full mt-0.5 shrink-0">
                    <X className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-muted-foreground text-sm leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* After Column */}
          <div className="transform-col rounded-xl border border-primary/20 bg-primary/5 p-8">
            <h3 className="text-xl font-bold text-primary mb-6 text-center">After</h3>
            <ul className="space-y-4">
              {afterItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="p-1 bg-primary/10 rounded-full mt-0.5 shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground text-sm leading-relaxed font-medium">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
