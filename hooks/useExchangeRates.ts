"use client";

import { useState, useEffect } from "react";
import { CURRENCIES, type CurrencyCode } from "@/lib/utils";

interface ExchangeRates {
  [key: string]: number;
}

interface UseExchangeRatesReturn {
  rates: ExchangeRates;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Build fallback rates from CURRENCIES array
const FALLBACK_RATES: ExchangeRates = CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = curr.rate;
  return acc;
}, {} as ExchangeRates);

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Using free exchangerate-api (no API key required for basic use)
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch exchange rates");
        }

        const data = await response.json();

        // Build rates object from API response, falling back to static rates if not available
        const fetchedRates: ExchangeRates = {};
        CURRENCIES.forEach((curr) => {
          fetchedRates[curr.code] = data.rates[curr.code] || curr.rate;
        });

        setRates(fetchedRates);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching exchange rates:", err);
        setError("Using fallback rates");
        // Keep using fallback rates
        setRates(FALLBACK_RATES);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

    // Refresh rates every 30 minutes
    const interval = setInterval(fetchRates, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { rates, loading, error, lastUpdated };
}

export function getRate(rates: ExchangeRates, currency: CurrencyCode): number {
  return rates[currency] || 1;
}
