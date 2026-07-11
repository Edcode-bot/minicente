import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordSettlement } from "@/lib/settlement/record";

// POST /api/rails/webhook
// Called by the payment provider (MTN MoMo callback, biller callback, etc.)
// to update a transaction's final status.
//
// Body: { providerRef, status: "SUCCESSFUL" | "FAILED", reason? }
// Header: x-rails-secret must equal RAILS_WEBHOOK_SECRET env var.

export async function POST(req: NextRequest) {
  const secret = process.env.RAILS_WEBHOOK_SECRET;
  if (secret) {
    const header = req.headers.get("x-rails-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: { providerRef?: string; status?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { providerRef, status, reason } = body;
  if (!providerRef || !status) {
    return NextResponse.json({ error: "Missing providerRef or status" }, { status: 400 });
  }

  const normalised = status.toUpperCase();
  const finalStatus = normalised === "SUCCESSFUL" ? "success" : "failed";

  const supabase = createClient();

  // Find the transaction by providerRef stored in meta
  const { data: txns, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("status", "pending")
    .filter("meta->>providerRef", "eq", providerRef)
    .limit(1);

  if (error || !txns || txns.length === 0) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const txn = txns[0];

  if (finalStatus === "success") {
    // Mark success + deduct wallet
    await supabase
      .from("transactions")
      .update({ status: "success" })
      .eq("id", txn.id);

    const { data: wallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", txn.user_id)
      .eq("currency", "UGX")
      .single();

    if (wallet) {
      await supabase
        .from("wallets")
        .update({ balance_minor: wallet.balance_minor - (txn.amount_minor + txn.fee_minor) })
        .eq("id", wallet.id);
    }
    // Record settlement (best-effort)
    void recordSettlement({ txnId: txn.reference, amountMinor: txn.amount_minor });
  } else {
    // Mark failed + auto-insert refund (no wallet deduction)
    await supabase
      .from("transactions")
      .update({ status: "failed", meta: { ...txn.meta, reason } })
      .eq("id", txn.id);

    const refundRef = "MC-RF-" + Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("").toUpperCase();

    await supabase.from("transactions").insert({
      user_id: txn.user_id,
      kind: "refund",
      status: "success",
      amount_minor: txn.amount_minor,
      fee_minor: 0,
      currency: "UGX",
      counterparty: txn.counterparty,
      reference: refundRef,
      meta: { refunds: txn.reference },
    });
  }

  return NextResponse.json({ ok: true, reference: txn.reference, status: finalStatus });
}
