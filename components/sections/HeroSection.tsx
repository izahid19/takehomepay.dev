"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Spotlight } from "@/components/ui/spotlight";
import { AnnouncementBadge } from "@/components/ui/announcement-badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  Calculator as CalcIcon,
  Sparkles,
} from "lucide-react";

export const HeroSection = () => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Scroll animation for hero image
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ["start 0.9", "end 0.5"],
  });

  const rotateXRaw = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
  const yRaw = useTransform(scrollYProgress, [0, 0.5], [0, 40]);

  const springConfig = { stiffness: 300, damping: 50, restDelta: 0.001 };
  const heroRotateX = useSpring(rotateXRaw, springConfig);
  const heroY = useSpring(yRaw, springConfig);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .from(badgeRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
        })
        .from(
          headlineRef.current,
          {
            opacity: 0,
            y: 50,
            duration: 1,
          },
          "-=0.4"
        )
        .from(
          subtextRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          "-=0.5"
        )
        .from(
          ctaRef.current,
          {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.6,
          },
          "-=0.3"
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-32 px-4"
    >
      <Spotlight
        className="-top-40 left-0 md:left-0 md:-top-20"
        fill="rgba(249, 115, 22, 0.15)"
      />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        {/* Credibility Badge */}
        <div ref={badgeRef} className="flex justify-center mb-4">
          <AnnouncementBadge
            label="Trusted"
            message="Built for freelancers who close deals."
            href="/dashboard/proposals/new"
          />
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.2] text-center"
        >
          Stop Pitching. Start Closing.
          <span className="relative flex gap-x-3 gap-y-2 justify-center items-center flex-wrap mt-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              Win More Freelance Projects.
            </span>
          </span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subtextRef}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center"
        >
          PitchDown generates AI-personalized proposals that sell your skills
          — and calculates your real take-home income so you never underprice again.
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link href="/dashboard/proposals/new">
            <ShimmerButton className="w-full sm:w-auto h-12 px-8">
              <span className="flex items-center gap-2">
                Generate Your Proposal
                <Sparkles className="h-5 w-5" />
              </span>
            </ShimmerButton>
          </Link>
          <Link href="/calculator">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 border-none text-white w-full sm:w-auto px-8 rounded-full shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)]"
            >
              <span className="flex items-center relative z-10">
                Calculate Your Income
                <CalcIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
        </div>

        {/* Trust Microcopy */}
        <p className="text-sm text-muted-foreground font-medium opacity-60">
          No credit card required. 10 free proposals included.
        </p>
      </div>

      {/* Hero Image / Banner */}
      <div className="relative z-10 px-4 w-full max-w-7xl mx-auto mt-16 pb-32">
        <motion.div
          ref={bannerRef}
          className="max-w-5xl mx-auto relative w-full px-2 sm:px-0 z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            rotateX: heroRotateX,
            y: heroY,
            transformPerspective: 1000,
            transformOrigin: "center top",
            willChange: "transform",
          }}
        >
          <div className="h-full w-full border-[6px] border-zinc-800 rounded-2xl sm:rounded-[2.5rem] bg-zinc-900 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
            <div className="h-full w-full overflow-hidden rounded-xl sm:rounded-[2rem] bg-[#050505]">
              <img
                src="/heroimage.png"
                alt="PitchDown AI Dashboard Preview"
                className="w-full h-auto object-cover"
                width="1200"
                height="675"
              />
            </div>
          </div>
          {/* Decorative Glows */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -z-10" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -z-10" />
        </motion.div>
      </div>
    </section>
  );
};
