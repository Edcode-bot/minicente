import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { createClient } from "@supabase/supabase-js";

// GET /api/health — config doctor / go-live readiness report.
// Returns JSON: which providers are sim vs live, env-var presence, DB connectivity.

async function checkSupabase(): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  if (!config.hasSupabase) return { ok: false, error: "NEXT_PUBLIC_SUPABASE_URL or ANON_KEY missing" };
  const start = Date.now();
  try {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await client.from("platform_stats").select("id").limit(1);
    return { ok: !error, latencyMs: Date.now() - start, error: error?.message };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function GET() {
  const db = await checkSupabase();

  const report = {
    timestamp: new Date().toISOString(),
    overall: db.ok ? "ready" : "degraded",

    modes: {
      rails: config.railsMode,
      railsProvider: config.railsProvider,
      otp: config.otpMode,
      settlement: config.settlementMode,
    },

    providers: {
      rails: {
        mode: config.railsMode,
        live_ready: config.railsProvider === "mtn" ? config.hasMtn : config.hasAirtel,
        missing:
          config.railsMode === "sim"
            ? []
            : config.railsProvider === "mtn"
            ? (config.hasMtn ? [] : ["MTN_SUBSCRIPTION_KEY", "MTN_API_USER", "MTN_API_KEY"])
            : config.hasAirtel
            ? []
            : ["AIRTEL_CLIENT_ID", "AIRTEL_CLIENT_SECRET"],
      },
      otp: {
        mode: config.otpMode,
        live_ready: config.hasAt,
        missing: config.hasAt ? [] : ["AT_API_KEY", "AT_USERNAME"],
      },
      settlement: {
        mode: config.settlementMode,
        live_ready: config.hasTreasury,
        missing: config.hasTreasury ? [] : ["TREASURY_ADDRESS", "RPC_URL_BASE"],
      },
    },

    infrastructure: {
      supabase: db,
      service_role: config.hasServiceRole,
      webhook_secret: config.hasWebhookSecret,
    },

    go_live_checklist: [
      { item: "Supabase connected", done: db.ok },
      { item: "SUPABASE_SERVICE_ROLE_KEY set", done: config.hasServiceRole },
      { item: "RAILS_WEBHOOK_SECRET set", done: config.hasWebhookSecret },
      { item: "OTP SMS credentials (AT_API_KEY)", done: config.hasAt },
      {
        item: `MoMo rails credentials (${config.railsProvider.toUpperCase()})`,
        done: config.railsProvider === "mtn" ? config.hasMtn : config.hasAirtel,
      },
      { item: "Settlement treasury configured", done: config.hasTreasury },
    ],
  };

  const status = db.ok ? 200 : 503;
  return NextResponse.json(report, { status });
}
