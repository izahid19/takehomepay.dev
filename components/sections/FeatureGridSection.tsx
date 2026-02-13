"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import {
  UserCircle,
  Target,
  Layers,
  Calculator as CalcIcon,
  Download,
  Zap,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const FeatureGridSection = () => {
  const featureGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(featureGridRef.current?.querySelectorAll(".feature-card") || [], {
        scrollTrigger: {
          trigger: featureGridRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          once: true
        },
        opacity: 0,
        scale: 0.98,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: UserCircle,
      title: "Profile-Based Personalization",
      description:
        "Every proposal is built from your stored skills, experience, and past projects. No generic output.",
    },
    {
      icon: Target,
      title: "Platform-Specific Modes",
      description:
        "Upwork cover letters, LinkedIn messages, cold emails, direct client pitches. Each format is tuned for its platform.",
    },
    {
      icon: Layers,
      title: "Structured Sales Format",
      description:
        "Proposals follow a proven persuasion structure — hook, relevance, proof, and a clear call to action.",
    },
    {
      icon: CalcIcon,
      title: "Smart Income Calculator",
      description:
        "Enter your rate, platform, and tax bracket. See your exact net income before you commit to any project.",
    },
    {
      icon: Download,
      title: "Editable and Export-Ready",
      description:
        "Edit every proposal before sending. Copy to clipboard or export as a clean PDF. Full control, always.",
    },
    {
      icon: Zap,
      title: "Generated in Seconds",
      description:
        "What used to take 30 minutes now takes 30 seconds. Respond faster, apply to more projects, close more deals.",
    },
  ];

  return (
    <section ref={featureGridRef} id="features" className="relative z-10 py-20 px-4 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              Pitch and Price with Confidence
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="feature-card p-6 bg-card/80 border-border/50 hover:border-primary/40 transition-colors"
            >
              <div className="p-3 bg-primary/10 rounded-xl inline-flex mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
