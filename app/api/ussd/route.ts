import { NextRequest, NextResponse } from "next/server";
import { handleUssd, type UssdContext } from "@/lib/ussd/menu";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider, getBillerProvider } from "@/lib/rails/index";
import type { BillerCode } from "@/lib/rails/types";

// Africa's Talking USSD gateway callback.
//
// HOW TO REGISTER A SHORTCODE:
//   1. Create an Africa's Talking account at africastalking.com
//   2. Go to USSD → Create channel → select country (Uganda), enter shortcode (*384#)
//   3. Set the callback URL to: https://<your-domain>/api/ussd
//   4. Set request method: POST
//   5. The telco (MTN/Airtel Uganda) must whitelist your shortcode — AT handles the
//      application process once you have a paid account.
//
// Local testing: use AT's USSD simulator at account.africastalking.com/ussd/simulator

function text(body: string): NextResponse {
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function genRef(prefix = "MC"): string {
  const hex = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("").toUpperCase();
  return `${prefix}-${hex}`;
}

export async function POST(req: NextRequest) {
  // AT sends form-encoded body
  const formData = await req.formData();
  const sessionId = String(formData.get("sessionId") ?? "");
  const phoneNumber = String(formData.get("phoneNumber") ?? "");
  const ussdText = String(formData.get("text") ?? "");

  if (!phoneNumber) return text("END Invalid request.");

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch {
    return text("END Service unavailable — try again shortly.");
  }

  const phoneDigits = phoneNumber.replace(/\D/g, "").replace(/^256/, "");
  const email = `mc-${phoneDigits}@example.com`;

  // Build context: async helpers that talk to Supabase using the admin client
  const ctx: UssdContext = {
    async getBalance(pd: string) {
      const { data: user } = await adminClient
        .from("profiles")
        .select("id")
        .eq("phone", `+256${pd}`)
        .maybeSingle();
      if (!user) return 0;
      const { data: wallet } = await adminClient
        .from("wallets")
        .select("balance_minor")
        .eq("user_id", user.id)
        .eq("currency", "UGX")
        .maybeSingle();
      return wallet?.balance_minor ?? 0;
    },

    async findNearestAgent() {
      const { data } = await adminClient
        .from("agents")
        .select("shop_name, area, phone")
        .neq("cash_status", "out")
        .eq("verified", true)
        .limit(1)
        .maybeSingle();
      return data ?? null;
    },

    async processPayment(pd, kind, counterparty, amountMinor) {
      // Resolve user
      const { data: profile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("phone", `+256${pd}`)
        .maybeSingle();

      // If user doesn't exist yet, create via auth (they've never used the app)
      let userId: string;
      if (profile) {
        userId = profile.id;
      } else {
        // New user signing in via USSD for the first time
        const pw = `MC-${pd}-dev`;
        const { data: authData } = await adminClient.auth.admin.createUser({
          email,
          password: pw,
          user_metadata: { phone: `+256${pd}`, full_name: "Friend" },
          email_confirm: true,
        });
        if (!authData.user) return { ok: false, reason: "Account creation failed" };
        userId = authData.user.id;
      }

      // Check wallet
      const { data: wallet } = await adminClient
        .from("wallets")
        .select("id, balance_minor")
        .eq("user_id", userId)
        .eq("currency", "UGX")
        .maybeSingle();

      if (!wallet || wallet.balance_minor < amountMinor) {
        return { ok: false, reason: "insufficient balance" };
      }

      const reference = genRef("MC");

      // Insert pending transaction
      await adminClient.from("transactions").insert({
        user_id: userId,
        kind,
        status: "pending",
        amount_minor: amountMinor,
        fee_minor: 0,
        currency: "UGX",
        counterparty,
        reference,
        meta: { channel: "ussd" },
      });

      // Call rails provider
      let providerResult: { ok: boolean; providerRef: string; reason?: string };
      const billerMap: Record<string, BillerCode | null> = {
        yaka: "YAKA", water: "NWSC", airtime: "AIRTIME", send: null,
      };
      const billerCode = billerMap[kind] ?? null;

      if (billerCode) {
        providerResult = await getBillerProvider().pay({
          billerCode,
          accountNumber: counterparty,
          amountMinor,
          currency: "UGX",
          reference,
        });
      } else {
        providerResult = await getPaymentProvider().disburse({
          amountMinor,
          currency: "UGX",
          phoneNumber: counterparty.replace(/\D/g, ""),
          reference,
          payerMessage: `Minicente ${kind}`,
          payeeNote: `Ref ${reference}`,
        });
      }

      if (!providerResult.ok) {
        await adminClient
          .from("transactions")
          .update({ status: "failed", meta: { channel: "ussd", providerRef: providerResult.providerRef } })
          .eq("reference", reference);
        // Auto-refund (no deduction)
        await adminClient.from("transactions").insert({
          user_id: userId,
          kind: "refund",
          status: "success",
          amount_minor: amountMinor,
          fee_minor: 0,
          currency: "UGX",
          counterparty,
          reference: genRef("MC-RF"),
          meta: { refunds: reference, channel: "ussd" },
        });
        return { ok: false, reference, reason: providerResult.reason ?? "network error" };
      }

      // Success — update transaction, deduct wallet
      await adminClient
        .from("transactions")
        .update({ status: "success", meta: { channel: "ussd", providerRef: providerResult.providerRef } })
        .eq("reference", reference);

      await adminClient
        .from("wallets")
        .update({ balance_minor: wallet.balance_minor - amountMinor })
        .eq("id", wallet.id);

      return { ok: true, reference };
    },
  };

  const response = await handleUssd({ sessionId, phoneNumber, text: ussdText }, ctx);
  return text(response);
}
