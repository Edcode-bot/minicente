// Server-side util — records a settlement row after a successful payment.
// Required SQL (run in Supabase SQL editor):
//
// CREATE TABLE IF NOT EXISTS settlements (
//   id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   txn_id       text NOT NULL,
//   asset        text NOT NULL DEFAULT 'UGX',
//   amount_minor bigint NOT NULL,
//   chain        text NOT NULL,
//   provider_ref text NOT NULL,
//   status       text NOT NULL DEFAULT 'pending',
//   created_at   timestamptz NOT NULL DEFAULT now()
// );
// CREATE INDEX ON settlements (txn_id);
// CREATE INDEX ON settlements (status, created_at DESC);
// ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
// -- Only service-role can read/write; never exposed to end users.
// CREATE POLICY "service_only" ON settlements FOR ALL TO service_role USING (true) WITH CHECK (true);

import { getSettlementProvider } from "./index";

interface RecordInput {
  txnId: string;
  amountMinor: number;
  asset?: string;
}

export async function recordSettlement(input: RecordInput): Promise<void> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn("[SETTLEMENT] SUPABASE_SERVICE_ROLE_KEY not set — skipping settlement record");
    return;
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const asset = input.asset ?? "UGX";

  try {
    const provider = getSettlementProvider();
    const result = await provider.settle([
      { txnId: input.txnId, amountMinor: input.amountMinor, asset },
    ]);

    await admin.from("settlements").insert({
      txn_id: input.txnId,
      asset,
      amount_minor: input.amountMinor,
      chain: result.chain,
      provider_ref: result.providerRef,
      status: result.ok ? "settled" : "failed",
    });
  } catch (err) {
    // Settlement recording is best-effort — never crash the payment flow
    console.error("[SETTLEMENT] record error:", err);
  }
}
