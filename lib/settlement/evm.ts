// Live EVM settlement — uses the existing wagmi/viem deps already in the repo.
// Reuses the same chain list from lib/wagmi.ts (Base, Arbitrum, Optimism, Polygon).
//
// To go live:
//   1. Set SETTLEMENT_MODE=live
//   2. Set TREASURY_ADDRESS (your treasury wallet address)
//   3. Set RPC_URL_BASE, RPC_URL_ARBITRUM, RPC_URL_OPTIMISM, RPC_URL_POLYGON
//   4. Add a funded treasury private key (via a KMS / env secret — NOT committed to git)
//   5. Replace the throw below with:
//      - createPublicClient / createWalletClient from viem
//      - estimateGas on each chain, pick cheapest
//      - signTransaction + sendTransaction for USDC batch transfer
//      - Return the on-chain tx hash as providerRef

import type { SettlementProvider, SettleBatchResult, BalanceResult, SettlementItem } from "./types";
import { createPublicClient, http } from "viem";
import { base } from "wagmi/chains";

// Stub public client — illustrates the viem wiring without doing anything.
// Replace with per-chain clients once credentials are configured.
function _stubClient() {
  const rpcUrl = process.env.RPC_URL_BASE;
  if (!rpcUrl) throw new Error("RPC_URL_BASE not set");
  return createPublicClient({ chain: base, transport: http(rpcUrl) });
}

export const settlementEvm: SettlementProvider = {
  async settle(_batch: SettlementItem[]): Promise<SettleBatchResult> {
    throw new Error(
      "EVM settlement not configured — set SETTLEMENT_MODE=live, TREASURY_ADDRESS, and RPC_URL_* vars"
    );
  },

  async balanceOf(_asset: string): Promise<BalanceResult> {
    throw new Error(
      "EVM settlement not configured — set SETTLEMENT_MODE=live, TREASURY_ADDRESS, and RPC_URL_* vars"
    );
  },
};
