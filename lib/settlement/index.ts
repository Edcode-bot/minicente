import type { SettlementProvider } from "./types";
import { settlementSim } from "./sim";
import { settlementEvm } from "./evm";

export function getSettlementProvider(): SettlementProvider {
  const mode = process.env.SETTLEMENT_MODE ?? "sim";
  return mode === "live" ? settlementEvm : settlementSim;
}

export type { SettlementProvider, SettlementItem, SettleBatchResult } from "./types";
