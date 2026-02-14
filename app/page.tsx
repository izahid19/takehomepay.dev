"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Sparkles } from "lucide-react";
import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  FeatureGridSection,
  TransformationSection,
  HowItWorksSection,
  IncomeCalculatorSection,
  TestimonialSection,
  FinalCtaSection,
} from "@/components/sections";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [blocks, setBlocks] = useState<React.ReactNode[]>([]);

  const activeDivs = useMemo(
    () => ({
      0: new Set([4, 1]),
      2: new Set([3]),
      4: new Set([2, 5, 8]),
      5: new Set([4]),
      6: new Set([0]),
      7: new Set([1]),
      10: new Set([3]),
      12: new Set([7]),
      13: new Set([2, 4]),
      14: new Set([1, 5]),
      15: new Set([3, 6]),
    }),
    []
  );

  useEffect(() => {
    const updateBlocks = () => {
      const { innerWidth, innerHeight } = window;
      const blockSize = innerWidth * 0.06;
      const amountOfBlocks = Math.ceil(innerHeight / blockSize);

      const newBlocks = Array.from({ length: 17 }, (_, columnIndex) => (
        <div key={columnIndex} className="w-[6vw] h-full">
          {Array.from({ length: amountOfBlocks }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className={`h-[6vw] w-full border border-white/[0.015] ${
                (activeDivs as any)[columnIndex]?.has(rowIndex)
                  ? "bg-primary/5"
                  : ""
              }`}
              style={{ height: `${blockSize}px` }}
            ></div>
          ))}
        </div>
      ));
      setBlocks(newBlocks);
    };

    const timeoutId = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(updateBlocks);
      } else {
        updateBlocks();
      }
    }, 1000);

    window.addEventListener("resize", updateBlocks);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateBlocks);
    };
  }, [activeDivs]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="flex h-full overflow-hidden top-0 left-0 inset-0 z-0 absolute opacity-30 pointer-events-none">
          {blocks}
        </div>
      </div>

      {/* Header */}
      <Header />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Problem Section */}
      <ProblemSection />

      {/* 3. Solution Section */}
      <SolutionSection />

      {/* 4. Feature Grid (6 Features) */}
      <FeatureGridSection />

      {/* 5. Before vs After Transformation */}
      <TransformationSection />

      {/* 6. How It Works (3 Steps) */}
      <HowItWorksSection />

      {/* 7. Income Calculator Section */}
      <IncomeCalculatorSection />

      {/* 8. Testimonials */}
      <TestimonialSection />

      {/* 9. Final CTA */}
      <FinalCtaSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
