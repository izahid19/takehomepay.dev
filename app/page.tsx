"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calculator } from "@/components/Calculator";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, Calculator as CalcIcon, DollarSign, Percent } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations timeline
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

      // Preview cards stagger animation
      gsap.from(".preview-card", {
        scrollTrigger: {
          trigger: previewRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out",
      });

      // Calculator section animation
      gsap.from(calculatorRef.current, {
        scrollTrigger: {
          trigger: calculatorRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 80,
        duration: 1,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Simple Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Shared Header */}
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-24">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="hsl(160, 84%, 39%)" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Free • No Signup • Instant Results
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight"
          >
            Stop Guessing.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Know Your Take-Home Pay.
            </span>
          </h1>

          {/* Subtext */}
          <p
            ref={subtextRef}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Upwork, Fiverr, Toptal — whatever platform you use. See exactly what lands in your pocket after fees and taxes.
          </p>

          {/* CTA Button */}
          <div ref={ctaRef} className="pt-4">
            <Button
              size="xl"
              onClick={scrollToCalculator}
              className="group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Open Calculator
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Free forever • No credit card • No signup
          </p>
        </div>

        {/* Hero Preview Section */}
        <div ref={previewRef} className="w-full max-w-5xl mx-auto mt-16 sm:mt-24 px-4">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full">
              <span className="text-primary">✦</span>
              Preview
            </span>
          </div>

          {/* Dashboard-style Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Preview Card */}
            <Card className="preview-card p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Your Inputs</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-medium">$50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hours Worked</span>
                  <span className="font-medium">40 hrs</span>
                </div>
              </div>
            </Card>

            {/* Take-Home Pay Highlight Card */}
            <Card className="preview-card p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 backdrop-blur-sm md:scale-105 hover:scale-110 transition-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <CalcIcon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-primary">Take-Home Pay</span>
              </div>
              <div className="text-center py-4">
                <span className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                  $1,200
                </span>
                <p className="text-sm text-muted-foreground mt-2">
                  Your real income after deductions
                </p>
              </div>
            </Card>

            {/* Deductions Preview Card */}
            <Card className="preview-card p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Percent className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Deductions</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium text-red-400">-$400</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium text-red-400">-$400</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="relative z-10 py-20 px-4">
        <div ref={calculatorRef} className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
              Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                Real Earnings
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enter your hourly rate, hours worked, and deductions to see your real income instantly.
            </p>
          </div>

          <Calculator />
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="relative z-10 py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-secondary/50 border border-border text-muted-foreground text-sm font-medium px-4 py-2 rounded-full mb-6">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Three Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <Card className="how-card p-6 bg-card/80 backdrop-blur-sm border-border/50 text-center hover:border-primary/50 transition-all hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Enter Rate & Hours</h3>
              <p className="text-muted-foreground text-sm">
                Input your hourly rate and the number of hours worked
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="how-card p-6 bg-card/80 backdrop-blur-sm border-border/50 text-center hover:border-primary/50 transition-all hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Add Fees & Tax</h3>
              <p className="text-muted-foreground text-sm">
                Enter your platform fee percentage and tax rate
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="how-card p-6 bg-card/80 backdrop-blur-sm border-border/50 text-center hover:border-primary/50 transition-all hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                <span className="text-xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Instant Results</h3>
              <p className="text-muted-foreground text-sm">
                See your real take-home pay calculated in real-time
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What Is Section - SEO Content */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 text-center">
            What is a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Freelance Take Home Pay Calculator?
            </span>
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              A freelance take home pay calculator helps independent contractors and self-employed professionals calculate their net income after deducting platform fees, service charges, and taxes. Unlike traditional employees who receive a fixed paycheck, freelancers must account for multiple deductions that reduce their gross earnings.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              TakeHomePay.dev provides instant calculations for freelancers working on platforms like Upwork, Fiverr, Toptal, and others. Simply enter your hourly rate, hours worked, platform fee percentage, and tax rate to see exactly what lands in your pocket.
            </p>
          </div>
        </div>
      </section>

      {/* Why Freelancers Need It - SEO Content */}
      <section className="relative z-10 py-16 px-4 bg-card/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 text-center">
            Why Freelancers Need a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Net Income Calculator
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/80 border-border/50">
              <h3 className="text-lg font-semibold mb-2">Accurate Pricing</h3>
              <p className="text-muted-foreground text-sm">
                Know your true hourly rate after fees to price your services correctly and maintain profitability.
              </p>
            </Card>
            <Card className="p-6 bg-card/80 border-border/50">
              <h3 className="text-lg font-semibold mb-2">Tax Planning</h3>
              <p className="text-muted-foreground text-sm">
                Estimate your tax liability and set aside the right amount for quarterly tax payments.
              </p>
            </Card>
            <Card className="p-6 bg-card/80 border-border/50">
              <h3 className="text-lg font-semibold mb-2">Budget Confidently</h3>
              <p className="text-muted-foreground text-sm">
                Plan your expenses based on actual take-home pay, not gross income estimates.
              </p>
            </Card>
            <Card className="p-6 bg-card/80 border-border/50">
              <h3 className="text-lg font-semibold mb-2">Compare Platforms</h3>
              <p className="text-muted-foreground text-sm">
                Calculate net income across different freelance platforms to find the most profitable option.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Who It's For - SEO Content */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Freelancers & Contractors
            </span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Whether you're a developer, designer, writer, consultant, or any independent professional — this calculator is designed for you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Web Developers", "Graphic Designers", "Content Writers", "Virtual Assistants", "Consultants", "Video Editors", "Translators", "Data Analysts"].map((role) => (
              <span 
                key={role}
                className="bg-secondary/50 border border-border text-muted-foreground text-sm px-4 py-2 rounded-full"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2">
              <CalcIcon className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold text-foreground">takehomepay.dev</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md text-center sm:text-left">
              The free calculator for freelancers to know their real income after platform fees and taxes.
            </p>
            <div className="text-muted-foreground text-xs flex items-center gap-1.5 mt-2">
              Built with{" "}
              <span className="text-red-500 animate-pulse">❤️</span> by{" "}
              <a
                href="https://devzahid.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                Zahid Mushtaq
              </a>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} takehomepay.dev. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
