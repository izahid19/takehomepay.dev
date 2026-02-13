"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const TestimonialSection = () => {
  const testimonialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(testimonialRef.current?.querySelectorAll(".testimonial-card") || [], {
        scrollTrigger: {
          trigger: testimonialRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          once: true
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
      });
    });
    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      name: "Arjun S.",
      role: "Full-Stack Developer",
      quote:
        "I used to spend 40 minutes writing each Upwork proposal. Now I generate one in under a minute, and my response rate jumped from 8% to 22%. The income calculator also showed me I was undercharging by almost $15/hour after fees.",
    },
    {
      name: "Mariana K.",
      role: "UI/UX Designer",
      quote:
        "The platform-specific modes are what sold me. My LinkedIn outreach messages sound completely different from my Upwork proposals — and they should. PitchDown gets that. I closed 3 new clients in my first month.",
    },
    {
      name: "David R.",
      role: "Agency Owner, 4-Person Team",
      quote:
        "We use PitchDown across the whole team. Everyone generates proposals from their own profile, but the quality and structure stays consistent. The income calculator helps us quote project rates that actually protect our margins.",
    },
  ];

  return (
    <section ref={testimonialRef} id="testimonials" className="relative z-10 py-20 px-4 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
            What Freelancers Say
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Real Results.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
              Real Freelancers.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="testimonial-card p-6 bg-card/80 border-border/50 hover:border-primary/30 transition-colors flex flex-col"
            >
              <div className="mb-4">
                <Quote className="h-6 w-6 text-primary/40" />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="border-t border-border/50 pt-4">
                <p className="text-foreground font-semibold text-sm">
                  {testimonial.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {testimonial.role}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
