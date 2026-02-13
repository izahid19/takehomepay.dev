"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CURRENCIES, type CurrencyCode } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CurrencySelectProps {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
  label?: string;
}

export function CurrencySelect({ value, onChange, label = "Currency" }: CurrencySelectProps) {
  const selectedCurrency = CURRENCIES.find((c) => c.code === value);

  return (
    <div className={cn(label && "space-y-2")}>
      {label && (
        <Label htmlFor="currency" className="text-muted-foreground">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={(v) => onChange(v as CurrencyCode)}>
        <SelectTrigger id="currency" className="text-lg font-medium h-12 bg-card/60 border-border rounded-xl">
          <SelectValue placeholder="Select currency">
            {selectedCurrency && (
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">{selectedCurrency.symbol}</span>
                <span>{selectedCurrency.code}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground w-8">{currency.symbol}</span>
                <span className="font-medium">{currency.code}</span>
                <span className="text-muted-foreground text-sm">
                  {currency.name}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
