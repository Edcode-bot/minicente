"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPaymentProvider, getBillerProvider } from "@/lib/rails/index";
import type { BillerCode, ValidateResult } from "@/lib/rails/types";
import { logError } from "@/lib/logError";

export type PaymentKind = "yaka" | "water" | "airtime" | "send" | "savings";

export interface ProcessPaymentInput {
  kind: PaymentKind;
  amountMinor: number;
  counterparty: string;
  meta?: Record<string, unknown>;
}

export interface ProcessPaymentResult {
  ok: boolean;
  status: "success" | "failed";
  reference: string;
  providerRef?: string;
  refundReference?: string;
  reason?: "insufficient" | "network";
}

function genRef(prefix = "MC"): string {
  const hex = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("").toUpperCase();
  return `${prefix}-${hex}`;
}

function kindToBillerCode(kind: PaymentKind): BillerCode | null {
  if (kind === "yaka") return "YAKA";
  if (kind === "water") return "NWSC";
  if (kind === "airtime") return "AIRTIME";
  return null;
}

// Validate a biller account before the confirm screen.
// Returns { ok, customerName } — callers show the name for UX trust.
export async function validateBillerAccount(
  kind: PaymentKind,
  accountNumber: string
): Promise<ValidateResult> {
  const billerCode = kindToBillerCode(kind);
  if (!billerCode) return { ok: true }; // non-biller kinds skip validation
  const biller = getBillerProvider();
  return biller.validate({ billerCode, accountNumber });
}

export async function processPayment(
  input: ProcessPaymentInput
): Promise<ProcessPaymentResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, status: "failed", reference: "", reason: "network" };
  }

  const reference = genRef("MC");
  const feeMinor = 0;

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .eq("currency", "UGX")
    .single();

  if (!wallet || wallet.balance_minor < input.amountMinor + feeMinor) {
    await supabase.from("transactions").insert({
      user_id: user.id,
      kind: input.kind,
      status: "failed",
      amount_minor: input.amountMinor,
      fee_minor: feeMinor,
      currency: "UGX",
      counterparty: input.counterparty,
      reference,
      meta: { ...(input.meta ?? {}), reason: "insufficient" },
    });
    return { ok: false, status: "failed", reference, reason: "insufficient" };
  }

  // Insert pending transaction before calling the provider
  await supabase.from("transactions").insert({
    user_id: user.id,
    kind: input.kind,
    status: "pending",
    amount_minor: input.amountMinor,
    fee_minor: feeMinor,
    currency: "UGX",
    counterparty: input.counterparty,
    reference,
    meta: input.meta ?? {},
  });

  // Route to the correct provider
  let providerResult: { ok: boolean; providerRef: string; reason?: string };
  const billerCode = kindToBillerCode(input.kind);

  if (billerCode) {
    // YAKA / NWSC / Airtime → biller provider
    const biller = getBillerProvider();
    providerResult = await biller.pay({
      billerCode,
      accountNumber: input.counterparty,
      amountMinor: input.amountMinor,
      currency: "UGX",
      reference,
    });
  } else {
    // send / cashout → disbursement; cashin → collect (agent flow)
    const provider = getPaymentProvider();
    providerResult = await provider.disburse({
      amountMinor: input.amountMinor,
      currency: "UGX",
      phoneNumber: input.counterparty.replace(/\D/g, ""),
      reference,
      payerMessage: `Minicente ${input.kind}`,
      payeeNote: `Minicente ref ${reference}`,
    });
  }

  if (!providerResult.ok) {
    // Mark failed — store providerRef in meta for reconciliation
    await supabase
      .from("transactions")
      .update({
        status: "failed",
        meta: { ...(input.meta ?? {}), providerRef: providerResult.providerRef, reason: providerResult.reason },
      })
      .eq("user_id", user.id)
      .eq("reference", reference);

    // Auto-insert refund (no wallet deduction)
    const refundReference = genRef("MC-RF");
    await supabase.from("transactions").insert({
      user_id: user.id,
      kind: "refund",
      status: "success",
      amount_minor: input.amountMinor,
      fee_minor: 0,
      currency: "UGX",
      counterparty: input.counterparty,
      reference: refundReference,
      meta: { refunds: reference },
    });

    return {
      ok: false,
      status: "failed",
      reference,
      providerRef: providerResult.providerRef,
      refundReference,
      reason: "network",
    };
  }

  // Success: mark success, store providerRef, deduct wallet
  await supabase
    .from("transactions")
    .update({
      status: "success",
      meta: { ...(input.meta ?? {}), providerRef: providerResult.providerRef },
    })
    .eq("user_id", user.id)
    .eq("reference", reference);

  await supabase
    .from("wallets")
    .update({ balance_minor: wallet.balance_minor - (input.amountMinor + feeMinor) })
    .eq("id", wallet.id);

  // Fire-and-forget settlement record (best-effort internal bookkeeping)
  void fetch("/api/settlement/record", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ txnId: reference, amountMinor: input.amountMinor }),
  }).catch(() => {});

  return {
    ok: true,
    status: "success",
    reference,
    providerRef: providerResult.providerRef,
  };
}

export type PaymentStage = "idle" | "processing" | "success" | "failed" | "refunded";

export function usePayment() {
  const [stage, setStage] = useState<PaymentStage>("idle");
  const [result, setResult] = useState<ProcessPaymentResult | null>(null);

  const run = useCallback(async (input: ProcessPaymentInput) => {
    setStage("processing");
    try {
      const res = await processPayment(input);
      setResult(res);
      if (res.ok) {
        setStage("success");
      } else if (res.refundReference) {
        setStage("refunded");
      } else {
        setStage("failed");
        if (res.reason === "network") {
          logError("processPayment network failure", { kind: input.kind, reference: res.reference });
        }
      }
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logError(msg, { kind: input.kind, context: "processPayment_throw" });
      const fallback: ProcessPaymentResult = { ok: false, status: "failed", reference: "", reason: "network" };
      setResult(fallback);
      setStage("failed");
      return fallback;
    }
  }, []);

  return { run, stage, result };
}
