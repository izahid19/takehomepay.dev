import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Calculator as CalcIcon, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pricing | Pitchdown",
  description: "Simple, honest pricing for freelancers. Start free, upgrade when you need more.",
};

const features = [
  { name: "Unlimited calculations", free: true, pro: true },
  { name: "Real-time results", free: true, pro: true },
  { name: "Mobile-friendly", free: true, pro: true },
  { name: "40+ currencies", free: true, pro: true },
  { name: "Live exchange rates", free: true, pro: true },
  { name: "Save calculation history", free: false, pro: true },
  { name: "Export results as PDF", free: false, pro: true },
  { name: "No ads", free: false, pro: true },
  { name: "Priority support", free: false, pro: true },
];

const faqs = [
  {
    question: "Is it really free?",
    answer: "Yes! The free plan includes unlimited calculations with no sign-up required. You only pay if you want Pro features like saving history and PDF exports."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. There are no contracts or commitments. Cancel your Pro subscription anytime with just one click."
  },
  {
    question: "Is my data safe?",
    answer: "Yes. All calculations happen in your browser. We don't store any of your financial data unless you explicitly save it with a Pro account."
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1d1d1d_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Shared Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative z-10 py-16 px-4 text-center pt-24">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            Simple Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Simple Pricing for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Freelancers
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Pay only when you need more. Start free, upgrade anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className="p-8 bg-card/80 border-border/50 backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Free</h3>
              <p className="text-muted-foreground text-sm">Perfect for getting started</p>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Unlimited calculations</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>No sign-up required</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Real-time results</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Mobile-friendly</span>
              </li>
            </ul>

            <Link href="/">
              <Button variant="outline" size="lg" className="w-full">
                Start Free
              </Button>
            </Link>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 backdrop-blur-sm relative overflow-hidden">
            {/* Popular Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                POPULAR
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-2">Pro</h3>
              <p className="text-muted-foreground text-sm">For power users</p>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$5</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Everything in Free</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Save calculation history</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Export results as PDF</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>No ads</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>

            <Button size="lg" className="w-full">
              Upgrade to Pro
            </Button>
          </Card>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8">
            Feature Comparison
          </h2>

          <Card className="bg-card/80 border-border/50 backdrop-blur-sm overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 border-b border-border text-sm font-medium">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-primary">Pro</div>
            </div>
            
            {features.map((feature, index) => (
              <div 
                key={feature.name}
                className={`grid grid-cols-3 gap-4 p-4 text-sm ${
                  index !== features.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="text-muted-foreground">{feature.name}</div>
                <div className="text-center">
                  {feature.free ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                  )}
                </div>
                <div className="text-center">
                  {feature.pro ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-16 px-4 bg-card/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question} className="p-6 bg-card/80 border-border/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to know your real earnings?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start calculating your take-home pay for free. No sign-up required.
          </p>
          <Link href="/">
            <Button size="xl">
              Open Calculator
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
