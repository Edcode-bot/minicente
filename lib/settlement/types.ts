// Settlement provider interfaces — backend reconciliation only, never shown to users.
// All amounts in minor units (whole UGX).

export interface SettlementItem {
  txnId: string;       // our internal MC-XXXXXX reference
  amountMinor: number;
  asset: string;       // e.g. "UGX", "USDC"
}

export interface SettleBatchResult {
  ok: boolean;
  providerRef: string; // e.g. SETTLE-AB12CD34
  chain: string;       // e.g. "base", "arbitrum", "sim"
  reason?: string;
}

export interface BalanceResult {
  asset: string;
  amountMinor: number;
  chain: string;
}

export interface SettlementProvider {
  /** Settle a batch of transactions — routes to cheapest configured chain. */
  settle(batch: SettlementItem[]): Promise<SettleBatchResult>;
  /** Query treasury wallet balance for a given asset. */
  balanceOf(asset: string): Promise<BalanceResult>;
}
