export interface CalculationInputs {
  hourlyRate: number;
  hoursWorked: number;
  platformFee: number;
  tax: number;
}

export interface CalculationResults {
  grossIncome: number;
  platformFeeAmount: number;
  taxAmount: number;
  takeHomePay: number;
  isValid: boolean;
}

/**
 * Calculate take-home pay after platform fees and taxes
 *
 * Formulas:
 * - Gross Income = Hourly Rate × Hours Worked
 * - Platform Fee Amount = Gross Income × (Platform Fee / 100)
 * - Tax Amount = (Gross Income − Platform Fee Amount) × (Tax / 100)
 * - Take-Home Pay = Gross Income − Platform Fee Amount − Tax Amount
 */
export function calculateTakeHomePay(
  inputs: CalculationInputs
): CalculationResults {
  const { hourlyRate, hoursWorked, platformFee, tax } = inputs;

  // Validate inputs - all must be valid non-negative numbers
  if (
    !isFinite(hourlyRate) ||
    !isFinite(hoursWorked) ||
    !isFinite(platformFee) ||
    !isFinite(tax) ||
    hourlyRate < 0 ||
    hoursWorked < 0 ||
    platformFee < 0 ||
    tax < 0
  ) {
    return {
      grossIncome: 0,
      platformFeeAmount: 0,
      taxAmount: 0,
      takeHomePay: 0,
      isValid: false,
    };
  }

  // Calculate gross income
  const grossIncome = hourlyRate * hoursWorked;

  // Calculate platform fee amount
  const platformFeeAmount = grossIncome * (platformFee / 100);

  // Calculate taxable income (after platform fee)
  const taxableIncome = grossIncome - platformFeeAmount;

  // Calculate tax amount
  const taxAmount = taxableIncome * (tax / 100);

  // Calculate final take-home pay
  const takeHomePay = grossIncome - platformFeeAmount - taxAmount;

  // Round all values to 2 decimal places
  return {
    grossIncome: Math.round(grossIncome * 100) / 100,
    platformFeeAmount: Math.round(platformFeeAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    takeHomePay: Math.round(takeHomePay * 100) / 100,
    isValid: true,
  };
}
