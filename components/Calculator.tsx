"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputField } from "@/components/InputField";
import { ResultCard } from "@/components/ResultCard";
import { CurrencySelect } from "@/components/CurrencySelect";
import { calculateTakeHomePay } from "@/lib/calculate";
import { parseNumericInput } from "@/lib/validation";
import { formatCurrency, CURRENCIES, type CurrencyCode } from "@/lib/utils";
import { useExchangeRates, getRate } from "@/hooks/useExchangeRates";
import { RefreshCw, ArrowRight } from "lucide-react";

export function Calculator() {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const prevTakeHomePay = useRef<number>(0);

  // Exchange rates from API
  const { rates, loading: ratesLoading, lastUpdated } = useExchangeRates();

  // Input states as strings to handle empty/intermediate states
  const [hourlyRate, setHourlyRate] = useState<string>("50");
  const [hoursWorked, setHoursWorked] = useState<string>("40");
  const [platformFee, setPlatformFee] = useState<string>("20");
  const [tax, setTax] = useState<string>("25");
  
  // Currency for input (hourly rate)
  const [inputCurrency, setInputCurrency] = useState<CurrencyCode>("USD");
  // Currency for output (results display)
  const [outputCurrency, setOutputCurrency] = useState<CurrencyCode>("USD");

  // Get currency symbol for input
  const inputCurrencySymbol = CURRENCIES.find(c => c.code === inputCurrency)?.symbol || "$";

  // Calculate results in real-time
  const results = useMemo(() => {
    const rate = parseNumericInput(hourlyRate);
    const hours = parseNumericInput(hoursWorked);
    const fee = parseNumericInput(platformFee);
    const taxRate = parseNumericInput(tax);

    // If any input is null/empty, return invalid results
    if (rate === null || hours === null || fee === null || taxRate === null) {
      return {
        grossIncome: 0,
        platformFeeAmount: 0,
        taxAmount: 0,
        takeHomePay: 0,
        isValid: false,
      };
    }

    // Convert input hourly rate to USD first
    const inputRate = getRate(rates, inputCurrency);
    const hourlyRateInUSD = rate / inputRate;

    return calculateTakeHomePay({
      hourlyRate: hourlyRateInUSD,
      hoursWorked: hours,
      platformFee: fee,
      tax: taxRate,
    });
  }, [hourlyRate, hoursWorked, platformFee, tax, inputCurrency, rates]);

  // Initial mount animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card entrance animation
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        duration: 0.8,
        ease: "power3.out",
      });

      // Staggered input fields animation
      gsap.from(".calc-input", {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.3,
        ease: "power2.out",
      });

      // Results animation
      gsap.from(".calc-result", {
        opacity: 0,
        x: 20,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.6,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  // Animate take-home pay when value changes
  useEffect(() => {
    if (results.isValid && results.takeHomePay !== prevTakeHomePay.current) {
      const takeHomeElement = document.querySelector(".take-home-value");
      if (takeHomeElement) {
        gsap.fromTo(
          takeHomeElement,
          { scale: 1.1, color: "hsl(160, 84%, 50%)" },
          { scale: 1, color: "hsl(160, 84%, 39%)", duration: 0.3, ease: "power2.out" }
        );
      }
      prevTakeHomePay.current = results.takeHomePay;
    }
  }, [results.takeHomePay, results.isValid]);

  // Format values for display with currency conversion
  const formatValue = (value: number): string => {
    if (!results.isValid) return "—";
    const exchangeRate = getRate(rates, outputCurrency);
    const convertedValue = value * exchangeRate;
    return formatCurrency(convertedValue, outputCurrency);
  };

  // Get exchange rate for display
  const inputRate = getRate(rates, inputCurrency);
  const outputRate = getRate(rates, outputCurrency);

  return (
    <Card
      ref={cardRef}
      className="w-full max-w-xl mx-auto border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-colors shadow-2xl shadow-primary/5"
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-center text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
          Calculate Your Take-Home Pay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div className="sm:col-span-2 calc-input">
            <CurrencySelect 
              value={inputCurrency} 
              onChange={setInputCurrency} 
              label="Input Currency"
            />
          </div>
          <div className="hidden sm:flex items-center justify-center pb-2">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="sm:col-span-2 calc-input">
            <CurrencySelect 
              value={outputCurrency} 
              onChange={setOutputCurrency}
              label="Output Currency" 
            />
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded-lg py-2 px-4">
          {ratesLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
          <span>1 {inputCurrency} = {(outputRate / inputRate).toFixed(4)} {outputCurrency}</span>
          {lastUpdated && (
            <span className="text-xs">• Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>

        {/* Input Section */}
        <div ref={inputsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="calc-input">
            <InputField
              id="hourlyRate"
              label="Hourly Rate"
              value={hourlyRate}
              onChange={setHourlyRate}
              prefix={inputCurrencySymbol}
              placeholder="50"
            />
          </div>
          <div className="calc-input">
            <InputField
              id="hoursWorked"
              label="Hours Worked"
              value={hoursWorked}
              onChange={setHoursWorked}
              suffix="hrs"
              placeholder="40"
            />
          </div>
          <div className="calc-input">
            <InputField
              id="platformFee"
              label="Platform Fee"
              value={platformFee}
              onChange={setPlatformFee}
              suffix="%"
              placeholder="20"
              max={100}
            />
          </div>
          <div className="calc-input">
            <InputField
              id="tax"
              label="Tax Rate"
              value={tax}
              onChange={setTax}
              suffix="%"
              placeholder="25"
              max={100}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Results in {outputCurrency}</span>
          </div>
        </div>

        {/* Results Section */}
        <div ref={resultsRef} className="space-y-3">
          <div className="calc-result">
            <ResultCard
              label="Gross Income"
              value={formatValue(results.grossIncome)}
            />
          </div>
          <div className="calc-result">
            <ResultCard
              label="Platform Fee"
              value={formatValue(results.platformFeeAmount)}
              isSubtraction
            />
          </div>
          <div className="calc-result">
            <ResultCard
              label="Tax"
              value={formatValue(results.taxAmount)}
              isSubtraction
            />
          </div>
          <div className="calc-result">
            <ResultCard
              label="Take-Home Pay"
              value={formatValue(results.takeHomePay)}
              isPrimary
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
