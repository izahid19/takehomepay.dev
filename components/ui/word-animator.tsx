"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState, useEffect } from "react";

interface WordAnimatorProps {
  words: string[];
  duration?: number;
  className?: string;
}

export const WordAnimator = ({
  words,
  duration = 2,
  className = "",
}: WordAnimatorProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        verticalAlign: "bottom",
      }}
      className={cn("text-left overflow-hidden", className)}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={currentIndex}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          style={{
            position: "absolute",
            display: "block",
            left: 0,
            right: 0,
          }}
          className="bg-gradient-to-t from-primary to-emerald-400 bg-clip-text text-transparent w-full"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
      {/* Invisible text to maintain correct spacing */}
      <span style={{ visibility: "hidden" }}>{words[currentIndex]}</span>
    </span>
  );
};
