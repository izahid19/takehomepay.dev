"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import {
  UserCircle,
  ClipboardList,
  Send,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const HowItWorksSection = () => {
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(howItWorksRef.current?.querySelectorAll(".step-card") || [], {
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          once: true
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      step: 1,
      icon: UserCircle,
      title: "Add Your Profile",
      description:
        "Enter your skills, experience, and past projects once. PitchDown uses this for every proposal.",
    },
    {
      step: 2,
      icon: ClipboardList,
      title: "Paste Client Requirements",
      description:
        "Drop in the job description or project brief. Select your platform mode.",
    },
    {
      step: 3,
      icon: Send,
      title: "Generate, Edit, Send",
      description:
        "Get a ready-to-send proposal in seconds. Edit if needed. Copy or export. Done.",
    },
  ];

  return (
    <section ref={howItWorksRef} id="how-it-works" className="relative z-10 py-20 px-4 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Three Steps.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              One Winning Proposal.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((item) => (
            <Card
              key={item.step}
              className="step-card p-6 bg-card/80 backdrop-blur-sm border-border/50 text-center hover:border-primary/50 transition-all hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <span className="text-xl font-bold text-white">
                  {item.step}
                </span>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg inline-flex mb-3">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
