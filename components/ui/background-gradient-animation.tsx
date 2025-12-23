"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BackgroundGradientAnimationProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  size?: string;
  interactive?: boolean;
}

export function BackgroundGradientAnimation({
  children,
  className,
  containerClassName,
  size = "80%",
  interactive = true,
}: BackgroundGradientAnimationProps) {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (interactiveRef.current) {
        const rect = interactiveRef.current.getBoundingClientRect();
        setCurX(event.clientX - rect.left);
        setCurY(event.clientY - rect.top);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-background",
        containerClassName
      )}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className={cn("relative z-10", className)}>{children}</div>
      <div
        ref={interactiveRef}
        className="absolute inset-0 z-0 overflow-hidden"
        style={{
          filter: "url(#blurMe) blur(40px)",
        }}
      >
        {/* Primary gradient blob */}
        <div
          className="absolute rounded-full bg-primary/30 opacity-50 mix-blend-hard-light animate-blob"
          style={{
            width: size,
            height: size,
            top: "10%",
            left: "10%",
            animationDelay: "0s",
          }}
        />
        {/* Secondary gradient blob */}
        <div
          className="absolute rounded-full bg-primary/20 opacity-50 mix-blend-hard-light animate-blob"
          style={{
            width: size,
            height: size,
            top: "40%",
            right: "10%",
            animationDelay: "2s",
          }}
        />
        {/* Tertiary gradient blob */}
        <div
          className="absolute rounded-full bg-emerald-500/20 opacity-30 mix-blend-hard-light animate-blob"
          style={{
            width: size,
            height: size,
            bottom: "10%",
            left: "30%",
            animationDelay: "4s",
          }}
        />
        {/* Interactive blob */}
        {interactive && (
          <div
            className="absolute rounded-full bg-primary/40 opacity-40 mix-blend-hard-light"
            style={{
              width: "30%",
              height: "30%",
              left: curX - 150,
              top: curY - 150,
              transition: "left 0.3s ease-out, top 0.3s ease-out",
            }}
          />
        )}
      </div>
    </div>
  );
}
