"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Calculator as CalcIcon, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const features = [
  { name: "Income Calculations", free: "Unlimited", elite: "Unlimited", pro: "Unlimited" },
  { name: "AI Proposals / Month", free: "10", elite: "300", pro: "1000" },
  { name: "AI Contract Generations", free: "-", elite: "-", pro: "100" },
  { name: "Proposal Editing", free: false, elite: true, pro: true },
  { name: "Download PDF", free: false, elite: true, pro: true },
  { name: "Platforms", free: "Direct Client", elite: "All Platforms", pro: "All Platforms" },
  { name: "Currencies", free: "INR, USD", elite: "All 40+", pro: "All 40+" },
  { name: "Advanced AI Model", free: false, elite: true, pro: true },
  { name: "Save History", free: false, elite: true, pro: true },
  { name: "Priority Support", free: false, elite: false, pro: true },
];

const faqs = [
  {
    question: "Is it really free?",
    answer: "Yes! The free plan includes 10 AI proposals monthly and unlimited income calculations. No credit card required."
  },
  {
    question: "What is the difference between Elite and Pro?",
    answer: "Elite is designed for active freelancers (300 proposals/mo), while Pro is for power users needing higher limits (1000 proposals/mo) and AI Contract Generation."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. There are no contracts. Cancel your subscription anytime with one click in your dashboard."
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const currentPlan = user?.plan || 'free';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <Header />

      <section className="relative z-10 py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            Pricing for India
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            Plans built for your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Growth
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your freelance journey. Start free, scale as you win more projects.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className={`p-8 bg-card/40 border-border/50 backdrop-blur-md flex flex-col justify-between hover:border-emerald-500/30 transition-colors ${currentPlan === 'free' ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : ''}`}>
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <p className="text-muted-foreground text-sm">Perfect for getting started</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-extrabold">₹0</span>
                <span className="text-muted-foreground ml-2">/forever</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>10 AI Proposals / month</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Calculations</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Direct Client only</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground/60">
                  <X className="h-5 w-5 flex-shrink-0" />
                  <span>No PDF Downloads</span>
                </li>
              </ul>
            </div>
            {currentPlan === 'free' ? (
              <Button variant="outline" size="lg" className="w-full border-emerald-500/50 bg-emerald-500/10 cursor-default hover:bg-emerald-500/10" disabled>
                Current Plan
              </Button>
            ) : (
              !user && (
                <Link href="/signup">
                  <Button variant="outline" size="lg" className="w-full border-emerald-500/20 hover:bg-emerald-500/5">
                    Start Free
                  </Button>
                </Link>
              )
            )}
          </Card>

          {/* Elite Plan */}
          <Card className={`p-8 bg-emerald-500/5 border-emerald-500/40 backdrop-blur-md relative overflow-hidden flex flex-col justify-between scale-105 shadow-2xl shadow-emerald-500/10 active:scale-100 transition-transform ${currentPlan === 'elite' ? 'border-emerald-400 ring-1 ring-emerald-400' : ''}`}>
            <div className="absolute top-4 right-4">
              <span className="bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Recommended
              </span>
            </div>
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Elite</h3>
                <p className="text-emerald-400/80 text-sm italic">Unlock your potential</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-emerald-400">₹200</span>
                <span className="text-emerald-400/60 ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium text-foreground">300 AI Proposals / month</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>All Platforms Unlocked</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>All Currencies Unlocked</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Edit & Download PDF</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="font-semibold text-emerald-400">Advanced AI Reasoning</span>
                </li>
              </ul>
            </div>
            <Button 
              size="lg" 
              className={`w-full font-bold ${currentPlan === 'elite' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400 cursor-default hover:bg-emerald-500/20' : 'bg-emerald-500 hover:bg-emerald-600 text-black'}`}
              disabled={currentPlan === 'elite'}
            >
              {currentPlan === 'elite' ? 'Current Plan' : currentPlan === 'pro' ? 'Downgrade to Elite' : 'Upgrade to Elite'}
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className={`p-8 bg-cyan-500/5 border-cyan-500/40 backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/60 transition-colors ${currentPlan === 'pro' ? 'border-cyan-400 ring-1 ring-cyan-400' : ''}`}>
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-cyan-400">Pro</h3>
                <p className="text-muted-foreground text-sm">For the top 1% freelancers</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-cyan-400">₹500</span>
                <span className="text-cyan-400/60 ml-2">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm">
                  <Sparkles className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  <span className="font-bold text-foreground">1000 AI Proposals / month</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-cyan-500 flex-shrink-0" />
                  <span className="font-semibold text-cyan-400">100 Contract Generations</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-cyan-500 flex-shrink-0" />
                  <span>Priority AI Processing</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-cyan-500 flex-shrink-0" />
                  <span>Premium 1-on-1 Support</span>
                </li>
              </ul>
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className={`w-full font-bold ${currentPlan === 'pro' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400 cursor-default hover:bg-cyan-500/20' : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'}`}
              disabled={currentPlan === 'pro'}
            >
              {currentPlan === 'pro' ? 'Current Plan' : 'Go Pro'}
            </Button>
          </Card>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Features</h2>
          <Card className="bg-card/40 border-border/50 backdrop-blur-md overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-6 bg-secondary/20 border-b border-border text-xs sm:text-sm font-bold uppercase tracking-wider">
              <div className="col-span-1">Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-emerald-400 underline decoration-2 underline-offset-4">Elite</div>
              <div className="text-center text-cyan-400 underline decoration-2 underline-offset-4">Pro</div>
            </div>
            
            {features.map((feature, index) => (
              <div 
                key={feature.name}
                className={`grid grid-cols-4 gap-4 p-6 text-sm hover:bg-white/5 transition-colors ${
                  index !== features.length - 1 ? "border-b border-border/50" : ""
                }`}
              >
                <div className="font-medium text-muted-foreground">{feature.name}</div>
                <div className="text-center flex items-center justify-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? <Check className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-muted-foreground/30" />
                  ) : <span className="font-semibold">{feature.free}</span>}
                </div>
                <div className="text-center flex items-center justify-center">
                  {typeof feature.elite === 'boolean' ? (
                    feature.elite ? <Check className="h-5 w-5 text-emerald-500" /> : <X className="h-5 w-5 text-muted-foreground/30" />
                  ) : <span className="font-semibold text-emerald-400">{feature.elite}</span>}
                </div>
                <div className="text-center flex items-center justify-center">
                  {typeof feature.pro === 'boolean' ? (
                    feature.pro ? <Check className="h-5 w-5 text-cyan-500" /> : <X className="h-5 w-5 text-muted-foreground/30" />
                  ) : <span className="font-bold text-cyan-400">{feature.pro}</span>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-4 bg-emerald-500/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">FAQs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="p-8 rounded-2xl bg-card border border-border/50 hover:border-emerald-500/30 transition-all">
                <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20">
          <h2 className="text-4xl font-bold mb-6">Start Winning More Projects</h2>
          <p className="text-muted-foreground mb-10 text-lg">Join 500+ freelancers scaling their income with PitchDown.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard/proposals/new">
              <Button size="xl" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-12">Generate AI proposal</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
