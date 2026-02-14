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
import { Lock } from "lucide-react";

interface CurrencySelectProps {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
  label?: string;
  allowedCodes?: CurrencyCode[];
}

export function CurrencySelect({ 
  value, 
  onChange, 
  label = "Currency",
  allowedCodes
}: CurrencySelectProps) {
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
          <SelectValue placeholder="Select..">
            {selectedCurrency && (
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">{selectedCurrency.symbol}</span>
                <span>{selectedCurrency.code}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {CURRENCIES.map((currency) => {
            const isLocked = !!allowedCodes && !allowedCodes.includes(currency.code);
            return (
              <SelectItem 
                key={currency.code} 
                value={currency.code}
                disabled={isLocked}
                title={isLocked ? "Upgrade to Elite or Pro to unlock 40+ currencies" : undefined}
                className={cn(
                  isLocked && "opacity-80 cursor-not-allowed border border-amber-500/20 bg-amber-500/5 my-0.5 mx-1 rounded-lg"
                )}
              >
                <div className="flex items-center justify-between w-full min-w-[200px] gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-8 font-serif">{currency.symbol}</span>
                    <span className="font-bold">{currency.code}</span>
                    <span className="text-muted-foreground text-xs truncate max-w-[120px]">
                      {currency.name}
                    </span>
                  </div>
                  {isLocked && (
                    <div className="flex items-center bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
