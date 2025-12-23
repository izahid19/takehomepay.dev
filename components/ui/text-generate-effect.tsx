"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.5,
}: TextGenerateEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (!containerRef.current) return;

    const spans = containerRef.current.querySelectorAll("span");
    spans.forEach((span, index) => {
      (span as HTMLSpanElement).style.opacity = "0";
      (span as HTMLSpanElement).style.filter = filter ? "blur(10px)" : "none";

      setTimeout(() => {
        (span as HTMLSpanElement).style.transition = `opacity ${duration}s ease, filter ${duration}s ease`;
        (span as HTMLSpanElement).style.opacity = "1";
        (span as HTMLSpanElement).style.filter = "blur(0px)";
      }, index * 100);
    });
  }, [duration, filter]);

  return (
    <div ref={containerRef} className={cn("font-bold", className)}>
      {wordsArray.map((word, idx) => (
        <span
          key={word + idx}
          className="opacity-0 inline-block mr-2"
          style={{
            filter: filter ? "blur(10px)" : "none",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
