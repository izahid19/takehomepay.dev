"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const FinalCtaSection = () => {
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(finalCtaRef.current, {
        scrollTrigger: {
          trigger: finalCtaRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="final-cta" className="relative z-10 py-24 px-4">
      <div
        ref={finalCtaRef}
        className="max-w-3xl mx-auto text-center space-y-6"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
          Your Skills Deserve{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
            Better Clients and Better Pay
          </span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Stop sending weak proposals. Stop undercharging. Start freelancing
          like someone who knows exactly what they&apos;re worth.
        </p>
        <div className="pt-4">
          <Link href="/dashboard/proposals/new">
            <Button
              size="xl"
              className="group relative overflow-hidden cursor-pointer"
            >
              <span className="relative z-10 flex items-center">
                Start Free — Generate Your First Proposal
                <Sparkles className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          10 free AI proposals. Unlimited calculator. No credit card required.
        </p>
      </div>
    </section>
  );
};
