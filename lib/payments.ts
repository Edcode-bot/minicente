"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type PaymentKind = "yaka" | "water" | "airtime" | "send";

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
  refundReference?: string;
  reason?: "insufficient" | "network";
}

function genRef(prefix = "MC"): string {
  const hex = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  )
    .join("")
    .toUpperCase();
  return `${prefix}-${hex}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processPayment(
  input: ProcessPaymentInput
): Promise<ProcessPaymentResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    return {
      ok: false,
      status: "failed",
      reference,
      reason: "insufficient",
    };
  }

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

  await wait(2500);

  const willFail = Math.random() < 0.1;

  if (willFail) {
    await supabase
      .from("transactions")
      .update({ status: "failed" })
      .eq("user_id", user.id)
      .eq("reference", reference);

    await wait(1500);

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
      refundReference,
      reason: "network",
    };
  }

  await supabase
    .from("transactions")
    .update({ status: "success" })
    .eq("user_id", user.id)
    .eq("reference", reference);

  await supabase
    .from("wallets")
    .update({ balance_minor: wallet.balance_minor - (input.amountMinor + feeMinor) })
    .eq("id", wallet.id);

  return { ok: true, status: "success", reference };
}

export type PaymentStage = "idle" | "processing" | "success" | "failed" | "refunded";

export function usePayment() {
  const [stage, setStage] = useState<PaymentStage>("idle");
  const [result, setResult] = useState<ProcessPaymentResult | null>(null);

  const run = useCallback(async (input: ProcessPaymentInput) => {
    setStage("processing");
    const res = await processPayment(input);
    setResult(res);
    if (res.ok) {
      setStage("success");
    } else if (res.refundReference) {
      setStage("refunded");
    } else {
      setStage("failed");
    }
    return res;
  }, []);

  return { run, stage, result };
}
