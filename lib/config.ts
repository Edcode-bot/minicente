// Central config — single source of truth for all *_MODE flags and env-var presence checks.
// Import this anywhere (server or client) to read current mode without scattering process.env checks.

export const config = {
  // Payment rails: 'sim' (default) | 'live'
  railsMode: (process.env.NEXT_PUBLIC_RAILS_MODE ?? "sim") as "sim" | "live",
  // MoMo provider when railsMode=live: 'mtn' (default) | 'airtel'
  railsProvider: (process.env.NEXT_PUBLIC_RAILS_PROVIDER ?? "mtn") as "mtn" | "airtel",

  // OTP / SMS: 'sim' (default, console-logs code) | 'live' (Africa's Talking)
  otpMode: (process.env.OTP_MODE ?? "sim") as "sim" | "live",

  // Settlement layer: 'sim' (default) | 'live' (EVM multichain)
  settlementMode: (process.env.SETTLEMENT_MODE ?? "sim") as "sim" | "live",

  // ── Env-var presence checks ───────────────────────────────────────────────
  hasSupabase: !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasWebhookSecret: !!process.env.RAILS_WEBHOOK_SECRET,

  // MTN MoMo live credentials
  hasMtn: !!(
    process.env.MTN_SUBSCRIPTION_KEY &&
    process.env.MTN_API_USER &&
    process.env.MTN_API_KEY
  ),
  // Airtel Money live credentials
  hasAirtel: !!(
    process.env.AIRTEL_CLIENT_ID && process.env.AIRTEL_CLIENT_SECRET
  ),

  // Africa's Talking SMS credentials
  hasAt: !!(process.env.AT_API_KEY && process.env.AT_USERNAME),

  // EVM settlement credentials
  hasTreasury: !!(
    process.env.TREASURY_ADDRESS && process.env.RPC_URL_BASE
  ),
} as const;

export type Config = typeof config;
