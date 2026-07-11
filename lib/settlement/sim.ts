import type { SettlementProvider, SettleBatchResult, BalanceResult, SettlementItem } from "./types";

// Chain cost ranking (cheapest → most expensive gas).
// In live mode the EVM provider would measure on-chain gas prices; here we use a fixed ranking.
const CHAIN_PREFERENCE = ["base", "arbitrum", "optimism", "polygon", "ethereum"] as const;

function genRef(): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("").toUpperCase();
  return `SETTLE-${hex}`;
}

export const settlementSim: SettlementProvider = {
  async settle(batch: SettlementItem[]): Promise<SettleBatchResult> {
    // Sim: pick cheapest chain (always Base in sim), succeed instantly
    const chain = CHAIN_PREFERENCE[0];
    const totalMinor = batch.reduce((sum, item) => sum + item.amountMinor, 0);
    console.log(
      `[SETTLEMENT SIM] Settling ${batch.length} txn(s) · UGX ${totalMinor.toLocaleString()} on ${chain}`
    );
    return {
      ok: true,
      providerRef: genRef(),
      chain,
    };
  },

  async balanceOf(asset: string): Promise<BalanceResult> {
    // Sim: return a plausible treasury balance
    return { asset, amountMinor: 50_000_000, chain: CHAIN_PREFERENCE[0] };
  },
};
