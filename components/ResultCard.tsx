"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  label: string;
  value: string;
  isPrimary?: boolean;
  isSubtraction?: boolean;
}

export function ResultCard({
  label,
  value,
  isPrimary = false,
  isSubtraction = false,
}: ResultCardProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevValue = useRef<string>(value);

  // Animate on value change
  useEffect(() => {
    if (value !== prevValue.current && valueRef.current && cardRef.current) {
      // Value change animation
      gsap.fromTo(
        valueRef.current,
        {
          scale: 1.15,
          opacity: 0.7,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "back.out(2)",
        }
      );

      // Card pulse animation
      gsap.fromTo(
        cardRef.current,
        {
          boxShadow: isPrimary
            ? "0 0 20px rgba(16, 185, 129, 0.4)"
            : "0 0 15px rgba(16, 185, 129, 0.2)",
        },
        {
          boxShadow: isPrimary
            ? "0 0 0px rgba(16, 185, 129, 0)"
            : "0 0 0px rgba(16, 185, 129, 0)",
          duration: 0.5,
          ease: "power2.out",
        }
      );

      prevValue.current = value;
    }
  }, [value, isPrimary]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200",
        isPrimary
          ? "bg-primary/10 border-2 border-primary"
          : "bg-secondary/50 border border-border hover:border-primary/20"
      )}
    >
      <span
        className={cn(
          "text-sm font-medium",
          isPrimary ? "text-primary" : "text-muted-foreground"
        )}
      >
        {isSubtraction && !isPrimary && (
          <span className="mr-1 text-red-400">−</span>
        )}
        {label}
      </span>
      <span
        ref={valueRef}
        className={cn(
          "font-semibold tabular-nums inline-block",
          isPrimary
            ? "text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400"
            : "text-lg text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
