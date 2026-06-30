"use client";

export interface LoanEligibility {
  eligible: boolean;
  amountMinor: number;
  termDays: number;
  feeMinor: number;
  note: string;
  paymentsNeeded: number;
}

const THRESHOLDS = [
  { minTxns: 30, amount: 500_000_00 },
  { minTxns: 15, amount: 300_000_00 },
  { minTxns: 5,  amount: 150_000_00 },
];

export function calcLoanEligibility(
  txnCount: number,
  totalSavingsMinor: number
): LoanEligibility {
  for (const tier of THRESHOLDS) {
    if (txnCount >= tier.minTxns) {
      return {
        eligible: true,
        amountMinor: tier.amount,
        termDays: 30,
        feeMinor: 5_000_00,
        note: "Repaid automatically from your balance when due.",
        paymentsNeeded: 0,
      };
    }
  }

  const smallestThreshold = THRESHOLDS[THRESHOLDS.length - 1].minTxns;
  const paymentsNeeded = smallestThreshold - txnCount;

  return {
    eligible: false,
    amountMinor: 150_000_00,
    termDays: 30,
    feeMinor: 5_000_00,
    note: `Pay ${paymentsNeeded} more bill${paymentsNeeded === 1 ? "" : "s"} to unlock a small loan.`,
    paymentsNeeded,
  };
}
