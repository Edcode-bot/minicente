// ─── Database row types ───────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  currency: string;
  language: "en" | "lug";
  kyc_tier: number;
  level: string;
  pin_set: boolean;
  onboarded: boolean;
  referral_code: string | null;
  avatar_url: string | null;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance_minor: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  kind: string;
  status: string;
  amount_minor: number;
  fee_minor: number;
  currency: string;
  counterparty: string | null;
  reference: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export type AutoCadence = "none" | "weekly" | "monthly";

export interface SavingsPot {
  id: string;
  user_id: string;
  name: string;
  saved_minor: number;
  target_minor: number;
  apy: number;
  auto_amount_minor: number;
  auto_cadence: AutoCadence;
  created_at: string;
}

export interface Chama {
  id: string;
  name: string;
  contribution_minor: number;
  cadence: "weekly" | "monthly";
  member_count: number;
  created_by: string;
  created_at: string;
}

export interface ChamaMember {
  id: string;
  chama_id: string;
  user_id: string;
  position: number;
  created_at: string;
}

export interface PlatformStats {
  id: string;
  success_rate: number;
  bills_today: number;
  city: string;
}

export type AgentCashStatus = "ready" | "low" | "out";

export interface Agent {
  id: string;
  shop_name: string;
  area: string;
  phone: string | null;
  cash_status: AgentCashStatus;
  verified: boolean;
  lat: number | null;
  lng: number | null;
}

// ─── Formatters ────────────────────────────────────────────────────────────────

/** Renders "UGX 1,000" with thousands separators and tabular figures. */
export function formatUGX(minor: number): string {
  const n = Math.floor(minor);
  const formatted = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `UGX ${formatted}`;
}
