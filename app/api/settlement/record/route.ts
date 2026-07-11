import { NextRequest, NextResponse } from "next/server";
import { recordSettlement } from "@/lib/settlement/record";

// Called client-side (fire-and-forget) after a successful processPayment.
// No auth check needed — txnId is our own MC-XXXXXX reference; the settlement
// record is internal bookkeeping only and never returned to users.

export async function POST(req: NextRequest) {
  let body: { txnId?: string; amountMinor?: number; asset?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { txnId, amountMinor } = body;
  if (!txnId || typeof amountMinor !== "number") {
    return NextResponse.json({ error: "txnId and amountMinor required" }, { status: 400 });
  }

  // Fire async — response returns immediately; recording continues in background
  void recordSettlement({ txnId, amountMinor, asset: body.asset ?? "UGX" });

  return NextResponse.json({ ok: true });
}
