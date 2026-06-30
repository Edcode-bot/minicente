"use client";

import type { Transaction, SavingsPot } from "@/lib/types";
import type { LoanEligibility } from "./useLoanEligibility";
import { formatUGX } from "@/lib/types";

export type NudgeKind = "yaka" | "pot" | "loan" | "fees" | "chama";

export interface Nudge {
  kind: NudgeKind;
  title: string;
  cta: string;
  href: string;
  icon: string;
}

interface NudgeInput {
  txns: Transaction[];
  pots: SavingsPot[];
  chamaNames: string[];
  loan: LoanEligibility;
  loanEverApplied: boolean;
}

export function computeNudge({
  txns,
  pots,
  chamaNames,
  loan,
  loanEverApplied,
}: NudgeInput): Nudge {
  // (a) No bill paid in ~25 days → YAKA nudge
  const billKinds = ["bill", "yaka", "water"];
  const lastBill = txns.find((tx) => billKinds.includes(tx.kind) && tx.status === "success");
  if (!lastBill) {
    return {
      kind: "yaka",
      title: "Your YAKA is usually low about now — top up?",
      cta: "Top up",
      href: "/pay/yaka",
      icon: "💡",
    };
  }
  const daysSinceLastBill = (Date.now() - new Date(lastBill.created_at).getTime()) / 86400000;
  if (daysSinceLastBill >= 25) {
    return {
      kind: "yaka",
      title: "Your YAKA is usually low about now — top up?",
      cta: "Top up",
      href: "/pay/yaka",
      icon: "💡",
    };
  }

  // (b) Has a pot below target → pot nudge
  const incompletePot = pots.find((p) => p.saved_minor < p.target_minor);
  if (incompletePot) {
    const pct = Math.round((incompletePot.saved_minor / incompletePot.target_minor) * 100);
    return {
      kind: "pot",
      title: `Add to your ${incompletePot.name} — you're ${pct}% there`,
      cta: "Add now",
      href: "/grow",
      icon: "🌱",
    };
  }

  // (c) Eligible for loan & never applied
  if (loan.eligible && !loanEverApplied) {
    return {
      kind: "loan",
      title: `You qualify for a small loan — ${formatUGX(loan.amountMinor)}`,
      cta: "View",
      href: "/grow/loan",
      icon: "🏦",
    };
  }

  // (d) Fees-saved milestone (>= UGX 1,000 saved this month)
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthlySavedFees = txns
    .filter(
      (tx) =>
        tx.status === "success" &&
        tx.kind !== "refund" &&
        new Date(tx.created_at) >= monthStart
    )
    .reduce((sum, tx) => sum + Math.round(tx.amount_minor * 0.01), 0);

  if (monthlySavedFees >= 100_00) {
    return {
      kind: "fees",
      title: `You've saved ${formatUGX(monthlySavedFees)} on fees this month — move it to savings?`,
      cta: "Save it",
      href: "/grow",
      icon: "💰",
    };
  }

  // (e) Chama contribution reminder
  if (chamaNames.length > 0) {
    return {
      kind: "chama",
      title: `Chama contribution due — ${chamaNames[0]}`,
      cta: "Contribute",
      href: "/grow",
      icon: "🤝",
    };
  }

  // Default fallback
  return {
    kind: "yaka",
    title: "Your YAKA is usually low about now — top up?",
    cta: "Top up",
    href: "/pay/yaka",
    icon: "💡",
  };
}
