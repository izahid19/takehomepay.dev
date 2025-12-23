import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Currencies sorted A-Z by code
export const CURRENCIES = [
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
  { code: "ARS", symbol: "$", name: "Argentine Peso", rate: 815 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", rate: 110 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 4.95 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", rate: 0.88 },
  { code: "CLP", symbol: "$", name: "Chilean Peso", rate: 890 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.24 },
  { code: "COP", symbol: "$", name: "Colombian Peso", rate: 3950 },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", rate: 22.8 },
  { code: "DKK", symbol: "kr", name: "Danish Krone", rate: 6.88 },
  { code: "EGP", symbol: "£", name: "Egyptian Pound", rate: 30.9 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", rate: 7.82 },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", rate: 355 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rate: 15700 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.5 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 149.5 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rate: 153 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", rate: 1320 },
  { code: "MXN", symbol: "$", name: "Mexican Peso", rate: 17.2 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rate: 4.72 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", rate: 790 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", rate: 10.7 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", rate: 1.64 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", rate: 55.8 },
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee", rate: 278 },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", rate: 3.98 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", rate: 92 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rate: 3.75 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", rate: 10.4 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.34 },
  { code: "THB", symbol: "฿", name: "Thai Baht", rate: 35.2 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", rate: 29.5 },
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", rate: 24500 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rate: 18.5 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function getExchangeRate(currency: CurrencyCode): number {
  const found = CURRENCIES.find((c) => c.code === currency);
  return found?.rate ?? 1;
}
