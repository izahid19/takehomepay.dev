import { z } from "zod";

export const calculatorInputSchema = z.object({
  hourlyRate: z
    .number()
    .min(0, "Hourly rate must be positive")
    .max(10000, "Hourly rate seems too high"),
  hoursWorked: z
    .number()
    .min(0, "Hours worked must be positive")
    .max(744, "Maximum 744 hours per month"),
  platformFee: z
    .number()
    .min(0, "Platform fee must be positive")
    .max(100, "Platform fee cannot exceed 100%"),
  tax: z
    .number()
    .min(0, "Tax must be positive")
    .max(100, "Tax cannot exceed 100%"),
});

export type CalculatorInput = z.infer<typeof calculatorInputSchema>;

/**
 * Parse a string input to a number, handling empty/invalid values gracefully
 */
export function parseNumericInput(value: string): number | null {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = parseFloat(trimmed);

  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }

  // Prevent negative values
  if (parsed < 0) {
    return 0;
  }

  return parsed;
}

/**
 * Validate a single field
 */
export function validateField(
  field: keyof CalculatorInput,
  value: number
): string | null {
  const result = calculatorInputSchema.shape[field].safeParse(value);

  if (!result.success) {
    return result.error.errors[0]?.message || "Invalid value";
  }

  return null;
}
