"use client";

import * as React from "react";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: string;
  error?: string | null;
}

export function InputField({
  id,
  label,
  value,
  onChange,
  placeholder = "0",
  suffix,
  prefix,
  min = 0,
  max,
  step = "any",
  error,
}: InputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty string for clearing input
    if (inputValue === "") {
      onChange("");
      return;
    }

    // Only allow valid numeric input (including decimals)
    if (/^-?\d*\.?\d*$/.test(inputValue)) {
      // Prevent negative values
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue) && numValue < 0) {
        onChange("0");
        return;
      }

      // Micro animation on value change
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { borderColor: "hsl(160, 84%, 39%)" },
          { borderColor: "hsl(0, 0%, 18%)", duration: 0.4, ease: "power2.out" }
        );
      }

      onChange(inputValue);
    }
  };

  // Focus animation
  const handleFocus = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 1.02,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  const handleBlur = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
      <div ref={containerRef} className="relative transition-transform">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none">
            {prefix}
          </span>
        )}
        <Input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(
            "text-lg font-medium transition-all",
            prefix && "pl-10",
            suffix && "pr-12",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
